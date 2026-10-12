'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Zap,
  Filter,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { createTestSession } from '@/lib/testEngine';
import { saveActiveTestSession } from '@/lib/store/usePlatformStore';
import { useRouter } from 'next/navigation';

export default function BookmarksAndMistakesPage() {
  const router = useRouter();
  const { bookmarks, toggleBookmark, mistakes, toggleResolveMistake } = usePlatformStore();
  const [activeTab, setActiveTab] = useState<'mistakes' | 'bookmarks'>('mistakes');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredMistakes = mistakes.filter((m) => {
    if (tagFilter === 'all') return true;
    if (tagFilter === 'unresolved') return !m.resolved;
    if (tagFilter === 'resolved') return m.resolved;
    return m.tag === tagFilter;
  });

  const handlePracticeMistakes = () => {
    if (bookmarks.length === 0 && mistakes.length === 0) return;
    const questionsToPractice = bookmarks.map((b) => b.question);
    if (questionsToPractice.length === 0) return;

    const session = createTestSession(
      {
        id: `drill_mistakes_${Date.now()}`,
        title: 'Targeted Mistake Revision Drill',
        mode: 'topic_practice',
        targetExamId: 'ssc_cgl',
        subjectCodes: ['quant', 'reasoning'],
        questionCount: questionsToPractice.length,
        durationMinutes: Math.max(10, questionsToPractice.length * 2),
        marksPerCorrect: 2.0,
        negativeMarking: 0.5,
        allowPause: true,
        sourceFilter: 'verified_only',
      },
      questionsToPractice
    );

    saveActiveTestSession(session);
    router.push(`/test/${session.testId}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-[#155DFC]" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#111B32] tracking-tight">
              Mistake Notebook & Saved Questions
            </h1>
          </div>
          <p className="text-xs text-[#64748B]">
            Revisit errors from your mock tests, review explanations, and launch targeted revision drills.
          </p>
        </div>

        {bookmarks.length > 0 && (
          <button
            onClick={handlePracticeMistakes}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors self-start sm:self-auto shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Launch Revision Drill</span>
          </button>
        )}
      </div>

      {/* Tabs Switcher matching screenshot */}
      <div className="flex items-center gap-6 border-b border-[#E2E8F0] text-xs">
        <button
          onClick={() => setActiveTab('mistakes')}
          className={`pb-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'mistakes'
              ? 'border-[#155DFC] text-[#155DFC]'
              : 'border-transparent text-[#64748B] hover:text-[#111B32]'
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <span>Mistakes ({mistakes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'bookmarks'
              ? 'border-[#155DFC] text-[#155DFC]'
              : 'border-transparent text-[#64748B] hover:text-[#111B32]'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          <span>Saved Questions ({bookmarks.length})</span>
        </button>
      </div>

      {/* Mistake Notebook View */}
      {activeTab === 'mistakes' && (
        <div className="space-y-5">
          {/* Tag Filter Bar matching screenshot chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-[#64748B] mr-1 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-[#94A3B8]" /> Filter:
            </span>
            <button
              onClick={() => setTagFilter('all')}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition-colors ${
                tagFilter === 'all'
                  ? 'bg-[#155DFC] text-white'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
              }`}
            >
              All Mistakes ({mistakes.length})
            </button>
            <button
              onClick={() => setTagFilter('unresolved')}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition-colors ${
                tagFilter === 'unresolved'
                  ? 'bg-[#E11D48] text-white'
                  : 'bg-[#FFF1F2] border border-rose-200 text-[#E11D48] hover:bg-rose-100'
              }`}
            >
              Needs Practice ({mistakes.filter((m) => !m.resolved).length})
            </button>
            <button
              onClick={() => setTagFilter('calculation_error')}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition-colors ${
                tagFilter === 'calculation_error'
                  ? 'bg-[#D97706] text-white'
                  : 'bg-[#FFFBEB] border border-amber-200 text-[#D97706] hover:bg-amber-100'
              }`}
            >
              Calculation Errors ({mistakes.filter((m) => m.tag === 'calculation_error').length})
            </button>
            <button
              onClick={() => setTagFilter('concept_gap')}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition-colors ${
                tagFilter === 'concept_gap'
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-[#F5F3FF] border border-purple-200 text-[#7C3AED] hover:bg-purple-100'
              }`}
            >
              Concept Gaps ({mistakes.filter((m) => m.tag === 'concept_gap').length})
            </button>
            <button
              onClick={() => setTagFilter('resolved')}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition-colors ${
                tagFilter === 'resolved'
                  ? 'bg-[#059669] text-white'
                  : 'bg-[#ECFDF5] border border-emerald-200 text-[#059669] hover:bg-emerald-100'
              }`}
            >
              Resolved ({mistakes.filter((m) => m.resolved).length})
            </button>
          </div>

          {/* Mistakes Cards Grid */}
          {filteredMistakes.length > 0 ? (
            <div className="space-y-4">
              {filteredMistakes.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-2xl border bg-white p-5 shadow-card hover:border-[#CBD5E1] transition-all space-y-3.5 ${
                    m.resolved
                      ? 'border-emerald-200 opacity-80'
                      : 'border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-[#111B32]">
                        {m.examName} • {m.topicName}
                      </span>
                      <span className="rounded-full bg-[#FFF1F2] border border-rose-200 px-2.5 py-0.5 font-bold text-[#E11D48] text-[10px] uppercase">
                        {m.tag.replace('_', ' ')}
                      </span>
                      <span className="text-[#94A3B8] text-[11px]">{m.dateAdded}</span>
                    </div>

                    <button
                      onClick={() => toggleResolveMistake(m.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                        m.resolved
                          ? 'bg-[#ECFDF5] text-[#059669] border border-emerald-200'
                          : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" />
                      <span>{m.resolved ? 'Resolved' : 'Mark as Resolved'}</span>
                    </button>
                  </div>

                  <p className="text-sm font-medium text-[#111B32] whitespace-pre-line leading-relaxed">
                    {m.questionText}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center font-bold text-xs shrink-0">✕</span>
                        <div>
                          <span className="text-[10px] text-[#94A3B8] block">Your Answer</span>
                          <span className="font-bold text-[#E11D48]">{m.userAnswer || 'Unattempted'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold text-xs shrink-0">✓</span>
                        <div>
                          <span className="text-[10px] text-[#94A3B8] block">Correct Answer</span>
                          <span className="font-bold text-[#059669]">{m.correctAnswer}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSolution(m.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#155DFC] bg-white px-3.5 py-1.5 text-xs font-bold text-[#155DFC] hover:bg-[#EFF6FF] transition-colors"
                    >
                      <span>Review →</span>
                    </button>
                  </div>

                  {m.notes && (
                    <div className="rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-3 text-xs flex items-start gap-2 shadow-2xs">
                      <span className="font-bold text-[#B45309] shrink-0">Your Reflection:</span>
                      <span className="text-[#92400E] font-medium leading-relaxed">{m.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#64748B] text-xs">
              <CheckCircle2 className="h-10 w-10 text-[#059669] mx-auto mb-2" />
              <p>No mistakes match the active filter. Great job!</p>
            </div>
          )}
        </div>
      )}

      {/* Bookmarks View */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {bookmarks.length > 0 ? (
            bookmarks.map((bm) => {
              const q = bm.question;
              const isExpanded = !!expandedSolutions[q.id];

              return (
                <div
                  key={bm.id}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-card hover:border-[#CBD5E1] transition-all space-y-3.5"
                >
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 text-xs">
                    <span className="font-bold text-[#155DFC]">
                      {q.provenance.examName} • {q.topicCode}
                    </span>
                    <button
                      onClick={() => toggleBookmark(q)}
                      className="text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1 font-medium transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-[#111B32] whitespace-pre-line leading-relaxed">
                    {q.questionText}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => toggleSolution(q.id)}
                      className="text-xs font-bold text-[#155DFC] hover:text-[#124BD4] flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Solution' : 'View Verified Solution'}</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 text-xs bg-[#EFF6FF]/70 border border-[#BFDBFE] p-4 rounded-xl text-[#1E293B] leading-relaxed">
                        {q.explanation.standard}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Bookmark className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p>No questions bookmarked yet. Click the bookmark icon during PYQ browsing to save items.</p>
              <Link href="/pyq" className="mt-2 inline-block font-bold text-blue-600 hover:underline">
                Browse Previous Year Questions
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
