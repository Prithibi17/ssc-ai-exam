'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BarChart2,
  Calendar,
  BookOpen,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Target,
  Flame,
  User,
  MonitorPlay,
  FileText,
  FileCheck2,
  Sparkles,
  Database,
  Bookmark,
  GraduationCap,
} from 'lucide-react';
import { usePlatformStore, getSavedActiveTestSession } from '@/lib/store/usePlatformStore';
import { EXAMS_CATALOGUE, SUBJECTS_CATALOGUE } from '@/data/exams';
import { TestSessionState } from '@/types';

export default function DashboardPage() {
  const { profile, mistakes, pastAttempts, toggleTargetExam } = usePlatformStore();
  const [activeSession, setActiveSession] = useState<TestSessionState | null>(null);

  useEffect(() => {
    const saved = getSavedActiveTestSession();
    if (saved && !saved.isSubmitted) {
      setActiveSession(saved);
    }
  }, []);

  const targetExams = EXAMS_CATALOGUE.filter((e) => profile.targetExams.includes(e.id));
  const unresolvedMistakes = mistakes.filter((m) => !m.resolved);
  const weakTopicNames = Array.from(new Set(unresolvedMistakes.map((m) => m.topicName))).slice(0, 4);

  // REAL DATA COMPUTATIONS:
  // 1. Total Practiced Questions
  const totalPracticed =
    pastAttempts.reduce((sum, a) => sum + (a.totalQuestions || 0), 0) ||
    profile.totalQuestionsPracticed ||
    0;

  // 2. Real Accuracy
  const totalAttempted = pastAttempts.reduce(
    (sum, a) => sum + (a.attemptedQuestions || a.totalQuestions || 0),
    0
  );
  const totalCorrect = pastAttempts.reduce((sum, a) => sum + (a.correctCount || 0), 0);
  const realAccuracy =
    totalAttempted > 0
      ? ((totalCorrect / totalAttempted) * 100).toFixed(1)
      : profile.overallAccuracy > 0
      ? profile.overallAccuracy.toFixed(1)
      : null;

  // Accuracy Trend (comparing last 2 attempts)
  let accuracyTrend: { label: string; positive: boolean } | null = null;
  if (pastAttempts.length >= 2) {
    const latest = pastAttempts[0].accuracyPercentage;
    const previous = pastAttempts[1].accuracyPercentage;
    const diff = Math.round(latest - previous);
    if (diff > 0) accuracyTrend = { label: `↑ ${diff}%`, positive: true };
    else if (diff < 0) accuracyTrend = { label: `↓ ${Math.abs(diff)}%`, positive: false };
    else accuracyTrend = { label: `0%`, positive: true };
  }

  // 3. Real Average Time
  const avgTimeSecs =
    pastAttempts.length > 0
      ? Math.round(
          pastAttempts.reduce((sum, a) => sum + (a.totalTimeSpentSeconds || 0), 0) /
            pastAttempts.length
        )
      : 0;
  const avgTimeDisplay = avgTimeSecs > 0 ? `${(avgTimeSecs / 60).toFixed(1)}m` : '--';
  const speedBadge = avgTimeSecs > 0 ? (avgTimeSecs <= 900 ? 'Fast' : 'Standard') : null;

  // 4. Questions Practiced Today (Daily target: 30)
  const todayStr = new Date().toISOString().split('T')[0];
  const questionsToday = pastAttempts
    .filter((a) => a.submittedAt?.startsWith(todayStr) || a.startedAt?.startsWith(todayStr))
    .reduce((sum, a) => sum + (a.totalQuestions || 0), 0);
  const dailyTarget = 30;

  // 5. Last 7 Days Calendar Chart Data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const attemptsOnDay = pastAttempts.filter(
      (a) => a.submittedAt?.startsWith(dateStr) || a.startedAt?.startsWith(dateStr)
    );
    const questionsCount = attemptsOnDay.reduce((sum, a) => sum + (a.totalQuestions || 0), 0);
    const isToday = i === 6;
    return {
      dateStr,
      day: dayName,
      count: questionsCount,
      isToday,
    };
  });
  const maxDayCount = Math.max(...last7Days.map((d) => d.count), 1);
  const questionsLast7 = last7Days.reduce((sum, d) => sum + d.count, 0);

  // Last 7 days accuracy
  const attemptsLast7 = pastAttempts.filter((a) => {
    const aDate = (a.submittedAt || a.startedAt || '').split('T')[0];
    return last7Days.some((d) => d.dateStr === aDate);
  });
  const totalAtt7 = attemptsLast7.reduce(
    (sum, a) => sum + (a.attemptedQuestions || a.totalQuestions || 0),
    0
  );
  const correct7 = attemptsLast7.reduce((sum, a) => sum + (a.correctCount || 0), 0);
  const accLast7 =
    totalAtt7 > 0
      ? `${((correct7 / totalAtt7) * 100).toFixed(1)}%`
      : realAccuracy
      ? `${realAccuracy}%`
      : '0.0%';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Candidate Greeting & Himalayan Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-card p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 min-h-[160px]">
        {/* Background Mountain Artwork */}
        <div
          className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 bg-no-repeat bg-right bg-cover opacity-90 pointer-events-none"
          style={{ backgroundImage: `url('/illustrations/hero-mountain.jpg')` }}
        />
        {/* Subtle white-to-transparent fade mask over artwork */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none" />

        {/* Left Greeting Text */}
        <div className="relative z-10 max-w-lg">
          <span className="text-xs font-semibold text-[#64748B] block mb-1">
            Good Evening,
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111B32] tracking-tight flex items-center gap-2">
            <span>{profile.fullName || 'Aspirant'}</span>
            <span>👋</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
            Let&apos;s continue your SSC journey. Consistency today, success tomorrow.
          </p>
        </div>

        {/* Right Metric Highlights */}
        <div className="relative z-10 w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Motivational Quote Capsule */}
          <div className="hidden xl:flex items-center gap-3 px-4 py-3 rounded-xl bg-white/90 backdrop-blur-xs border border-[#E2E8F0] shadow-card">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#155DFC] block">
                Discipline Turns Goals
              </span>
              <span className="text-xs font-black tracking-wider text-[#111B32]">
                INTO RESULTS.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center w-full">
            {/* Days Active Card */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white/95 backdrop-blur-xs p-3 shadow-card flex items-center gap-2.5 flex-1">
              <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-black text-[#111B32] block leading-tight">
                  {profile.streakDays || 1}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#64748B]">Days Active</span>
              </div>
            </div>

            {/* Today's Target Card */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white/95 backdrop-blur-xs p-3 shadow-card flex items-center gap-2.5 flex-1">
              <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#155DFC] shrink-0">
                <Target className="h-4 w-4 text-[#155DFC]" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-black text-[#111B32] block leading-tight">
                  {questionsToday} / {dailyTarget}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#64748B]">Target</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Metric Cards Row with Real Values */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1: Overall Accuracy */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 sm:p-5 shadow-card hover:border-[#CBD5E1] transition-all flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-[#ECFDF5] border border-emerald-100 flex items-center justify-center text-[#059669] shrink-0">
              <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#059669]" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-[#111B32] block leading-tight">
                {realAccuracy !== null ? `${realAccuracy}%` : '0.0%'}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-[#64748B]">Accuracy</span>
            </div>
          </div>
          {accuracyTrend ? (
            <div
              className={`hidden sm:flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                accuracyTrend.positive
                  ? 'text-[#059669] bg-[#ECFDF5]'
                  : 'text-[#E11D48] bg-[#FFF1F2]'
              }`}
            >
              <span>{accuracyTrend.label}</span>
            </div>
          ) : (
            <div className="hidden sm:block text-[11px] font-semibold text-[#94A3B8]">
              {pastAttempts.length === 0 ? 'No tests yet' : 'Baseline'}
            </div>
          )}
        </div>

        {/* Metric 2: Questions Practiced */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 sm:p-5 shadow-card hover:border-[#CBD5E1] transition-all flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-[#EFF6FF] border border-blue-100 flex items-center justify-center text-[#155DFC] shrink-0">
              <FileCheck2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#155DFC]" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-[#111B32] block leading-tight">
                {totalPracticed}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-[#64748B]">Practiced</span>
            </div>
          </div>
          {/* Mini Sparkline Bars */}
          <div className="hidden sm:flex items-end gap-1 h-6">
            <span
              className={`w-1.5 rounded-xs ${
                totalPracticed > 0 ? 'bg-blue-300 h-3' : 'bg-slate-200 h-1.5'
              }`}
            />
            <span
              className={`w-1.5 rounded-xs ${
                totalPracticed > 20 ? 'bg-blue-400 h-4' : 'bg-slate-200 h-1.5'
              }`}
            />
            <span
              className={`w-1.5 rounded-xs ${
                totalPracticed > 50 ? 'bg-[#155DFC] h-6' : 'bg-slate-200 h-1.5'
              }`}
            />
            <span
              className={`w-1.5 rounded-xs ${
                totalPracticed > 10 ? 'bg-blue-300 h-3.5' : 'bg-slate-200 h-1.5'
              }`}
            />
          </div>
        </div>

        {/* Metric 3: Avg. Time */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 sm:p-5 shadow-card hover:border-[#CBD5E1] transition-all flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-[#F5F3FF] border border-purple-100 flex items-center justify-center text-[#7C3AED] shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#7C3AED]" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-[#111B32] block leading-tight">
                {avgTimeDisplay}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-[#64748B]">Avg Time</span>
            </div>
          </div>
          {speedBadge ? (
            <div className="hidden sm:block text-xs font-bold text-[#7C3AED] bg-[#F5F3FF] px-2 py-0.5 rounded-full">
              <span>{speedBadge}</span>
            </div>
          ) : (
            <div className="hidden sm:block text-[11px] font-semibold text-[#94A3B8]">
              --
            </div>
          )}
        </div>

        {/* Metric 4: Weak Topics */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 sm:p-5 shadow-card hover:border-[#CBD5E1] transition-all flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-[#FFF1F2] border border-rose-100 flex items-center justify-center text-[#E11D48] shrink-0">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-[#E11D48]" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-[#111B32] block leading-tight">
                {weakTopicNames.length}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-[#64748B]">Weak Areas</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-0.5 text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-2 py-0.5 rounded-full">
            <span>{weakTopicNames.length > 0 ? `${weakTopicNames.length} topics` : 'None'}</span>
          </div>
        </div>
      </div>

      {/* 3. Start Practicing Section & Real Progress Graph Row */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[#111B32] uppercase tracking-wider">
          Start Practicing
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Practice Action Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Full Mock Test Simulation */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card hover:border-[#CBD5E1] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#EFF6FF] text-[#155DFC] flex items-center justify-center">
                    <MonitorPlay className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 text-[#64748B] px-2.5 py-0.5 text-[10px] font-bold">
                    Strict CBT Mode
                  </span>
                </div>
                <h3 className="font-bold text-[#111B32] text-sm">Full Mock Test Simulation</h3>
                <p className="text-[11px] text-[#64748B] mt-1.5 leading-relaxed">
                  Experience authentic exam environment with timer, negative marking and real exam interface.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/mock-setup?mode=official_simulation"
                  className="block w-full rounded-xl bg-[#155DFC] py-2.5 text-center text-xs font-bold text-white hover:bg-[#124BD4] shadow-xs transition-colors"
                >
                  Enter Examination Hall →
                </Link>
              </div>
            </div>

            {/* Card 2: Custom Mock Configurator */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card hover:border-[#CBD5E1] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                    <Target className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 text-[#64748B] px-2.5 py-0.5 text-[10px] font-bold">
                    Flexible Mode
                  </span>
                </div>
                <h3 className="font-bold text-[#111B32] text-sm">Custom Mock Configurator</h3>
                <p className="text-[11px] text-[#64748B] mt-1.5 leading-relaxed">
                  Choose subjects, topics, question count and time limits as per your plan.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/mock-setup?mode=custom_mock"
                  className="block w-full rounded-xl border border-[#155DFC] bg-white py-2.5 text-center text-xs font-bold text-[#155DFC] hover:bg-[#EFF6FF] shadow-xs transition-colors"
                >
                  Configure Custom Mock →
                </Link>
              </div>
            </div>

            {/* Card 3: AI Doubt Solver */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card hover:border-[#CBD5E1] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-purple-50 text-[#7C3AED] px-2.5 py-0.5 text-[10px] font-bold">
                    Kid-Teacher & Tricks
                  </span>
                </div>
                <h3 className="font-bold text-[#111B32] text-sm">AI Doubt Solver & Shortcuts</h3>
                <p className="text-[11px] text-[#64748B] mt-1.5 leading-relaxed">
                  Get easy explanations, shortcuts, visual analogies and step-by-step solutions.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/ai-tutor"
                  className="block w-full rounded-xl bg-[#7C3AED] py-2.5 text-center text-xs font-bold text-white hover:bg-purple-700 shadow-xs transition-colors"
                >
                  Ask AI Doubt Solver →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Progress Chart Card - REAL CALENDAR DATA */}
          <div className="lg:col-span-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <h3 className="text-xs font-bold text-[#111B32]">Your Progress</h3>
                <span className="text-[11px] font-semibold text-[#64748B]">Last 7 Days</span>
              </div>

              {/* Real Bar Chart */}
              <div className="pt-4 pb-2">
                <div className="flex items-end justify-between gap-2 h-28 px-2">
                  {last7Days.map((bar, i) => {
                    const heightPct =
                      bar.count > 0 ? Math.max(14, Math.round((bar.count / maxDayCount) * 100)) : 4;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        {bar.count > 0 ? (
                          <span className="rounded bg-[#0F172A] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs whitespace-nowrap">
                            {bar.count} Qs
                          </span>
                        ) : null}
                        <div
                          style={{ height: `${heightPct}%` }}
                          title={`${bar.day} (${bar.dateStr}): ${bar.count} questions`}
                          className={`w-full max-w-[18px] rounded-t-md transition-all ${
                            bar.count > 0
                              ? bar.isToday
                                ? 'bg-[#155DFC]'
                                : 'bg-[#60A5FA]'
                              : 'bg-slate-100 hover:bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-semibold ${
                            bar.isToday ? 'text-[#155DFC] font-bold' : 'text-[#94A3B8]'
                          }`}
                        >
                          {bar.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Real Chart Stats */}
            <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-3 text-center text-xs">
              <div>
                <span className="font-extrabold text-[#111B32] block">{questionsLast7}</span>
                <span className="text-[10px] text-[#64748B]">Questions Practiced</span>
              </div>
              <div>
                <span className="font-extrabold text-[#059669] block">{accLast7}</span>
                <span className="text-[10px] text-[#64748B]">Accuracy</span>
              </div>
              <div>
                <span className="font-extrabold text-[#7C3AED] block">{avgTimeDisplay}</span>
                <span className="text-[10px] text-[#64748B]">Avg. Time / Test</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Diagnostic Alert: Weak Topics */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#E11D48]" />
            <h2 className="text-xs font-bold text-[#111B32] uppercase tracking-wider">
              Diagnostic Alert: Weak Topics with Negative Marks
            </h2>
          </div>
          <Link href="/bookmarks" className="text-xs text-[#155DFC] font-semibold hover:underline">
            Mistake Notebook ({unresolvedMistakes.length}) →
          </Link>
        </div>

        <p className="text-xs text-[#64748B]">
          Negative marks and errors recorded from your mock test attempts:
        </p>

        {weakTopicNames.length === 0 ? (
          <div className="py-3 px-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] flex items-center justify-between">
            <span>🎉 Excellent accuracy! No negative mark traps recorded in your recent tests.</span>
            <Link
              href="/mock-setup?mode=topic_practice"
              className="text-xs font-bold text-[#155DFC] hover:underline"
            >
              Practice Topics →
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {weakTopicNames.map((topic, i) => (
                <span
                  key={i}
                  className="rounded-xl border border-rose-200 bg-[#FFF1F2] px-3 py-1 text-xs font-semibold text-[#E11D48]"
                >
                  {topic}
                </span>
              ))}
            </div>

            <Link
              href="/mock-setup?mode=topic_practice"
              className="rounded-xl bg-[#0F172A] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow-xs transition-colors shrink-0"
            >
              Start 15-Question Revision Drill →
            </Link>
          </div>
        )}
      </div>

      {/* 5. Bottom Three-Panel Grid: Enrolled Examinations, Real Recent Mock Tests, Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Panel 1: Enrolled Examinations */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-xs font-bold text-[#111B32]">Enrolled Examinations</h3>
              <Link href="/catalogue" className="text-[11px] font-semibold text-[#155DFC] hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-2.5 pt-3">
              {EXAMS_CATALOGUE.slice(0, 3).map((ex) => {
                const isActive = profile.targetExams.includes(ex.id);
                return (
                  <div
                    key={ex.id}
                    onClick={() => toggleTargetExam(ex.id)}
                    className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition-all ${
                      isActive
                        ? 'border-[#60A5FA] bg-[#EFF6FF] shadow-2xs'
                        : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[#EFF6FF] text-[#155DFC] flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111B32]">{ex.name}</p>
                        <span className="text-[10px] text-[#64748B] font-medium block mt-0.5">
                          {ex.conductingBody} • {ex.tiers.length} Tiers
                        </span>
                      </div>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                        isActive ? 'border-[#155DFC] bg-[#155DFC]' : 'border-slate-300'
                      }`}
                    >
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel 2: Real Recent Mock Tests */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-xs font-bold text-[#111B32]">Recent Mock Tests</h3>
              <Link href="/analytics" className="text-[11px] font-semibold text-[#155DFC] hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-2.5 pt-3">
              {pastAttempts.length === 0 ? (
                <div className="text-center py-6 px-3 bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1] space-y-2">
                  <p className="text-xs font-semibold text-[#64748B]">No mock tests completed yet.</p>
                  <p className="text-[11px] text-[#94A3B8]">
                    Take your first CBT mock test to start tracking your performance.
                  </p>
                  <Link
                    href="/mock-setup?mode=official_simulation"
                    className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-[#155DFC] text-white text-xs font-bold hover:bg-[#124BD4] transition-colors"
                  >
                    Start a Mock Test →
                  </Link>
                </div>
              ) : (
                pastAttempts.slice(0, 3).map((test, i) => {
                  const dateFormatted = test.submittedAt
                    ? new Date(test.submittedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recent';
                  const timeMins = test.totalTimeSpentSeconds
                    ? Math.round(test.totalTimeSpentSeconds / 60)
                    : 0;
                  return (
                    <div
                      key={test.attemptId || i}
                      className="rounded-xl border border-[#E2E8F0] p-3 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 text-[#64748B] flex items-center justify-center shrink-0">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#111B32]">{test.title || test.examName}</p>
                          <span className="text-[10px] text-[#64748B] block mt-0.5">
                            {dateFormatted} • {test.totalQuestions} Qs •{' '}
                            {timeMins > 0 ? `${timeMins}m` : 'Completed'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-[#ECFDF5] border border-emerald-200 px-2 py-0.5 text-xs font-bold text-[#059669]">
                          {test.accuracyPercentage}%
                        </span>
                        <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Panel 3: Quick Actions */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-xs font-bold text-[#111B32]">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-3">
              <Link
                href="/pyq"
                className="rounded-xl border border-[#E2E8F0] p-3 flex flex-col justify-between hover:border-[#155DFC] hover:bg-[#EFF6FF] transition-all group"
              >
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#155DFC] flex items-center justify-center mb-2">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111B32] group-hover:text-[#155DFC]">PYQ Bank</p>
                  <span className="text-[10px] text-[#64748B]">Solve past years</span>
                </div>
              </Link>

              <Link
                href="/bookmarks"
                className="rounded-xl border border-[#E2E8F0] p-3 flex flex-col justify-between hover:border-purple-400 hover:bg-[#F5F3FF] transition-all group"
              >
                <div className="h-8 w-8 rounded-lg bg-purple-50 text-[#7C3AED] flex items-center justify-center mb-2">
                  <Bookmark className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111B32] group-hover:text-[#7C3AED]">Mistake Book</p>
                  <span className="text-[10px] text-[#64748B]">Review errors</span>
                </div>
              </Link>

              <Link
                href="/mock-setup?mode=topic_practice"
                className="rounded-xl border border-[#E2E8F0] p-3 flex flex-col justify-between hover:border-blue-400 hover:bg-[#EFF6FF] transition-all group"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center mb-2">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111B32] group-hover:text-[#059669]">Topic Drill</p>
                  <span className="text-[10px] text-[#64748B]">Practice weak areas</span>
                </div>
              </Link>

              <Link
                href="/catalogue"
                className="rounded-xl border border-[#E2E8F0] p-3 flex flex-col justify-between hover:border-blue-400 hover:bg-[#EFF6FF] transition-all group"
              >
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#155DFC] flex items-center justify-center mb-2">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111B32] group-hover:text-[#155DFC]">Exams</p>
                  <span className="text-[10px] text-[#64748B]">View all syllabi</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
