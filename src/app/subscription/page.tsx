'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Crown,
  CheckCircle2,
  QrCode,
  Send,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Copy,
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
  Clock,
  Flame,
  Target,
  ChevronDown,
  ChevronUp,
  Check,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { usePlatformStore } from '@/lib/store/usePlatformStore';

interface PlanOption {
  id: 'sprint_5' | 'monthly_10' | 'quarterly_25' | 'half_yearly_45' | 'yearly_79' | 'lifetime_149';
  title: string;
  tagline: string;
  price: number;
  validityDays: number;
  validityLabel: string;
  category: 'sprint' | 'cycle' | 'longterm';
  badge: string;
  badgeColor: string;
  borderColor: string;
  accentColor: string;
  buttonBg: string;
  perDayText: string;
  features: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
}

const PLANS: PlanOption[] = [
  {
    id: 'sprint_5',
    title: '7-Day Exam Sprint',
    tagline: 'Last-minute revision booster',
    price: 5,
    validityDays: 7,
    validityLabel: '7 Days',
    category: 'sprint',
    badge: '⚡ EXAM WEEK RUSH',
    badgeColor: 'bg-amber-500 text-white',
    borderColor: 'border-amber-300 hover:border-amber-400',
    accentColor: 'text-amber-600',
    buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    perDayText: '₹0.71 / day',
    features: [
      'Unlimited Mock Tests for 7 Days',
      'Exact TCS iON CBT exam screen',
      'Rapid PYQ formula & shortcut drills',
      'Instant AI mistake diagnosis',
      'Instant activation on Telegram',
    ],
  },
  {
    id: 'monthly_10',
    title: '1 Month Pro Pass',
    tagline: 'Flagship preparation bundle',
    price: 10,
    validityDays: 30,
    validityLabel: '30 Days',
    category: 'sprint',
    badge: '⭐ MOST POPULAR • JUST ₹10',
    badgeColor: 'bg-[#155DFC] text-white',
    borderColor: 'border-[#155DFC] ring-2 ring-[#155DFC]/20 shadow-md',
    accentColor: 'text-[#155DFC]',
    buttonBg: 'bg-[#155DFC] hover:bg-[#124BD4] text-white',
    perDayText: '₹0.33 / day',
    isPopular: true,
    features: [
      'Unlimited Mock Tests (Zero daily cap)',
      '5,000+ TCS iON PYQs unlocked',
      'Bilingual detailed solutions (EN/HI)',
      'AI Doubt Solver & weak-area drills',
      'Priority code delivery on Telegram',
    ],
  },
  {
    id: 'quarterly_25',
    title: '3 Months Target Tier-1',
    tagline: 'Complete syllabus foundation',
    price: 25,
    validityDays: 90,
    validityLabel: '90 Days',
    category: 'cycle',
    badge: '🎯 TARGET TIER-1',
    badgeColor: 'bg-emerald-600 text-white',
    borderColor: 'border-emerald-300 hover:border-emerald-500',
    accentColor: 'text-emerald-600',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    perDayText: '₹0.27 / day',
    features: [
      '90 Days Unlimited CBT Mocks',
      'Tier-1 chapter-wise question bank',
      'Speed vs Accuracy analytics',
      'PYQ solutions with shortcut hacks',
      'Verified Telegram support at 9800615892',
    ],
  },
  {
    id: 'half_yearly_45',
    title: '6 Months Combo Pass',
    tagline: 'Tier-1 + Tier-2 full coverage',
    price: 45,
    validityDays: 180,
    validityLabel: '180 Days',
    category: 'cycle',
    badge: '🚀 TIER-1 + TIER-2 COMBO',
    badgeColor: 'bg-indigo-600 text-white',
    borderColor: 'border-indigo-300 hover:border-indigo-500',
    accentColor: 'text-indigo-600',
    buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    perDayText: '₹0.25 / day',
    features: [
      '180 Days Unlimited Test Access',
      'Tier-1 & Tier-2 advanced modules',
      'Subject-wise sectional speed tests',
      'All 2018–2025 actual TCS shift papers',
      'All SSC Exams: CGL, CHSL, MTS, CPO',
    ],
  },
  {
    id: 'yearly_79',
    title: '1 Year Season Pass',
    tagline: 'Covers all 2026-27 exam cycles',
    price: 79,
    validityDays: 365,
    validityLabel: '365 Days',
    category: 'longterm',
    badge: '🔥 ALL SSC & RAILWAY EXAMS',
    badgeColor: 'bg-purple-600 text-white',
    borderColor: 'border-purple-300 hover:border-purple-500',
    accentColor: 'text-purple-600',
    buttonBg: 'bg-purple-600 hover:bg-purple-700 text-white',
    perDayText: '₹0.21 / day',
    isBestValue: true,
    features: [
      'Full 365 Days Unlimited Access',
      'Covers ALL SSC + Railway RRB Exams',
      'New 2026-27 pattern questions added free',
      'Unlimited AI Doubt Solving credits',
      'VIP Telegram owner support channel',
    ],
  },
  {
    id: 'lifetime_149',
    title: 'Till Selection Pass',
    tagline: 'One-time investment until selected',
    price: 149,
    validityDays: 3650,
    validityLabel: 'Lifetime (10 Yrs)',
    category: 'longterm',
    badge: '👑 TILL SELECTION CLUB',
    badgeColor: 'bg-gradient-to-r from-rose-600 to-amber-600 text-white',
    borderColor: 'border-rose-300 hover:border-rose-500',
    accentColor: 'text-rose-600',
    buttonBg: 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white',
    perDayText: 'One-time payment',
    features: [
      'Lifetime Unlimited Mock Tests & PYQ Bank',
      'Zero renewal fees ever required',
      'All future exams, mock series & updates',
      'Personalized performance reviews',
      'Direct 1-on-1 access to platform owner',
    ],
  },
];

export default function SubscriptionPage() {
  const {
    profile,
    isSubscribed,
    subscriptionInfo,
    redeemActivationCode,
    submitPayment,
    getDailyTestsRemaining,
  } = usePlatformStore();

  const [selectedPlanId, setSelectedPlanId] = useState<PlanOption['id']>('monthly_10');
  const [filterCategory, setFilterCategory] = useState<'all' | 'sprint' | 'cycle' | 'longterm'>('all');
  const [showFullComparison, setShowFullComparison] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [inputCode, setInputCode] = useState('');
  const [activationResult, setActivationResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  // Quick transaction notification form
  const [utrNumber, setUtrNumber] = useState('');
  const [candidatePhone, setCandidatePhone] = useState(profile.phone || '');
  const [submissionFeedback, setSubmissionFeedback] = useState('');

  const dailyRemaining = getDailyTestsRemaining();

  const activePlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];

  const filteredPlans = filterCategory === 'all'
    ? PLANS
    : PLANS.filter((p) => p.category === filterCategory);

  const scrollToPlan = (planId: PlanOption['id']) => {
    setSelectedPlanId(planId);
    const cardEl = document.getElementById(`plan-card-${planId}`);
    if (cardEl && carouselRef.current) {
      cardEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const jumpTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPlan = (planId: PlanOption['id']) => {
    setSelectedPlanId(planId);
    jumpTo('payment-steps');
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setIsSubmittingCode(true);

    const res = redeemActivationCode(inputCode, profile.phone);
    setIsSubmittingCode(false);
    setActivationResult({
      success: res.success,
      message: res.message,
    });

    if (res.success) {
      setInputCode('');
    }
  };

  const handleQuickSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) return;

    submitPayment(
      candidatePhone || '9800615892',
      profile.fullName || 'Aspirant',
      utrNumber,
      activePlan.price
    );
    setSubmissionFeedback(
      `✅ Transaction ID (${utrNumber}) submitted for ₹${activePlan.price} (${activePlan.title})! Owner will verify and send your code on Telegram (+91 9800615892).`
    );
    setUtrNumber('');
    setTimeout(() => setSubmissionFeedback(''), 9000);
  };

  const telegramMessage = encodeURIComponent(
    `Hello Owner, I have scanned and paid ₹${activePlan.price} for the "${activePlan.title}" on Pariksha AI. Please find my payment screenshot attached. My phone number is: ${candidatePhone || profile.phone || 'N/A'}. Please send my single-use activation code.`
  );

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full max-w-full overflow-x-hidden space-y-5 sm:space-y-8 pb-28 md:pb-8">
      {/* Hero Header - Compact & Clean */}
      <div className="text-center space-y-2 max-w-3xl mx-auto pt-0 sm:pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#155DFC] border border-blue-200 text-[11px] sm:text-xs font-bold shadow-xs">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>India&apos;s Most Affordable SSC Exam Preparation Platform</span>
        </div>
        <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#111B32] tracking-tight leading-snug px-2">
          Diverse Plans for Every Aspirant — From <span className="text-[#155DFC]">₹5 to ₹149</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-2xl mx-auto px-2">
          Zero auto-debit traps, zero recurring charges. Just pay via PhonePe/UPI, get your 1-time single-use activation code from the owner on Telegram, and unlock unlimited CBT mocks with 5,000+ TCS iON PYQs.
        </p>

        {/* 1-Tap Quick Action Pills (Reduces mobile scrolling to zero) */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1.5">
          <button
            type="button"
            onClick={() => jumpTo('pricing-grid')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#111B32] shadow-2xs hover:bg-blue-50 hover:text-[#155DFC] transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-[#155DFC]" />
            <span>1. Choose Plan (from ₹5)</span>
          </button>
          <button
            type="button"
            onClick={() => jumpTo('payment-steps')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#155DFC] shadow-2xs hover:bg-blue-100 transition-colors"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>2. PhonePe QR (₹{activePlan.price})</span>
          </button>
          <button
            type="button"
            onClick={() => jumpTo('step-redeem-box')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-[#7C3AED] shadow-2xs hover:bg-purple-100 transition-colors"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>3. Redeem Code</span>
          </button>
        </div>
      </div>

      {/* Current Status Banner */}
      {isSubscribed ? (
        <div className="rounded-2xl border border-emerald-200 bg-[#ECFDF5] p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5 sm:mt-0">
              <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-xs sm:text-sm text-emerald-950 break-words">
                  {subscriptionInfo?.planName || 'Unlimited Pro Aspirant'} Active
                </span>
                <span className="text-[9px] sm:text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full shrink-0">
                  UNLIMITED ACCESS
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-800 mt-0.5 leading-relaxed break-words">
                Valid until {subscriptionInfo?.expiresAt ? new Date(subscriptionInfo.expiresAt).toLocaleDateString() : 'Active'}. All TCS iON CBT mocks &amp; PYQs are unlocked!
              </p>
            </div>
          </div>
          <Link
            href="/mock-setup"
            className="w-full sm:w-auto text-center rounded-xl bg-[#059669] hover:bg-emerald-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold transition-all shadow-xs shrink-0 flex items-center justify-center gap-2"
          >
            <span>Launch CBT Test Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-[#FFFBEB] p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xs">
          <div className="flex items-start gap-2.5 text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Free Account Status: <strong className="font-bold">{dailyRemaining} of 2</strong> tests remaining today. PYQ bank detailed solutions are locked.
            </span>
          </div>
          <a
            href="#pricing-grid"
            className="font-bold text-[#155DFC] hover:underline flex items-center gap-1 shrink-0 self-end sm:self-auto text-xs"
          >
            <span>Select a plan below</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* Pricing Cards Section */}
      <div id="pricing-grid" className="space-y-3 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-xl font-bold text-[#111B32]">Choose Your Plan</h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#155DFC] px-2 py-0.5 rounded-full md:hidden">
                Swipe Cards ↔
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#64748B]">
              Tap a tier pill or swipe horizontally to browse all options.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="w-full sm:w-auto overflow-x-auto no-scrollbar scroll-smooth px-0.5 py-1">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-semibold whitespace-nowrap min-w-max">
              {[
                { id: 'all', label: 'All Plans (6)' },
                { id: 'sprint', label: 'Short-Term (₹5–₹10)' },
                { id: 'cycle', label: 'Exam Cycles (₹25–₹45)' },
                { id: 'longterm', label: 'Annual & Lifetime' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all text-xs shrink-0 ${
                    filterCategory === tab.id
                      ? 'bg-white text-[#111B32] font-bold shadow-xs'
                      : 'text-[#64748B] hover:text-[#111B32]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Fast 1-Tap Pill Row (Select any plan instantly with 1 tap, zero vertical scroll) */}
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5 touch-pan-x">
          {PLANS.map((plan) => {
            const isCur = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => scrollToPlan(plan.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border transition-all flex items-center gap-1 ${
                  isCur
                    ? 'bg-[#155DFC] text-white border-[#155DFC] shadow-xs'
                    : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-slate-50'
                }`}
              >
                {plan.isPopular && <span>⭐</span>}
                <span>₹{plan.price}</span>
                <span className="opacity-80 text-[10px]">({plan.validityLabel})</span>
              </button>
            );
          })}
        </div>

        {/* Pricing Cards Track: Horizontal Swipe Slider on Mobile (< md), Grid on Tablet/Desktop (md+) */}
        <div
          ref={carouselRef}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar pb-2 pt-1 touch-pan-x overscroll-contain"
        >
          {filteredPlans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <div
                id={`plan-card-${plan.id}`}
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`w-[84vw] max-w-[310px] shrink-0 snap-center md:w-auto md:max-w-none cursor-pointer rounded-2xl bg-white border-2 p-4 sm:p-5 transition-all flex flex-col justify-between relative shadow-card hover:-translate-y-0.5 ${
                  isSelected
                    ? `${plan.borderColor} ring-2 ring-[#155DFC]/30 bg-[#F8FAFC]/60`
                    : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                }`}
              >
                {/* Cleanly Integrated Top Pill Badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase shadow-xs whitespace-nowrap ${plan.badgeColor}`}
                  >
                    {plan.badge}
                  </span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#155DFC] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 shrink-0">
                      <Check className="h-3 w-3" /> Selected
                    </span>
                  )}
                </div>

                {/* Plan Content */}
                <div>
                  <h3 className="text-base font-bold text-[#111B32]">{plan.title}</h3>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{plan.tagline}</p>

                  <div className="mt-2.5 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#111B32]">₹{plan.price}</span>
                    <span className="text-xs text-[#64748B] font-medium">/ {plan.validityLabel}</span>
                    <span className="ml-auto text-[11px] font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                      {plan.perDayText}
                    </span>
                  </div>

                  <div className="h-[1px] bg-[#E2E8F0] my-3" />

                  {/* Feature Checklist - Clean & Compact */}
                  <ul className="space-y-1.5 text-xs">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${plan.accentColor}`} />
                        <span className="text-[#334155] leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Select Button */}
                <div className="pt-3.5 mt-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan.id);
                    }}
                    className={`w-full rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                      isSelected
                        ? `${plan.buttonBg} shadow-md`
                        : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#111B32]'
                    }`}
                  >
                    <span>{isSelected ? `Proceed to Pay ₹${plan.price} →` : `Select Plan (₹${plan.price})`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Swipe Indicators & Fast CTA (Eliminates excessive scrolling) */}
        <div className="flex md:hidden flex-col items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            {filteredPlans.map((p) => (
              <span
                key={p.id}
                className={`h-1.5 rounded-full transition-all ${
                  selectedPlanId === p.id ? 'w-6 bg-[#155DFC]' : 'w-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => handleSelectPlan(selectedPlanId)}
            className="w-full rounded-xl bg-[#155DFC] hover:bg-[#124BD4] text-white py-2.5 text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <span>Scan QR for Selected Plan: ₹{activePlan.price} ({activePlan.title}) →</span>
          </button>
        </div>
      </div>

      {/* Main Activation & Payment Workflow Container */}
      <div id="payment-steps" className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-8 shadow-card space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#155DFC] bg-blue-50 px-2 py-0.5 rounded">
                Selected Plan
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#111B32]">
                {activePlan.title} (₹{activePlan.price} for {activePlan.validityLabel})
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#64748B] mt-1">
              Pay ₹{activePlan.price} using PhonePe or any UPI app, message screenshot on Telegram (+91 9800615892), and receive your single-use code.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="text-xs text-[#64748B]">Amount:</span>
            <span className="text-lg sm:text-xl font-black text-[#111B32] bg-[#F8FAFC] px-3 py-1 rounded-xl border border-[#E2E8F0]">
              ₹{activePlan.price}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Step 1: Dynamic PhonePe QR Code Container */}
          <div className="lg:col-span-5 flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#155DFC] bg-blue-50 px-3 py-1 rounded-full mb-3 border border-blue-200">
              STEP 1: SCAN &amp; PAY ₹{activePlan.price}
            </span>

            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-purple-200 shadow-md bg-white p-2">
              <Image
                src="/phonepe-qr.jpg"
                alt="PhonePe Scan & Pay UPI QR Code"
                fill
                sizes="(max-width: 640px) 224px, 256px"
                className="object-contain p-2"
                priority
              />
            </div>

            <div className="mt-3.5 space-y-1 w-full">
              <span className="text-xs font-bold text-[#111B32] block">
                Scan with Any UPI App
              </span>
              <p className="text-[11px] text-[#64748B]">
                PhonePe • Google Pay • Paytm • BHIM • Cred • Amazon Pay
              </p>
              <div className="pt-1.5 flex items-center justify-center gap-2">
                <span className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-[#059669] font-bold text-xs border border-emerald-200">
                  Target Amount: ₹{activePlan.price} ({activePlan.title})
                </span>
              </div>
            </div>
          </div>

          {/* Steps 2 & 3: Telegram Verification & Code Redemption */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            {/* Step 2 Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                STEP 2: MESSAGE TELEGRAM ADMIN
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-[#111B32]">
                Send Payment Screenshot &amp; Transaction ID
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                After completing your payment of <strong className="text-[#111B32]">₹{activePlan.price}</strong>, message the owner on Telegram at <strong className="text-[#111B32] font-mono">+91 9800615892</strong>. The owner will check your transaction and send your single-use activation code.
              </p>

              <div className="pt-1">
                <a
                  href={`https://t.me/+919800615892?text=${telegramMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto rounded-xl bg-[#229ED9] hover:bg-[#1E88E5] text-white px-4 py-2.5 text-xs font-bold flex items-center justify-center sm:justify-start gap-2 transition-all shadow-xs"
                >
                  <Send className="h-4 w-4" />
                  <span>Message Owner on Telegram (+91 9800615892)</span>
                  <ExternalLink className="h-3 w-3 opacity-80" />
                </a>
              </div>

              {/* Optional Quick Submission Form */}
              <div className="pt-3 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#111B32]">
                    Submit UTR on Portal (Optional):
                  </span>
                  <span className="text-[10px] text-[#64748B]">Auto-logged in Admin Panel</span>
                </div>
                <form onSubmit={handleQuickSubmitProof} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="Enter 12-digit UPI UTR / Transaction ID"
                    className="flex-1 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-mono text-[#111B32] placeholder-[#94A3B8] focus:border-[#155DFC] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-2 text-xs font-bold transition-colors shrink-0"
                  >
                    Submit Proof (₹{activePlan.price})
                  </button>
                </form>
                {submissionFeedback && (
                  <p className="text-[11px] text-[#059669] font-semibold mt-2">{submissionFeedback}</p>
                )}
              </div>
            </div>

            {/* Step 3 Box: Redeem Code */}
            <div id="step-redeem-box" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-white border border-[#BFDBFE] space-y-3.5 scroll-mt-20">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#155DFC] bg-white px-2.5 py-1 rounded-full border border-blue-200">
                STEP 3: REDEEM ACTIVATION CODE
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#111B32]">
                  Paste Your 1-Time Activation Code
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Once the owner delivers your single-use code, paste it below to instantly unlock your account.
                </p>
              </div>

              {activationResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    activationResult.success
                      ? 'bg-[#ECFDF5] border border-emerald-200 text-[#059669]'
                      : 'bg-[#FFF1F2] border border-[#FECDD3] text-[#E11D48]'
                  }`}
                >
                  {activationResult.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{activationResult.message}</span>
                </div>
              )}

              <form onSubmit={handleRedeem} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="e.g. PARIKSHA-PRO-10-DEMO"
                    className="w-full rounded-xl border-2 border-blue-300 bg-white px-3.5 py-2.5 sm:py-3 font-mono font-bold text-xs sm:text-sm tracking-wider sm:tracking-widest text-[#111B32] placeholder-[#94A3B8] focus:border-[#155DFC] focus:outline-none shadow-xs"
                  />
                  {/* Demo test helper */}
                  <button
                    type="button"
                    onClick={() => setInputCode('PARIKSHA-PRO-10-DEMO')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#155DFC] bg-blue-50 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
                  >
                    Sample Code
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingCode}
                  className="w-full rounded-xl bg-[#155DFC] hover:bg-[#124BD4] text-white py-3 font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Crown className="h-4 w-4" />
                  <span>{isSubmittingCode ? 'Verifying Code...' : 'Activate Subscription Now →'}</span>
                </button>
              </form>

              <p className="text-[10px] text-[#64748B] text-center">
                Each activation code is strictly valid for <strong>one single redemption</strong>. If you experience any delay, Telegram support is available at <strong>+91 9800615892</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison Table - Collapsible on Mobile to Save Vertical Scroll */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-6 shadow-card space-y-3">
        <div
          onClick={() => setShowFullComparison(!showFullComparison)}
          className="flex items-center justify-between gap-2 cursor-pointer select-none"
        >
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#111B32]">Detailed Feature Comparison Matrix</h2>
              <span className="text-[10px] font-bold text-[#155DFC] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 md:hidden">
                {showFullComparison ? 'Tap to Collapse' : 'Tap to Expand Table'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#64748B]">
              Compare our Free Tier against Sprint, Monthly Pro, and Full Season Pass.
            </p>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B] shrink-0"
            aria-label="Toggle comparison table"
          >
            {showFullComparison ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {/* Collapsed by default on mobile (< md), always visible on desktop (md+) */}
        <div className={`${showFullComparison ? 'block' : 'hidden md:block'} space-y-3 pt-1`}>
          {/* Mobile Swipe Guidance Badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#155DFC] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 sm:hidden">
            <span>👉 Swipe table sideways to compare tiers</span>
          </div>

          {/* Scrollable Container with Sticky First Column - Strictly contained, no negative margins */}
          <div className="w-full max-w-full overflow-x-auto overflow-y-hidden rounded-xl border border-[#E2E8F0] touch-pan-x overscroll-contain bg-white">
            <table className="w-full text-left text-xs border-collapse min-w-[580px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold bg-[#F8FAFC]">
                  <th className="py-3 px-3.5 sticky left-0 bg-[#F8FAFC] z-20 border-r border-[#E2E8F0] shadow-[2px_0_6px_rgba(0,0,0,0.06)] min-w-[130px]">
                    Feature
                  </th>
                  <th className="py-3 px-3 text-center min-w-[90px]">Free (₹0)</th>
                  <th className="py-3 px-3 text-center min-w-[90px]">7-Day (₹5)</th>
                  <th className="py-3 px-3 text-center min-w-[110px] bg-blue-50/70 text-[#155DFC]">1 Month Pro (₹10)</th>
                  <th className="py-3 px-3 text-center min-w-[90px]">1 Year (₹79)</th>
                  <th className="py-3 px-3 text-center min-w-[100px]">Lifetime (₹149)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#334155]">
                <tr>
                  <td className="py-3 px-3.5 font-bold text-[#111B32] sticky left-0 bg-white z-10 border-r border-[#E2E8F0] shadow-[2px_0_6px_rgba(0,0,0,0.06)]">
                    Daily Mock Limit
                  </td>
                  <td className="py-3 px-3 text-center text-[#E11D48] font-bold">2 / Day</td>
                  <td className="py-3 px-3 text-center text-[#059669] font-bold">Unlimited</td>
                  <td className="py-3 px-3 text-center bg-blue-50/50 text-[#155DFC] font-bold">Unlimited</td>
                  <td className="py-3 px-3 text-center text-[#059669] font-bold">Unlimited</td>
                  <td className="py-3 px-3 text-center text-[#059669] font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-3.5 font-bold text-[#111B32] sticky left-0 bg-white z-10 border-r border-[#E2E8F0] shadow-[2px_0_6px_rgba(0,0,0,0.06)]">
                    TCS iON CBT UI
                  </td>
                  <td className="py-3 px-3 text-center text-[#059669]">Included</td>
                  <td className="py-3 px-3 text-center text-[#059669]">Included</td>
                  <td className="py-3 px-3 text-center bg-blue-50/50 text-[#059669]">Included</td>
                  <td className="py-3 px-3 text-center text-[#059669]">Included</td>
                  <td className="py-3 px-3 text-center text-[#059669]">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-3.5 font-bold text-[#111B32] sticky left-0 bg-white z-10 border-r border-[#E2E8F0] shadow-[2px_0_6px_rgba(0,0,0,0.06)]">
                    5,000+ TCS PYQ Bank
                  </td>
                  <td className="py-3 px-3 text-center text-[#94A3B8]">Locked</td>
                  <td className="py-3 px-3 text-center text-[#059669]">Unlocked</td>
                  <td className="py-3 px-3 text-center bg-blue-50/50 text-[#059669]">Unlocked</td>
                  <td className="py-3 px-3 text-center text-[#059669]">Unlocked</td>
                  <td className="py-3 px-3 text-center text-[#059669]">Unlocked</td>
                </tr>
                <tr>
                  <td className="py-3 px-3.5 font-bold text-[#111B32] sticky left-0 bg-white z-10 border-r border-[#E2E8F0] shadow-[2px_0_6px_rgba(0,0,0,0.06)]">
                    AI Doubt Solver
                  </td>
                  <td className="py-3 px-3 text-center text-[#94A3B8]">1 / Day</td>
                  <td className="py-3 px-3 text-center text-[#059669]">Unlimited</td>
                  <td className="py-3 px-3 text-center bg-blue-50/50 text-[#059669]">Unlimited</td>
                  <td className="py-3 px-3 text-center text-[#059669]">Unlimited</td>
                  <td className="py-3 px-3 text-center text-[#059669]">VIP Uncapped</td>
                </tr>
                <tr>
                  <td className="py-3 px-3.5 font-bold text-[#111B32] sticky left-0 bg-white z-10 border-r border-[#E2E8F0] shadow-[2px_0_6px_rgba(0,0,0,0.06)]">
                    Sectional Speed Tests
                  </td>
                  <td className="py-3 px-3 text-center text-[#94A3B8]">Locked</td>
                  <td className="py-3 px-3 text-center text-[#059669]">Included</td>
                  <td className="py-3 px-3 text-center bg-blue-50/50 text-[#059669]">Included</td>
                  <td className="py-3 px-3 text-center text-[#059669]">Included</td>
                  <td className="py-3 px-3 text-center text-[#059669]">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-3.5 font-bold text-[#111B32] sticky left-0 bg-white z-10 border-r border-[#E2E8F0] shadow-[2px_0_6px_rgba(0,0,0,0.06)]">
                    Exam Coverage
                  </td>
                  <td className="py-3 px-3 text-center">CGL Only</td>
                  <td className="py-3 px-3 text-center">All Active</td>
                  <td className="py-3 px-3 text-center bg-blue-50/50">All Active</td>
                  <td className="py-3 px-3 text-center font-bold text-purple-700">All SSC + RRB</td>
                  <td className="py-3 px-3 text-center font-bold text-rose-700">All Lifetime</td>
                </tr>
                <tr>
                  <td className="py-3 px-3.5 font-bold text-[#111B32] sticky left-0 bg-white z-10 border-r border-[#E2E8F0] shadow-[2px_0_6px_rgba(0,0,0,0.06)]">
                    Telegram Support
                  </td>
                  <td className="py-3 px-3 text-center text-[#94A3B8]">Standard</td>
                  <td className="py-3 px-3 text-center">Priority</td>
                  <td className="py-3 px-3 text-center bg-blue-50/50 font-bold text-[#155DFC]">Priority (Direct)</td>
                  <td className="py-3 px-3 text-center font-bold text-purple-700">VIP Channel</td>
                  <td className="py-3 px-3 text-center font-bold text-rose-700">Direct Owner</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-6 shadow-card space-y-3.5">
        <h2 className="text-base sm:text-lg font-bold text-[#111B32]">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <h4 className="font-bold text-[#111B32]">How does activation code delivery work?</h4>
            <p className="text-[#64748B] leading-relaxed">
              When you pay via PhonePe/UPI, message your payment screenshot and UTR number to Telegram (+91 9800615892). The owner verifies it in the Admin panel and sends your single-use code within minutes.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <h4 className="font-bold text-[#111B32]">Can I pay with Google Pay or Paytm?</h4>
            <p className="text-[#64748B] leading-relaxed">
              Yes! The PhonePe QR is fully interoperable with all UPI apps including Google Pay, Paytm, BHIM, Cred, and bank UPI apps.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <h4 className="font-bold text-[#111B32]">Will money be automatically deducted next month?</h4>
            <p className="text-[#64748B] leading-relaxed">
              Never. Pariksha AI uses micro-payments with zero auto-debit and zero card renewals. You only pay when you choose to renew.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <h4 className="font-bold text-[#111B32]">Can an activation code be shared with a friend?</h4>
            <p className="text-[#64748B] leading-relaxed">
              No. Every activation code is cryptographically tied to a strict 1-time single redemption in our cloud database. Once redeemed, it cannot be reused.
            </p>
          </div>
        </div>
      </div>

      {/* Explicit spacer to guarantee the mobile bottom nav never obstructs FAQ questions or buttons */}
      <div className="h-28 md:hidden shrink-0 w-full" aria-hidden="true" />
    </div>
  );
}
