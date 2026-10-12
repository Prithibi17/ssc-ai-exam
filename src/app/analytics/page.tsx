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

  const totalTests = pastAttempts.length;

  const totalQuestionsAttempted = pastAttempts.reduce(
    (a, b) => a + (b.attemptedQuestions || b.totalQuestions || 0),
    0
  );
  const totalCorrect = pastAttempts.reduce((a, b) => a + (b.correctCount || 0), 0);
  const avgAccuracy =
    totalQuestionsAttempted > 0
      ? Math.round((totalCorrect / totalQuestionsAttempted) * 100)
      : 0;

  const totalTimeSecs = pastAttempts.reduce((a, b) => a + (b.totalTimeSpentSeconds || 0), 0);
  const avgSecsPerQ =
    totalQuestionsAttempted > 0 ? Math.round(totalTimeSecs / totalQuestionsAttempted) : 0;
  const avgResponseTimeDisplay = avgSecsPerQ > 0 ? `${avgSecsPerQ} sec` : '--';

  // Real Trends from completed attempts (up to last 6)
  const trends = pastAttempts
    .slice(0, 6)
    .reverse()
    .map((a, i) => {
      const dateStr = a.submittedAt
        ? new Date(a.submittedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })
        : `Test ${i + 1}`;
      return {
        date: dateStr,
        score: Math.round(a.totalScore),
        accuracy: Math.round(a.accuracyPercentage),
        maxMarks: a.maxMarks || 200,
      };
    });

  let netGrowthLabel: string | null = null;
  if (trends.length >= 2) {
    const diff = trends[trends.length - 1].score - trends[0].score;
    netGrowthLabel = diff >= 0 ? `+${diff} Marks Net Growth` : `${diff} Marks Net Growth`;
  }

  // Real Subject Proficiency Index from section breakdowns
  const allSections = pastAttempts.flatMap((a) => a.sectionBreakdown || []);

  // Real Time Management Quadrants from question results
  const allQResults = pastAttempts.flatMap((a) => a.questionResults || []);
  const totalQCount = allQResults.length;
  const fastCorrectCount = allQResults.filter((q) => q.timeClassification === 'fast_correct').length;
  const slowCorrectCount = allQResults.filter((q) => q.timeClassification === 'slow_correct').length;
  const carelessCount = allQResults.filter((q) => q.timeClassification === 'careless_error').length;
  const timeTrapCount = allQResults.filter((q) => q.timeClassification === 'time_trap').length;

  const fastCorrectPct = totalQCount > 0 ? Math.round((fastCorrectCount / totalQCount) * 100) : 0;
  const slowCorrectPct = totalQCount > 0 ? Math.round((slowCorrectCount / totalQCount) * 100) : 0;
  const carelessPct = totalQCount > 0 ? Math.round((carelessCount / totalQCount) * 100) : 0;
  const timeTrapPct = totalQCount > 0 ? Math.round((timeTrapCount / totalQCount) * 100) : 0;

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
            {totalTests > 0 ? `${totalTests} total recorded attempts` : 'No mock tests taken yet'}
          </span>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Cumulative Accuracy</span>
            <div className="h-8 w-8 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#059669] mt-2">
            {totalQuestionsAttempted > 0 ? `${avgAccuracy}%` : '0%'}
          </p>
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
          <p className="text-2xl sm:text-3xl font-extrabold text-[#111B32] mt-2">
            {avgResponseTimeDisplay}
          </p>
          <span className="text-[11px] text-[#059669] font-semibold mt-1 block">
            {avgSecsPerQ > 0
              ? avgSecsPerQ <= 60
                ? 'Optimal (below 60s limit)'
                : 'Needs speed practice'
              : 'Take a test to calculate'}
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
            {mistakes.filter((m) => !m.resolved).length > 0
              ? 'Requires revision drill'
              : 'Mistake book is clear'}
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
            <p className="text-xs text-[#64748B]">Mock test score improvement over your completed attempts</p>
          </div>
          {netGrowthLabel && (
            <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#059669] border border-[#A7F3D0] self-start sm:self-auto">
              {netGrowthLabel}
            </span>
          )}
        </div>

        {/* Visual Bar Graph */}
        {trends.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1] space-y-2">
            <p className="text-xs font-bold text-[#64748B]">No completed test history yet.</p>
            <p className="text-[11px] text-[#94A3B8]">
              Your score progression graph will automatically render here as you take mock tests.
            </p>
            <Link
              href="/mock-setup?mode=official_simulation"
              className="inline-block mt-3 px-4 py-2 rounded-xl bg-[#155DFC] text-white text-xs font-bold hover:bg-[#124BD4] transition-colors"
            >
              Start First Mock Test →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end h-48 pt-6 border-b border-[#F1F5F9]">
            {trends.map((t, idx) => {
              const maxPossible = t.maxMarks > 0 ? t.maxMarks : 200;
              const heightPct = Math.max(12, Math.round((Math.max(0, t.score) / maxPossible) * 100));
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
        )}
      </div>

      {/* Section-Wise Proficiency & Time Quadrants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card space-y-4">
          <h2 className="text-base font-bold text-[#111B32]">
            Subject Proficiency Index
          </h2>
          <div className="space-y-4 text-xs">
            {SUBJECTS_CATALOGUE.map((subj) => {
              const matching = allSections.filter((s) => {
                const sName = s.sectionName.toLowerCase();
                const subjName = subj.name.toLowerCase();
                const subjCode = subj.code.toLowerCase();
                return (
                  sName.includes(subjName) ||
                  sName.includes(subjCode) ||
                  (subjCode === 'quant' && sName.includes('math')) ||
                  (subjCode === 'reasoning' && sName.includes('intelligence'))
                );
              });

              const subjTotal = matching.reduce((sum, s) => sum + s.totalQuestions, 0);
              const subjCorrect = matching.reduce((sum, s) => sum + s.correct, 0);
              const proficiency =
                subjTotal > 0 ? Math.round((subjCorrect / subjTotal) * 100) : 0;

              return (
                <div key={subj.id} className="space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#111B32]">{subj.name}</span>
                    <span className="text-[#155DFC]">
                      {subjTotal > 0 ? `${proficiency}%` : '--'}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div
                      style={{ width: `${subjTotal > 0 ? proficiency : 0}%` }}
                      className={`h-full rounded-full transition-all ${
                        proficiency >= 85
                          ? 'bg-[#059669]'
                          : proficiency >= 70
                          ? 'bg-[#155DFC]'
                          : 'bg-[#D97706]'
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
              <p className="text-2xl font-extrabold text-[#059669] mt-1">{fastCorrectPct}%</p>
              <span className="text-[10px] text-[#047857] mt-1 block">Solved &lt;45s accurately</span>
            </div>

            <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
              <span className="font-bold text-[#1E40AF] block">Slow & Correct</span>
              <p className="text-2xl font-extrabold text-[#155DFC] mt-1">{slowCorrectPct}%</p>
              <span className="text-[10px] text-[#1D4ED8] mt-1 block">Accurate but need speed shortcuts</span>
            </div>

            <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
              <span className="font-bold text-[#92400E] block">Careless Errors</span>
              <p className="text-2xl font-extrabold text-[#D97706] mt-1">{carelessPct}%</p>
              <span className="text-[10px] text-[#B45309] mt-1 block">Rushed without verifying</span>
            </div>

            <div className="rounded-xl border border-[#FECDD3] bg-[#FFF1F2] p-4">
              <span className="font-bold text-[#9F1239] block">Time Traps</span>
              <p className="text-2xl font-extrabold text-[#E11D48] mt-1">{timeTrapPct}%</p>
              <span className="text-[10px] text-[#BE123C] mt-1 block">Spent &gt;90s and scored negative</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
