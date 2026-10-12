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
  const weakTopicNames = Array.from(new Set(mistakes.filter((m) => !m.resolved).map((m) => m.topicName))).slice(0, 4);

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
            <span>{profile.fullName}</span>
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
                  {profile.streakDays}
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
                  18 / 30
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#64748B]">Target</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Metric Cards Row with Trend Visualizers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1: Overall Accuracy */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 sm:p-5 shadow-card hover:border-[#CBD5E1] transition-all flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-[#ECFDF5] border border-emerald-100 flex items-center justify-center text-[#059669] shrink-0">
              <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#059669]" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-[#111B32] block leading-tight">
                76.9%
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-[#64748B]">Accuracy</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-0.5 text-xs font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
            <span>↑ 8%</span>
          </div>
        </div>

        {/* Metric 2: Questions Practiced */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 sm:p-5 shadow-card hover:border-[#CBD5E1] transition-all flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-[#EFF6FF] border border-blue-100 flex items-center justify-center text-[#155DFC] shrink-0">
              <FileCheck2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#155DFC]" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-[#111B32] block leading-tight">
                142
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-[#64748B]">Practiced</span>
            </div>
          </div>
          {/* Mini Sparkline Bars */}
          <div className="hidden sm:flex items-end gap-1 h-6">
            <span className="w-1.5 h-3 bg-blue-200 rounded-xs" />
            <span className="w-1.5 h-4 bg-blue-300 rounded-xs" />
            <span className="w-1.5 h-6 bg-[#155DFC] rounded-xs" />
            <span className="w-1.5 h-4 bg-blue-300 rounded-xs" />
          </div>
        </div>

        {/* Metric 3: Avg. Time / 25 Qs */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 sm:p-5 shadow-card hover:border-[#CBD5E1] transition-all flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-[#F5F3FF] border border-purple-100 flex items-center justify-center text-[#7C3AED] shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#7C3AED]" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-[#111B32] block leading-tight">
                12.5m
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-[#64748B]">Avg Time</span>
            </div>
          </div>
          <div className="hidden sm:block text-xs font-bold text-[#7C3AED] bg-[#F5F3FF] px-2 py-0.5 rounded-full">
            <span>Fast</span>
          </div>
        </div>

        {/* Metric 4: Weak Topics */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 sm:p-5 shadow-card hover:border-[#CBD5E1] transition-all flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-[#FFF1F2] border border-rose-100 flex items-center justify-center text-[#E11D48] shrink-0">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-[#E11D48]" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-[#111B32] block leading-tight">
                3
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-[#64748B]">Weak Areas</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-0.5 text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-2 py-0.5 rounded-full">
            <span>↑ 2</span>
          </div>
        </div>
      </div>

      {/* 3. Start Practicing Section & Progress Graph Row */}
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
                  Choose subjects, topics, question count and time in-itas as per your plan.
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

          {/* Right Progress Chart Card */}
          <div className="lg:col-span-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <h3 className="text-xs font-bold text-[#111B32]">Your Progress</h3>
                <span className="text-[11px] font-semibold text-[#64748B] cursor-pointer">Last 7 Days ▾</span>
              </div>

              {/* Bar Chart Mockup */}
              <div className="pt-4 pb-2">
                <div className="flex items-end justify-between gap-2 h-28 px-2">
                  {[
                    { day: 'Mon', h: '45%' },
                    { day: 'Tue', h: '60%' },
                    { day: 'Wed', h: '35%' },
                    { day: 'Thu', h: '90%', active: true, count: '18 Qs' },
                    { day: 'Fri', h: '50%' },
                    { day: 'Sat', h: '70%' },
                    { day: 'Sun', h: '40%' },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      {bar.active && (
                        <span className="rounded bg-[#0F172A] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                          {bar.count}
                        </span>
                      )}
                      <div
                        style={{ height: bar.h }}
                        className={`w-full max-w-[18px] rounded-t-md transition-all ${
                          bar.active ? 'bg-[#155DFC]' : 'bg-[#EFF6FF] hover:bg-blue-200'
                        }`}
                      />
                      <span className="text-[10px] font-semibold text-[#94A3B8]">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Chart Stats */}
            <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-3 text-center text-xs">
              <div>
                <span className="font-extrabold text-[#111B32] block">142</span>
                <span className="text-[10px] text-[#64748B]">Questions Practiced</span>
              </div>
              <div>
                <span className="font-extrabold text-[#059669] block">76.9%</span>
                <span className="text-[10px] text-[#64748B]">Accuracy</span>
              </div>
              <div>
                <span className="font-extrabold text-[#7C3AED] block">12.5 min</span>
                <span className="text-[10px] text-[#64748B]">Avg. Time / 25 Qs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Diagnostic Alert: Weak Topics Banner */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#E11D48]" />
            <h2 className="text-xs font-bold text-[#111B32] uppercase tracking-wider">
              Diagnostic Alert: Weak Topics with Negative Marks
            </h2>
          </div>
          <Link href="/bookmarks" className="text-xs text-[#155DFC] font-semibold hover:underline">
            Mistake Notebook ({mistakes.length}) →
          </Link>
        </div>

        <p className="text-xs text-[#64748B]">
          You incurred negative marks in the following topics across your recent mock test attempts:
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {['Profit, Loss & Discount', 'Time & Work', 'Ratio & Proportion', 'Simple Interest'].map((topic, i) => (
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
      </div>

      {/* 5. Bottom Three-Panel Grid: Enrolled Examinations, Recent Mock Tests, Quick Actions */}
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
              {[
                { name: 'SSC CGL (Combined Graduate Level)', tier: 'Tier-I: 100 Qs • 60m', active: true },
                { name: 'SSC CHSL (10+2 Combined Higher Secondary Level)', tier: 'Tier-I: 100 Qs • 60m', active: false },
                { name: 'SSC MTS & Havaldar (Multi-Tasking Staff)', tier: 'Tier-I: 90 Qs • 90m', active: false },
              ].map((ex, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-3 flex items-center justify-between transition-all ${
                    ex.active
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
                      <span className="text-[10px] text-[#64748B] font-medium block mt-0.5">{ex.tier}</span>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${ex.active ? 'border-[#155DFC] bg-[#155DFC]' : 'border-slate-300'}`}>
                    {ex.active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 2: Recent Mock Tests */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-xs font-bold text-[#111B32]">Recent Mock Tests</h3>
              <Link href="/analytics" className="text-[11px] font-semibold text-[#155DFC] hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-2.5 pt-3">
              {[
                { title: 'SSC CGL - Full Mock Test', meta: '10 Oct 2026 • 100 Qs • 60m', score: '72%' },
                { title: 'Quantitative Aptitude - Topic Drill', meta: '8 Oct 2026 • 25 Qs • 30m', score: '64%' },
                { title: 'English Comprehension - Practice', meta: '6 Oct 2026 • 25 Qs • 25m', score: '80%' },
              ].map((test, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#E2E8F0] p-3 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 text-[#64748B] flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111B32]">{test.title}</p>
                      <span className="text-[10px] text-[#64748B] block mt-0.5">{test.meta}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[#ECFDF5] border border-emerald-200 px-2 py-0.5 text-xs font-bold text-[#059669]">
                      {test.score}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                  </div>
                </div>
              ))}
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
