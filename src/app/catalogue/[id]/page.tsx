import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  GraduationCap,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Calculator,
  BrainCircuit,
  Globe,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import { EXAMS_CATALOGUE, SUBJECTS_CATALOGUE, TOPICS_CATALOGUE } from '@/data/exams';
import { EXAM_SYLLABUS_MAP } from '@/data/syllabus';
import { DSSSB_PAPERS_CATALOGUE } from '@/data/dsssb_papers_meta';

export function generateStaticParams() {
  return EXAMS_CATALOGUE.map((exam) => ({
    id: exam.id,
  }));
}

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = EXAMS_CATALOGUE.find((e) => e.id === id);

  if (!exam) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#111B32] mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Catalogue</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-bold text-[#155DFC]">
                {exam.badge}
              </span>
              <span className="text-xs text-[#64748B] font-medium">
                {exam.conductingBody}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111B32] tracking-tight">
              {exam.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
              {exam.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/mock-setup?exam=${exam.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#155DFC] hover:bg-[#124BD4] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Launch Mock Test</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Annual Applicants</span>
          <p className="text-2xl font-extrabold text-[#111B32] mt-1">
            {exam.stats.annualApplicants}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">10-Yr Verified PYQs</span>
          <p className="text-2xl font-extrabold text-[#155DFC] mt-1">
            {exam.stats.pyqCount}+
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Expected Cutoff</span>
          <p className="text-2xl font-extrabold text-[#059669] mt-1">
            {exam.stats.avgCutoff}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Languages</span>
          <p className="text-2xl font-extrabold text-[#111B32] mt-1">
            EN • HI • BN
          </p>
        </div>
      </div>

      {/* Eligibility & Overview */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card space-y-2">
        <h2 className="text-base font-bold text-[#111B32]">
          Eligibility & Selection Criteria
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
          {exam.eligibility}
        </p>
      </div>

      {/* Tiers & Paper Patterns */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#111B32]">
          Examination Pattern & Marking Scheme
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {exam.tiers.map((tier) => (
            <div
              key={tier.id}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <span className="text-base font-bold text-[#111B32]">
                  {tier.title}
                </span>
                <span className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-bold text-[#155DFC]">
                  {tier.tier}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 py-3 text-center border-b border-[#F1F5F9]">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl">
                  <span className="text-[11px] text-[#64748B] block font-medium">Questions</span>
                  <span className="text-base font-extrabold text-[#111B32]">
                    {tier.totalQuestions}
                  </span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl">
                  <span className="text-[11px] text-[#64748B] block font-medium">Marks</span>
                  <span className="text-base font-extrabold text-[#111B32]">
                    {tier.totalMarks}
                  </span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl">
                  <span className="text-[11px] text-[#64748B] block font-medium">Duration</span>
                  <span className="text-base font-extrabold text-[#111B32]">
                    {tier.durationMinutes}m
                  </span>
                </div>
              </div>

              {/* Sections Breakdown */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                  Sectional Distribution
                </p>
                {tier.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    <span className="font-semibold text-[#111B32]">
                      {sec.name}
                    </span>
                    <span className="text-[#64748B] font-medium">
                      {sec.questionCount} Questions ({sec.questionCount * sec.marksPerQuestion} Marks)
                    </span>
                  </div>
                ))}
              </div>

              {/* Negative marking note */}
              <div className="flex items-center justify-between text-xs text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] p-3 rounded-xl">
                <span>Negative Marking Penalty:</span>
                <span className="font-bold">-{tier.negativeMarking} Marks per incorrect answer</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Shift Papers Showcase for DSSSB */}
      {exam.id === 'dsssb' && (
        <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-bold text-[#059669]">
                  100% Authentic Exam Papers
                </span>
                <span className="text-xs text-[#64748B] font-semibold">
                  38 Shifts • 3,667 Questions Available
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#111B32] tracking-tight">
                Official Previous Year Shift Papers (2014–2022)
              </h2>
            </div>
            <Link
              href="/mock-setup?exam=dsssb"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#155DFC] text-white text-xs font-bold hover:bg-[#124BD4] transition-all self-start sm:self-auto"
            >
              <span>Explore All Shifts in CBT Lab →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {DSSSB_PAPERS_CATALOGUE.slice(0, 9).map((paper) => (
              <div
                key={paper.id}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#155DFC] mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] border border-[#BFDBFE]">
                      {paper.postName}
                    </span>
                    <span className="text-[#64748B]">{paper.examDate}</span>
                  </div>
                  <h3 className="font-bold text-xs text-[#111B32] line-clamp-2 mt-1">
                    {paper.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-[11px]">
                  <span className="text-[#64748B] font-medium">
                    {paper.totalQuestions} Qs • {paper.durationMinutes}m
                  </span>
                  <Link
                    href={`/mock-setup?exam=dsssb&paper=${paper.id}`}
                    className="font-bold text-[#155DFC] hover:underline"
                  >
                    Start CBT Mock →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapter-wise Official Syllabus Breakdown */}
      {(() => {
        const syllabusData = EXAM_SYLLABUS_MAP[exam.id];
        if (!syllabusData) return null;

        return (
          <div className="space-y-5 pt-4 border-t border-[#E2E8F0]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-bold text-[#155DFC]">
                    Official Curriculum
                  </span>
                  <span className="text-xs text-[#64748B] font-semibold">
                    {syllabusData.totalTopics} Verified Topics
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#111B32] tracking-tight">
                  Subject-wise &amp; Chapter-wise Syllabus
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                  Every chapter officially prescribed by {exam.conductingBody} under the latest TCS iON test delivery pattern.
                </p>
              </div>

              <Link
                href="/syllabus"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#155DFC] hover:bg-blue-50 transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#155DFC]" />
                <span>Open Full Syllabus Explorer →</span>
              </Link>
            </div>

            <div className="space-y-6">
              {syllabusData.subjects.map((subj) => (
                <div
                  key={subj.id}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-card space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#155DFC] flex items-center justify-center font-bold border border-blue-200">
                        {subj.code === 'quant' && <Calculator className="h-4 w-4" />}
                        {subj.code === 'reasoning' && <BrainCircuit className="h-4 w-4" />}
                        {subj.code === 'english' && <BookOpen className="h-4 w-4" />}
                        {subj.code === 'ga' && <Globe className="h-4 w-4" />}
                        {subj.code === 'computer' && <Cpu className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#111B32]">
                          {subj.name}
                        </h3>
                        <span className="text-xs text-[#64748B] font-medium">
                          {subj.topicCount} Prescribed Chapters
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/pyq?subject=${subj.code}`}
                      className="text-xs font-bold text-[#155DFC] hover:underline hidden sm:inline-flex items-center gap-1"
                    >
                      <span>Practice PYQs</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {/* Topics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                    {subj.topics.map((top) => (
                      <div
                        key={top.number}
                        className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white transition-all flex items-start gap-2.5 group"
                      >
                        <span className="h-5 w-5 rounded-md bg-white border border-[#E2E8F0] text-[#155DFC] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {top.number}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-1.5">
                            <h4 className="text-xs font-bold text-[#111B32] group-hover:text-[#155DFC] transition-colors truncate">
                              {top.name}
                            </h4>
                            {top.category && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200/80 text-[#475569] shrink-0">
                                {top.category}
                              </span>
                            )}
                          </div>
                          {top.description && (
                            <p className="text-[10px] text-[#64748B] mt-0.5 line-clamp-1">
                              {top.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
