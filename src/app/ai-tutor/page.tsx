'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Zap,
  BookOpen,
  ArrowRight,
  Send,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Smile,
  GraduationCap,
  Sparkles,
  Lightbulb,
  Bot,
} from 'lucide-react';
import { SUBJECTS_CATALOGUE, TOPICS_CATALOGUE } from '@/data/exams';
import { Question } from '@/types';
import { createTestSession } from '@/lib/testEngine';
import { saveActiveTestSession } from '@/lib/store/usePlatformStore';
import { useRouter } from 'next/navigation';

export default function DoubtSolverPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [teachMode, setTeachMode] = useState<'kid' | 'mentor'>('kid');
  const [isSolving, setIsSolving] = useState(false);
  const [solutionResult, setSolutionResult] = useState<{
    conceptExplanation: string;
    stepByStepSolution: string;
    shortcutHack: string;
    similarPracticeTip: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Practice Generator State
  const [genSubject, setGenSubject] = useState('Quantitative Aptitude');
  const [genTopic, setGenTopic] = useState('Profit, Loss & Discount');
  const [genDifficulty, setGenDifficulty] = useState('medium');
  const [genCount, setGenCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  const sampleKidPrompts = [
    '🧒 English: Why do we say "Neither the teacher nor the students were" and not "was"? Explain like teaching a kid.',
    '🧒 English: How do I spot Subject-Verb errors in 5 seconds without getting confused?',
    '🧒 English: Why is "Scrupulous" a synonym for "Meticulous"? Tell me a simple story.',
    '🧒 Math: How do I calculate profit after a 15% discount on marked price without confusing algebra?',
    '🧒 Reasoning: How do I solve "All books are pens, some pens are erasers" with simple circles?',
  ];

  const sampleMentorPrompts = [
    'How do I calculate difference between CI and SI for 3 years without lengthy algebra?',
    'What is the quickest trick to identify unit digits of numbers like 7^95 - 3^58?',
    'Explain the rule of proximity in Subject-Verb Agreement for Neither... Nor with examples.',
    'What are the key Supreme Court writs under Article 32 and how are they asked in SSC CGL?',
  ];

  const handleAskTutor = async (textToAsk?: string) => {
    let q = textToAsk || query;
    if (!q.trim()) return;

    if (teachMode === 'kid' && !q.toLowerCase().includes('kid') && !q.toLowerCase().includes('simple')) {
      q = `Please teach this like you are explaining to a 10-year-old kid in simple everyday language. If it is English, explain what the answer is, WHY like this with the simple golden rule, why other options are traps, and give a memory trick: ${q}`;
    }

    setIsSolving(true);
    setErrorMsg(null);
    setSolutionResult(null);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch explanation.');
      }

      setSolutionResult(json.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error communicating with doubt solver service.');
    } finally {
      setIsSolving(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: genSubject,
          topic: genTopic,
          difficulty: genDifficulty,
          examCode: 'ssc_cgl',
          count: genCount,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate practice questions.');
      }

      setGeneratedQuestions(json.questions);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to generate questions. Check API configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartDrill = () => {
    if (generatedQuestions.length === 0) return;
    const session = createTestSession(
      {
        id: `ai_drill_${Date.now()}`,
        title: `AI Adaptive Drill: ${genSubject} (${genTopic})`,
        mode: 'topic_practice',
        targetExamId: 'ssc_cgl',
        subjectCodes: ['quant', 'reasoning', 'english', 'ga'],
        questionCount: generatedQuestions.length,
        durationMinutes: Math.max(5, Math.round(generatedQuestions.length * 1.5)),
        marksPerCorrect: 2.0,
        negativeMarking: 0.5,
        allowPause: true,
        sourceFilter: 'ai_augmented',
      },
      generatedQuestions
    );
    saveActiveTestSession(session);
    router.push(`/test/${session.testId}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-xs">
      {/* Title & Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              AI Doubt Tutor
            </h1>
            <p className="text-xs text-slate-400">
              Ask your question and get step-by-step explanations, shortcuts, and tricks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTeachMode('kid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              teachMode === 'kid'
                ? 'bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>🧒</span>
            <span>Teach Me Like a Kid</span>
          </button>
          <button
            type="button"
            onClick={() => setTeachMode('mentor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              teachMode === 'mentor'
                ? 'bg-blue-100 text-blue-900 border border-blue-200 shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
            <span>Exam Cutoff Mentor</span>
          </button>
          <button
            type="button"
            onClick={() => { setQuery(''); setSolutionResult(null); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Query Form Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1.5">
            Type your doubt here...
          </label>
          <textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='English: Why do we say "Neither the teacher nor the students were" and not "was"? Explain like teaching a kid.'
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Filters and CTA bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Explanation Style
            </label>
            <select
              value={teachMode}
              onChange={(e) => setTeachMode(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="kid">Kid-Teacher Walkthrough</option>
              <option value="mentor">Exam Cutoff Mentor</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Subject
            </label>
            <select
              value={genSubject}
              onChange={(e) => setGenSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="English Language & Comprehension">English Grammar</option>
              <option value="Quantitative Aptitude">Quantitative Aptitude</option>
              <option value="General Intelligence & Reasoning">Reasoning</option>
              <option value="General Awareness">General Awareness</option>
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={() => handleAskTutor()}
              disabled={isSolving || !query.trim()}
              className="w-full rounded-xl bg-[#2563eb] py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>{isSolving ? 'Analyzing...' : 'Get Explanation →'}</span>
            </button>
          </div>
        </div>

        {/* Prompt Suggestions */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-400 font-medium">Try asking:</span>
          {(teachMode === 'kid' ? sampleKidPrompts : sampleMentorPrompts).slice(0, 4).map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuery(p);
                handleAskTutor(p);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {p.slice(0, 36)}...
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Solution Walkthrough Card */}
      {solutionResult && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧒</span>
              <h2 className="font-bold text-slate-900 text-sm">
                Kid-Teacher Walkthrough
              </h2>
            </div>
            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
              Concept Simplified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Steps Navigation */}
            <div className="md:col-span-3 space-y-1.5 border-r border-slate-100 pr-4">
              <button className="w-full text-left px-3 py-2 rounded-xl bg-[#2563eb] text-white font-bold text-xs flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                <span>Main Concept</span>
              </button>
              <button className="w-full text-left px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-xs flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                <span>Step-by-Step</span>
              </button>
              <button className="w-full text-left px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-xs flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                <span>Quick Trick</span>
              </button>
              <button className="w-full text-left px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-xs flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                <span>Examples</span>
              </button>
              <button className="w-full text-left px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-xs flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                <span>Common Mistakes</span>
              </button>
            </div>

            {/* Right Detailed Walkthrough Body */}
            <div className="md:col-span-9 space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-[#EFF6FF]/60 p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-[#111B32] text-sm flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span>Main Concept & Why Like This</span>
                    </h3>
                    <p className="text-[#111B32] leading-relaxed whitespace-pre-line text-xs">
                      {solutionResult.conceptExplanation}
                    </p>
                  </div>

                  {/* Character Illustration */}
                  <div className="h-28 w-28 shrink-0 rounded-2xl overflow-hidden border border-blue-200/60 bg-white p-1 shadow-2xs self-center sm:self-auto">
                    <img
                      src="/illustrations/teacher-character.jpg"
                      alt="AI Teacher Concept Guide"
                      className="h-full w-full object-cover object-top rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Step By Step */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">
                  Step-by-Step Explanation
                </h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {solutionResult.stepByStepSolution}
                </p>
              </div>

              {/* Quick Trick */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                  <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>Kid-Friendly Memory Hack</span>
                </span>
                <p className="text-amber-900 text-xs leading-relaxed">
                  {solutionResult.shortcutHack}
                </p>
              </div>

              {/* Final Answer Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Final Answer
                  </span>
                  <p className="text-xs font-semibold text-emerald-900">
                    {solutionResult.similarPracticeTip || 'Correct option verified according to the official rule.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Practice Question Generator */}
      {/* Practice Question Generator */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card space-y-5">
        <div>
          <h2 className="text-base font-bold text-[#111B32] tracking-tight">
            Practice Question Generator
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Produce targeted practice MCQs calibrated for specific subjects and difficulty levels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
              Subject
            </label>
            <select
              aria-label="Select Practice Subject"
              value={genSubject}
              onChange={(e) => setGenSubject(e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#111B32] font-medium focus:bg-white focus:outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#93C5FD]/40 transition-all"
            >
              <option value="Quantitative Aptitude">Quantitative Aptitude</option>
              <option value="General Intelligence & Reasoning">Reasoning</option>
              <option value="English Language & Comprehension">English Language</option>
              <option value="General Awareness">General Awareness</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
              Topic
            </label>
            <input
              type="text"
              value={genTopic}
              onChange={(e) => setGenTopic(e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#111B32] font-medium focus:bg-white focus:outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#93C5FD]/40 transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
              Difficulty
            </label>
            <select
              aria-label="Select Difficulty"
              value={genDifficulty}
              onChange={(e) => setGenDifficulty(e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#111B32] font-medium focus:bg-white focus:outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#93C5FD]/40 transition-all"
            >
              <option value="easy">Easy (Foundational)</option>
              <option value="medium">Medium (Standard Tier-I)</option>
              <option value="hard">Hard (Tier-II Decider)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
              Count
            </label>
            <select
              aria-label="Select Question Count"
              value={genCount}
              onChange={(e) => setGenCount(Number(e.target.value))}
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#111B32] font-medium focus:bg-white focus:outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#93C5FD]/40 transition-all"
            >
              <option value={1}>1 Question</option>
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleGenerateQuestions}
            disabled={isGenerating}
            className="rounded-xl bg-[#155DFC] hover:bg-[#124BD4] px-5 py-2.5 font-bold text-white disabled:opacity-50 transition-all text-xs shadow-xs"
          >
            {isGenerating ? 'Generating Calibrated MCQs...' : 'Generate Practice Questions →'}
          </button>
        </div>

        {/* Display Generated Questions */}
        {generatedQuestions.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-[#F1F5F9]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#111B32]">
                Generated Practice Set ({generatedQuestions.length} Questions)
              </h3>
              <button
                type="button"
                onClick={handleStartDrill}
                className="rounded-xl bg-[#059669] hover:bg-[#047857] px-4 py-2 font-bold text-white text-xs shadow-xs transition-all"
              >
                Launch Drill in CBT Console →
              </button>
            </div>

            <div className="space-y-3">
              {generatedQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 space-y-3"
                >
                  <div className="flex items-center justify-between text-[#64748B] font-semibold text-[11px]">
                    <span className="font-bold text-[#155DFC]">Question {idx + 1}</span>
                    <span className="text-[#059669] font-bold">Key: Option ({q.correctOption})</span>
                  </div>
                  <p className="font-semibold text-[#111B32] leading-relaxed">
                    {q.questionText}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {q.options.map((opt) => (
                      <div
                        key={opt.label}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                          opt.label === q.correctOption
                            ? 'border-[#059669] bg-[#ECFDF5] text-[#065F46] font-bold'
                            : 'border-[#E2E8F0] bg-white text-[#334155]'
                        }`}
                      >
                        <span className="font-bold">({opt.label})</span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 text-xs text-[#64748B] border-t border-[#E2E8F0]">
                    <strong className="text-[#111B32]">Explanation:</strong>{' '}
                    {q.explanation.beginner || q.explanation.standard}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
