import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MonitorPlay,
  BookOpen,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { EXAMS_CATALOGUE } from '@/data/exams';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-20 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* 1. Calm, Minimal Announcement Pill */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-medium">10-Year verified official answer keys & real TCS iON exam simulation</span>
        </div>
      </div>

      {/* 2. Refined, Minimal Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Practice central government exams with real hall familiarity.
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            Prepare for <strong>SSC CGL, CHSL, MTS, CPO, GD</strong>, and <strong>RRB NTPC</strong> with verified past questions, exact negative marking formulas, and the official TCS iON computer console.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/mock-setup"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <MonitorPlay className="h-4 w-4" />
              <span>Start Mock Test</span>
            </Link>

            <Link
              href="/pyq"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Browse Past Papers (PYQ)
            </Link>

            <Link
              href="/ai-tutor"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 transition-colors"
            >
              AI Doubt Tutor
            </Link>
          </div>

          {/* 3 Calm Metrics */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-100 dark:border-slate-900 max-w-lg">
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">TCS iON</p>
              <p className="text-xs text-slate-500">Official Exam Console</p>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">100%</p>
              <p className="text-xs text-slate-500">Verified Answer Keys</p>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">10-Year</p>
              <p className="text-xs text-slate-500">PYQ Archive</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Minimal Question Palette Legend */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2.5 dark:border-slate-800">
            <span className="font-semibold text-xs text-slate-900 dark:text-slate-200">
              TCS iON Question Palette Reference
            </span>
            <span className="text-[11px] text-slate-500">
              Exam hall button shapes & evaluation status
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-xs">
            <div className="flex items-center gap-2.5 p-2 rounded bg-slate-50 dark:bg-slate-800/40">
              <span className="h-6 w-6 bg-slate-300 text-slate-800 font-bold flex items-center justify-center text-[10px] tcs-shape-not-visited shrink-0">
                1
              </span>
              <div>
                <span className="font-medium block text-slate-800 dark:text-slate-200">Not Visited</span>
                <span className="text-[10px] text-slate-500 block">Not yet opened</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded bg-slate-50 dark:bg-slate-800/40">
              <span className="h-6 w-6 bg-red-600 text-white font-bold flex items-center justify-center text-[10px] tcs-shape-not-answered shrink-0">
                2
              </span>
              <div>
                <span className="font-medium block text-slate-800 dark:text-slate-200">Not Answered</span>
                <span className="text-[10px] text-slate-500 block">Visited, no answer</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded bg-slate-50 dark:bg-slate-800/40">
              <span className="h-6 w-6 bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] tcs-shape-answered shrink-0">
                3
              </span>
              <div>
                <span className="font-medium block text-slate-800 dark:text-slate-200">Answered</span>
                <span className="text-[10px] text-slate-500 block">Saved answer</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded bg-slate-50 dark:bg-slate-800/40">
              <span className="h-6 w-6 bg-purple-700 text-white font-bold flex items-center justify-center text-[10px] tcs-shape-review shrink-0">
                4
              </span>
              <div>
                <span className="font-medium block text-slate-800 dark:text-slate-200">Review</span>
                <span className="text-[10px] text-slate-500 block">Marked for review</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded bg-slate-50 dark:bg-slate-800/40 col-span-2 sm:col-span-1">
              <span className="h-6 w-6 bg-purple-700 text-white font-bold flex items-center justify-center text-[10px] tcs-shape-review relative shrink-0">
                5
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <div>
                <span className="font-medium block text-slate-800 dark:text-slate-200">Answered & Marked</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium">Will be evaluated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Active Examination Catalogue Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-[#0b3a75] dark:text-blue-400 uppercase tracking-wider block">
              Examination Catalogue
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Target SSC & Railway Examinations
            </h2>
          </div>
          <Link
            href="/catalogue"
            className="text-xs font-bold text-[#0b3a75] dark:text-blue-400 hover:underline"
          >
            View Complete Syllabus & Rules →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXAMS_CATALOGUE.map((exam) => (
            <div
              key={exam.id}
              className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all dark:border-slate-800 dark:bg-slate-900 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 uppercase dark:bg-slate-800 dark:text-slate-400">
                    {exam.conductingBody}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {exam.stats.pyqCount}+ Questions
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {exam.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {exam.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Tier-I: <strong>{exam.tiers[0].totalQuestions} Qs ({exam.tiers[0].durationMinutes}m)</strong></span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">-{exam.tiers[0].negativeMarking.toFixed(2)} penalty</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/mock-setup?exam=${exam.id}`}
                    className="flex-1 text-center rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
                  >
                    Start CBT Mock
                  </Link>
                  <Link
                    href={`/catalogue/${exam.id}`}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  >
                    Syllabus
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
