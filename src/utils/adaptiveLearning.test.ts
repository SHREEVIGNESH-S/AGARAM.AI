import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSpacedRepetitionInterval,
  evaluateTopicMastery,
  detectKnowledgeGap,
  hindsightReflection,
  LearningEvent,
} from './adaptiveLearning';

test('spaced repetition resets interval to 1 day on "again"', () => {
  const nextInterval = calculateSpacedRepetitionInterval(4, 14, 'again');
  assert.equal(nextInterval, 1);
});

test('spaced repetition scales interval for "good" and "easy" ratings', () => {
  const int1 = calculateSpacedRepetitionInterval(1, 1, 'good');
  assert.equal(int1, 3);

  const int2 = calculateSpacedRepetitionInterval(2, 3, 'good');
  assert.equal(int2, 7);

  const int3 = calculateSpacedRepetitionInterval(3, 7, 'good');
  assert.ok(int3 >= 14, `Expected int3 >= 14, got ${int3}`);

  const intEasy = calculateSpacedRepetitionInterval(3, 7, 'easy');
  assert.ok(intEasy > int3, 'Easy rating should provide longer interval than good rating');
});

test('topic mastery calculation scales accuracy, recency and penalties', () => {
  // 8 out of 10 correct = 80%
  const masteryBasic = evaluateTopicMastery(8, 10, 1.0, 0);
  assert.equal(masteryBasic, 80);

  // With repeated mistake penalty of 10 points
  const masteryPenalized = evaluateTopicMastery(8, 10, 1.0, 10);
  assert.equal(masteryPenalized, 70);

  // Recency bonus
  const masteryFresh = evaluateTopicMastery(10, 10, 1.1, 0);
  assert.equal(masteryFresh, 100); // capped at 100
});

test('knowledge gap detects overconfidence with high confidence and low score', () => {
  // Confidence 5/5 (100%), but score 40%
  const gap = detectKnowledgeGap(5, 40);
  assert.equal(gap.isGap, true);
  assert.equal(gap.severity, 'high');
  assert.ok(gap.delta >= 50);

  // Confidence 3/5 (60%) and score 85% -> no overconfidence gap
  const noGap = detectKnowledgeGap(3, 85);
  assert.equal(noGap.isGap, false);
});

test('hindsight reflection identifies visual pattern and repeated mistakes', () => {
  const events: LearningEvent[] = [
    {
      id: 'e1',
      timestamp: Date.now() - 3600000,
      subjectId: 'cs-1',
      topicId: 'pointers',
      type: 'example_requested',
      notes: 'asked for visual memory diagram',
    },
    {
      id: 'e2',
      timestamp: Date.now() - 3000000,
      subjectId: 'cs-1',
      topicId: 'pointers',
      type: 'example_requested',
      notes: 'visual pointer trace',
    },
    {
      id: 'e3',
      timestamp: Date.now() - 2000000,
      subjectId: 'cs-1',
      topicId: 'pointers',
      type: 'answer_incorrect',
      mistakePattern: 'pointer dereference address confusion',
    },
    {
      id: 'e4',
      timestamp: Date.now() - 1000000,
      subjectId: 'cs-1',
      topicId: 'pointers',
      type: 'answer_incorrect',
      mistakePattern: 'pointer offset out of bounds',
    },
  ];

  const reflection = hindsightReflection(events);
  assert.ok(reflection.patterns.some(p => p.includes('visual')));
  assert.ok(reflection.patterns.some(p => p.includes('Pointer and array mistakes')));
  assert.ok(reflection.suggestedAction.length > 0);
});
