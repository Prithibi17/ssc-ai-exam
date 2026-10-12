const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'dsssb_papers');
const files = fs.readdirSync(outDir);

const textQuestions = [];
const seenStems = new Set();
const seenIds = new Set();

files.forEach(f => {
  const qs = JSON.parse(fs.readFileSync(path.join(outDir, f), 'utf8'));
  qs.forEach(q => {
    if (typeof q.questionText !== 'string') return;
    const text = q.questionText.trim();
    if (
      !text.startsWith('data:image') &&
      !text.startsWith('/9j/') &&
      text.length > 10 &&
      !text.startsWith('Question ')
    ) {
      const optsOk = Array.isArray(q.options) && q.options.every(o => {
        if (!o || typeof o.text !== 'string') return false;
        const ot = o.text.trim();
        return !ot.startsWith('data:image') && !ot.startsWith('/9j/') && ot.length > 0;
      });

      if (optsOk) {
        const stemNormalized = text.toLowerCase();
        if (!seenStems.has(stemNormalized)) {
          seenStems.add(stemNormalized);

          let finalId = q.id;
          if (seenIds.has(finalId)) {
            let counter = 2;
            while (seenIds.has(`${finalId}_dup${counter}`)) {
              counter++;
            }
            finalId = `${finalId}_dup${counter}`;
          }
          seenIds.add(finalId);

          textQuestions.push({
            ...q,
            id: finalId,
            questionText: text,
            options: q.options.map(o => ({
              label: o.label,
              text: String(o.text || '').trim()
            }))
          });
        }
      }
    }
  });
});

console.log('Writing', textQuestions.length, 'questions to src/data/dsssb_text_questions.ts');

const fileContent = `import { Question } from '@/types';

// Auto-generated 595 authentic official DSSSB text questions from official papers
export const DSSSB_TEXT_QUESTIONS: Question[] = ${JSON.stringify(textQuestions, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'dsssb_text_questions.ts'), fileContent, 'utf8');
console.log('Done!');
