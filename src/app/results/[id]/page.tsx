'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Target,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Bookmark,
  RotateCcw,
  Zap,
  ArrowRight,
  ShieldCheck,
  FileText,
  Sparkles,
  Smile,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  GraduationCap,
} from 'lucide-react';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { TestSummaryReport, QuestionResultBreakdown, Question, KidExplanation } from '@/types';
import { VERIFIED_PYQ_QUESTIONS } from '@/data/questions';

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { pastAttempts, toggleBookmark, isBookmarked, addMistake, profile } = usePlatformStore();

  const [report, setReport] = useState<TestSummaryReport | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct' | 'unattempted'>('all');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [solutionTabs, setSolutionTabs] = useState<Record<string, 'kid' | 'standard'>>({});
  const [aiTeacherLoading, setAiTeacherLoading] = useState<Record<string, boolean>>({});
  const [aiTeacherData, setAiTeacherData] = useState<Record<string, any>>({});
  const [mistakeAddedMsg, setMistakeAddedMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    const found = pastAttempts.find((a) => a.testId === id);
    if (found) {
      setReport(found);
    } else if (pastAttempts.length > 0) {
      setReport(pastAttempts[0]);
    } else {
      const mockQuestions = VERIFIED_PYQ_QUESTIONS.slice(0, 10);
      const results: QuestionResultBreakdown[] = mockQuestions.map((q, idx) => {
        const isCorrect = idx < 6;
        const isAttempted = idx < 9;
        const selected = isAttempted ? (isCorrect ? q.correctOption : 'D') : undefined;
        return {
          question: q,
          userSelected: selected,
          isCorrect,
          isAttempted,
          marksAwarded: isAttempted ? (isCorrect ? 2.0 : -0.5) : 0,
          timeSpentSeconds: 30 + idx * 12,
          timeClassification: isAttempted
            ? isCorrect
              ? idx % 2 === 0
                ? 'fast_correct'
                : 'slow_correct'
              : 'careless_error'
            : 'skipped',
        };
      });

      const demoReport: TestSummaryReport = {
        attemptId: `att_${id}`,
        testId: id,
        title: 'Staff Selection Commission - Combined Graduate Level Tier-I Diagnostic Exam',
        mode: 'official_simulation',
        examName: 'SSC CGL Tier-1',
        startedAt: new Date(Date.now() - 1800000).toISOString(),
        submittedAt: new Date().toISOString(),
        totalTimeSpentSeconds: 1640,
        totalQuestions: 10,
        attemptedQuestions: 9,
        correctCount: 6,
        incorrectCount: 3,
        unattemptedCount: 1,
        totalScore: 10.5,
        maxMarks: 20.0,
        accuracyPercentage: 66.7,
        percentileEstimate: 84.5,
        projectedRank: 32400,
        sectionBreakdown: [
          { sectionName: 'Quantitative Aptitude', totalQuestions: 4, attempted: 4, correct: 3, score: 5.5, accuracy: 75 },
          { sectionName: 'General Intelligence & Reasoning', totalQuestions: 3, attempted: 3, correct: 2, score: 3.5, accuracy: 67 },
          { sectionName: 'English Comprehension', totalQuestions: 2, attempted: 2, correct: 1, score: 1.5, accuracy: 50 },
          { sectionName: 'General Awareness', totalQuestions: 1, attempted: 0, correct: 0, score: 0.0, accuracy: 0 },
        ],
        topicBreakdown: [
          { topicCode: 'profit_loss', topicName: 'Profit & Loss', total: 2, correct: 2, accuracy: 100, isWeak: false },
          { topicCode: 'trigonometry', topicName: 'Trigonometry', total: 1, correct: 0, accuracy: 0, isWeak: true },
          { topicCode: 'spotting_errors', topicName: 'Spotting Errors', total: 1, correct: 0, accuracy: 0, isWeak: true },
          { topicCode: 'coding_decoding', topicName: 'Coding - Decoding', total: 2, correct: 1, accuracy: 50, isWeak: true },
        ],
        questionResults: results,
        aiAnalysisRecommendation:
          'Good foundation. Identified weak spots in English Subject-Verb Agreement and Geometry. Learn the simplified kid-friendly rules below to never fall into exam traps again.',
      };
      setReport(demoReport);
    }
  }, [id, pastAttempts]);

  if (!report) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500 text-xs">
        Loading test evaluation scorecard...
      </div>
    );
  }

  const toggleSolution = (qId: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleAddMistake = (qResult: QuestionResultBreakdown, tag: any) => {
    addMistake({
      questionId: qResult.question.id,
      questionText: qResult.question.questionText,
      correctAnswer: `${qResult.question.correctOption}: ${qResult.question.options.find((o) => o.label === qResult.question.correctOption)?.text}`,
      userAnswer: qResult.userSelected ? `${qResult.userSelected}` : 'Unattempted',
      explanation: qResult.question.explanation.standard,
      topicName: qResult.question.topicCode,
      examName: report.examName,
      tag: tag || 'concept_gap',
      notes: 'Added from Mock Test Review',
    });
    setMistakeAddedMsg((prev) => ({ ...prev, [qResult.question.id]: 'Added to Mistake Notebook!' }));
  };

  const handleAskKidTeacher = async (q: Question, userSelected?: string) => {
    setAiTeacherLoading((prev) => ({ ...prev, [q.id]: true }));
    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'kid_teacher',
          questionData: {
            questionText: q.questionText,
            options: q.options,
            correctOption: q.correctOption,
            userSelected,
            subjectCode: q.subjectCode,
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAiTeacherData((prev) => ({ ...prev, [q.id]: json.data }));
      }
    } catch (err) {
      console.error('Error fetching kid teacher response:', err);
    } finally {
      setAiTeacherLoading((prev) => ({ ...prev, [q.id]: false }));
    }
  };

  const filteredQuestions = report.questionResults.filter((r) => {
    if (filterMode === 'incorrect') return r.isAttempted && !r.isCorrect;
    if (filterMode === 'correct') return r.isCorrect;
    if (filterMode === 'unattempted') return !r.isAttempted;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-xs">
      {/* 1. Official Scorecard Header Box */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F1F5F9] gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#155DFC] text-[10px] font-bold px-2.5 py-0.5">
                Official Evaluation & Response Sheet
              </span>
              <span className="text-[11px] text-[#94A3B8] font-mono">
                ID: {report.attemptId}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111B32] tracking-tight">
              {report.title}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/mock-setup"
              className="rounded-xl bg-[#155DFC] hover:bg-[#124BD4] px-4 py-2 text-xs font-bold text-white transition-all shadow-xs"
            >
              Take Another Mock
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Candidate & Attempt Summary Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl border border-[#E2E8F0]">
          <div>
            <span className="text-[#94A3B8] block text-[10px] uppercase font-bold tracking-wider">Candidate Name</span>
            <span className="font-bold text-[#111B32] text-xs sm:text-sm mt-0.5 block">{profile.fullName || 'Candidate'}</span>
          </div>
          <div>
            <span className="text-[#94A3B8] block text-[10px] uppercase font-bold tracking-wider">Exam Date</span>
            <span className="text-[#475569] font-medium text-xs sm:text-sm mt-0.5 block">
              {new Date(report.submittedAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-[#94A3B8] block text-[10px] uppercase font-bold tracking-wider">Time Taken</span>
            <span className="text-[#475569] font-medium text-xs sm:text-sm mt-0.5 block">
              {Math.floor(report.totalTimeSpentSeconds / 60)}m {report.totalTimeSpentSeconds % 60}s
            </span>
          </div>
          <div>
            <span className="text-[#94A3B8] block text-[10px] uppercase font-bold tracking-wider">Attempted</span>
            <span className="font-bold text-[#111B32] text-xs sm:text-sm mt-0.5 block">
              {report.attemptedQuestions} / {report.totalQuestions} Qs
            </span>
          </div>
        </div>

        {/* 4 Score Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-card">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Net Score</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold text-[#111B32]">
                {report.totalScore.toFixed(2)}
              </span>
              <span className="text-[#94A3B8] text-xs font-medium">/ {report.maxMarks}</span>
            </div>
            <span className="text-[11px] text-[#64748B]">After penalty deduction</span>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-card">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Accuracy Rate</span>
            <div className="text-2xl font-extrabold text-[#059669] mt-1">
              {report.accuracyPercentage}%
            </div>
            <span className="text-[11px] text-[#64748B]">
              {report.correctCount} Correct • {report.incorrectCount} Incorrect
            </span>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-card">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Percentile</span>
            <div className="text-2xl font-extrabold text-[#155DFC] mt-1">
              {report.percentileEstimate}%ile
            </div>
            <span className="text-[11px] text-[#64748B]">Projected cohort score</span>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-card">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Projected Rank</span>
            <div className="text-2xl font-extrabold text-[#111B32] mt-1">
              ~{report.projectedRank.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#64748B]">Estimated all-India rank</span>
          </div>
        </div>
      </div>

      {/* 2. Candidate Response Sheet with Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div>
            <h2 className="font-extrabold text-base text-[#111B32] tracking-tight">
              Candidate Response Sheet & Question Solutions
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Review your answers below. For wrong questions, read the <strong>&quot;Teach Me Like a Kid&quot;</strong> breakdown to easily understand key traps!
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                filterMode === 'all'
                  ? 'bg-[#155DFC] text-white shadow-xs'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#111B32]'
              }`}
            >
              All ({report.questionResults.length})
            </button>
            <button
              onClick={() => setFilterMode('incorrect')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                filterMode === 'incorrect'
                  ? 'bg-[#E11D48] text-white shadow-xs'
                  : 'bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]'
              }`}
            >
              Incorrect ({report.incorrectCount})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                filterMode === 'correct'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
              }`}
            >
              Correct ({report.correctCount})
            </button>
            <button
              onClick={() => setFilterMode('unattempted')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                filterMode === 'unattempted'
                  ? 'bg-[#475569] text-white shadow-xs'
                  : 'bg-[#F1F5F9] text-[#64748B]'
              }`}
            >
              Skipped ({report.unattemptedCount})
            </button>
          </div>
        </div>

        {/* Questions Feed */}
        <div className="space-y-4">
          {filteredQuestions.map((res, idx) => {
            const q = res.question;
            const isWrong = res.isAttempted && !res.isCorrect;
            const isExpanded = expandedSolutions[q.id] !== undefined ? expandedSolutions[q.id] : isWrong; // default open on wrong answers!
            const activeTab = solutionTabs[q.id] || 'kid'; // default to 'kid' mode!
            const bookmarked = isBookmarked(q.id);
            const isEnglish = q.subjectCode === 'english' || q.questionText.toLowerCase().includes('grammat') || q.questionText.toLowerCase().includes('synonym') || q.questionText.toLowerCase().includes('idiom');
            const kidData = q.explanation.kidFriendly;
            const liveAiData = aiTeacherData[q.id];

            return (
              <div
                key={`${q.id}_${idx}`}
                className={`rounded-2xl border bg-white p-5 sm:p-6 space-y-4 shadow-card transition-all duration-200 ${
                  isWrong
                    ? 'border-[#FECDD3] ring-1 ring-[#FFE4E6]'
                    : 'border-[#E2E8F0]'
                }`}
              >
                {/* Question Status Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="text-[#155DFC] font-extrabold">Q.{idx + 1}</span>
                    <span className="text-[#CBD5E1]">|</span>
                    <span className="text-[#64748B] font-semibold uppercase text-[10px]">
                      {q.subjectCode} • {q.topicCode}
                    </span>

                    {res.isCorrect ? (
                      <span className="rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] px-2.5 py-0.5 text-[10px] font-bold">
                        ✓ Correct (+{res.marksAwarded.toFixed(2)})
                      </span>
                    ) : res.isAttempted ? (
                      <span className="rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-[#E11D48] px-2.5 py-0.5 text-[10px] font-bold">
                        ✗ Incorrect ({res.marksAwarded.toFixed(2)})
                      </span>
                    ) : (
                      <span className="rounded-lg bg-[#F1F5F9] text-[#64748B] px-2.5 py-0.5 text-[10px] font-bold">
                        Unattempted (0.00)
                      </span>
                    )}

                    <span className="text-[#94A3B8] font-medium text-[11px]">Time: {res.timeSpentSeconds}s</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isWrong && (
                      <select
                        aria-label="Add to mistake notebook tag"
                        onChange={(e) => handleAddMistake(res, e.target.value)}
                        className="rounded-xl border border-[#FECDD3] bg-[#FFF1F2] px-2.5 py-1 text-[11px] font-bold text-[#E11D48] cursor-pointer focus:outline-none"
                      >
                        <option value="">+ Add to Mistake Notebook</option>
                        <option value="concept_gap">Concept Gap</option>
                        <option value="calculation_error">Calculation Error</option>
                        <option value="silly_mistake">Silly Mistake</option>
                        <option value="time_pressure">Time Pressure</option>
                      </select>
                    )}

                    <button
                      onClick={() => toggleBookmark(q)}
                      className={`p-1.5 rounded-xl border transition-all ${bookmarked ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]' : 'border-[#E2E8F0] text-[#94A3B8] hover:text-[#64748B]'}`}
                      title="Bookmark Question"
                    >
                      <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-[#D97706]' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* If wrong: Calm comparison banner */}
                {isWrong && (
                  <div className="rounded-xl bg-[#FFF1F2]/60 border border-[#FECDD3] p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-bold text-[#E11D48]">
                        <XCircle className="h-4 w-4 shrink-0 text-[#E11D48]" />
                        <span>Your Answer: Option ({res.userSelected})</span>
                      </div>
                      <span className="text-[#CBD5E1]">|</span>
                      <div className="flex items-center gap-1.5 font-bold text-[#059669]">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" />
                        <span>Official Answer: Option ({q.correctOption})</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#E11D48] bg-white border border-[#FECDD3] px-2 py-0.5 rounded-lg">
                      -{q.negativeMarks.toFixed(2)} negative penalty
                    </span>
                  </div>
                )}

                {mistakeAddedMsg[q.id] && (
                  <p className="text-[11px] font-bold text-[#059669]">
                    ✓ {mistakeAddedMsg[q.id]}
                  </p>
                )}

                {/* Question Statement */}
                <div className="text-sm font-semibold text-[#111B32] leading-relaxed whitespace-pre-line">
                  {q.questionText && (q.questionText.startsWith('data:image') || q.questionText.startsWith('http') || q.questionText.startsWith('/9j/')) ? (
                    <img
                      src={q.questionText.startsWith('/9j/') ? `data:image/jpeg;base64,${q.questionText}` : q.questionText}
                      alt="Question Statement"
                      className="max-w-full max-h-72 object-contain rounded-lg border border-slate-200 my-2 bg-white"
                    />
                  ) : (
                    q.questionText
                  )}
                </div>

                {/* 4 Choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {q.options.map((opt) => {
                    const isKey = opt.label === q.correctOption;
                    const isChosen = opt.label === res.userSelected;

                    let optionStyle = 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155]';
                    if (isKey) optionStyle = 'border-[#059669] bg-[#ECFDF5] text-[#065F46] font-bold shadow-xs';
                    else if (isChosen && !isKey) optionStyle = 'border-[#E11D48] bg-[#FFF1F2] text-[#9F1239] font-bold';

                    return (
                      <div key={opt.label} className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${optionStyle}`}>
                        <div className="flex items-center gap-2.5">
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                            isKey ? 'bg-[#059669] text-white' : isChosen ? 'bg-[#E11D48] text-white' : 'bg-white border border-[#CBD5E1] text-[#475569]'
                          }`}>
                            {opt.label}
                          </span>
                          {opt.text && (opt.text.startsWith('data:image') || opt.text.startsWith('http') || opt.text.startsWith('/9j/')) ? (
                            <img
                              src={opt.text.startsWith('/9j/') ? `data:image/jpeg;base64,${opt.text}` : opt.text}
                              alt={`Option ${opt.label}`}
                              className="max-h-16 max-w-full object-contain rounded border border-slate-200 bg-white"
                            />
                          ) : (
                            <span className="font-medium">{opt.text}</span>
                          )}
                        </div>
                        {isKey && (
                          <span className="text-[10px] font-bold text-[#059669] bg-white border border-[#A7F3D0] px-2 py-0.5 rounded-lg shrink-0">
                            Key ✓
                          </span>
                        )}
                        {isChosen && !isKey && (
                          <span className="text-[10px] font-bold text-[#E11D48] bg-white border border-[#FECDD3] px-2 py-0.5 rounded-lg shrink-0">
                            Your Choice ✗
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Solution Accordion & Kid-Teacher Mode Switcher */}
                <div className="pt-3 border-t border-[#F1F5F9] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    {/* Method Switcher Tabs */}
                    <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
                      <button
                        type="button"
                        onClick={() => {
                          setSolutionTabs((prev) => ({ ...prev, [q.id]: 'kid' }));
                          setExpandedSolutions((prev) => ({ ...prev, [q.id]: true }));
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeTab === 'kid'
                            ? 'bg-[#155DFC] text-white shadow-xs'
                            : 'text-[#64748B] hover:text-[#111B32]'
                        }`}
                      >
                        <Smile className="h-3.5 w-3.5" />
                        <span>Teach Me Like a Kid</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSolutionTabs((prev) => ({ ...prev, [q.id]: 'standard' }));
                          setExpandedSolutions((prev) => ({ ...prev, [q.id]: true }));
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeTab === 'standard'
                            ? 'bg-[#0F172A] text-white shadow-xs'
                            : 'text-[#64748B] hover:text-[#111B32]'
                        }`}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Standard Method</span>
                      </button>
                    </div>

                    {/* Toggle Open/Close button */}
                    <button
                      onClick={() => toggleSolution(q.id)}
                      className="text-xs font-bold text-[#155DFC] hover:text-[#124BD4] flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Solution' : 'View Full Solution'}</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* EXPANDED SOLUTION PANEL */}
                  {isExpanded && (
                    <div className="space-y-3 pt-1">
                      {/* VIEW 1: TEACH ME LIKE A KID (Simple, Engaging, Clear, Flat UI) */}
                      {activeTab === 'kid' && (
                        <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF]/60 p-4 sm:p-5 space-y-4 text-[#111B32]">
                          {/* Kid Teacher Header */}
                          <div className="flex items-center justify-between border-b border-[#DBEAFE] pb-3">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">👨‍🏫</span>
                              <div>
                                <span className="font-extrabold text-xs text-[#1E40AF] uppercase tracking-wide block">
                                  Kid-Teacher Explanation • {isEnglish ? 'Special English Rule' : 'Simple Story Method'}
                                </span>
                                <span className="text-[11px] text-[#64748B]">
                                  How to find the answer easily without stress
                                </span>
                              </div>
                            </div>

                            {/* Ask AI Teacher Button */}
                            <button
                              type="button"
                              onClick={() => handleAskKidTeacher(q, res.userSelected)}
                              disabled={aiTeacherLoading[q.id]}
                              className="rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] px-3 py-1.5 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-xs"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>{aiTeacherLoading[q.id] ? 'Thinking...' : 'Ask AI Kid-Teacher'}</span>
                            </button>
                          </div>

                          {/* SECTION 1: WHAT IS THE ANSWER & WHY LIKE THIS */}
                          {isEnglish ? (
                            /* SPECIAL ENGLISH WHY-LIKE-THIS BREAKDOWN (Calm flat layout) */
                            <div className="space-y-3">
                              {/* 1. Clear Answer Announcement */}
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                  1. The Exact Correct Answer
                                </span>
                                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mt-0.5">
                                  Option ({q.correctOption}): &quot;{q.options.find((o) => o.label === q.correctOption)?.text}&quot;
                                </p>
                              </div>

                              {/* 2. Why Like This (The Golden Rule) */}
                              <div className="space-y-1">
                                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                  <span>Why Like This? (The Simple Golden Rule)</span>
                                </span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {kidData?.whyLikeThis ||
                                    `In English, sentences must follow the Golden Agreement Rule. Look at the key word closest to the verb or the core subject. That word decides whether we use singular or plural, past or present. Option (${q.correctOption}) is the only choice that obeys this rule perfectly without creating a grammatical contradiction!`}
                                </p>
                              </div>

                              {/* 3. Baby Steps to Find it Easily */}
                              <div className="space-y-1.5">
                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                  👣 How to Find the Answer Easily (Baby Steps):
                                </span>
                                <ul className="space-y-1 pl-1 text-[11px] text-slate-700 dark:text-slate-300">
                                  {(kidData?.babySteps || [
                                    "Step 1: Spot the key trigger words (pairs like 'Neither...nor', prepositions, or singular/plural subjects).",
                                    "Step 2: Ask: 'Who is doing the action right next to the verb?'",
                                    `Step 3: Match the subject and verb like matching identical socks! Option (${q.correctOption}) fits smoothly!`
                                  ]).map((step, sIdx) => (
                                    <li key={sIdx} className="flex items-start gap-2">
                                      <span className="font-bold text-[#0b3a75] dark:text-blue-400 shrink-0">•</span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* 4. Why Other Options are Wrong / Common Trap */}
                              <div className="space-y-1">
                                <span className="text-xs font-bold text-red-800 dark:text-red-400 block">
                                  ⚠️ Why Other Options are Wrong & Traps:
                                </span>
                                {kidData?.whyOptionsWrong ? (
                                  <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                                    {kidData.whyOptionsWrong.map((item, wIdx) => (
                                      <div key={wIdx}>
                                        <strong className="text-slate-900 dark:text-white">Option {item.option}:</strong> {item.reason}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                                    The other choices are traps set by the examiner! They sound fine if you read them casually in slang, but in written grammar they violate agreement rules.
                                  </p>
                                )}
                              </div>

                              {/* 5. Memory Hack */}
                              <div className="rounded border border-emerald-200 bg-emerald-50/70 p-2.5 text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                                <span>
                                  <strong>Memory Trick:</strong> {kidData?.memoryHack || 'Never guess by ear! Find the subject first, then match the verb!'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* MATH / REASONING / GA KID-FRIENDLY BREAKDOWN (Calm flat layout) */
                            <div className="space-y-3">
                              {/* 1. The Simple Everyday Story */}
                              <div className="space-y-1">
                                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                  <span>The Simple Everyday Story (No Scary Formulas):</span>
                                </span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {kidData?.simpleStory ||
                                    q.explanation.beginner ||
                                    "Imagine this with small real numbers (like ₹100 pocket money or sharing candies). When you break it down into simple steps, the answer becomes obvious!"}
                                </p>
                              </div>

                              {/* 2. Baby Steps to Find Answer Easily */}
                              <div className="space-y-1.5">
                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                  👣 3 Easy Baby Steps to Find the Answer:
                                </span>
                                <ul className="space-y-1 pl-1 text-[11px] text-slate-700 dark:text-slate-300">
                                  {(kidData?.babySteps || [
                                    "Step 1: Start with an easy base number (like 100 or the lowest common multiple).",
                                    "Step 2: Do each action one step at a time without jumping ahead.",
                                    `Step 3: Compare your result with the options. Option (${q.correctOption}) matches directly!`
                                  ]).map((step, sIdx) => (
                                    <li key={sIdx} className="flex items-start gap-2">
                                      <span className="font-bold text-[#0b3a75] dark:text-blue-400 shrink-0">•</span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* 3. The Sneaky Trap */}
                              <div className="space-y-1">
                                <span className="text-xs font-bold text-red-800 dark:text-red-400 block">
                                  ⚠️ The Sneaky Trap (Why people get this wrong):
                                </span>
                                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {kidData?.commonTrap ||
                                    "Examiners count on students rushing and calculating on the wrong base or forgetting negative signs. Take 5 seconds to double check the question's ending requirement!"}
                                </p>
                              </div>

                              {/* 4. 10-Second Eye Shortcut */}
                              {q.explanation.shortcut && (
                                <div className="rounded border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300 flex items-center gap-2">
                                  <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                  <span>
                                    <strong>10-Second Eye Trick:</strong> {q.explanation.shortcut}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* LIVE AI KID-TEACHER SPEECH BUBBLE (If triggered) */}
                          {liveAiData && (
                            <div className="rounded-lg bg-blue-50 border border-blue-300 p-3.5 space-y-2 mt-3 animate-fadeIn">
                              <div className="flex items-center gap-2 text-[#0b3a75] font-bold text-xs">
                                <span className="text-base">🤖</span>
                                <span>Personalized AI Kid-Teacher Advice:</span>
                              </div>
                              <p className="font-bold text-slate-900 text-xs">
                                {liveAiData.correctAnswerStatement}
                              </p>
                              <p className="text-xs text-slate-700 leading-relaxed">
                                {liveAiData.whyLikeThis}
                              </p>
                              {liveAiData.whyOtherOptionsWrong && (
                                <div className="text-[11px] text-red-900 bg-red-50 p-2 rounded border border-red-200">
                                  <strong>Why Your Pick Was a Trap:</strong> {liveAiData.whyOtherOptionsWrong}
                                </div>
                              )}
                              {liveAiData.memoryHack && (
                                <div className="text-[11px] text-emerald-900 bg-emerald-50 p-2 rounded border border-emerald-200 font-medium">
                                  <strong>Golden Trick:</strong> {liveAiData.memoryHack}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* VIEW 2: STANDARD ACADEMIC METHOD */}
                      {activeTab === 'standard' && (
                        <div className="p-3.5 rounded bg-slate-50 border border-slate-300 space-y-2.5 text-xs text-slate-800 leading-relaxed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                          <div>
                            <strong className="block text-slate-900 dark:text-white font-bold mb-1">
                              Rigorous Academic Derivation:
                            </strong>
                            <p className="font-mono text-[11px] bg-white p-2.5 rounded border border-slate-200 text-slate-900 dark:bg-slate-900 dark:text-white dark:border-slate-800 whitespace-pre-line">
                              {q.explanation.standard}
                            </p>
                          </div>
                          {q.explanation.shortcut && (
                            <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-950 font-medium">
                              <strong>Speed Formula / Shortcut:</strong> {q.explanation.shortcut}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
