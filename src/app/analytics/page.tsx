'use client';

import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { SUBJECTS_CATALOGUE, TOPICS_CATALOGUE } from '@/data/exams';

export default function AnalyticsPage() {
  const { profile, pastAttempts, mistakes } = usePlatformStore();

  const totalTests = Math.max(pastAttempts.length, 6);
  const avgAccuracy = pastAttempts.length > 0
    ? Math.round(pastAttempts.reduce((a, b) => a + b.accuracyPercentage, 0) / pastAttempts.length)
    : 78;

  const mockTrends = [
    { date: '12 Sep', score: 112, accuracy: 68 },
    { date: '18 Sep', score: 124, accuracy: 72 },
    { date: '25 Sep', score: 136, accuracy: 75 },
    { date: '01 Oct', score: 142, accuracy: 79 },
    { date: '05 Oct', score: 148, accuracy: 82 },
    { date: 'Today', score: 154, accuracy: 84 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#155DFC] mb-2.5">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Comprehensive Student Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111B32] tracking-tight">
            Performance Diagnostics & Trends
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Data-driven tracking across mock tests, speed indices, accuracy curves, and syllabus mastery.
          </p>
        </div>

        <Link
          href="/mock-setup?mode=topic_practice"
          className="inline-flex items-center gap-2 rounded-xl bg-[#155DFC] hover:bg-[#124BD4] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          <span>Generate Targeted Practice</span>
        </Link>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Total Tests Taken</span>
            <div className="h-8 w-8 rounded-xl bg-[#EFF6FF] text-[#155DFC] flex items-center justify-center">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#111B32] mt-2">{totalTests}</p>
          <span className="text-[11px] text-[#059669] font-semibold mt-1 block">
            ↑ 3 tests this week
          </span>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Cumulative Accuracy</span>
            <div className="h-8 w-8 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#059669] mt-2">{avgAccuracy}%</p>
          <span className="text-[11px] text-[#64748B] mt-1 block">
            Targeting &gt;85% for Tier-1 cutoff
          </span>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Avg Response Time</span>
            <div className="h-8 w-8 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#111B32] mt-2">48 sec</p>
          <span className="text-[11px] text-[#059669] font-semibold mt-1 block">
            Optimal (below 60s limit)
          </span>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Mistake Backlog</span>
            <div className="h-8 w-8 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#D97706] mt-2">
            {mistakes.filter((m) => !m.resolved).length} Concepts
          </p>
          <span className="text-[11px] text-[#64748B] mt-1 block">
            Requires revision drill
          </span>
        </div>
      </div>

      {/* Accuracy & Score Progression Curve */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#111B32]">
              Score & Accuracy Progression Trend
            </h2>
            <p className="text-xs text-[#64748B]">Mock test score improvement over the last 30 days</p>
          </div>
          <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#059669] border border-[#A7F3D0] self-start sm:self-auto">
            +42 Marks Net Growth
          </span>
        </div>

        {/* Visual Bar Simulation */}
        <div className="grid grid-cols-6 gap-3 items-end h-48 pt-6 border-b border-[#F1F5F9]">
          {mockTrends.map((t, idx) => {
            const heightPct = Math.round((t.score / 200) * 100);
            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-bold text-[#155DFC]">{t.score}</span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-[#155DFC] to-[#60A5FA] shadow-xs hover:brightness-110 transition-all cursor-pointer relative group"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#0F172A] text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10 shadow-floating">
                    Accuracy: {t.accuracy}%
                  </div>
                </div>
                <span className="text-[11px] font-medium text-[#64748B]">{t.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section-Wise Radar Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card space-y-4">
          <h2 className="text-base font-bold text-[#111B32]">
            Subject Proficiency Index
          </h2>
          <div className="space-y-4 text-xs">
            {SUBJECTS_CATALOGUE.map((subj) => {
              const proficiency =
                subj.code === 'quant'
                  ? 82
                  : subj.code === 'reasoning'
                  ? 88
                  : subj.code === 'english'
                  ? 84
                  : 64;

              return (
                <div key={subj.id} className="space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#111B32]">{subj.name}</span>
                    <span className="text-[#155DFC]">{proficiency}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div
                      style={{ width: `${proficiency}%` }}
                      className={`h-full rounded-full ${
                        proficiency >= 85 ? 'bg-[#059669]' : proficiency >= 75 ? 'bg-[#155DFC]' : 'bg-[#D97706]'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Management Matrix */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card space-y-4">
          <h2 className="text-base font-bold text-[#111B32]">
            Time Management Quadrant Analysis
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-4">
              <span className="font-bold text-[#065F46] block">Fast & Correct</span>
              <p className="text-2xl font-extrabold text-[#059669] mt-1">62%</p>
              <span className="text-[10px] text-[#047857] mt-1 block">Solved &lt;45s accurately</span>
            </div>

            <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
              <span className="font-bold text-[#1E40AF] block">Slow & Correct</span>
              <p className="text-2xl font-extrabold text-[#155DFC] mt-1">18%</p>
              <span className="text-[10px] text-[#1D4ED8] mt-1 block">Accurate but need speed shortcuts</span>
            </div>

            <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
              <span className="font-bold text-[#92400E] block">Careless Errors</span>
              <p className="text-2xl font-extrabold text-[#D97706] mt-1">12%</p>
              <span className="text-[10px] text-[#B45309] mt-1 block">Rushed without verifying</span>
            </div>

            <div className="rounded-xl border border-[#FECDD3] bg-[#FFF1F2] p-4">
              <span className="font-bold text-[#9F1239] block">Time Traps</span>
              <p className="text-2xl font-extrabold text-[#E11D48] mt-1">8%</p>
              <span className="text-[10px] text-[#BE123C] mt-1 block">Spent &gt;90s and scored negative</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
