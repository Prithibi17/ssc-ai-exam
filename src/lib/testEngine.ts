import {
  Question,
  TestConfiguration,
  TestSessionState,
  TestSummaryReport,
  UserAnswerRecord,
  QuestionResultBreakdown,
} from '@/types';
import { EXAMS_CATALOGUE, SUBJECTS_CATALOGUE, TOPICS_CATALOGUE, getExamSubjectCodes } from '@/data/exams';
import { VERIFIED_PYQ_QUESTIONS } from '@/data/questions';

export function createTestSession(config: TestConfiguration, rawQuestions?: Question[]): TestSessionState {
  let questionsToUse: Question[] = [];

  if (rawQuestions && rawQuestions.length > 0) {
    questionsToUse = rawQuestions;
  } else {
    // 1. Strictly determine allowed subjects according to selected exam
    const allowedExamSubjects = getExamSubjectCodes(config.targetExamId);
    const activeSubjectCodes =
      config.mode === 'official_simulation' || !config.subjectCodes || config.subjectCodes.length === 0
        ? allowedExamSubjects
        : config.subjectCodes.filter((c) => allowedExamSubjects.includes(c));

    // Select questions according to configuration filters
    let pool = VERIFIED_PYQ_QUESTIONS.filter((q) => activeSubjectCodes.includes(q.subjectCode));

    if (config.targetExamId && config.targetExamId !== 'all') {
      const examSpecific = pool.filter((q) => q.provenance.examCode === config.targetExamId);
      if (examSpecific.length > 0) {
        pool = examSpecific;
      }
    }

    if (config.topicCodes && config.topicCodes.length > 0) {
      const topicFiltered = pool.filter((q) => config.topicCodes?.includes(q.topicCode));
      if (topicFiltered.length > 0) {
        pool = topicFiltered;
      }
    }

    if (config.difficulty && config.difficulty !== 'mixed') {
      const diffFiltered = pool.filter((q) => q.difficulty === config.difficulty);
      if (diffFiltered.length > 0) {
        pool = diffFiltered;
      }
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    questionsToUse = shuffled.slice(0, config.questionCount);

    // If pool is smaller than questionCount, cycle through to reach requested count for seamless demo testing
    if (questionsToUse.length < config.questionCount && pool.length > 0) {
      let idx = 0;
      while (questionsToUse.length < config.questionCount) {
        const base = pool[idx % pool.length];
        questionsToUse.push({
          ...base,
          id: `${base.id}_rep_${questionsToUse.length}`,
        });
        idx++;
      }
    }
  }

  // Initialize answer states
  const initialAnswers: Record<string, UserAnswerRecord> = {};
  questionsToUse.forEach((q, idx) => {
    initialAnswers[q.id] = {
      questionId: q.id,
      selectedOption: undefined,
      paletteState: idx === 0 ? 'not_answered' : 'not_visited',
      timeSpentSeconds: 0,
      visited: idx === 0,
    };
  });

  return {
    testId: config.id || `test_${Date.now()}`,
    config,
    questions: questionsToUse,
    currentQuestionIndex: 0,
    currentSectionIndex: 0,
    answers: initialAnswers,
    timeRemainingSeconds: config.durationMinutes * 60,
    isPaused: false,
    isSubmitted: false,
    startedAt: new Date().toISOString(),
    lastSavedAt: new Date().toISOString(),
  };
}

export function evaluateTestAttempt(session: TestSessionState): TestSummaryReport {
  const { config, questions, answers } = session;

  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let totalScore = 0;

  const marksPerCorrect = config.marksPerCorrect ?? 2.0;
  const negativeMarking = config.negativeMarking ?? 0.5;
  const maxMarks = questions.length * marksPerCorrect;

  const questionResults: QuestionResultBreakdown[] = [];

  // Track section & topic statistics
  const sectionStats: Record<string, { total: number; attempted: number; correct: number; score: number }> = {};
  const topicStats: Record<string, { total: number; correct: number }> = {};

  questions.forEach((q) => {
    const ans = answers[q.id];
    const userSelected = ans?.selectedOption;
    const isAttempted = !!userSelected;
    const isCorrect = isAttempted && userSelected === q.correctOption;
    const timeSpent = ans?.timeSpentSeconds || 0;

    let marksAwarded = 0;
    if (isAttempted) {
      if (isCorrect) {
        correctCount++;
        marksAwarded = marksPerCorrect;
        totalScore += marksPerCorrect;
      } else {
        incorrectCount++;
        marksAwarded = -negativeMarking;
        totalScore -= negativeMarking;
      }
    } else {
      unattemptedCount++;
    }

    // Classify time management behavior
    let timeClassification: QuestionResultBreakdown['timeClassification'] = 'skipped';
    if (isAttempted) {
      if (isCorrect) {
        timeClassification = timeSpent < 45 ? 'fast_correct' : 'slow_correct';
      } else {
        timeClassification = timeSpent > 90 ? 'time_trap' : 'careless_error';
      }
    }

    questionResults.push({
      question: q,
      userSelected,
      isCorrect,
      isAttempted,
      marksAwarded,
      timeSpentSeconds: timeSpent,
      timeClassification,
    });

    // Section accumulation
    const subjName = SUBJECTS_CATALOGUE.find((s) => s.code === q.subjectCode)?.name || q.subjectCode;
    if (!sectionStats[subjName]) {
      sectionStats[subjName] = { total: 0, attempted: 0, correct: 0, score: 0 };
    }
    sectionStats[subjName].total++;
    if (isAttempted) sectionStats[subjName].attempted++;
    if (isCorrect) sectionStats[subjName].correct++;
    sectionStats[subjName].score += marksAwarded;

    // Topic accumulation
    const topicName = TOPICS_CATALOGUE.find((t) => t.code === q.topicCode)?.name || q.topicCode;
    if (!topicStats[topicName]) {
      topicStats[topicName] = { total: 0, correct: 0 };
    }
    topicStats[topicName].total++;
    if (isCorrect) topicStats[topicName].correct++;
  });

  const accuracyPercentage =
    correctCount + incorrectCount > 0
      ? Math.round((correctCount / (correctCount + incorrectCount)) * 100 * 10) / 10
      : 0;

  // Approximate percentile estimation based on standard SSC normal distribution
  const scoreRatio = Math.max(0, totalScore / (maxMarks || 1));
  const percentileEstimate = Math.min(99.9, Math.max(10, Math.round((scoreRatio * 0.85 + 0.12) * 100 * 10) / 10));
  const projectedRank = Math.max(1, Math.round(250000 * (1 - percentileEstimate / 100)));

  const sectionBreakdown = Object.entries(sectionStats).map(([name, data]) => ({
    sectionName: name,
    totalQuestions: data.total,
    attempted: data.attempted,
    correct: data.correct,
    score: Math.round(data.score * 100) / 100,
    accuracy: data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0,
  }));

  const topicBreakdown = Object.entries(topicStats).map(([name, data]) => {
    const acc = Math.round((data.correct / data.total) * 100);
    return {
      topicCode: name,
      topicName: name,
      total: data.total,
      correct: data.correct,
      accuracy: acc,
      isWeak: acc < 60,
    };
  });

  // Target exam details
  const exam = EXAMS_CATALOGUE.find((e) => e.id === config.targetExamId);
  const examName = exam ? exam.name : 'Competitive Exam Mock';

  const totalTimeSpentSeconds = config.durationMinutes * 60 - session.timeRemainingSeconds;

  return {
    attemptId: `att_${Date.now()}`,
    testId: session.testId,
    title: config.title,
    mode: config.mode,
    examName,
    startedAt: session.startedAt,
    submittedAt: new Date().toISOString(),
    totalTimeSpentSeconds: Math.max(1, totalTimeSpentSeconds),
    totalQuestions: questions.length,
    attemptedQuestions: correctCount + incorrectCount,
    correctCount,
    incorrectCount,
    unattemptedCount,
    totalScore: Math.round(totalScore * 100) / 100,
    maxMarks,
    accuracyPercentage,
    percentileEstimate,
    projectedRank,
    sectionBreakdown,
    topicBreakdown,
    questionResults,
    aiAnalysisRecommendation: generateRuleBasedActionPlan(topicBreakdown, accuracyPercentage, totalScore, maxMarks),
  };
}

function generateRuleBasedActionPlan(
  topics: { topicName: string; accuracy: number; isWeak: boolean }[],
  accuracy: number,
  score: number,
  maxMarks: number
): string {
  const weak = topics.filter((t) => t.isWeak).map((t) => t.topicName);
  const scorePct = Math.round((score / (maxMarks || 1)) * 100);

  let advice = '';
  if (scorePct >= 75) {
    advice += 'Outstanding performance! You are currently scoring well above the expected Tier-1 cutoff threshold. ';
  } else if (scorePct >= 50) {
    advice += 'Solid foundation with clear potential to qualify! Focus on eliminating careless negative marks to hit the 140+ safe zone. ';
  } else {
    advice += 'Foundational revision required. Prioritise high-weightage arithmetic and reasoning rules first. ';
  }

  if (weak.length > 0) {
    advice += `Immediate priority topics for revision: ${weak.slice(0, 3).join(', ')}.`;
  } else {
    advice += 'Great balance across all attempted topics. Maintain your test speed by practicing full-length mixed sets.';
  }

  return advice;
}
