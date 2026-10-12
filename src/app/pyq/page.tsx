'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ShieldCheck,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Zap,
  BookOpen,
  ArrowRight,
  Share2,
  CheckCircle2,
  Info,
  Sparkles,
  Crown,
  Lock,
} from 'lucide-react';
import { VERIFIED_PYQ_QUESTIONS } from '@/data/questions';
import {
  EXAMS_CATALOGUE,
  SUBJECTS_CATALOGUE,
  TOPICS_CATALOGUE,
  getExamSubjectCodes,
  getExamExcludedSubjects,
} from '@/data/exams';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { Question } from '@/types';

export default function PYQBankPage() {
  const { bookmarks, toggleBookmark, isBookmarked, isSubscribed } = usePlatformStore();

  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [questionLang, setQuestionLang] = useState<Record<string, 'en' | 'hi' | 'bn'>>({});

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setLang = (id: string, l: 'en' | 'hi' | 'bn') => {
    setQuestionLang((prev) => ({ ...prev, [id]: l }));
  };

  // Dynamic allowed subjects based on selected exam
  const allowedSubjectCodes = useMemo(() => {
    if (selectedExam === 'all') return SUBJECTS_CATALOGUE.map((s) => s.code);
    return getExamSubjectCodes(selectedExam);
  }, [selectedExam]);

  const excludedSubjects = useMemo(() => {
    if (selectedExam === 'all') return [];
    return getExamExcludedSubjects(selectedExam);
  }, [selectedExam]);

  // Handle changing exam: reset subject/topic if no longer valid
  const handleExamChange = (examId: string) => {
    setSelectedExam(examId);
    if (examId !== 'all') {
      const allowed = getExamSubjectCodes(examId);
      if (selectedSubject !== 'all' && !allowed.includes(selectedSubject)) {
        setSelectedSubject('all');
      }
      if (selectedTopic !== 'all') {
        const top = TOPICS_CATALOGUE.find((t) => t.code === selectedTopic);
        if (top) {
          const s = SUBJECTS_CATALOGUE.find((sub) => sub.id === top.subjectId);
          if (s && !allowed.includes(s.code)) {
            setSelectedTopic('all');
          }
        }
      }
    }
  };

  // Filtered list of subjects for dropdown
  const visibleSubjects = useMemo(() => {
    return SUBJECTS_CATALOGUE.filter((s) => allowedSubjectCodes.includes(s.code));
  }, [allowedSubjectCodes]);

  // Filtered list of topics for dropdown
  const visibleTopics = useMemo(() => {
    return TOPICS_CATALOGUE.filter((t) => {
      const s = SUBJECTS_CATALOGUE.find((sub) => sub.id === t.subjectId);
      if (!s) return false;
      if (!allowedSubjectCodes.includes(s.code)) return false;
      if (selectedSubject !== 'all' && s.code !== selectedSubject) return false;
      return true;
    });
  }, [allowedSubjectCodes, selectedSubject]);

  const filteredQuestions = useMemo(() => {
    return VERIFIED_PYQ_QUESTIONS.filter((q) => {
      if (selectedExam !== 'all' && q.provenance.examCode !== selectedExam) return false;
      if (selectedSubject !== 'all' && q.subjectCode !== selectedSubject) return false;
      if (selectedTopic !== 'all' && q.topicCode !== selectedTopic) return false;
      if (selectedYear !== 'all' && q.provenance.year.toString() !== selectedYear) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      if (search) {
        const query = search.toLowerCase();
        const matches =
          q.questionText.toLowerCase().includes(query) ||
          q.explanation.standard.toLowerCase().includes(query) ||
          q.provenance.examName.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [selectedExam, selectedSubject, selectedTopic, selectedYear, selectedDifficulty, search]);

  const currentExamObj = EXAMS_CATALOGUE.find((e) => e.id === selectedExam);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#155DFC]">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>100% Official Answer Key Provenance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111B32] tracking-tight">
          Previous Year Question Archive
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
          Search real official examination questions extracted from verified answer keys with step-by-step solutions, exam shortcuts, and AI teacher breakdowns.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-card space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search questions by keyword or topic (e.g. discount, Kathakali, Article 32, Dice)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#111B32] placeholder-[#94A3B8] focus:border-[#155DFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#93C5FD]/40 transition-all"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {/* Exam Filter */}
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
              Examination
            </label>
            <select
              value={selectedExam}
              onChange={(e) => handleExamChange(e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-[#111B32] font-medium focus:bg-white focus:outline-none focus:border-[#155DFC]"
            >
              <option value="all">All Examinations (Combined)</option>
              {EXAMS_CATALOGUE.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter (Dynamically adapts to selected exam) */}
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
              Subject {selectedExam !== 'all' ? `(${visibleSubjects.length} in Syllabus)` : ''}
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedTopic('all');
              }}
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-[#111B32] font-medium focus:bg-white focus:outline-none focus:border-[#155DFC]"
            >
              <option value="all">All Syllabus Subjects</option>
              {visibleSubjects.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Filter */}
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
              Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-[#111B32] font-medium focus:bg-white focus:outline-none focus:border-[#155DFC]"
            >
              <option value="all">All Topics</option>
              {visibleTopics.map((t) => (
                <option key={t.id} value={t.code}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
              Year Window
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-[#111B32] font-medium focus:bg-white focus:outline-none focus:border-[#155DFC]"
            >
              <option value="all">All Years (Rolling 10-Yr)</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-[#111B32] font-medium focus:bg-white focus:outline-none focus:border-[#155DFC]"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy (Foundational)</option>
              <option value="medium">Medium (Standard Exam)</option>
              <option value="hard">Hard (Advanced / Tricky)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Syllabus Notice if Exam has Excluded Subjects */}
        {excludedSubjects.length > 0 && currentExamObj && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs">
            <Info className="h-4 w-4 shrink-0 text-[#D97706]" />
            <span>
              <strong>{currentExamObj.name} Notice:</strong>{' '}
              {excludedSubjects.map((e) => e.name).join(', ')} is not part of this examination&apos;s syllabus and has been filtered out of the selection.
            </span>
          </div>
        )}

        {/* Subscription Gate Banner for Free Users */}
        {!isSubscribed && (
          <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-[#F5F3FF] via-white to-[#EFF6FF] p-5 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center font-bold shrink-0">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#111B32]">
                    PYQ Bank Solutions Locked (₹10 Micro-Subscription Required)
                  </span>
                  <span className="bg-[#7C3AED] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    JUST ₹10
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Scan the PhonePe QR code, send UTR to Telegram (+91 9800615892), and redeem your 1-time activation code to unlock all 5,000+ verified solutions & shortcuts.
                </p>
              </div>
            </div>
            <Link
              href="/subscription"
              className="rounded-xl bg-[#155DFC] hover:bg-[#124BD4] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-500/20 shrink-0 whitespace-nowrap"
            >
              Unlock PYQs for ₹10 →
            </Link>
          </div>
        )}
      </div>

      {/* Result Counter & Active Filters Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#64748B] px-1">
        <span>
          Showing <strong className="text-[#111B32]">{filteredQuestions.length}</strong> verified questions
          {selectedExam !== 'all' && currentExamObj && ` for ${currentExamObj.name}`}
        </span>
        <span className="text-[#059669] font-medium flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" /> Zero Manufactured Historical Papers
        </span>
      </div>

      {/* Question Cards Feed */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-12 text-center text-xs text-[#64748B] shadow-card">
            No questions matching the selected filter combination in the verified database.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isExpanded = !!expandedSolutions[q.id];
            const activeL = questionLang[q.id] || 'en';
            const bookmarked = isBookmarked(q.id);

            const qText =
              activeL === 'hi' && q.questionTextHi
                ? q.questionTextHi
                : activeL === 'bn' && q.questionTextBn
                ? q.questionTextBn
                : q.questionText;

            return (
              <div
                key={`${q.id}_${idx}`}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-4"
              >
                {/* Question Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-0.5 font-bold text-[#155DFC] text-[11px]">
                      Q.{idx + 1}
                    </span>
                    <span className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-0.5 font-semibold text-[#475569] text-[11px]">
                      {q.provenance.examName} • Shift {q.provenance.shift}
                    </span>
                    <span className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 font-bold text-[#059669] text-[11px]">
                      Official Verified Key
                    </span>
                    <span className="capitalize text-[#64748B] font-medium text-[11px] px-1">
                      Difficulty: {q.difficulty}
                    </span>
                  </div>

                  {/* Question Actions: Language switcher & Bookmark */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-0.5 text-[11px] font-semibold">
                      <button
                        onClick={() => setLang(q.id, 'en')}
                        className={`px-2.5 py-0.5 rounded-lg transition-colors ${activeL === 'en' ? 'bg-[#155DFC] text-white' : 'text-[#64748B] hover:text-[#111B32]'}`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLang(q.id, 'hi')}
                        className={`px-2.5 py-0.5 rounded-lg transition-colors ${activeL === 'hi' ? 'bg-[#155DFC] text-white' : 'text-[#64748B] hover:text-[#111B32]'}`}
                      >
                        HI
                      </button>
                      <button
                        onClick={() => setLang(q.id, 'bn')}
                        className={`px-2.5 py-0.5 rounded-lg transition-colors ${activeL === 'bn' ? 'bg-[#155DFC] text-white' : 'text-[#64748B] hover:text-[#111B32]'}`}
                      >
                        BN
                      </button>
                    </div>

                    <button
                      onClick={() => toggleBookmark(q)}
                      className={`p-2 rounded-xl border transition-all ${
                        bookmarked
                          ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]'
                          : 'border-[#E2E8F0] text-[#94A3B8] hover:text-[#64748B] hover:border-[#CBD5E1]'
                      }`}
                      title={bookmarked ? 'Saved in Bookmarks' : 'Save Question'}
                    >
                      <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-[#D97706]' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-sm sm:text-base font-semibold text-[#111B32] whitespace-pre-line leading-relaxed">
                  {qText && (qText.startsWith('data:image') || qText.startsWith('http') || qText.startsWith('/9j/')) ? (
                    <img
                      src={qText.startsWith('/9j/') ? `data:image/jpeg;base64,${qText}` : qText}
                      alt="Question Statement"
                      className="max-w-full max-h-72 object-contain rounded-lg border border-slate-200 my-2 bg-white"
                    />
                  ) : (
                    qText
                  )}
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm">
                  {q.options.map((opt) => {
                    const optText =
                      activeL === 'hi' && opt.textHi
                        ? opt.textHi
                        : activeL === 'bn' && opt.textBn
                        ? opt.textBn
                        : opt.text;
                    const isCorrectAnswer = opt.label === q.correctOption;

                    return (
                      <div
                        key={opt.label}
                        className={`flex items-center gap-3 rounded-xl border p-3 font-medium transition-all ${
                          isExpanded && isCorrectAnswer
                            ? 'border-[#059669] bg-[#ECFDF5] text-[#065F46] font-bold shadow-xs'
                            : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155]'
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            isExpanded && isCorrectAnswer
                              ? 'bg-[#059669] text-white'
                              : 'bg-white border border-[#CBD5E1] text-[#475569]'
                          }`}
                        >
                          {opt.label}
                        </span>
                        {optText && (optText.startsWith('data:image') || optText.startsWith('http') || optText.startsWith('/9j/')) ? (
                          <img
                            src={optText.startsWith('/9j/') ? `data:image/jpeg;base64,${optText}` : optText}
                            alt={`Option ${opt.label}`}
                            className="max-h-16 max-w-full object-contain rounded border border-slate-200 bg-white"
                          />
                        ) : (
                          <span className="flex-1">{optText}</span>
                        )}
                        {isExpanded && isCorrectAnswer && (
                          <span className="text-[11px] font-bold text-[#059669] shrink-0">
                            ✓ Official Key
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Solution Toggle Bar & AI Tutor Action */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#F1F5F9]">
                  <button
                    onClick={() => toggleSolution(q.id)}
                    className="flex items-center gap-2 text-xs font-bold text-[#155DFC] hover:text-[#124BD4] transition-colors"
                  >
                    <span>{isExpanded ? 'Hide Detailed Solution' : 'View Verified Solution & Speed Shortcuts'}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  <Link
                    href={`/ai-tutor?query=${encodeURIComponent(`Explain this ${q.provenance.examName} question step by step like a teacher: "${q.questionText}"`)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C3AED] hover:text-[#6D28D9] bg-[#F5F3FF] border border-[#DDD6FE] px-3 py-1.5 rounded-xl transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Ask 2D AI Tutor</span>
                  </Link>
                </div>

                {/* Expanded Multi-Tier Solution */}
                {isExpanded && (
                  <div className="mt-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF]/60 p-4 sm:p-5 space-y-3.5 text-xs leading-relaxed">
                    <div>
                      <span className="font-bold uppercase tracking-wider block text-[10px] text-[#1E40AF] mb-1">
                        1. Standard Solution & Formula
                      </span>
                      <p className="text-[#1E293B] font-medium">{q.explanation.standard}</p>
                    </div>

                    {q.explanation.beginner && (
                      <div className="pt-2.5 border-t border-[#DBEAFE]">
                        <span className="font-bold uppercase tracking-wider block text-[10px] text-[#475569] mb-1">
                          2. Beginner-Friendly Intuition
                        </span>
                        <p className="text-[#334155]">{q.explanation.beginner}</p>
                      </div>
                    )}

                    {q.explanation.shortcut && (
                      <div className="pt-2 border-t border-[#DBEAFE]">
                        <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-3 text-[#92400E]">
                          <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[10px] mb-1 text-[#B45309]">
                            <Zap className="h-3.5 w-3.5 text-[#D97706] fill-[#D97706]" />
                            3. 20-Second Exam Shortcut / Mental Math Trick
                          </span>
                          <p className="text-[#78350F] font-semibold">
                            {q.explanation.shortcut}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
