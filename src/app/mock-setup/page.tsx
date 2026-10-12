'use client';

import { useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Clock,
  ShieldCheck,
  Play,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Info,
  Layers,
  BookOpen,
  MonitorPlay,
  Crown,
  X,
} from 'lucide-react';
import {
  EXAMS_CATALOGUE,
  SUBJECTS_CATALOGUE,
  TOPICS_CATALOGUE,
  getExamSubjectCodes,
  getExamExcludedSubjects,
} from '@/data/exams';
import { DSSSB_PAPERS_CATALOGUE } from '@/data/dsssb_papers_meta';
import { TestMode, TestConfiguration, QuestionDifficulty } from '@/types';
import { createTestSession } from '@/lib/testEngine';
import { saveActiveTestSession, usePlatformStore } from '@/lib/store/usePlatformStore';

export default function MockSetupPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs text-slate-500">Loading examination configurator...</div>}>
      <MockSetupContent />
    </Suspense>
  );
}

function MockSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode = (searchParams.get('mode') as TestMode) || 'official_simulation';
  const initialExam = searchParams.get('exam') || 'ssc_cgl';
  const initialSubj = searchParams.get('subject') || '';
  const initialPaper = searchParams.get('paper') || '';

  const [mode, setMode] = useState<TestMode>(initialMode);
  const [selectedExamId, setSelectedExamId] = useState<string>(initialExam);
  
  // Calculate allowed subjects for initially chosen exam
  const initialAllowed = useMemo(() => getExamSubjectCodes(initialExam), [initialExam]);
  
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() => {
    if (initialSubj && initialAllowed.includes(initialSubj)) {
      return [initialSubj];
    }
    return initialAllowed;
  });

  const [selectedTopicSubject, setSelectedTopicSubject] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty | 'mixed'>('mixed');
  const [sourceFilter, setSourceFilter] = useState<'verified_only' | 'all' | 'ai_augmented'>('ai_augmented');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);

  // Official DSSSB Shift Paper Selector State
  const [selectedDsssBPaper, setSelectedDsssBPaper] = useState<string>(
    initialPaper || DSSSB_PAPERS_CATALOGUE[0]?.id || ''
  );
  const [paperPostFilter, setPaperPostFilter] = useState<string>('all');

  const { isSubscribed, canTakeTest, getDailyTestsRemaining, recordDailyTest } = usePlatformStore();
  const dailyRemaining = getDailyTestsRemaining();

  const selectedExam = EXAMS_CATALOGUE.find((e) => e.id === selectedExamId) || EXAMS_CATALOGUE[0];
  const activePattern = selectedExam.tiers[0];

  const filteredDsssBPapers = useMemo(() => {
    if (paperPostFilter === 'all') return DSSSB_PAPERS_CATALOGUE;
    return DSSSB_PAPERS_CATALOGUE.filter((p) =>
      p.postName.toLowerCase().includes(paperPostFilter.toLowerCase())
    );
  }, [paperPostFilter]);

  // Dynamic syllabus subjects for the current selected exam
  const allowedExamSubjects = useMemo(() => getExamSubjectCodes(selectedExamId), [selectedExamId]);
  const excludedExamSubjects = useMemo(() => getExamExcludedSubjects(selectedExamId), [selectedExamId]);

  // Handle changing exam
  const handleSelectExam = (examId: string) => {
    setSelectedExamId(examId);
    const newAllowed = getExamSubjectCodes(examId);
    
    // Automatically restrict selected subjects to this exam's valid subjects
    setSelectedSubjects((prev) => {
      const remaining = prev.filter((s) => newAllowed.includes(s));
      return remaining.length > 0 ? remaining : newAllowed;
    });

    // Reset topic if selected topic belongs to an excluded subject
    if (selectedTopic !== 'all') {
      const top = TOPICS_CATALOGUE.find((t) => t.code === selectedTopic);
      if (top) {
        const topSubj = SUBJECTS_CATALOGUE.find((s) => s.id === top.subjectId);
        if (topSubj && !newAllowed.includes(topSubj.code)) {
          setSelectedTopic('all');
        }
      }
    }
    if (selectedTopicSubject !== 'all' && !newAllowed.includes(selectedTopicSubject)) {
      setSelectedTopicSubject('all');
    }
  };

  const isOfficial = mode === 'official_simulation';
  const finalQuestionCount = isOfficial ? activePattern.totalQuestions : questionCount;
  const finalDuration = isOfficial ? activePattern.durationMinutes : durationMinutes;
  const finalMarksPerCorrect = activePattern.marksPerCorrect;
  const finalNegativeMarking = activePattern.negativeMarking;

  const toggleSubject = (code: string) => {
    if (!allowedExamSubjects.includes(code)) return; // Don't allow selecting excluded subjects

    if (selectedSubjects.includes(code)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((c) => c !== code));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, code]);
    }
  };

  const handlePresetCount = (cnt: number) => {
    setQuestionCount(cnt);
    setDurationMinutes(Math.max(10, Math.round(cnt * 0.8)));
  };

  // Filter topics for topic drill based on allowed exam subjects
  const availableTopics = useMemo(() => {
    return TOPICS_CATALOGUE.filter((topic) => {
      const subj = SUBJECTS_CATALOGUE.find((s) => s.id === topic.subjectId);
      if (!subj) return false;
      if (!allowedExamSubjects.includes(subj.code)) return false;
      if (selectedTopicSubject !== 'all' && subj.code !== selectedTopicSubject) return false;
      return true;
    });
  }, [allowedExamSubjects, selectedTopicSubject]);

  const handleLaunchTest = async () => {
    if (!canTakeTest()) {
      setShowLimitModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      // If DSSSB exam is selected with an official shift paper
      if (selectedExamId === 'dsssb' && selectedDsssBPaper) {
        const paperMeta = DSSSB_PAPERS_CATALOGUE.find((p) => p.id === selectedDsssBPaper) || DSSSB_PAPERS_CATALOGUE[0];
        try {
          const res = await fetch(`/api/dsssb-papers?id=${paperMeta.id}`);
          const data = await res.json();
          if (data.success && data.questions && data.questions.length > 0) {
            const config: TestConfiguration = {
              id: `cbt_dsssb_${Date.now()}`,
              title: `${paperMeta.title} (${paperMeta.year})`,
              mode: 'official_simulation',
              targetExamId: 'dsssb',
              patternTier: paperMeta.totalQuestions >= 200 ? 'One-Tier General CBT' : 'Speed Sectional (80Q)',
              subjectCodes: paperMeta.subjects,
              questionCount: data.questions.length,
              durationMinutes: paperMeta.durationMinutes,
              marksPerCorrect: 1.0,
              negativeMarking: 0.25,
              allowPause: true,
              difficulty: 'medium',
              sourceFilter: 'verified_only',
              hasSectionalTiming: false,
            };

            const newSession = createTestSession(config, data.questions);
            saveActiveTestSession(newSession);
            recordDailyTest();
            router.push(`/test/${newSession.testId}`);
            return;
          }
        } catch (fetchErr) {
          console.warn('Could not load specific paper file, falling back to verified bank:', fetchErr);
        }
      }

      // In topic drill mode, set subject to the selected topic's subject
      let finalSubjects = selectedSubjects;
      if (mode === 'topic_practice' && selectedTopic !== 'all') {
        const activeTopicObj = TOPICS_CATALOGUE.find((t) => t.code === selectedTopic);
        if (activeTopicObj) {
          const sObj = SUBJECTS_CATALOGUE.find((s) => s.id === activeTopicObj.subjectId);
          if (sObj) finalSubjects = [sObj.code];
        }
      }

      const config: TestConfiguration = {
        id: `cbt_${Date.now()}`,
        title: isOfficial
          ? `${selectedExam.name} - Official Simulation (${activePattern.tier})`
          : mode === 'topic_practice'
          ? `Topic Practice - ${selectedTopic !== 'all' ? selectedTopic : 'Mixed Topics'} (${selectedExam.name})`
          : `Custom Mock - ${selectedExam.name}`,
        mode,
        targetExamId: selectedExamId,
        patternTier: activePattern.tier,
        subjectCodes: isOfficial ? allowedExamSubjects : finalSubjects,
        topicCodes: selectedTopic !== 'all' ? [selectedTopic] : undefined,
        questionCount: finalQuestionCount,
        durationMinutes: finalDuration,
        marksPerCorrect: finalMarksPerCorrect,
        negativeMarking: finalNegativeMarking,
        allowPause: !isOfficial,
        difficulty,
        sourceFilter,
        hasSectionalTiming: activePattern.hasSectionalTiming,
      };

      const newSession = createTestSession(config);
      saveActiveTestSession(newSession);
      recordDailyTest();
      router.push(`/test/${newSession.testId}`);
    } catch (err) {
      console.error('Failed to create test session:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="space-y-1.5 pb-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Create Examination Practice Session
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select an examination pattern, customize subjects or target high-yield topics, and practice in real exam timing.
        </p>
      </div>

      {/* Daily Free Test Limit / Pro Badge */}
      {isSubscribed ? (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#ECFDF5] border border-emerald-200 text-[#059669] text-xs font-semibold shadow-xs">
          <Crown className="h-4 w-4 text-[#059669]" />
          <span>Unlimited Pro Aspirant: You can take unlimited mock tests with zero daily limits!</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-[#EFF6FF] border border-blue-200 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-[#155DFC]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Daily Free Test Allowance: <strong className="font-bold text-[#111B32]">{dailyRemaining} of 2 tests</strong> remaining today.
            </span>
          </div>
          <Link
            href="/subscription"
            className="text-xs font-bold text-[#155DFC] hover:underline flex items-center gap-1 shrink-0"
          >
            Upgrade to Unlimited for ₹10 →
          </Link>
        </div>
      )}

      {/* Mode Tabs - Matching Screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setMode('official_simulation')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            mode === 'official_simulation'
              ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <MonitorPlay className={`h-4 w-4 ${mode === 'official_simulation' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className={`text-xs font-bold ${mode === 'official_simulation' ? 'text-blue-900' : 'text-slate-800'}`}>
              Official Simulation
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Authentic exam timing, exact question count, negative marking and sections.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setMode('custom_mock')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            mode === 'custom_mock'
              ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Sliders className={`h-4 w-4 ${mode === 'custom_mock' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className={`text-xs font-bold ${mode === 'custom_mock' ? 'text-blue-900' : 'text-slate-800'}`}>
              Custom Mock Test
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Choose specific subjects and topics with custom question counts.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setMode('topic_practice')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            mode === 'topic_practice'
              ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <BookOpen className={`h-4 w-4 ${mode === 'topic_practice' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className={`text-xs font-bold ${mode === 'topic_practice' ? 'text-blue-900' : 'text-slate-800'}`}>
              Topic Drill
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Practice weak areas like Dice, Trigonometry, or Spotting Errors.
          </p>
        </button>
      </div>

      {/* Main Configuration Form Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 text-xs">
        {/* Step 1: Target Exam Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="font-bold text-slate-900 text-xs">
              1. Target Examination
            </label>
            <span className="text-[11px] text-slate-400">
              Determines syllabus subjects & sectional pattern
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EXAMS_CATALOGUE.map((exam) => {
              const isSelected = selectedExamId === exam.id;
              return (
                <div
                  key={exam.id}
                  onClick={() => handleSelectExam(exam.id)}
                  className={`relative cursor-pointer rounded-xl border p-3.5 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/30 text-slate-900 ring-1 ring-blue-500 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                  )}
                  <p className="text-xs font-bold pr-4">{exam.name}</p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                    {exam.conductingBody}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Special Official Shift Paper Selector for DSSSB */}
        {selectedExamId === 'dsssb' && (
          <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/70 to-white p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Select Official DSSSB Exam Shift Paper (2014–2022)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {filteredDsssBPapers.length} authentic exam papers available with 100% original questions & official keys
                  </p>
                </div>
              </div>

              {/* Filter by Post */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['all', 'Junior Assistant', 'LDC', 'Grade II', 'Patwari', 'Data Entry', 'Statistical'].map((postKey) => (
                  <button
                    key={postKey}
                    type="button"
                    onClick={() => setPaperPostFilter(postKey)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                      paperPostFilter === postKey
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {postKey === 'all' ? 'All Shifts' : postKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Shift Paper Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredDsssBPapers.map((paper) => {
                const isSelected = selectedDsssBPaper === paper.id;
                return (
                  <div
                    key={paper.id}
                    onClick={() => setSelectedDsssBPaper(paper.id)}
                    className={`cursor-pointer rounded-xl border p-3 transition-all relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/30 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                    <div className="font-bold text-xs text-slate-900 line-clamp-1 pr-5">
                      {paper.title}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                      <span className="font-semibold text-blue-700">{paper.postName}</span>
                      <span>•</span>
                      <span>{paper.examDate}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-600">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5">{paper.totalQuestions} Questions</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5">{paper.durationMinutes} Mins</span>
                      <span className="ml-auto text-emerald-700 text-[9px] uppercase font-black">Official CBT</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Subject Breakdown / Custom Selection */}
        {isOfficial ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold text-slate-900 gap-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Official Pattern: {selectedExam.name} ({activePattern.tier})
              </span>
              <span className="text-xs font-semibold text-blue-600">
                {activePattern.totalQuestions} Questions • {activePattern.totalMarks} Marks
              </span>
            </div>

            {/* Detailed Section Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200/80">
              {activePattern.sections.map((sec, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <div className="font-bold text-slate-800 text-xs">{sec.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {sec.questionCount} Questions • {sec.questionCount * sec.marksPerQuestion} Marks
                  </div>
                </div>
              ))}
            </div>

            {/* Excluded Subjects Notice if any */}
            {excludedExamSubjects.length > 0 && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                <Info className="h-3.5 w-3.5 shrink-0" />
                <span>
                  <strong>Official Syllabus Note:</strong>{' '}
                  {excludedExamSubjects.map((e) => e.name).join(', ')} is not part of {selectedExam.name}.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-500 pt-1 text-[11px]">
              <div>Duration: <strong className="text-slate-800">{activePattern.durationMinutes} Minutes</strong></div>
              <div>Negative Penalty: <strong className="text-slate-800">-{activePattern.negativeMarking}</strong></div>
              <div>Medium: <strong className="text-slate-800">English / Hindi</strong></div>
              <div>Exam Mode: <strong className="text-slate-800">TCS iON CBT</strong></div>
            </div>
          </div>
        ) : mode === 'custom_mock' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#111B32] uppercase tracking-wider block text-[11px]">
                2. Select Subjects ({selectedExam.name} Syllabus)
              </label>
              <span className="text-[11px] text-[#64748B]">
                Subjects automatically adapted for {selectedExam.name}
              </span>
            </div>

            {/* Excluded Subjects Notice */}
            {excludedExamSubjects.length > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-[11px]">
                <Info className="h-4 w-4 shrink-0 text-[#D97706]" />
                <span>
                  {excludedExamSubjects.map((s) => s.name).join(', ')} is not included in {selectedExam.name} and is excluded below.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SUBJECTS_CATALOGUE.map((subj) => {
                const isAllowed = allowedExamSubjects.includes(subj.code);
                const isSelected = selectedSubjects.includes(subj.code) && isAllowed;

                if (!isAllowed) {
                  return (
                    <div
                      key={subj.id}
                      className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-3 opacity-60 text-[#94A3B8] select-none cursor-not-allowed"
                    >
                      <p className="text-xs line-through font-medium">{subj.name}</p>
                      <span className="text-[10px] text-[#D97706] font-semibold block mt-1">
                        Not in {selectedExam.code.toUpperCase()}
                      </span>
                    </div>
                  );
                }

                return (
                  <button
                    type="button"
                    key={subj.id}
                    onClick={() => toggleSubject(subj.code)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-[#155DFC] bg-[#EFF6FF] font-bold text-[#155DFC] shadow-xs'
                        : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] text-[#334155]'
                    }`}
                  >
                    <p className="text-xs">{subj.name}</p>
                    <span className="text-[10px] text-[#64748B] font-normal block mt-0.5">
                      {isSelected ? '✓ Included in Mock' : '+ Click to Include'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Topic Drill Mode */
          <div className="space-y-4">
            <label className="font-bold text-[#111B32] uppercase tracking-wider block text-[11px]">
              2. Select Target Subject & Topic ({selectedExam.name})
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Subject filter for topic drill */}
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] block mb-1">Subject</span>
                <select
                  value={selectedTopicSubject}
                  onChange={(e) => {
                    setSelectedTopicSubject(e.target.value);
                    setSelectedTopic('all');
                  }}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#111B32] font-medium focus:bg-white focus:outline-none focus:border-[#155DFC]"
                >
                  <option value="all">All Syllabus Subjects ({allowedExamSubjects.length})</option>
                  {SUBJECTS_CATALOGUE.filter((s) => allowedExamSubjects.includes(s.code)).map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic selector */}
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] block mb-1">Topic</span>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#111B32] font-medium focus:bg-white focus:outline-none focus:border-[#155DFC]"
                >
                  <option value="all">Mixed High-Weightage Topics</option>
                  {availableTopics.map((top) => (
                    <option key={top.id} value={top.code}>
                      {top.name} ({top.nameHi})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Question Presets (Custom & Topic modes) */}
        {!isOfficial && (
          <div className="space-y-4">
            <div>
              <label className="font-bold text-[#111B32] uppercase tracking-wider block mb-2 text-[11px]">
                3. Question Count Preset
              </label>
              <div className="flex flex-wrap gap-2">
                {[10, 20, 25, 50, 60, 100].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handlePresetCount(cnt)}
                    className={`rounded-xl px-3.5 py-1.5 font-bold text-xs transition-all ${
                      questionCount === cnt
                        ? 'bg-[#155DFC] text-white shadow-xs'
                        : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:text-[#111B32] hover:bg-white'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty & Source Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#F1F5F9]">
              <div>
                <label className="font-bold text-[#111B32] uppercase tracking-wider block mb-1.5 text-[11px]">
                  Difficulty Profile
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['mixed', 'easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 px-2 rounded-xl border text-center capitalize font-semibold text-xs transition-all ${
                        difficulty === diff
                          ? 'border-[#155DFC] bg-[#155DFC] text-white shadow-xs'
                          : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:bg-white hover:text-[#111B32]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#111B32] uppercase tracking-wider block mb-1.5 text-[11px]">
                  Question Bank Source
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSourceFilter('verified_only')}
                    className={`py-2 px-2.5 rounded-xl border text-center font-semibold text-xs transition-all ${
                      sourceFilter === 'verified_only'
                        ? 'border-[#155DFC] bg-[#155DFC] text-white shadow-xs'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:bg-white hover:text-[#111B32]'
                    }`}
                  >
                    Official PYQ Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceFilter('ai_augmented')}
                    className={`py-2 px-2.5 rounded-xl border text-center font-semibold text-xs transition-all ${
                      sourceFilter === 'ai_augmented'
                        ? 'border-[#155DFC] bg-[#155DFC] text-white shadow-xs'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:bg-white hover:text-[#111B32]'
                    }`}
                  >
                    PYQ + AI Augmented
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[#64748B] text-xs flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#155DFC]" />
            <span>
              Summary: <strong className="text-[#111B32]">{finalQuestionCount} Questions</strong> • <strong className="text-[#111B32]">{finalDuration} Minutes</strong> • Target: <strong className="text-[#155DFC]">{selectedExam.name}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={handleLaunchTest}
            disabled={isGenerating}
            className="w-full sm:w-auto rounded-xl bg-[#155DFC] hover:bg-[#124BD4] px-6 py-2.5 font-bold text-xs text-white transition-all shadow-xs"
          >
            {isGenerating ? 'Loading Exam Console...' : 'Launch Test Console →'}
          </button>
        </div>
      </div>

      {/* Daily Free Test Limit Reached Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-modal text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-100 text-[#D97706] flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111B32]">
                Daily Free Test Limit Reached (2/2 Taken Today)
              </h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Free candidate accounts are limited to 2 mock tests per calendar day. To continue practicing without any limits, upgrade to Unlimited Pro for just <strong className="text-[#111B32]">₹10</strong> via PhonePe QR code!
              </p>
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                href="/subscription"
                className="w-full rounded-xl bg-[#155DFC] hover:bg-[#124BD4] text-white py-3 font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Crown className="h-4 w-4" />
                <span>Upgrade to Unlimited Pro for ₹10 →</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowLimitModal(false)}
                className="w-full rounded-xl border border-[#E2E8F0] py-2.5 text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC]"
              >
                Close &amp; Practice Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
