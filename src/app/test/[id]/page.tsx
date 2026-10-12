'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  Bookmark,
  Layers,
  Pause,
  Play,
  HelpCircle,
  FileText,
  User,
  Menu,
  X,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  Printer,
  Info,
} from 'lucide-react';
import {
  TestSessionState,
  UserAnswerRecord,
  PaletteState,
  Question,
  TestSummaryReport,
} from '@/types';
import {
  getSavedActiveTestSession,
  saveActiveTestSession,
  usePlatformStore,
} from '@/lib/store/usePlatformStore';
import { createTestSession, evaluateTestAttempt } from '@/lib/testEngine';
import { SUBJECTS_CATALOGUE } from '@/data/exams';

export default function CBTTestInterfacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { saveAttempt, profile } = usePlatformStore();

  const [session, setSession] = useState<TestSessionState | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'bn'>('en');

  // Pre-exam flow: 'login' -> 'instructions' -> 'exam'
  const [examStep, setExamStep] = useState<'login' | 'instructions' | 'exam'>('exam');
  const [instructionsRead, setInstructionsRead] = useState<boolean>(true);
  const [virtualPin, setVirtualPin] = useState<string>('12041998');

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);
  const [isQuestionPaperOpen, setIsQuestionPaperOpen] = useState<boolean>(false);
  const [paletteDrawerOpen, setPaletteDrawerOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize or restore session
  useEffect(() => {
    let active = getSavedActiveTestSession();
    if (!active || active.testId !== id || active.isSubmitted) {
      active = createTestSession({
        id,
        title: 'Staff Selection Commission - Combined Graduate Level (Tier-I) Computer Based Examination',
        mode: 'official_simulation',
        targetExamId: 'ssc_cgl',
        subjectCodes: ['quant', 'reasoning', 'english', 'ga'],
        questionCount: 25,
        durationMinutes: 30,
        marksPerCorrect: 2.0,
        negativeMarking: 0.5,
        allowPause: false,
        sourceFilter: 'verified_only',
      });
      saveActiveTestSession(active);
    }
    setSession(active);
    setCurrentIdx(active.currentQuestionIndex || 0);

    // If candidate has not answered any question yet and spent 0 time, start at instructions flow
    const anyAnswered = Object.values(active.answers).some((a) => a.visited);
    if (!anyAnswered && active.timeRemainingSeconds === active.config.durationMinutes * 60) {
      setExamStep('instructions');
    } else {
      setExamStep('exam');
    }
  }, [id]);

  // Countdown timer effect & continuous autosave (runs only when in 'exam' step)
  useEffect(() => {
    if (!session || session.isSubmitted || session.isPaused || examStep !== 'exam') return;

    const interval = setInterval(() => {
      setSession((prev) => {
        if (!prev) return null;
        if (prev.timeRemainingSeconds <= 1) {
          clearInterval(interval);
          handleAutoSubmit(prev);
          return { ...prev, timeRemainingSeconds: 0 };
        }

        const updated: TestSessionState = {
          ...prev,
          timeRemainingSeconds: prev.timeRemainingSeconds - 1,
          lastSavedAt: new Date().toISOString(),
        };

        const currentQ = prev.questions[currentIdx];
        if (currentQ && updated.answers[currentQ.id]) {
          updated.answers[currentQ.id].timeSpentSeconds += 1;
        }

        saveActiveTestSession(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.isPaused, session?.isSubmitted, currentIdx, examStep]);

  // Keyboard navigation shortcuts (authentic CBT shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isSubmitModalOpen ||
        isInstructionsOpen ||
        isQuestionPaperOpen ||
        examStep !== 'exam'
      )
        return;

      const key = e.key.toUpperCase();
      if (['1', 'A'].includes(key)) handleSelectOption('A');
      else if (['2', 'B'].includes(key)) handleSelectOption('B');
      else if (['3', 'C'].includes(key)) handleSelectOption('C');
      else if (['4', 'D'].includes(key)) handleSelectOption('D');
      else if (key === 'S') handleSaveAndNext();
      else if (key === 'M') handleMarkForReviewAndNext();
      else if (key === 'C') handleClearResponse();
      else if (key === 'P' || key === 'ARROWLEFT') handlePrevious();
      else if (key === 'ARROWRIGHT') handleSaveAndNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b2545] text-white text-xs">
        <div className="flex flex-col items-center gap-3">
          <span className="h-6 w-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <span className="font-bold tracking-wider uppercase text-slate-200">
            Connecting to TCS iON Assessment Server...
          </span>
        </div>
      </div>
    );
  }

  const questions = session.questions;
  const currentQuestion: Question | undefined = questions[currentIdx];
  const currentAnswer = currentQuestion ? session.answers[currentQuestion.id] : undefined;

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;
    setSession((prev) => {
      if (!prev) return null;
      const existing = prev.answers[currentQuestion.id];
      const updated: UserAnswerRecord = {
        ...existing,
        selectedOption: opt,
        visited: true,
      };
      const newAnswers = { ...prev.answers, [currentQuestion.id]: updated };
      const updatedSession = { ...prev, answers: newAnswers };
      saveActiveTestSession(updatedSession);
      return updatedSession;
    });
  };

  const handleSaveAndNext = () => {
    if (!currentQuestion) return;
    setSession((prev) => {
      if (!prev) return null;
      const existing = prev.answers[currentQuestion.id];
      const newState: PaletteState = existing?.selectedOption ? 'answered' : 'not_answered';

      const updatedRecord: UserAnswerRecord = {
        ...existing,
        paletteState: newState,
        visited: true,
      };

      const newAnswers = { ...prev.answers, [currentQuestion.id]: updatedRecord };
      const nextIdx = Math.min(prev.questions.length - 1, currentIdx + 1);

      const nextQ = prev.questions[nextIdx];
      if (nextQ && newAnswers[nextQ.id]?.paletteState === 'not_visited') {
        newAnswers[nextQ.id].paletteState = 'not_answered';
        newAnswers[nextQ.id].visited = true;
      }

      const updatedSession = {
        ...prev,
        answers: newAnswers,
        currentQuestionIndex: nextIdx,
      };
      saveActiveTestSession(updatedSession);
      return updatedSession;
    });
    setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1));
  };

  const handleMarkForReviewAndNext = () => {
    if (!currentQuestion) return;
    setSession((prev) => {
      if (!prev) return null;
      const existing = prev.answers[currentQuestion.id];
      const newState: PaletteState = existing?.selectedOption
        ? 'answered_and_marked'
        : 'marked_for_review';

      const updatedRecord: UserAnswerRecord = {
        ...existing,
        paletteState: newState,
        visited: true,
      };

      const newAnswers = { ...prev.answers, [currentQuestion.id]: updatedRecord };
      const nextIdx = Math.min(prev.questions.length - 1, currentIdx + 1);

      const nextQ = prev.questions[nextIdx];
      if (nextQ && newAnswers[nextQ.id]?.paletteState === 'not_visited') {
        newAnswers[nextQ.id].paletteState = 'not_answered';
        newAnswers[nextQ.id].visited = true;
      }

      const updatedSession = {
        ...prev,
        answers: newAnswers,
        currentQuestionIndex: nextIdx,
      };
      saveActiveTestSession(updatedSession);
      return updatedSession;
    });
    setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1));
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setSession((prev) => {
      if (!prev) return null;
      const existing = prev.answers[currentQuestion.id];
      const updatedRecord: UserAnswerRecord = {
        ...existing,
        selectedOption: undefined,
        paletteState: 'not_answered',
      };
      const newAnswers = { ...prev.answers, [currentQuestion.id]: updatedRecord };
      const updatedSession = { ...prev, answers: newAnswers };
      saveActiveTestSession(updatedSession);
      return updatedSession;
    });
  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleJumpToQuestion = (targetIndex: number) => {
    setSession((prev) => {
      if (!prev) return null;
      const newAnswers = { ...prev.answers };
      if (currentQuestion && newAnswers[currentQuestion.id].paletteState === 'not_visited') {
        newAnswers[currentQuestion.id].paletteState = 'not_answered';
      }

      const targetQ = prev.questions[targetIndex];
      if (targetQ && newAnswers[targetQ.id].paletteState === 'not_visited') {
        newAnswers[targetQ.id].paletteState = 'not_answered';
        newAnswers[targetQ.id].visited = true;
      }

      const updatedSession = {
        ...prev,
        answers: newAnswers,
        currentQuestionIndex: targetIndex,
      };
      saveActiveTestSession(updatedSession);
      return updatedSession;
    });
    setCurrentIdx(targetIndex);
    setPaletteDrawerOpen(false);
  };

  const handleAutoSubmit = (currentSessionState: TestSessionState) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const finalReport = evaluateTestAttempt(currentSessionState);
    saveAttempt(finalReport);
    saveActiveTestSession({ ...currentSessionState, isSubmitted: true });
    router.push(`/results/${currentSessionState.testId}`);
  };

  const handleFinalSubmit = () => {
    if (!session || isSubmitting) return;
    setIsSubmitting(true);
    const finalReport = evaluateTestAttempt(session);
    saveAttempt(finalReport);
    saveActiveTestSession({ ...session, isSubmitted: true });
    router.push(`/results/${session.testId}`);
  };

  const paletteCounts = Object.values(session.answers).reduce(
    (acc, a) => {
      acc[a.paletteState] = (acc[a.paletteState] || 0) + 1;
      return acc;
    },
    {
      not_visited: 0,
      not_answered: 0,
      answered: 0,
      marked_for_review: 0,
      answered_and_marked: 0,
    } as Record<PaletteState, number>
  );

  const currentSubjectCode = currentQuestion?.subjectCode || 'quant';
  const currentSubject = SUBJECTS_CATALOGUE.find((s) => s.code === currentSubjectCode);

  const localizedQText =
    selectedLang === 'hi' && currentQuestion?.questionTextHi
      ? currentQuestion.questionTextHi
      : selectedLang === 'bn' && currentQuestion?.questionTextBn
      ? currentQuestion.questionTextBn
      : currentQuestion?.questionText;

  const isLowTime = session.timeRemainingSeconds <= 300;
  const isCriticalTime = session.timeRemainingSeconds <= 60;

  // -------------------------------------------------------------
  // VIEW 1: PRE-EXAM CANDIDATE LOGIN SCREEN (TCS iON Candidate Portal)
  // -------------------------------------------------------------
  if (examStep === 'login') {
    return (
      <div className="flex min-h-screen flex-col bg-[#eef2f6] text-slate-800 font-sans select-none">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-300 bg-[#0b3a75] px-6 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0b3a75] font-black text-sm">
              SSC
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight uppercase">
                {session.config.title}
              </h1>
              <p className="text-[11px] text-amber-300">
                TCS iON Digital Assessment System • Candidate Examination Portal
              </p>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="font-bold block text-white">System Name: C001</span>
            <span className="text-slate-300 text-[11px]">Lab: 02 • Desk: 42</span>
          </div>
        </header>

        {/* Center Login Box */}
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-lg border border-slate-300 bg-white shadow-lg overflow-hidden">
            <div className="bg-[#1f4a7c] px-6 py-3 text-white flex items-center justify-between">
              <span className="font-bold text-sm tracking-wide uppercase">Candidate Login Verification</span>
              <span className="text-xs text-amber-300 font-medium">Shift 1 • 09:00 AM</span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Candidate Photo & Credentials */}
              <div className="md:col-span-5 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4">
                <div className="h-28 w-24 rounded border-2 border-slate-400 bg-slate-100 flex flex-col items-center justify-center text-slate-400 mb-2 overflow-hidden">
                  <User className="h-16 w-16 text-slate-400" />
                </div>
                <span className="font-bold text-sm text-slate-900">{profile.fullName}</span>
                <span className="text-xs text-slate-500 font-mono">Roll: 2201004821</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded mt-1">
                  Biometrics Verified
                </span>
              </div>

              {/* Login Keypad & Password */}
              <div className="md:col-span-7 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Candidate Roll Number / Registration ID
                  </label>
                  <input
                    type="text"
                    disabled
                    value="2201004821"
                    className="w-full rounded border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Password (Date of Birth: DDMMYYYY)
                  </label>
                  <input
                    type="password"
                    readOnly
                    value={virtualPin}
                    className="w-full rounded border border-slate-400 bg-amber-50/60 px-3 py-1.5 text-sm font-mono font-bold tracking-widest text-slate-900 focus:outline-none"
                  />
                </div>

                {/* TCS iON Iconic Virtual Numeric Keypad */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Virtual Numeric Keypad
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center font-bold text-xs">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setVirtualPin((p) => p + num.toString())}
                        className="rounded border border-slate-300 bg-slate-100 py-1.5 hover:bg-slate-200 active:bg-blue-200"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1 mt-1 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setVirtualPin((p) => p.slice(0, -1))}
                      className="flex-1 rounded border border-slate-300 bg-slate-200 py-1 hover:bg-slate-300"
                    >
                      Backspace
                    </button>
                    <button
                      type="button"
                      onClick={() => setVirtualPin('')}
                      className="flex-1 rounded border border-slate-300 bg-slate-200 py-1 hover:bg-slate-300"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setExamStep('instructions')}
                    className="w-full rounded bg-[#0b3a75] py-2.5 text-xs font-bold text-white hover:bg-[#082a54] transition-colors uppercase tracking-wider shadow-sm"
                  >
                    Sign In to Examination
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: OFFICIAL GENERAL INSTRUCTIONS SCREEN (TCS iON CBT Pattern)
  // -------------------------------------------------------------
  if (examStep === 'instructions') {
    return (
      <div className="flex min-h-screen flex-col bg-[#f4f7f9] text-slate-900 font-sans select-none">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-slate-300 bg-[#0b3a75] px-6 text-white">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xs sm:text-sm tracking-wide uppercase">
              General Instructions • सामान्य अनुदेश
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline text-slate-300">Default Language:</span>
            <select
              aria-label="Instruction Language"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as 'en' | 'hi' | 'bn')}
              className="rounded bg-white text-slate-900 px-2.5 py-1 text-xs font-bold"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="bn">বাংলা (Bengali)</option>
            </select>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto space-y-6 text-xs text-slate-800 leading-relaxed">
          <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#0b3a75] border-b border-slate-200 pb-2 uppercase">
              Please read the instructions carefully / कृपया निर्देशों को ध्यान से पढ़ें
            </h2>

            <div className="space-y-3 text-slate-700">
              <p>
                <strong>1. Total Duration:</strong> The total duration of the examination is{' '}
                <span className="font-bold text-blue-900">{session.config.durationMinutes} minutes</span>.
              </p>
              <p>
                <strong>2. Server Clock:</strong> The clock will be set at the server. The countdown timer in the top right corner of the screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.
              </p>
              <p>
                <strong>3. Question Palette Symbols:</strong> The Question Palette displayed on the right side of the screen will show the status of each question using one of the following symbols:
              </p>
            </div>

            {/* Official 5-State Symbol Legend Table */}
            <div className="rounded border border-slate-300 overflow-hidden text-xs my-4">
              <table className="w-full text-left">
                <thead className="bg-[#eef2f6] font-bold text-slate-800 border-b border-slate-300">
                  <tr>
                    <th className="p-2.5 w-16 text-center border-r border-slate-300">Symbol</th>
                    <th className="p-2.5 border-r border-slate-300">Status</th>
                    <th className="p-2.5">Official Definition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 text-center border-r border-slate-200">
                      <span className="inline-flex h-7 w-7 items-center justify-center bg-slate-300 font-bold text-slate-800 tcs-shape-not-visited">
                        1
                      </span>
                    </td>
                    <td className="p-2 font-bold text-slate-800 border-r border-slate-200">Not Visited</td>
                    <td className="p-2 text-slate-600">You have not visited the question yet.</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center border-r border-slate-200">
                      <span className="inline-flex h-7 w-7 items-center justify-center bg-red-600 font-bold text-white tcs-shape-not-answered">
                        2
                      </span>
                    </td>
                    <td className="p-2 font-bold text-red-700 border-r border-slate-200">Not Answered</td>
                    <td className="p-2 text-slate-600">You have not answered the question.</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center border-r border-slate-200">
                      <span className="inline-flex h-7 w-7 items-center justify-center bg-emerald-600 font-bold text-white tcs-shape-answered">
                        3
                      </span>
                    </td>
                    <td className="p-2 font-bold text-emerald-800 border-r border-slate-200">Answered</td>
                    <td className="p-2 text-slate-600">You have answered the question.</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center border-r border-slate-200">
                      <span className="inline-flex h-7 w-7 items-center justify-center bg-purple-700 font-bold text-white tcs-shape-review">
                        4
                      </span>
                    </td>
                    <td className="p-2 font-bold text-purple-800 border-r border-slate-200">Marked for Review</td>
                    <td className="p-2 text-slate-600">
                      You have NOT answered the question, but have marked the question for review.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center border-r border-slate-200">
                      <span className="inline-flex h-7 w-7 items-center justify-center bg-purple-700 font-bold text-white tcs-shape-review relative">
                        5
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                    </td>
                    <td className="p-2 font-bold text-purple-900 border-r border-slate-200">
                      Answered & Marked for Review
                    </td>
                    <td className="p-2 text-slate-700 font-medium">
                      The question(s) &quot;Answered and Marked for Review&quot; will be considered for evaluation in final scoring.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-2 text-slate-700 pt-2 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 uppercase">Navigating to a Question & Answering:</h3>
              <p>• Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly.</p>
              <p>• Click on <strong>Save & Next</strong> to save your answer for the current question and then go to the next question.</p>
              <p>• Click on <strong>Mark for Review & Next</strong> to save your answer if selected, mark it for review, and then go to the next question.</p>
              <p>• To deselect your chosen answer, click on the button <strong>Clear Response</strong>.</p>
            </div>

            {/* Mandatory Candidate Declaration */}
            <div className="rounded bg-amber-50 border border-amber-300 p-4 mt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={instructionsRead}
                  onChange={(e) => setInstructionsRead(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-amber-400 text-blue-900 focus:ring-blue-900"
                />
                <span className="text-xs font-semibold text-amber-950 leading-relaxed">
                  I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of any prohibited electronic gadgets or books. I agree that in case of not adhering to the instructions, I shall be liable to be debarred from this examination.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <footer className="border-t border-slate-300 bg-white p-4 flex items-center justify-between px-8">
          <button
            type="button"
            onClick={() => setExamStep('login')}
            className="rounded border border-slate-300 bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
          >
            ← Previous (Login)
          </button>

          <button
            type="button"
            disabled={!instructionsRead}
            onClick={() => setExamStep('exam')}
            className="rounded bg-[#0b3a75] px-8 py-2.5 text-xs font-bold text-white hover:bg-[#082a54] disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider shadow-sm"
          >
            I am ready to begin →
          </button>
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: ACTIVE TCS iON CBT ASSESSMENT CONSOLE (Exam Screen)
  // -------------------------------------------------------------
  return (
    <div className="flex h-screen flex-col bg-white text-slate-900 font-sans select-none overflow-hidden">
      {/* 1. Official TCS iON Institutional Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-300 bg-[#0b3a75] px-4 text-white">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full border border-amber-400 bg-white text-[#0b3a75] font-black text-xs flex items-center justify-center shrink-0">
            SSC
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase truncate max-w-xl">
              {session.config.title}
            </h1>
            <p className="text-[10px] text-amber-300 font-medium">
              System ID: C001 • Test Code: {session.testId} • Tier-I Simulation
            </p>
          </div>
        </div>

        {/* Right side Candidate Profile Box (Authentic TCS iON Candidate Card) */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 bg-[#082a54] border border-[#13498a] px-3 py-1 rounded">
            <div className="h-8 w-8 rounded border border-slate-400 bg-slate-200 flex items-center justify-center text-xs font-bold text-[#0b3a75] overflow-hidden">
              <User className="h-5 w-5 text-slate-600" />
            </div>
            <div className="text-right text-[11px] leading-tight">
              <span className="font-bold text-white block truncate max-w-[120px]">{profile.fullName}</span>
              <span className="text-amber-300 text-[10px] font-mono">Roll: 2201004821</span>
            </div>
          </div>

          <button
            onClick={() => setPaletteDrawerOpen(!paletteDrawerOpen)}
            className="lg:hidden p-1.5 rounded bg-[#082a54] text-white border border-[#13498a]"
            aria-label="Toggle Question Palette"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* 2. Official Section Navigation & Timer Strip */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-300 bg-[#eef2f6] px-4 text-xs">
        {/* Sections */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth">
          <span className="font-bold text-[#0b3a75] uppercase text-[10px] shrink-0 mr-1">
            Section :
          </span>
          {SUBJECTS_CATALOGUE.map((subj) => {
            const hasQuestions = questions.some((q) => q.subjectCode === subj.code);
            if (!hasQuestions) return null;
            const isCurrentSection = currentQuestion?.subjectCode === subj.code;

            return (
              <button
                key={subj.id}
                onClick={() => {
                  const firstQIdx = questions.findIndex((q) => q.subjectCode === subj.code);
                  if (firstQIdx !== -1) handleJumpToQuestion(firstQIdx);
                }}
                className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap transition-colors ${
                  isCurrentSection
                    ? 'bg-[#0b3a75] text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {subj.name}
              </button>
            );
          })}
        </div>

        {/* Center/Right: Countdown Timer & Quick Actions */}
        <div className="flex items-center gap-3 shrink-0 ml-2">
          {/* High-visibility Countdown Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-black rounded border ${
              isCriticalTime
                ? 'bg-red-600 text-white border-red-700 animate-pulse'
                : isLowTime
                ? 'bg-amber-100 text-amber-950 border-amber-400'
                : 'bg-[#082a54] text-amber-300 border-[#0b3a75]'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Time Left : {formatTimer(session.timeRemainingSeconds)}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-bold">
            <button
              onClick={() => setIsQuestionPaperOpen(true)}
              className="text-[#0b3a75] hover:underline px-2 py-0.5 rounded border border-slate-300 bg-white"
            >
              Question Paper
            </button>
            <button
              onClick={() => setIsInstructionsOpen(true)}
              className="text-[#0b3a75] hover:underline px-2 py-0.5 rounded border border-slate-300 bg-white"
            >
              Instructions
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Question Area (Left) + TCS iON Question Palette (Right) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Question Panel */}
        <div className="flex flex-1 flex-col justify-between bg-white overflow-y-auto p-4 sm:p-6 border-r border-slate-300">
          {currentQuestion ? (
            <div className="space-y-4 max-w-4xl">
              {/* Question Meta Header */}
              <div className="flex items-center justify-between border-b border-slate-300 pb-2.5 text-xs bg-slate-50 p-2.5 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-[#0b3a75]">
                    Question No. {currentIdx + 1}
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="font-semibold text-slate-700">
                    {currentSubject?.name || currentQuestion.subjectCode}
                  </span>
                  <span className="text-slate-400 hidden sm:inline">|</span>
                  <span className="text-slate-500 text-[10px] hidden sm:inline">
                    Question Type: Multiple Choice
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Language Selector */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-600 font-semibold">View in:</span>
                    <select
                      aria-label="Question display language"
                      value={selectedLang}
                      onChange={(e) => setSelectedLang(e.target.value as 'en' | 'hi' | 'bn')}
                      className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-800"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी</option>
                      <option value="bn">বাংলা</option>
                    </select>
                  </div>

                  <div className="text-right text-[11px] font-bold">
                    <span className="text-emerald-700">+{currentQuestion.marks.toFixed(2)}</span>
                    <span className="text-slate-300 mx-1">/</span>
                    <span className="text-red-600">-{currentQuestion.negativeMarks.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed whitespace-pre-line py-3 px-1">
                {localizedQText && (localizedQText.startsWith('data:image') || localizedQText.startsWith('http') || localizedQText.startsWith('/9j/')) ? (
                  <img
                    src={localizedQText.startsWith('/9j/') ? `data:image/jpeg;base64,${localizedQText}` : localizedQText}
                    alt="Official Question Scan"
                    className="max-w-full max-h-[500px] object-contain rounded border border-slate-200 shadow-xs my-2 bg-white"
                  />
                ) : (
                  localizedQText
                )}
              </div>

              {/* 4 Answer Choices (Radio standard) */}
              <div className="space-y-2.5 pt-2">
                {currentQuestion.options.map((opt, optIndex) => {
                  const isSelected = currentAnswer?.selectedOption === opt.label;
                  const localizedOptText =
                    selectedLang === 'hi' && opt.textHi
                      ? opt.textHi
                      : selectedLang === 'bn' && opt.textBn
                      ? opt.textBn
                      : opt.text;

                  return (
                    <div
                      key={opt.label}
                      onClick={() => handleSelectOption(opt.label)}
                      className={`cursor-pointer rounded border p-3 flex items-center gap-3 transition-colors ${
                        isSelected
                          ? 'border-[#0b3a75] bg-blue-50/80 text-slate-950 font-bold'
                          : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#0b3a75] bg-[#0b3a75]' : 'border-slate-400'
                        }`}
                      >
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="font-bold text-xs mr-1 text-[#0b3a75]">
                        ({optIndex + 1})
                      </span>
                      {localizedOptText && (localizedOptText.startsWith('data:image') || localizedOptText.startsWith('http') || localizedOptText.startsWith('/9j/')) ? (
                        <img
                          src={localizedOptText.startsWith('/9j/') ? `data:image/jpeg;base64,${localizedOptText}` : localizedOptText}
                          alt={`Option ${opt.label}`}
                          className="max-h-24 max-w-full object-contain rounded border border-slate-200 bg-white p-1"
                        />
                      ) : (
                        <span className="text-xs sm:text-sm font-normal">{localizedOptText}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs">No question loaded.</div>
          )}

          {/* Bottom Action Buttons (TCS iON Standard Positions with Mobile Touch Grid) */}
          <div className="mt-6 pt-3 border-t border-slate-300 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs font-semibold">
            {/* Left Action Buttons */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkForReviewAndNext}
                className="rounded border border-slate-400 bg-slate-100 px-3 py-2 text-slate-800 hover:bg-slate-200 transition-colors text-center text-[11px] sm:text-xs"
              >
                Mark Review & Next
              </button>

              <button
                type="button"
                onClick={handleClearResponse}
                className="rounded border border-slate-400 bg-slate-100 px-3 py-2 text-slate-800 hover:bg-slate-200 transition-colors text-center text-[11px] sm:text-xs"
              >
                Clear Response
              </button>
            </div>

            {/* Right Action Buttons */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIdx === 0}
                className="rounded border border-slate-400 bg-slate-100 px-3.5 py-2 text-slate-800 hover:bg-slate-200 disabled:opacity-40 text-center text-[11px] sm:text-xs"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={handleSaveAndNext}
                className="rounded bg-[#0b3a75] px-5 py-2 text-white hover:bg-[#082a54] transition-colors font-bold shadow-xs text-center text-[11px] sm:text-xs"
              >
                Save & Next →
              </button>
            </div>
          </div>
        </div>

        {/* Right Palette (TCS iON Standard Layout with Authentic Geometric Badges) */}
        <aside
          className={`w-80 shrink-0 bg-[#eef2f6] border-l border-slate-300 flex flex-col justify-between p-3.5 overflow-y-auto lg:static absolute inset-y-0 right-0 z-30 transition-transform ${
            paletteDrawerOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-3.5">
            {/* Candidate Photo Header Card inside Palette */}
            <div className="rounded border border-slate-300 bg-white p-2.5 flex items-center gap-3">
              <div className="h-12 w-10 rounded border border-slate-400 bg-slate-200 flex items-center justify-center shrink-0">
                <User className="h-6 w-6 text-slate-600" />
              </div>
              <div className="leading-tight text-xs">
                <span className="font-bold text-slate-900 block truncate">{profile.fullName}</span>
                <span className="text-[10px] text-slate-600 font-mono block">Roll: 2201004821</span>
                <span className="text-[9px] text-[#0b3a75] font-bold block uppercase">Desk: C001</span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <div className="flex lg:hidden items-center justify-between pb-1 border-b border-slate-300">
              <span className="font-bold text-xs uppercase">Question Palette</span>
              <button onClick={() => setPaletteDrawerOpen(false)} aria-label="Close">
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            {/* TCS iON 5-State Color Legend Box with Exact Polygonal Shapes */}
            <div className="rounded border border-slate-300 bg-white p-3 text-[11px] space-y-2">
              <div className="grid grid-cols-2 gap-2 text-slate-800 font-semibold">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] tcs-shape-answered shrink-0">
                    {paletteCounts.answered}
                  </span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 bg-red-600 text-white font-bold flex items-center justify-center text-[10px] tcs-shape-not-answered shrink-0">
                    {paletteCounts.not_answered}
                  </span>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 bg-slate-300 text-slate-800 font-bold flex items-center justify-center text-[10px] tcs-shape-not-visited shrink-0">
                    {paletteCounts.not_visited}
                  </span>
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 bg-purple-700 text-white font-bold flex items-center justify-center text-[10px] tcs-shape-review shrink-0">
                    {paletteCounts.marked_for_review}
                  </span>
                  <span>Marked for Review</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                <span className="h-6 w-6 bg-purple-700 text-white font-bold flex items-center justify-center text-[10px] tcs-shape-review relative shrink-0">
                  {paletteCounts.answered_and_marked}
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] text-slate-600 leading-tight">
                  Answered & Marked for Review (will be considered for evaluation)
                </span>
              </div>
            </div>

            {/* Question Palette Number Grid */}
            <div>
              <div className="bg-[#0b3a75] text-white font-bold text-xs p-2 rounded-t flex justify-between items-center">
                <span className="uppercase">{currentSubject?.name || 'SECTION'}</span>
                <span>{questions.length} Questions</span>
              </div>
              <div className="border border-t-0 border-slate-300 bg-white p-2.5 rounded-b max-h-60 overflow-y-auto">
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs font-bold">
                  {questions.map((q, idx) => {
                    const ans = session.answers[q.id];
                    const state = ans?.paletteState || 'not_visited';
                    const isCurrent = idx === currentIdx;

                    let bgClass = 'bg-slate-300 text-slate-800 tcs-shape-not-visited';
                    if (state === 'answered') {
                      bgClass = 'bg-emerald-600 text-white tcs-shape-answered';
                    } else if (state === 'not_answered') {
                      bgClass = 'bg-red-600 text-white tcs-shape-not-answered';
                    } else if (state === 'marked_for_review') {
                      bgClass = 'bg-purple-700 text-white tcs-shape-review';
                    } else if (state === 'answered_and_marked') {
                      bgClass = 'bg-purple-700 text-white tcs-shape-review relative';
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleJumpToQuestion(idx)}
                        className={`h-8 font-black transition-all ${bgClass} ${
                          isCurrent ? 'ring-2 ring-slate-900 ring-offset-1 z-10' : ''
                        }`}
                      >
                        {idx + 1}
                        {state === 'answered_and_marked' && (
                          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Area: Question Paper, Instructions & Final Submit */}
          <div className="pt-3 border-t border-slate-300 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsQuestionPaperOpen(true)}
                className="rounded border border-slate-300 bg-white py-1.5 text-[#0b3a75] hover:bg-slate-100"
              >
                Question Paper
              </button>
              <button
                type="button"
                onClick={() => setIsInstructionsOpen(true)}
                className="rounded border border-slate-300 bg-white py-1.5 text-[#0b3a75] hover:bg-slate-100"
              >
                Instructions
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full rounded bg-emerald-700 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors uppercase tracking-wider shadow-xs"
            >
              Submit Group / Paper
            </button>
          </div>
        </aside>
      </div>

      {/* 4. QUESTION PAPER MODAL (Official TCS iON feature to skim all questions) */}
      {isQuestionPaperOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-4xl h-[85vh] rounded-lg bg-white p-5 shadow-2xl border border-slate-300 flex flex-col space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-sm text-[#0b3a75] uppercase">
                  Complete Question Paper • {session.config.title}
                </h3>
                <p className="text-[10px] text-slate-500">
                  Total Questions: {questions.length} • Maximum Marks: {questions.length * 2}
                </p>
              </div>
              <button
                onClick={() => setIsQuestionPaperOpen(false)}
                className="p-1 rounded hover:bg-slate-100 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {questions.map((q, idx) => (
                <div key={`${q.id}_${idx}`} className="border-b border-slate-200 pb-4 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span className="text-[#0b3a75]">Question {idx + 1}</span>
                    <span className="text-[10px] text-slate-500">
                      Marks: +{q.marks.toFixed(2)} / -{q.negativeMarks.toFixed(2)}
                    </span>
                  </div>
                  <div className="font-medium text-slate-900 leading-relaxed">
                    {q.questionText && (q.questionText.startsWith('data:image') || q.questionText.startsWith('http') || q.questionText.startsWith('/9j/')) ? (
                      <img
                        src={q.questionText.startsWith('/9j/') ? `data:image/jpeg;base64,${q.questionText}` : q.questionText}
                        alt={`Question ${idx + 1}`}
                        className="max-w-full max-h-64 object-contain rounded border border-slate-200 my-1 bg-white"
                      />
                    ) : (
                      q.questionText
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={opt.label}
                        className="rounded border border-slate-200 p-2 text-slate-700 flex items-start gap-2 bg-slate-50"
                      >
                        <span className="font-bold text-[#0b3a75]">({oIdx + 1})</span>
                        {opt.text && (opt.text.startsWith('data:image') || opt.text.startsWith('http') || opt.text.startsWith('/9j/')) ? (
                          <img
                            src={opt.text.startsWith('/9j/') ? `data:image/jpeg;base64,${opt.text}` : opt.text}
                            alt={`Option ${opt.label}`}
                            className="max-h-16 max-w-full object-contain rounded border border-slate-200 bg-white"
                          />
                        ) : (
                          <span>{opt.text}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 text-right">
              <button
                type="button"
                onClick={() => setIsQuestionPaperOpen(false)}
                className="rounded bg-[#0b3a75] px-6 py-2 font-bold text-white hover:bg-[#082a54]"
              >
                Close Question Paper
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CONFIRMATION & EXAM SUBMISSION SUMMARY MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl border border-slate-300 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-[#0b3a75] uppercase">
                Examination Submission Confirmation
              </h3>
              <button onClick={() => setIsSubmitModalOpen(false)}>
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <p className="text-slate-700">
              You are about to finish the examination. Please inspect your attempt summary before final submission:
            </p>

            <table className="w-full text-left border border-slate-300 text-xs">
              <thead className="bg-[#eef2f6] font-bold text-slate-800">
                <tr>
                  <th className="p-2 border-r border-b">Status</th>
                  <th className="p-2 border-b text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 border-r flex items-center gap-2">
                    <span className="h-4 w-4 bg-emerald-600 tcs-shape-answered inline-block" />
                    <span>Answered</span>
                  </td>
                  <td className="p-2 text-right font-bold text-emerald-700">{paletteCounts.answered}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r flex items-center gap-2">
                    <span className="h-4 w-4 bg-red-600 tcs-shape-not-answered inline-block" />
                    <span>Not Answered</span>
                  </td>
                  <td className="p-2 text-right font-bold text-red-600">{paletteCounts.not_answered}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r flex items-center gap-2">
                    <span className="h-4 w-4 bg-purple-700 tcs-shape-review inline-block" />
                    <span>Marked for Review</span>
                  </td>
                  <td className="p-2 text-right font-bold text-purple-700">
                    {paletteCounts.marked_for_review}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border-r flex items-center gap-2">
                    <span className="h-4 w-4 bg-purple-700 tcs-shape-review inline-block relative">
                      <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    <span>Answered & Marked for Review</span>
                  </td>
                  <td className="p-2 text-right font-bold text-purple-900">
                    {paletteCounts.answered_and_marked}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border-r flex items-center gap-2">
                    <span className="h-4 w-4 bg-slate-300 tcs-shape-not-visited inline-block" />
                    <span>Not Visited</span>
                  </td>
                  <td className="p-2 text-right font-bold text-slate-500">{paletteCounts.not_visited}</td>
                </tr>
              </tbody>
            </table>

            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-[11px] text-amber-900 font-medium">
              Note: Answers marked as &quot;Answered & Marked for Review&quot; will be evaluated in the final scoring.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="rounded border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Return to Paper
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="rounded bg-emerald-700 px-5 py-2 font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Evaluating...' : 'Yes, Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. GENERAL INSTRUCTIONS MODAL (Popup inside active exam) */}
      {isInstructionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl border border-slate-300 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-sm text-[#0b3a75] uppercase">
                General Examination Instructions
              </h3>
              <button onClick={() => setIsInstructionsOpen(false)}>
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="space-y-2 text-slate-700 leading-relaxed max-h-80 overflow-y-auto pr-1">
              <p>1. The clock will be set at the server. The countdown timer on the top displays remaining time.</p>
              <p>2. The Question Palette on the right displays the exact status of each question using official color markers.</p>
              <p>3. To answer a question, select the radio button and click <strong>Save & Next</strong>.</p>
              <p>4. To deselect your answer, click <strong>Clear Response</strong>.</p>
              <p>5. Questions marked for review with an answered choice will be evaluated in final scoring.</p>
            </div>
            <div className="pt-2 border-t text-right">
              <button
                type="button"
                onClick={() => setIsInstructionsOpen(false)}
                className="rounded bg-[#0b3a75] px-4 py-1.5 font-bold text-white hover:bg-[#082a54]"
              >
                Close Instructions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
