'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  GraduationCap,
  Layers,
  ArrowRight,
  CheckCircle2,
  Filter,
  Calculator,
  BrainCircuit,
  Globe,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { EXAM_SYLLABUS_MAP, ExamSyllabus, SyllabusSubject } from '@/data/syllabus';

const EXAM_KEYS = [
  'ssc_chsl',
  'ssc_cgl',
  'ssc_mts',
  'ssc_gd',
  'ssc_cpo',
  'rrb_ntpc',
  'ssc_steno',
] as const;

export default function SyllabusPage() {
  const [selectedExamKey, setSelectedExamKey] = useState<string>('ssc_chsl');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const currentExam: ExamSyllabus =
    EXAM_SYLLABUS_MAP[selectedExamKey] || EXAM_SYLLABUS_MAP.ssc_chsl;

  // Available subjects for the active exam
  const availableSubjects = currentExam.subjects;

  // Filtered topics based on subject, category, and search query
  const filteredData = useMemo(() => {
    let result: {
      subject: SyllabusSubject;
      topics: typeof currentExam.subjects[0]['topics'];
    }[] = [];

    const query = searchQuery.trim().toLowerCase();

    for (const subj of availableSubjects) {
      if (selectedSubjectCode !== 'all' && subj.code !== selectedSubjectCode) {
        continue;
      }

      const matchingTopics = subj.topics.filter((topic) => {
        const matchesCategory =
          selectedCategory === 'all' || topic.category === selectedCategory;

        const matchesQuery =
          !query ||
          topic.name.toLowerCase().includes(query) ||
          topic.description?.toLowerCase().includes(query) ||
          topic.category?.toLowerCase().includes(query);

        return matchesCategory && matchesQuery;
      });

      if (matchingTopics.length > 0) {
        result.push({
          subject: subj,
          topics: matchingTopics,
        });
      }
    }

    return result;
  }, [availableSubjects, selectedSubjectCode, selectedCategory, searchQuery]);

  // Aggregate categories for active subject filter
  const currentCategories = useMemo(() => {
    if (selectedSubjectCode === 'all') {
      const set = new Set<string>();
      availableSubjects.forEach((s) => s.categories?.forEach((c) => set.add(c)));
      return Array.from(set);
    }
    const subj = availableSubjects.find((s) => s.code === selectedSubjectCode);
    return subj?.categories || [];
  }, [availableSubjects, selectedSubjectCode]);

  // Total topics matched
  const totalMatchedCount = filteredData.reduce(
    (acc, curr) => acc + curr.topics.length,
    0
  );

  const handleCopySyllabus = () => {
    let text = `${currentExam.examName} — Official Chapter-wise Syllabus\n\n`;
    for (const s of currentExam.subjects) {
      text += `=== ${s.name} (${s.topicCount} Topics) ===\n`;
      s.topics.forEach((t) => {
        text += `${t.number}. ${t.name}${t.category ? ` [${t.category}]` : ''}: ${t.description || ''}\n`;
      });
      text += '\n';
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getSubjectIcon = (code: string) => {
    switch (code) {
      case 'quant':
        return <Calculator className="h-4 w-4" />;
      case 'reasoning':
        return <BrainCircuit className="h-4 w-4" />;
      case 'english':
        return <BookOpen className="h-4 w-4" />;
      case 'ga':
        return <Globe className="h-4 w-4" />;
      case 'computer':
        return <Cpu className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#155DFC] border border-blue-200 text-[11px] sm:text-xs font-bold shadow-xs mb-2.5">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>2025–2026 TCS iON Official Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111B32] tracking-tight">
            Comprehensive Exam Syllabus &amp; Topics
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
            Exhaustive, chapter-wise breakdown for all national SSC and Railway examinations. Drill down by subject, topic weightage, and official exam categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopySyllabus}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#111B32] shadow-2xs hover:bg-slate-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#059669]" />
                <span className="text-[#059669]">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-[#64748B]" />
                <span>Copy Full Syllabus</span>
              </>
            )}
          </button>
          <Link
            href={`/mock-setup?exam=${currentExam.examId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#155DFC] hover:bg-[#124BD4] text-white px-4 py-2 text-xs font-bold shadow-xs transition-all"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Launch Mock Exam</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Master Understanding & Methodology Block */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white p-4 sm:p-6 shadow-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#155DFC] text-white shadow-xs">
              Syllabus Blueprint
            </span>
            <span className="text-xs font-bold text-[#155DFC]">
              Understand Chapter Scope • Then Start Working
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#64748B] bg-white px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
            {currentExam.examName} Official Modules
          </span>
        </div>

        <p className="text-xs text-[#475569] leading-relaxed max-w-4xl">
          Each module below represents an officially verified chapter. Below each topic, review the <strong>Description Block</strong> detailing the exact question types tested. Once understood, click <strong>&quot;Start Working&quot;</strong> to practice that chapter under timed conditions.
        </p>
      </div>

      {/* 1. Exam Switcher Tabs */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
          Select Target Examination
        </label>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 touch-pan-x">
          {EXAM_KEYS.map((key) => {
            const ex = EXAM_SYLLABUS_MAP[key];
            const isSelected = selectedExamKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedExamKey(key);
                  setSelectedSubjectCode('all');
                  setSelectedCategory('all');
                }}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-sm'
                    : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-slate-50 hover:text-[#111B32]'
                }`}
              >
                <span>{ex.shortCode}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-[#64748B]'
                  }`}
                >
                  {ex.totalTopics} Topics
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Exam Overview Banner */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-6 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-50 text-[#155DFC] border border-blue-200">
                {currentExam.badge}
              </span>
              <span className="text-xs text-[#64748B] font-medium">
                {currentExam.officialNotificationNote}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#111B32]">
              {currentExam.examName}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
              <span className="text-[10px] text-[#64748B] block font-semibold">Subjects</span>
              <span className="text-sm font-extrabold text-[#111B32]">
                {currentExam.subjects.length}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
              <span className="text-[10px] text-[#64748B] block font-semibold">Total Topics</span>
              <span className="text-sm font-extrabold text-[#155DFC]">
                {currentExam.totalTopics}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="pt-2 border-t border-[#F1F5F9] flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder={`Search topics in ${currentExam.shortCode} (e.g., BODMAS, Trigonometry, Indus Valley, Cloze Test)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 py-2 text-xs sm:text-sm text-[#111B32] placeholder-[#94A3B8] focus:border-[#155DFC] focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => {
                setSelectedSubjectCode('all');
                setSelectedCategory('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedSubjectCode === 'all'
                  ? 'bg-[#155DFC] text-white shadow-xs'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
              }`}
            >
              All Subjects
            </button>
            {availableSubjects.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => {
                  setSelectedSubjectCode(s.code);
                  setSelectedCategory('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedSubjectCode === s.code
                    ? 'bg-[#155DFC] text-white shadow-xs'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
              >
                {getSubjectIcon(s.code)}
                <span>{s.name.split('(')[0].trim()}</span>
                <span className="opacity-80 text-[10px]">({s.topicCount})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Category Chips (e.g. History, Geography, Polity, Arithmetic...) */}
        {currentCategories.length > 0 && (
          <div className="pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mr-1 shrink-0">
              Domains:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
              }`}
            >
              All Domains
            </button>
            {currentCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#155DFC] text-white font-bold'
                    : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Topics Breakdown List by Subject */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-[#64748B]">
          <span>
            Showing <strong className="text-[#111B32]">{totalMatchedCount}</strong> topics for{' '}
            <strong className="text-[#111B32]">{currentExam.examName}</strong>
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#155DFC] font-bold hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>

        {filteredData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] p-12 text-center bg-white space-y-3">
            <BookOpen className="h-8 w-8 text-[#94A3B8] mx-auto" />
            <h3 className="text-base font-bold text-[#111B32]">No matching topics found</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              We couldn&apos;t find any topics matching &quot;{searchQuery}&quot;. Try a different keyword or reset filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedSubjectCode('all');
              }}
              className="px-4 py-2 rounded-xl bg-[#155DFC] text-white text-xs font-bold shadow-xs hover:bg-[#124BD4]"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredData.map(({ subject, topics }) => (
            <div
              key={subject.id}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-6 shadow-card space-y-4"
            >
              {/* Subject Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#155DFC] flex items-center justify-center font-bold shrink-0 border border-blue-200">
                    {getSubjectIcon(subject.code)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111B32]">
                      {subject.name}
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      {topics.length} of {subject.topicCount} Topics matching selection
                    </p>
                  </div>
                </div>

                <Link
                  href={`/pyq?subject=${subject.code}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#155DFC] hover:underline self-start sm:self-auto"
                >
                  <span>Practice Subject PYQs</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {topics.map((topic) => (
                  <div
                    key={`${subject.id}_${topic.number}`}
                    className="p-3 sm:p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1] transition-all flex flex-col justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="h-6 w-6 rounded-lg bg-white border border-[#E2E8F0] text-[#155DFC] font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {topic.number}
                        </span>
                        {topic.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-[#475569] shrink-0">
                            {topic.category}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-[#111B32] group-hover:text-[#155DFC] transition-colors leading-snug">
                        {topic.name}
                      </h4>

                      {/* Topic Description Block */}
                      <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#475569] space-y-1 my-2">
                        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                          Description & Formulas:
                        </span>
                        <p className="text-[11px] leading-relaxed text-[#334155]">
                          {topic.description || 'Verified official syllabus chapter tested in recent computer-based exam shifts.'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-[#E2E8F0]/60 flex items-center justify-between gap-2">
                      <Link
                        href={`/pyq?topic=${encodeURIComponent(topic.name)}`}
                        className="text-[11px] font-semibold text-[#64748B] hover:text-[#155DFC] transition-colors"
                      >
                        View PYQs
                      </Link>

                      <Link
                        href={`/mock-setup?exam=${currentExam.examId}&topic=${encodeURIComponent(topic.name)}&mode=topic_practice`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#155DFC] text-white text-[11px] font-bold hover:bg-[#124BD4] transition-all shadow-xs"
                      >
                        <span>Start Working</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
