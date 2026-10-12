'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { EXAMS_CATALOGUE, SUBJECTS_CATALOGUE } from '@/data/exams';
import { ExamCategory } from '@/types';

export default function CataloguePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: { label: string; value: string }[] = [
    { label: 'All Examinations', value: 'all' },
    { label: 'Staff Selection Commission (SSC)', value: 'ssc' },
    { label: 'Railways (RRB)', value: 'railways' },
    { label: 'Delhi State & PSC (DSSSB)', value: 'state_psc' },
  ];

  const filteredExams = EXAMS_CATALOGUE.filter((exam) => {
    const matchesSearch =
      exam.name.toLowerCase().includes(search.toLowerCase()) ||
      exam.description.toLowerCase().includes(search.toLowerCase()) ||
      exam.conductingBody.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || exam.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#155DFC] mb-2.5">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>National Examination Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111B32] tracking-tight">
            Competitive Examination Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-3xl mt-1 leading-relaxed">
            Explore complete syllabus hierarchies, tier structures, negative marking policies, and authentic TCS iON computer-based test specifications.
          </p>
        </div>

        <Link
          href="/syllabus"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#155DFC] hover:bg-blue-50 hover:border-blue-200 shadow-2xs transition-all shrink-0 self-start md:self-auto"
        >
          <BookOpen className="h-4 w-4" />
          <span>Chapter-wise Syllabus (All Exams) →</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-card">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by exam name (e.g., SSC CGL, MTS, CPO, Stenographer)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#111B32] placeholder-[#94A3B8] focus:border-[#155DFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#93C5FD]/40 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-[#155DFC] text-white shadow-xs'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#111B32] hover:bg-[#E2E8F0]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExams.map((exam) => (
          <div
            key={exam.id}
            className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-bold text-[#155DFC]">
                  {exam.badge}
                </span>
                <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider">
                  {exam.category.toUpperCase()}
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#111B32] mt-3">
                {exam.name}
              </h2>
              <p className="text-xs font-semibold text-[#64748B] mt-0.5">
                {exam.conductingBody}
              </p>

              <p className="text-xs text-[#64748B] mt-3 line-clamp-3 leading-relaxed">
                {exam.description}
              </p>

              {/* Tiers summary */}
              <div className="mt-4 space-y-2 pt-3 border-t border-[#F1F5F9]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Examination Tiers & Marking
                </p>
                {exam.tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="flex items-center justify-between text-xs text-[#334155] bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl"
                  >
                    <span className="font-semibold text-[#111B32]">{tier.tier}</span>
                    <span className="text-[#64748B]">
                      {tier.totalQuestions} Qs • {tier.durationMinutes}m • (-{tier.negativeMarking})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center gap-2.5">
              <Link
                href={`/catalogue/${exam.id}`}
                className="flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-center text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all"
              >
                Inspect Syllabus
              </Link>
              <Link
                href={`/mock-setup?exam=${exam.id}`}
                className="flex-1 rounded-xl bg-[#155DFC] hover:bg-[#124BD4] py-2.5 text-center text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Take Mock</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
