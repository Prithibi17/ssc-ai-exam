'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calculator,
  BrainCircuit,
  Globe,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Info,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  PlayCircle,
  HelpCircle,
  Layers,
  BookMarked,
} from 'lucide-react';
import {
  SUBJECTS_CATALOGUE,
  TOPICS_CATALOGUE,
  EXAMS_CATALOGUE,
  getExamSubjectCodes,
  getExamExcludedSubjects,
} from '@/data/exams';

export default function SubjectSelectionPage() {
  const [targetExamId, setTargetExamId] = useState<string>('all');
  const [selectedSubj, setSelectedSubj] = useState<string>('quant');

  // Allowed subjects for the chosen target exam
  const allowedSubjectCodes = useMemo(() => {
    if (targetExamId === 'all') return SUBJECTS_CATALOGUE.map((s) => s.code);
    return getExamSubjectCodes(targetExamId);
  }, [targetExamId]);

  const excludedSubjects = useMemo(() => {
    if (targetExamId === 'all') return [];
    return getExamExcludedSubjects(targetExamId);
  }, [targetExamId]);

  const selectedExamObj = EXAMS_CATALOGUE.find((e) => e.id === targetExamId);

  const activeSubject =
    SUBJECTS_CATALOGUE.find((s) => s.code === selectedSubj) || SUBJECTS_CATALOGUE[0];
  const isSubjectInExam = allowedSubjectCodes.includes(activeSubject.code);

  const subjectTopics = TOPICS_CATALOGUE.filter((t) => t.subjectId === activeSubject.id);

  // Helper to get section weightage in the selected exam
  const getSubjectExamWeightage = (subjCode: string) => {
    if (!selectedExamObj) return null;
    const tier = selectedExamObj.tiers[0];
    const section = tier.sections.find((s) => s.code === subjCode);
    if (!section) return null;
    const pct = Math.round((section.questionCount / tier.totalQuestions) * 100);
    return {
      questionCount: section.questionCount,
      marks: section.questionCount * section.marksPerQuestion,
      percentage: pct,
    };
  };

  // Helper for Subject specific insights
  const getSubjectStrategy = (code: string) => {
    switch (code) {
      case 'quant':
        return {
          title: 'Quantitative Aptitude Strategy Blueprint',
          description:
            'Combines Commercial Arithmetic (Percentages, Profit & Loss, Ratio, Time & Work, Speed & Distance) and Advanced Mathematics (Algebra, Geometry, Mensuration 2D & 3D, Trigonometry, and Data Interpretation).',
          speedTarget: '45 – 55 seconds per question',
          negativePenalty: '-0.50 marks per incorrect response',
          tips: [
            'Master shortcut calculation methods, reciprocal-percentage conversions, and squares up to 30.',
            'Arithmetic carries 60-65% weightage; Advanced Math carries 35-40% in SSC CGL & CHSL.',
            'Solve simpler arithmetic questions first; flag lengthier geometry/algebra puzzles for review.',
          ],
        };
      case 'reasoning':
        return {
          title: 'General Intelligence & Reasoning Blueprint',
          description:
            'Tests logical deduction, spatial reasoning, and pattern recognition across Verbal Reasoning (Analogies, Coding-Decoding, Syllogisms, Blood Relations) and Non-Verbal patterns (Dice, Paper Folding, Mirror Images, Embedded Figures).',
          speedTarget: '35 – 45 seconds per question',
          negativePenalty: '-0.50 marks per incorrect response',
          tips: [
            'Highest scoring section across all central exams. Target 23+ correct answers out of 25.',
            'Solve Non-Verbal figures (Mirror, Paper Folding, Embedded) within 15–20 seconds each.',
            'Beware of alternate number series traps; look for difference-of-differences first.',
          ],
        };
      case 'english':
        return {
          title: 'English Language & Comprehension Blueprint',
          description:
            'Assesses grammatical accuracy (Spotting Errors, Sentence Improvement, Active/Passive Voice, Narration) and vocabulary fluency (Cloze Test, Reading Comprehension, Synonyms, Antonyms, Idioms).',
          speedTarget: '25 – 35 seconds per question (Fastest section)',
          negativePenalty: '-0.50 marks per incorrect response',
          tips: [
            'Complete all 25 questions within 10–12 minutes to bank maximum time for Quantitative Aptitude.',
            'Grammar rules account for ~45% of marks; master Subject-Verb Agreement, Conditionals, and Prepositions.',
            'Read Cloze test passages completely once before filling in vocabulary options.',
          ],
        };
      case 'ga':
        return {
          title: 'General Awareness & Static GK Blueprint',
          description:
            'Comprehensive curriculum spanning Indian Polity (Articles & Constitution), History (Ancient, Medieval, Modern Freedom Movement), Geography, Economics, General Science (Physics, Chemistry, Biology), and Current Affairs.',
          speedTarget: '15 – 25 seconds per question (Direct recall)',
          negativePenalty: '-0.50 marks per incorrect response',
          tips: [
            'Pure knowledge test: zero mathematical computation required. Either you know the answer or you skip.',
            'Never guess randomly; negative marking (-0.50) severely damages your overall percentile.',
            'Indian Polity (Fundamental Rights, Articles, Parliament) and Modern History have highest recurrence.',
          ],
        };
      case 'hindi':
        return {
          title: 'General Hindi (सामान्य हिन्दी) Blueprint',
          description:
            'Focused on Hindi grammar, Sandhi, Samas, Vartani Shuddhi, Vilom, Paryayvachi, Muhavare, and unread passages for DSSSB and SSC GD.',
          speedTarget: '25 – 35 seconds per question',
          negativePenalty: '-0.25 marks per incorrect response',
          tips: [
            'High scoring in DSSSB and SSC GD exams.',
            'Practice Sandhi Viched and Samas identification rules thoroughly.',
            'Pay special attention to Vartani Shuddhi (correct spelling of complex Hindi words).',
          ],
        };
      default:
        return {
          title: 'Subject Curriculum Blueprint',
          description: activeSubject.description,
          speedTarget: '45 seconds per question',
          negativePenalty: '-0.50 marks per error',
          tips: ['Understand the concepts thoroughly before starting practice drills.'],
        };
    }
  };

  const currentStrategy = getSubjectStrategy(activeSubject.code);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* 1. Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#155DFC] mb-2.5">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Curriculum & Dynamic Syllabus Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111B32] tracking-tight">
          Syllabus & Subject Structure
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Subject structures adapt dynamically to the official pattern of each central exam. Understand the syllabus descriptions, review high-weightage topics and strategy guidelines, and start working on verified test drills.
        </p>
      </div>

      {/* 2. Top / Above: Master Understanding & Blueprint Block */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white p-5 sm:p-6 shadow-card space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#155DFC] text-white shadow-xs">
              Subject Mastery Protocol
            </span>
            <span className="text-xs font-bold text-[#155DFC]">
              Understand Everything First • Then Start Working
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#64748B] bg-white px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
            TCS iON CBT Exam Standard
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-extrabold text-[#111B32]">
          How Subject-Wise Examination Architecture Works
        </h2>

        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-4xl">
          In national computer-based examinations, question patterns are strictly sectional. To maximize your rank, first examine the <strong>Subject Description</strong> and <strong>Exam Weightage</strong> below, read the detailed <strong>Topic Concept Blocks</strong>, and then click <strong>&quot;Start Working&quot;</strong> to begin timed practice drills.
        </p>

        {/* 3 Step Flow Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/90 border border-blue-100 shadow-2xs">
            <span className="h-6 w-6 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <strong className="text-[#111B32] block">Read Subject Scope</strong>
              <span className="text-[11px] text-[#64748B] leading-tight block mt-0.5">
                Understand total questions, marks weightage, and negative marking formulas.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/90 border border-indigo-100 shadow-2xs">
            <span className="h-6 w-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <strong className="text-[#111B32] block">Review Topic Blocks</strong>
              <span className="text-[11px] text-[#64748B] leading-tight block mt-0.5">
                Check tested formulas, recurrence frequency, and common exam traps.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/90 border border-emerald-100 shadow-2xs">
            <span className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <strong className="text-[#111B32] block">Start Working</strong>
              <span className="text-[11px] text-[#64748B] leading-tight block mt-0.5">
                Launch timed topic drill or full computer-based exam mock tests.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Target Exam Filter Bar */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div>
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">
              Select Target Examination Syllabus
            </label>
            <p className="text-xs text-[#94A3B8]">
              Adapts subject cards, marks distribution, and weightage to the official tier pattern
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setTargetExamId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                targetExamId === 'all'
                  ? 'bg-[#155DFC] text-white shadow-xs'
                  : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B]'
              }`}
            >
              All Examinations (Cross-Syllabus)
            </button>
            {EXAMS_CATALOGUE.map((exam) => (
              <button
                key={exam.id}
                onClick={() => {
                  setTargetExamId(exam.id);
                  const allowed = getExamSubjectCodes(exam.id);
                  if (!allowed.includes(selectedSubj) && allowed.length > 0) {
                    setSelectedSubj(allowed[0]);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  targetExamId === exam.id
                    ? 'bg-[#155DFC] text-white shadow-xs'
                    : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B]'
                }`}
              >
                {exam.name.split(' ')[0]} {exam.name.split(' ')[1] || ''}
              </button>
            ))}
          </div>
        </div>

        {/* Excluded Subjects Notice for selected exam */}
        {excludedSubjects.length > 0 && selectedExamObj && (
          <div className="mt-3.5 pt-3.5 border-t border-[#F1F5F9] flex items-center gap-2 text-xs text-[#92400E] bg-[#FFFBEB] p-3 rounded-xl border border-[#FDE68A]">
            <Info className="h-4 w-4 shrink-0 text-[#D97706]" />
            <span>
              <strong>{selectedExamObj.name} Syllabus Constraint:</strong>{' '}
              {excludedSubjects.map((s) => s.name).join(', ')} is not included in this examination.
            </span>
          </div>
        )}
      </div>

      {/* 4. Subject Cards Elements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {SUBJECTS_CATALOGUE.map((subj) => {
          const isSelected = selectedSubj === subj.code;
          const isAllowedInTargetExam = allowedSubjectCodes.includes(subj.code);
          const weightageInfo = getSubjectExamWeightage(subj.code);

          return (
            <button
              type="button"
              key={subj.id}
              onClick={() => setSelectedSubj(subj.code)}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[#155DFC] bg-[#EFF6FF] shadow-card ring-2 ring-[#93C5FD]'
                  : !isAllowedInTargetExam
                  ? 'border-dashed border-[#CBD5E1] bg-[#F8FAFC] opacity-75'
                  : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] shadow-card hover:shadow-card-hover'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-[#111B32] text-sm sm:text-base">
                    {subj.name}
                  </span>
                  {!isAllowedInTargetExam && (
                    <span className="text-[10px] font-bold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded-lg">
                      Excluded
                    </span>
                  )}
                  {isAllowedInTargetExam && weightageInfo && (
                    <span className="text-[10px] font-bold text-[#155DFC] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-lg">
                      {weightageInfo.percentage}% Exam
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#64748B] font-medium">{subj.nameHi}</p>

                {/* Subject Description Block */}
                <p className="text-[11px] text-[#475569] mt-2 line-clamp-2 leading-relaxed bg-white/70 p-2 rounded-lg border border-[#E2E8F0]/60">
                  {subj.description}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-[#E2E8F0]/70 flex items-center justify-between text-[11px]">
                {weightageInfo ? (
                  <span className="font-semibold text-[#475569]">
                    {weightageInfo.questionCount} Qs ({weightageInfo.marks} Marks)
                  </span>
                ) : (
                  <span className="text-[#64748B]">
                    {subj.totalQuestionsCount}+ Verified PYQs
                  </span>
                )}
                <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-[#155DFC]' : 'text-[#64748B]'}`}>
                  {isSelected ? '● Active' : 'Explore →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 5. Active Subject Strategy & Understanding Block */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-card space-y-6">
        {/* Subject Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#F1F5F9] pb-5">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#155DFC]">
                Active Subject Curriculum
              </span>
              {!isSubjectInExam && selectedExamObj && (
                <span className="text-xs font-bold bg-[#FFFBEB] text-[#D97706] px-2 py-0.5 rounded-lg border border-[#FDE68A]">
                  Not in {selectedExamObj.name}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#111B32] tracking-tight">
              {activeSubject.name} ({activeSubject.nameHi})
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-3xl leading-relaxed">
              {currentStrategy.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href={`/mock-setup?subject=${activeSubject.code}&exam=${targetExamId !== 'all' ? targetExamId : 'ssc_cgl'}&mode=custom_mock`}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md ${
                !isSubjectInExam
                  ? 'bg-[#94A3B8] cursor-not-allowed pointer-events-none'
                  : 'bg-[#155DFC] hover:bg-[#124BD4] shadow-blue-500/20 active:scale-[0.99]'
              }`}
            >
              <PlayCircle className="h-4 w-4" />
              <span>Start Working (Subject Mock)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={`/pyq?subject=${activeSubject.code}&exam=${targetExamId !== 'all' ? targetExamId : 'all'}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-all"
            >
              <span>Explore All PYQs</span>
            </Link>
          </div>
        </div>

        {/* Understanding & Strategy Blueprint Sub-Block */}
        <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#155DFC]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#111B32]">
                {currentStrategy.title}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-[#64748B]">
              <span>Speed Target: <strong className="text-[#111B32]">{currentStrategy.speedTarget}</strong></span>
              <span>•</span>
              <span>Penalty: <strong className="text-rose-600">{currentStrategy.negativePenalty}</strong></span>
            </div>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs pt-1">
            {currentStrategy.tips.map((tip, idx) => (
              <li
                key={idx}
                className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-[#475569] flex items-start gap-2 shadow-2xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug text-[11px]">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Warning if Subject is Excluded */}
        {!isSubjectInExam && selectedExamObj && (
          <div className="p-3.5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] text-[#92400E] text-xs">
            <strong>Syllabus Exception:</strong> {activeSubject.name} is excluded from the official syllabus of {selectedExamObj.name} ({selectedExamObj.tiers[0].title}). If you are preparing solely for this exam, you do not need to study this section.
          </div>
        )}

        {/* 6. Topic Elements Grid with Description Blocks and "Start Working" Action */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#F1F5F9] pb-2">
            <div>
              <h3 className="font-extrabold text-[#111B32] uppercase tracking-wider text-xs">
                Topic Breakdown & Verified Question Modules ({subjectTopics.length} Topics)
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Each block includes description, tested formulas, and a direct link to start working.
              </p>
            </div>
            <span className="text-[11px] text-[#155DFC] font-semibold self-start sm:self-auto">
              Sorted by TCS Question Recurrence
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectTopics.map((top, index) => (
              <div
                key={top.id}
                className="rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 bg-white hover:border-[#CBD5E1] shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-3.5 group"
              >
                <div className="space-y-2.5">
                  {/* Topic Badge & Header */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 text-[10px] font-black text-[#155DFC]">
                      Topic #{index + 1} • {'★'.repeat(top.weightage)}
                    </span>
                    <span className="text-[11px] text-[#94A3B8] font-medium">
                      {top.nameHi}
                    </span>
                  </div>

                  <h4 className="font-bold text-[#111B32] text-sm group-hover:text-[#155DFC] transition-colors leading-snug">
                    {top.name}
                  </h4>

                  {/* Topic Description Block */}
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/70 text-xs text-[#475569] space-y-1">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Description & Scope:
                    </span>
                    <p className="text-[11px] leading-relaxed text-[#334155]">
                      {top.description}
                    </p>
                  </div>
                </div>

                {/* "Start Working" Action Block */}
                <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                  <Link
                    href={`/pyq?subject=${activeSubject.code}&topic=${top.code}&exam=${targetExamId !== 'all' ? targetExamId : 'all'}`}
                    className="text-[11px] font-semibold text-[#64748B] hover:text-[#155DFC] transition-colors"
                  >
                    View PYQs
                  </Link>

                  <Link
                    href={`/mock-setup?subject=${activeSubject.code}&topic=${top.code}&exam=${targetExamId !== 'all' ? targetExamId : 'ssc_cgl'}&mode=topic_practice`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#155DFC] text-white text-[11px] font-bold hover:bg-[#124BD4] transition-all shadow-xs active:scale-[0.98]"
                  >
                    <span>Start Working</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
