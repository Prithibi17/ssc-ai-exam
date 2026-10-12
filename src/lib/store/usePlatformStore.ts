'use client';

import { useState, useEffect } from 'react';
import {
  Language,
  UserProfile,
  TestSessionState,
  TestSummaryReport,
  BookmarkItem,
  MistakeNotebookItem,
  Question,
  ActivationCode,
  PaymentSubmission,
  SubscriptionInfo,
} from '@/types';
import { VERIFIED_PYQ_QUESTIONS } from '@/data/questions';

export const DAILY_FREE_TEST_LIMIT = 2;

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_guest',
  fullName: '',
  phone: '',
  email: '',
  password: '',
  targetExams: ['ssc_cgl', 'ssc_chsl'],
  preferredLanguage: 'en',
  streakDays: 1,
  totalQuestionsPracticed: 0,
  overallAccuracy: 0,
  role: 'student',
  subscription: {
    isActive: false,
  },
  dailyTestsTaken: {},
};

const DEFAULT_SEED_CODES: ActivationCode[] = [
  {
    id: 'code_seed_01',
    code: 'PARIKSHA-PRO-10-DEMO',
    planTier: 'monthly_10',
    planName: '1 Month Unlimited Pro',
    price: 10,
    durationDays: 30,
    createdAt: new Date().toISOString(),
    isUsed: false,
  },
  {
    id: 'code_seed_02',
    code: 'SSC-10-DISCOUNT-1M',
    planTier: 'monthly_10',
    planName: '1 Month Unlimited Pro',
    price: 10,
    durationDays: 30,
    createdAt: new Date().toISOString(),
    isUsed: false,
  },
  {
    id: 'code_seed_03',
    code: 'PRO-3M-UNLIMITED-25',
    planTier: 'quarterly_25',
    planName: '3 Months Unlimited Pro',
    price: 25,
    durationDays: 90,
    createdAt: new Date().toISOString(),
    isUsed: false,
  },
];

const STORAGE_KEYS = {
  USER_PROFILE: 'pariksha_user_profile',
  ACTIVE_TEST: 'pariksha_active_test_session',
  PAST_ATTEMPTS: 'pariksha_past_test_attempts',
  BOOKMARKS: 'pariksha_bookmarks',
  MISTAKE_NOTEBOOK: 'pariksha_mistake_notebook',
  ADMIN_MODERATION: 'pariksha_admin_questions',
  LANGUAGE: 'pariksha_language',
  ACTIVATION_CODES: 'pariksha_activation_codes',
  PAYMENT_SUBMISSIONS: 'pariksha_payment_submissions',
  REGISTERED_USERS: 'pariksha_registered_users',
};

export function usePlatformStore() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [language, setLanguage] = useState<Language>('en');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [mistakes, setMistakes] = useState<MistakeNotebookItem[]>([]);
  const [pastAttempts, setPastAttempts] = useState<TestSummaryReport[]>([]);
  const [activationCodes, setActivationCodes] = useState<ActivationCode[]>(DEFAULT_SEED_CODES);
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        const cleanStreak = parsed.streakDays === 99 ? 1 : (parsed.streakDays || 1);
        const cleanQuestions = parsed.totalQuestionsPracticed === 9999 ? 0 : (parsed.totalQuestionsPracticed || 0);
        const cleanAccuracy = parsed.overallAccuracy === 100 && parsed.id === 'admin_owner_01' && cleanQuestions === 0 ? 0 : (parsed.overallAccuracy || 0);

        setProfile({
          ...DEFAULT_PROFILE,
          ...parsed,
          streakDays: cleanStreak,
          totalQuestionsPracticed: cleanQuestions,
          overallAccuracy: cleanAccuracy,
          subscription: parsed.subscription || { isActive: false },
          dailyTestsTaken: parsed.dailyTestsTaken || {},
        });

        // Sync live streak, subscription & daily test count directly from Turso Cloud Database
        if (parsed.phone && typeof window !== 'undefined') {
          fetch(`/api/user/sync?phone=${encodeURIComponent(parsed.phone)}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.success && d.user) {
                setProfile((prev) => {
                  const synced: UserProfile = {
                    ...prev,
                    id: d.user.id || prev.id,
                    fullName: d.user.fullName || prev.fullName,
                    role: d.user.role || prev.role,
                    streakDays: d.user.streakDays ?? prev.streakDays,
                    totalQuestionsPracticed: d.user.totalQuestionsPracticed ?? prev.totalQuestionsPracticed,
                    overallAccuracy: d.user.overallAccuracy ?? prev.overallAccuracy,
                    subscription: d.user.subscription || prev.subscription,
                    dailyTestsTaken: d.user.dailyTestsTaken || prev.dailyTestsTaken,
                  };
                  try {
                    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(synced));
                  } catch {}
                  return synced;
                });
              }
            })
            .catch(() => {});
        }
      }

      const storedLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
      if (storedLang) setLanguage(storedLang);

      const storedBookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));

      const storedMistakes = localStorage.getItem(STORAGE_KEYS.MISTAKE_NOTEBOOK);
      if (storedMistakes) {
        setMistakes(JSON.parse(storedMistakes));
      } else {
        const sampleMistake: MistakeNotebookItem = {
          id: 'mist_init_1',
          questionId: VERIFIED_PYQ_QUESTIONS[0].id,
          questionText: VERIFIED_PYQ_QUESTIONS[0].questionText,
          correctAnswer: 'A (10.5%)',
          userAnswer: 'B (12%)',
          explanation: VERIFIED_PYQ_QUESTIONS[0].explanation.standard,
          topicName: 'Profit, Loss & Discount',
          examName: 'SSC CGL Tier-1 2023',
          tag: 'calculation_error',
          dateAdded: new Date().toLocaleDateString(),
          notes: 'Forgot to subtract discount from marked price before profit calculation.',
          resolved: false,
        };
        setMistakes([sampleMistake]);
        localStorage.setItem(STORAGE_KEYS.MISTAKE_NOTEBOOK, JSON.stringify([sampleMistake]));
      }

      const storedAttempts = localStorage.getItem(STORAGE_KEYS.PAST_ATTEMPTS);
      if (storedAttempts) setPastAttempts(JSON.parse(storedAttempts));

      const storedCodes = localStorage.getItem(STORAGE_KEYS.ACTIVATION_CODES);
      if (storedCodes) {
        setActivationCodes(JSON.parse(storedCodes));
      } else {
        localStorage.setItem(STORAGE_KEYS.ACTIVATION_CODES, JSON.stringify(DEFAULT_SEED_CODES));
      }

      const storedSubmissions = localStorage.getItem(STORAGE_KEYS.PAYMENT_SUBMISSIONS);
      if (storedSubmissions) {
        setPaymentSubmissions(JSON.parse(storedSubmissions));
      }

      // Sync latest codes and submissions directly from Turso database
      if (typeof window !== 'undefined') {
        fetch('/api/admin/codes')
          .then((r) => r.json())
          .then((d) => {
            if (d.success && Array.isArray(d.codes) && d.codes.length > 0) {
              setActivationCodes(d.codes);
              localStorage.setItem(STORAGE_KEYS.ACTIVATION_CODES, JSON.stringify(d.codes));
            }
          })
          .catch(() => {});

        fetch('/api/subscription/submit')
          .then((r) => r.json())
          .then((d) => {
            if (d.success && Array.isArray(d.submissions)) {
              setPaymentSubmissions(d.submissions);
              localStorage.setItem(STORAGE_KEYS.PAYMENT_SUBMISSIONS, JSON.stringify(d.submissions));
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.warn('LocalStorage access warning:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync profile changes to localStorage
  const updateProfileAndPersist = (updater: (prev: UserProfile) => UserProfile) => {
    setProfile((prev) => {
      const updated = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  // Auth: Login with Phone & Password (Turso Database Backed)
  const login = async (
    phone: string,
    pass: string
  ): Promise<{ success: boolean; role: 'student' | 'admin'; message?: string; notRegistered?: boolean }> => {
    const cleanPhone = phone.trim();
    const cleanPass = pass.trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, password: cleanPass }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          role: 'student',
          message: data.message || 'Invalid credentials',
          notRegistered: Boolean(data.notRegistered),
        };
      }

      const userProfile: UserProfile = {
        ...DEFAULT_PROFILE,
        id: data.user.id,
        fullName: data.user.fullName,
        phone: data.user.phone,
        role: data.user.role || 'student',
        streakDays: data.user.streakDays ?? 1,
        totalQuestionsPracticed: data.user.totalQuestionsPracticed ?? 0,
        overallAccuracy: data.user.overallAccuracy ?? 0,
        subscription: data.user.subscription || { isActive: false },
        dailyTestsTaken: data.user.dailyTestsTaken || {},
      };

      updateProfileAndPersist(() => userProfile);
      return { success: true, role: data.user.role };
    } catch (e: any) {
      console.warn('Login request error:', e);
      return { success: false, role: 'student', message: 'Unable to connect to database. Please try again.' };
    }
  };

  // Auth: Signup (Turso Database Backed)
  const signup = async (
    phone: string,
    fullName: string,
    pass: string
  ): Promise<{ success: boolean; role: 'student' | 'admin'; message?: string }> => {
    const cleanPhone = phone.trim();
    const cleanPass = pass.trim();
    const cleanName = fullName.trim();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, fullName: cleanName, password: cleanPass }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          role: 'student',
          message: data.message || 'Registration failed',
        };
      }

      const userProfile: UserProfile = {
        ...DEFAULT_PROFILE,
        id: data.user.id,
        fullName: data.user.fullName,
        phone: data.user.phone,
        role: 'student',
        streakDays: data.user.streakDays ?? 1,
        totalQuestionsPracticed: data.user.totalQuestionsPracticed ?? 0,
        overallAccuracy: data.user.overallAccuracy ?? 0,
        subscription: data.user.subscription || { isActive: false },
        dailyTestsTaken: data.user.dailyTestsTaken || {},
      };

      updateProfileAndPersist(() => userProfile);
      return { success: true, role: 'student' };
    } catch (e: any) {
      console.warn('Signup request error:', e);
      return { success: false, role: 'student', message: 'Unable to connect to database. Please try again.' };
    }
  };

  // Auth: Logout
  const logout = () => {
    const guestProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      id: `guest_${Date.now()}`,
      fullName: '',
      phone: '',
      role: 'student',
      subscription: { isActive: false },
      dailyTestsTaken: {},
    };
    setProfile(guestProfile);
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    } catch (e) {
      console.warn(e);
    }
  };

  // Daily Tests Limit Calculation
  const getTodayDateStr = () => new Date().toISOString().split('T')[0];

  const getDailyTestsRemaining = (): number => {
    if (profile.subscription?.isActive) {
      return Infinity; // Unlimited
    }
    const today = getTodayDateStr();
    const taken = profile.dailyTestsTaken?.[today] || 0;
    return Math.max(0, DAILY_FREE_TEST_LIMIT - taken);
  };

  const canTakeTest = (): boolean => {
    if (profile.subscription?.isActive) return true;
    return getDailyTestsRemaining() > 0;
  };

  const recordDailyTest = (testDetails?: {
    testId?: string;
    title?: string;
    score?: number;
    maxMarks?: number;
    accuracy?: number;
    summary?: any;
  }) => {
    const today = getTodayDateStr();
    const countToAdd = testDetails?.summary?.totalQuestions || 25;
    updateProfileAndPersist((prev) => ({
      ...prev,
      totalQuestionsPracticed: (prev.totalQuestionsPracticed || 0) + countToAdd,
      overallAccuracy: testDetails?.accuracy ?? prev.overallAccuracy,
      dailyTestsTaken: {
        ...prev.dailyTestsTaken,
        [today]: (prev.dailyTestsTaken?.[today] || 0) + 1,
      },
    }));

    if (profile.phone && typeof window !== 'undefined') {
      fetch('/api/user/record-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: profile.phone,
          testId: testDetails?.testId || 'practice_mock',
          title: testDetails?.title || 'Practice Mock Exam',
          score: testDetails?.score || 0,
          maxMarks: testDetails?.maxMarks || 200,
          accuracy: testDetails?.accuracy || 0,
          questionsCount: 25,
          summary: testDetails?.summary,
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setProfile((prev) => ({
              ...prev,
              streakDays: d.streakDays ?? prev.streakDays,
              totalQuestionsPracticed: d.totalQuestionsPracticed ?? prev.totalQuestionsPracticed,
              dailyTestsTaken: {
                ...prev.dailyTestsTaken,
                [today]: d.dailyTestsToday ?? (prev.dailyTestsTaken[today] || 1),
              },
            }));
          }
        })
        .catch(() => {});
    }
  };

  // One-Time Activation Code Generator (Admin)
  const generateActivationCode = (
    planTier: 'sprint_5' | 'monthly_10' | 'quarterly_25' | 'half_yearly_45' | 'yearly_79' | 'lifetime_149',
    durationDays = 30,
    price = 10,
    planName = '1 Month Unlimited Pro'
  ): ActivationCode => {
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = planTier === 'monthly_10' ? 'SSC-PRO-10' : 'PARIKSHA-PRO';
    const codeStr = `${prefix}-${randomPart}-${randomPart2}`;

    const newCode: ActivationCode = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      code: codeStr,
      planTier,
      planName,
      price,
      durationDays,
      createdAt: new Date().toISOString(),
      isUsed: false,
    };

    setActivationCodes((prev) => {
      const updated = [newCode, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVATION_CODES, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    // Sync with Turso cloud DB
    if (typeof window !== 'undefined') {
      fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier, quantity: 1 }),
      }).catch(() => {});
    }

    return newCode;
  };

  // Code Redemption (Student)
  const redeemActivationCode = (
    codeStr: string,
    userPhone?: string
  ): { success: boolean; message: string; planName?: string; expiresAt?: string } => {
    const clean = codeStr.trim().toUpperCase();
    if (!clean) {
      return { success: false, message: 'Please enter a valid activation code.' };
    }

    const targetCodeIndex = activationCodes.findIndex(
      (c) => c.code.toUpperCase() === clean
    );

    if (targetCodeIndex === -1) {
      return {
        success: false,
        message: 'Invalid code. Please check for typos or message Telegram @ 9800615892 for assistance.',
      };
    }

    const targetCode = activationCodes[targetCodeIndex];
    if (targetCode.isUsed) {
      return {
        success: false,
        message: `This code was already redeemed on ${targetCode.usedAt ? new Date(targetCode.usedAt).toLocaleDateString() : 'earlier'}. Each code is 1-time use only.`,
      };
    }

    // Mark code as used
    const phoneToRecord = userPhone || profile.phone || '9800615892';
    const usedAt = new Date().toISOString();
    const expiresDate = new Date(Date.now() + targetCode.durationDays * 24 * 60 * 60 * 1000).toISOString();

    const updatedCodes = [...activationCodes];
    updatedCodes[targetCodeIndex] = {
      ...targetCode,
      isUsed: true,
      usedByPhone: phoneToRecord,
      usedAt,
    };

    setActivationCodes(updatedCodes);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVATION_CODES, JSON.stringify(updatedCodes));
    } catch (e) {
      console.warn(e);
    }

    // Activate subscription on user profile
    const subInfo: SubscriptionInfo = {
      isActive: true,
      planId: targetCode.planTier,
      planName: targetCode.planName,
      price: targetCode.price,
      activatedAt: usedAt,
      expiresAt: expiresDate,
      activationCodeUsed: targetCode.code,
    };

    updateProfileAndPersist((prev) => ({
      ...prev,
      subscription: subInfo,
    }));

    // Sync with Turso cloud DB
    if (typeof window !== 'undefined') {
      fetch('/api/subscription/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean, phone: phoneToRecord }),
      }).catch(() => {});
    }

    return {
      success: true,
      message: `🎉 Successfully activated ${targetCode.planName}! You now have unlimited mock tests and full PYQ Bank access until ${new Date(expiresDate).toLocaleDateString()}.`,
      planName: targetCode.planName,
      expiresAt: expiresDate,
    };
  };

  // Payment Submission (Candidate submits transaction proof)
  const submitPayment = (
    userPhone: string,
    userName: string,
    transactionId: string,
    amount = 10
  ): PaymentSubmission => {
    const newSubmission: PaymentSubmission = {
      id: `pay_${Date.now()}`,
      userPhone: userPhone.trim(),
      userName: userName.trim() || 'Aspirant',
      amount,
      transactionId: transactionId.trim().toUpperCase(),
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    setPaymentSubmissions((prev) => {
      const updated = [newSubmission, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.PAYMENT_SUBMISSIONS, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    // Sync with Turso cloud DB
    if (typeof window !== 'undefined') {
      fetch('/api/subscription/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPhone: newSubmission.userPhone,
          userName: newSubmission.userName,
          transactionId: newSubmission.transactionId,
          amount: newSubmission.amount,
        }),
      }).catch(() => {});
    }

    return newSubmission;
  };

  // Admin Payment Verification & Code Generation
  const verifyPaymentAndGenerateCode = (submissionId: string): { submission?: PaymentSubmission; code?: ActivationCode } => {
    const subIdx = paymentSubmissions.findIndex((s) => s.id === submissionId);
    if (subIdx === -1) return {};

    const sub = paymentSubmissions[subIdx];
    // Generate code matching amount
    const planTier = sub.amount >= 79 ? 'yearly_79' : sub.amount >= 45 ? 'half_yearly_45' : sub.amount >= 25 ? 'quarterly_25' : 'monthly_10';
    const durationDays = planTier === 'yearly_79' ? 365 : planTier === 'half_yearly_45' ? 180 : planTier === 'quarterly_25' ? 90 : 30;
    const planName = planTier === 'yearly_79' ? '1 Year Unlimited Pro' : planTier === 'quarterly_25' ? '3 Months Unlimited Pro' : '1 Month Unlimited Pro';

    const newCode = generateActivationCode(planTier, durationDays, sub.amount, planName);

    const updatedSubmissions = [...paymentSubmissions];
    updatedSubmissions[subIdx] = {
      ...sub,
      status: 'verified',
      generatedCode: newCode.code,
    };

    setPaymentSubmissions(updatedSubmissions);
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENT_SUBMISSIONS, JSON.stringify(updatedSubmissions));
    } catch (e) {
      console.warn(e);
    }

    return { submission: updatedSubmissions[subIdx], code: newCode };
  };

  // Direct Owner Grant (Admin)
  const directGrantSubscription = (phone: string, durationDays = 30, planName = '1 Month Unlimited Pro (Admin Grant)') => {
    const expiresDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    if (profile.phone === phone || phone === 'current') {
      updateProfileAndPersist((prev) => ({
        ...prev,
        subscription: {
          isActive: true,
          planId: 'monthly_10',
          planName,
          price: 0,
          activatedAt: new Date().toISOString(),
          expiresAt: expiresDate,
          activationCodeUsed: 'DIRECT_OWNER_GRANT',
        },
      }));
    }
  };

  // Language setting
  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLang);
      setProfile((prev) => ({ ...prev, preferredLanguage: newLang }));
    } catch (e) {
      console.warn(e);
    }
  };

  // Bookmarks
  const toggleBookmark = (question: Question, note?: string) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.questionId === question.id);
      let updated: BookmarkItem[];
      if (exists) {
        updated = prev.filter((b) => b.questionId !== question.id);
      } else {
        updated = [
          {
            id: `bm_${Date.now()}`,
            questionId: question.id,
            question,
            addedAt: new Date().toISOString(),
            personalNotes: note,
          },
          ...prev,
        ];
      }
      try {
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const isBookmarked = (questionId: string) => {
    return bookmarks.some((b) => b.questionId === questionId);
  };

  // Mistake Notebook
  const addMistake = (item: Omit<MistakeNotebookItem, 'id' | 'dateAdded' | 'resolved'>) => {
    const newItem: MistakeNotebookItem = {
      ...item,
      id: `mist_${Date.now()}`,
      dateAdded: new Date().toLocaleDateString(),
      resolved: false,
    };
    setMistakes((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.MISTAKE_NOTEBOOK, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const toggleResolveMistake = (id: string) => {
    setMistakes((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, resolved: !m.resolved } : m));
      try {
        localStorage.setItem(STORAGE_KEYS.MISTAKE_NOTEBOOK, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  // Past Attempts
  const saveAttempt = (report: TestSummaryReport) => {
    setPastAttempts((prev) => {
      const updated = [report, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.PAST_ATTEMPTS, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    recordDailyTest({
      testId: report.testId,
      title: report.title,
      score: report.totalScore,
      maxMarks: report.maxMarks,
      accuracy: report.accuracyPercentage,
      summary: report,
    });
  };

  const toggleTargetExam = (examId: string) => {
    updateProfileAndPersist((prev) => {
      const exists = prev.targetExams.includes(examId);
      let newTargetExams: string[];
      if (exists) {
        newTargetExams = prev.targetExams.filter((id) => id !== examId);
        if (newTargetExams.length === 0) newTargetExams = ['ssc_cgl'];
      } else {
        newTargetExams = [...prev.targetExams, examId];
      }
      return { ...prev, targetExams: newTargetExams };
    });
  };

  return {
    profile,
    setProfile,
    language,
    changeLanguage,
    bookmarks,
    toggleBookmark,
    isBookmarked,
    mistakes,
    addMistake,
    toggleResolveMistake,
    pastAttempts,
    saveAttempt,
    toggleTargetExam,
    isLoaded,
    mobileMenuOpen,
    setMobileMenuOpen,
    // Auth
    login,
    signup,
    logout,
    // Subscription & Daily Limits
    dailyFreeTestLimit: DAILY_FREE_TEST_LIMIT,
    getDailyTestsRemaining,
    canTakeTest,
    recordDailyTest,
    isSubscribed: !!profile.subscription?.isActive,
    subscriptionInfo: profile.subscription,
    // Activation Codes & Admin
    activationCodes,
    generateActivationCode,
    redeemActivationCode,
    paymentSubmissions,
    submitPayment,
    verifyPaymentAndGenerateCode,
    directGrantSubscription,
  };
}

// Global active test recovery helper
export function getSavedActiveTestSession(): TestSessionState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('pariksha_active_test_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveTestSession(session: TestSessionState | null) {
  if (typeof window === 'undefined') return;
  try {
    if (!session) {
      localStorage.removeItem('pariksha_active_test_session');
    } else {
      localStorage.setItem('pariksha_active_test_session', JSON.stringify(session));
    }
  } catch (e) {
    console.warn('Failed to save active test session:', e);
  }
}
