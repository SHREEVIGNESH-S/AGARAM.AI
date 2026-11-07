/**
 * Adaptive Learning Engine & Algorithms
 * Implements:
 * 1. Spaced Repetition (SuperMemo-2 inspired intervals adapted for recall latency & performance)
 * 2. Topic Mastery Calculation based on accuracy, recency, and repeated mistake penalties
 * 3. Knowledge Gap Detection (Self-rating confidence vs actual empirical performance)
 * 4. Hindsight Memory Reflection (identifying learning patterns across events)
 */

export interface LearningEvent {
  id: string;
  timestamp: number;
  subjectId: string;
  topicId: string;
  type: 'question_asked' | 'example_requested' | 'answer_correct' | 'answer_incorrect' | 'confidence_rated' | 'revision_completed';
  confidenceRating?: number; // 1-5
  notes?: string;
  mistakePattern?: string;
}

export type PerformanceRating = 'again' | 'hard' | 'good' | 'easy';

/**
 * Calculates next revision interval in days based on performance rating and consecutive streak
 */
export function calculateSpacedRepetitionInterval(
  consecutiveCorrect: number,
  previousIntervalDays: number = 1,
  rating: PerformanceRating = 'good'
): number {
  if (rating === 'again') {
    return 1; // Immediate reset to 1 day
  }

  if (consecutiveCorrect <= 0) {
    return rating === 'hard' ? 1 : 2;
  }

  let factor = 2.0;
  if (rating === 'hard') factor = 1.3;
  if (rating === 'good') factor = 2.2;
  if (rating === 'easy') factor = 2.8;

  if (consecutiveCorrect === 1) {
    return rating === 'hard' ? 2 : 3;
  } else if (consecutiveCorrect === 2) {
    return rating === 'hard' ? 4 : 7;
  }

  // SuperMemo exponential progression
  const nextInterval = Math.round(Math.max(previousIntervalDays * factor, consecutiveCorrect * 3));
  return Math.min(nextInterval, 90); // Cap at 90 days
}

/**
 * Evaluates topic mastery percentage (0 to 100)
 * Uses correct count, total attempts, recency factor, and repeated mistake penalty
 */
export function evaluateTopicMastery(
  correctCount: number,
  totalAttempts: number,
  recencyWeight: number = 1.0, // 0.5 to 1.2
  repeatedMistakesPenalty: number = 0 // points to deduct
): number {
  if (totalAttempts === 0) return 0;

  const rawAccuracy = (correctCount / totalAttempts) * 100;
  // Weight accuracy by recency and penalize repeated mistakes
  const adjusted = rawAccuracy * Math.min(Math.max(recencyWeight, 0.5), 1.2) - repeatedMistakesPenalty;
  
  return Math.round(Math.max(0, Math.min(100, adjusted)));
}

/**
 * Detects knowledge gap between subjective student confidence and empirical accuracy
 */
export function detectKnowledgeGap(
  selfConfidenceRating: number, // 1 to 5
  testScorePercentage: number // 0 to 100
): {
  isGap: boolean;
  severity: 'none' | 'low' | 'medium' | 'high';
  delta: number;
  recommendation: string;
} {
  // Normalize confidence rating to 0-100%
  const normalizedConfidence = (selfConfidenceRating / 5) * 100;
  const delta = normalizedConfidence - testScorePercentage;

  // High confidence (>70%) but low accuracy (<65%) indicates high gap/misconception
  if (normalizedConfidence >= 75 && testScorePercentage < 55) {
    return {
      isGap: true,
      severity: 'high',
      delta: Math.round(delta),
      recommendation: 'You rated confidence high, but assessment accuracy was low. Review core definitions and try a visual worked example.',
    };
  } else if (delta >= 25 && testScorePercentage < 75) {
    return {
      isGap: true,
      severity: 'medium',
      delta: Math.round(delta),
      recommendation: 'Overconfidence bias detected. Test understanding with a fresh code dry run or practice problem.',
    };
  } else if (delta >= 15 && testScorePercentage < 80) {
    return {
      isGap: true,
      severity: 'low',
      delta: Math.round(delta),
      recommendation: 'Slight discrepancy between confidence and execution. Complete targeted practice questions.',
    };
  }

  return {
    isGap: false,
    severity: 'none',
    delta: Math.round(delta),
    recommendation: 'Confidence aligns well with mastery.',
  };
}

/**
 * Hindsight Memory Reflection Analyzer
 * Synthesizes learning events into high-level memory patterns and actionable insights
 */
export function hindsightReflection(events: LearningEvent[]): {
  patterns: string[];
  insights: string[];
  suggestedAction: string;
} {
  const patterns: string[] = [];
  const insights: string[] = [];

  const visualRequests = events.filter(e => e.type === 'example_requested' && e.notes?.toLowerCase().includes('visual')).length;
  const totalExamples = events.filter(e => e.type === 'example_requested').length;
  const incorrectCount = events.filter(e => e.type === 'answer_incorrect').length;
  const correctCount = events.filter(e => e.type === 'answer_correct').length;

  // Pattern detection: Learning format preference
  if (visualRequests >= 2 || (totalExamples >= 3 && visualRequests >= 1)) {
    patterns.push('Student learns best when explanations include visual memory-address analogies and diagrams.');
    insights.push('Visual reasoning is a significant strength.');
  }

  // Pattern detection: Repeated indexing / pointer mistakes
  const indexMistakes = events.filter(e => e.mistakePattern?.toLowerCase().includes('index') || e.mistakePattern?.toLowerCase().includes('pointer')).length;
  if (indexMistakes >= 2) {
    patterns.push('Recent pattern: Pointer and array mistakes occur when tracing memory offsets and index boundaries.');
    insights.push('Needs dry-run tracing practice before advanced data structures.');
  }

  // Accuracy trend
  if (incorrectCount > correctCount && incorrectCount >= 3) {
    insights.push('Recent session shows cognitive fatigue or foundational gap. Recommend simplifying explanation style.');
  } else if (correctCount > 5) {
    insights.push('Strong retention across recent concepts. Ready for higher difficulty challenges.');
  }

  if (patterns.length === 0) {
    patterns.push('Initial learning profile established: Responsive to step-by-step worked demonstrations.');
  }
  if (insights.length === 0) {
    insights.push('Consistent study pace observed. Reinforce with spaced repetition.');
  }

  const suggestedAction = indexMistakes >= 1
    ? 'Review pointer arithmetic with step-by-step memory visualization.'
    : 'Complete today\'s 4 due revision topics to cement retention.';

  return { patterns, insights, suggestedAction };
}
