import { Question, QuestionDifficulty } from '@/types';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

const MODEL_CANDIDATES = [
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'google/gemma-4-26b-a4b-it:free',
  'thinkingmachines/inkling:free',
  'nvidia/nemotron-3.5-lightning:free',
];

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callOpenRouter(messages: OpenRouterMessage[], temperature = 0.4): Promise<string> {
  let lastError: Error | null = null;

  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://pariksha-ai.local',
          'X-Title': 'ParikshaAI Competitive Exam Platform',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[OpenRouter] Model ${model} returned HTTP ${response.status}: ${errorText}`);
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        continue; // Fallback to next free model
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) {
        return text;
      }
    } catch (err: any) {
      console.warn(`[OpenRouter] Request failed on model ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All OpenRouter candidate models failed or exhausted rate limits.');
}

export interface AIGeneratedQuestionPayload {
  questionText: string;
  options: { label: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanationStandard: string;
  explanationBeginner: string;
  explanationShortcut: string;
  difficulty: QuestionDifficulty;
  topic: string;
}

export async function generateAIQuestions(params: {
  subject: string;
  topic: string;
  difficulty: QuestionDifficulty | 'mixed';
  examCode: string;
  count: number;
}): Promise<Question[]> {
  const systemPrompt = `You are an expert psychometric test creator and Senior Question Developer for Indian Competitive Examinations (SSC CGL, CHSL, MTS, CPO, GD, Railways).
Your task is to generate original, scientifically calibrated Multiple Choice Questions (MCQs).

RULES:
1. Every question must have EXACTLY 4 options: labeled A, B, C, D.
2. Only ONE option must be mathematically and logically correct.
3. The remaining 3 options must be PLAUSIBLE distractors representing common student misconceptions or calculation slips.
4. Output must be PURE JSON ARRAY ONLY, without markdown code fences (\`\`\`json) if possible, or clean parseable JSON.
5. Provide three distinct explanations for each question:
   - "explanationStandard": rigorous academic/mathematical solution.
   - "explanationBeginner": intuitive step-by-step explanation without complex jargon.
   - "explanationShortcut": calculation trick, Vedic math method, unit digit hack, or 30-second exam shortcut.
6. Target Exam: ${params.examCode.toUpperCase()}
7. Subject: ${params.subject}
8. Topic: ${params.topic}
9. Difficulty: ${params.difficulty}

JSON SCHEMA FORMAT FOR EACH OBJECT:
{
  "questionText": "Question description...",
  "options": [
    {"label": "A", "text": "Option A text"},
    {"label": "B", "text": "Option B text"},
    {"label": "C", "text": "Option C text"},
    {"label": "D", "text": "Option D text"}
  ],
  "correctOption": "A",
  "explanationStandard": "Detailed standard steps...",
  "explanationBeginner": "Simple beginner walkthrough...",
  "explanationShortcut": "Exam shortcut or formula trick...",
  "difficulty": "medium",
  "topic": "${params.topic}"
}`;

  const userPrompt = `Generate ${params.count} original practice MCQs for ${params.subject} - ${params.topic} with difficulty ${params.difficulty}.`;

  const rawResponse = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  // Clean JSON string
  let cleaned = rawResponse.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  let parsed: AIGeneratedQuestionPayload[] = [];
  try {
    parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      if ((parsed as any).questions && Array.isArray((parsed as any).questions)) {
        parsed = (parsed as any).questions;
      } else {
        parsed = [parsed];
      }
    }
  } catch (parseError) {
    console.error('Failed to parse AI question output:', cleaned);
    throw new Error('AI question validation failed: Output could not be parsed as valid JSON.');
  }

  // Validate and transform into Question domain entities
  const validatedQuestions: Question[] = [];

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    // Check required fields
    if (!item.questionText || !Array.isArray(item.options) || item.options.length < 4) {
      continue;
    }

    const labels = item.options.map((o) => o.label.toUpperCase());
    if (!labels.includes('A') || !labels.includes('B') || !labels.includes('C') || !labels.includes('D')) {
      continue;
    }

    const correctLabel = (item.correctOption || 'A').toUpperCase() as 'A' | 'B' | 'C' | 'D';

    // Verify option text uniqueness
    const optionTexts = new Set(item.options.map((o) => o.text.trim().toLowerCase()));
    if (optionTexts.size < 4) {
      // Duplicate options, reject or skip
      continue;
    }

    const qId = `ai_gen_${Date.now()}_${i + 1}`;
    validatedQuestions.push({
      id: qId,
      subjectCode: params.subject.toLowerCase().includes('reason') ? 'reasoning' : params.subject.toLowerCase().includes('math') || params.subject.toLowerCase().includes('quant') ? 'quant' : params.subject.toLowerCase().includes('english') ? 'english' : 'ga',
      topicCode: params.topic.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      questionText: item.questionText,
      options: item.options.map((o) => ({
        label: o.label.toUpperCase() as 'A' | 'B' | 'C' | 'D',
        text: o.text,
      })),
      correctOption: correctLabel,
      explanation: {
        standard: item.explanationStandard || 'Standard explanation.',
        beginner: item.explanationBeginner || 'Beginner walkthrough.',
        shortcut: item.explanationShortcut || 'Shortcut technique.',
      },
      difficulty: (item.difficulty as QuestionDifficulty) || 'medium',
      isVerified: false,
      isAiGenerated: true,
      marks: 2.0,
      negativeMarks: 0.5,
      provenance: {
        examCode: params.examCode,
        examName: `${params.examCode.toUpperCase()} AI Adaptive Practice Set`,
        year: new Date().getFullYear(),
        shift: 1,
        tier: 'Practice',
        sourceType: 'AI Practice Model',
        documentReference: 'AI Validated Question Engine (Gemma-4 / Nemotron)',
      },
      status: 'approved',
    });
  }

  return validatedQuestions;
}

export async function askAITutor(query: string, contextQuestion?: string): Promise<{
  conceptExplanation: string;
  stepByStepSolution: string;
  shortcutHack: string;
  similarPracticeTip: string;
}> {
  const systemPrompt = `You are the ParikshaAI Senior Exam Mentor for Indian Competitive Aspirants (SSC CGL, CHSL, MTS, CPO, Railways RRB NTPC).
Provide crystal-clear, structured answers that empower students to clear cutoffs with high speed.
Format your response as valid JSON with the following keys:
{
  "conceptExplanation": "Core concept behind this problem in simple language",
  "stepByStepSolution": "Clean step-by-step derivation without missing steps",
  "shortcutHack": "Vedic trick, elimination technique, or 20-second shortcut",
  "similarPracticeTip": "What to watch out for in actual examination shifts"
}`;

  const promptContent = contextQuestion
    ? `Student has a question regarding this problem:\n"${contextQuestion}"\n\nStudent Doubt: "${query}"`
    : `Student Doubt: "${query}"`;

  const raw = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: promptContent },
  ]);

  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      conceptExplanation: raw,
      stepByStepSolution: 'Please review the standard formula application above.',
      shortcutHack: 'Eliminate options using unit digits or parity checks.',
      similarPracticeTip: 'Practice 15-20 similar questions under a 45-second timer.',
    };
  }
}

export interface KidTeacherResult {
  correctAnswerStatement: string;
  whyLikeThis: string;
  babySteps: string[];
  whyOtherOptionsWrong?: string;
  commonTrap: string;
  memoryHack: string;
}

export async function askKidTeacher(params: {
  questionText: string;
  options: { label: string; text: string }[];
  correctOption: string;
  userSelected?: string;
  subjectCode: string;
}): Promise<KidTeacherResult> {
  const isEnglish = params.subjectCode === 'english' || params.questionText.toLowerCase().includes('grammat') || params.questionText.toLowerCase().includes('synonym') || params.questionText.toLowerCase().includes('idiom');

  const systemPrompt = `You are a warm, friendly teacher explaining a competitive exam question so simply that a 10-year-old child or complete beginner understands effortlessly without feeling stupid.

TEACHING PRINCIPLES:
1. Explain the answer like telling an easy, engaging story to a kid.
2. If subject is English (grammar, error spotting, idiom, vocabulary):
   - Clearly state the correct answer upfront.
   - Explain "Why like this?" using the simple Golden Rule of English (e.g. subject-verb agreement neighbor rule, tense rule, preposition clue).
   - Explain why other options are wrong or why the student's selected option was a trap.
   - Give a fun mnemonic or rhyme to remember forever.
3. If subject is Math/Reasoning/Science:
   - Use an everyday story (e.g., buying candies, sharing toys, pocket money).
   - Give 2-4 baby steps that anyone can follow to find the answer easily without confusing algebra.
   - Explain "The Sneaky Trap": why examiners set this trap and why students pick the wrong option.
   - Give an easy 10-second shortcut or eye trick.

Return valid JSON strictly with this schema:
{
  "correctAnswerStatement": "Clear friendly statement of the correct option and what it is",
  "whyLikeThis": "Why this answer is right, explained simply like teaching a kid with the golden rule",
  "babySteps": [
    "Step 1: Look at the clue...",
    "Step 2: Ask this 1 simple question...",
    "Step 3: Boom! Here is the answer..."
  ],
  "whyOtherOptionsWrong": "Why the wrong options fail and why the chosen option was a trap",
  "commonTrap": "The sneaky trap most students fall into",
  "memoryHack": "A catchy rhyme or 5-second trick to never forget"
}`;

  const promptContent = `Question:
"${params.questionText}"

Options:
${params.options.map((o) => `${o.label}) ${o.text}`).join('\n')}

Official Correct Option: ${params.correctOption}
${params.userSelected ? `Student Selected: ${params.userSelected} (which was WRONG)` : 'Student skipped this question'}
Subject: ${params.subjectCode}

Please explain this so simply like teaching a kid, telling the answer and why like this!`;

  try {
    const raw = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: promptContent },
    ]);

    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleaned);
    return {
      correctAnswerStatement: parsed.correctAnswerStatement || `The correct answer is Option ${params.correctOption}!`,
      whyLikeThis: parsed.whyLikeThis || 'Here is why this option is correct using simple everyday rules.',
      babySteps: Array.isArray(parsed.babySteps) && parsed.babySteps.length > 0 ? parsed.babySteps : ['Look at the main keyword in the question.', 'Check the simple rule.', 'Match with the correct option.'],
      whyOtherOptionsWrong: parsed.whyOtherOptionsWrong || 'The other options do not follow the exact rule or change the meaning.',
      commonTrap: parsed.commonTrap || 'Examiners design options that sound right to the ear but break the formal rule.',
      memoryHack: parsed.memoryHack || 'Golden Rule: Look for the key trigger word before picking an option!',
    };
  } catch (err) {
    // Intelligent fallback kid teacher response based on subject
    const correctOptObj = params.options.find((o) => o.label === params.correctOption);
    const correctText = correctOptObj ? correctOptObj.text : params.correctOption;

    if (isEnglish) {
      return {
        correctAnswerStatement: `The correct answer is Option ${params.correctOption}: "${correctText}"!`,
        whyLikeThis: `In English, sentences must follow the Golden Agreement Rule. Look at the key word closest to the verb or the core subject. That word decides whether we use singular or plural, past or present. Option ${params.correctOption} is the only one that obeys this rule perfectly!`,
        babySteps: [
          `Step 1: Find the trigger word in the sentence (look for pairs like 'neither...nor', prepositions, or singular/plural subjects).`,
          `Step 2: Ask: "Who is doing the action right next to the verb?"`,
          `Step 3: Pick the option that matches that subject without adding extra words. Option ${params.correctOption} fits like a glove!`
        ],
        whyOtherOptionsWrong: `The other options are traps! They sound okay if you speak quickly, but grammatically they pair singular verbs with plural subjects or use the wrong tense.`,
        commonTrap: `Students often read by 'ear' and pick what sounds familiar. But exam questions test the specific written rule, not casual spoken slang!`,
        memoryHack: `Golden Rule: Never guess by sound! Find the subject first, then match the verb like matching socks!`
      };
    }

    return {
      correctAnswerStatement: `The correct answer is Option ${params.correctOption}: "${correctText}"!`,
      whyLikeThis: `Let's make this simple! Instead of scary formulas, imagine this with real things you can touch (like ₹100 pocket money or chocolates). When you break it down into easy numbers, the answer pops right out!`,
      babySteps: [
        `Step 1: Start with an easy base number (like 100 or the lowest common multiple).`,
        `Step 2: Do each action one step at a time without jumping ahead.`,
        `Step 3: Check your result against Option ${params.correctOption}. It matches directly!`
      ],
      whyOtherOptionsWrong: `The other options represent standard calculation traps—like calculating discount on the wrong base or forgetting negative signs.`,
      commonTrap: `Examiners know where students rush and make hasty additions. Don't rush; do the simple 3 steps!`,
      memoryHack: `Quick Hack: Always check the unit digit or use round numbers (100) to test options in under 15 seconds!`
    };
  }
}

