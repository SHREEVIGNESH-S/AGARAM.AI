import test from 'node:test';
import assert from 'node:assert/strict';
import { getStudentBankId } from './hindsight';
import {
  calculateSpacedRepetitionInterval,
  detectKnowledgeGap,
  evaluateTopicMastery,
  hindsightReflection,
} from '../utils/adaptiveLearning';

test('getStudentBankId creates consistent and sanitized bank IDs', () => {
  const bank1 = getStudentBankId('student-uuid-1234');
  assert.equal(bank1, 'agaram-student-student-uuid-1234');

  // Verify special character sanitization
  const bank2 = getStudentBankId('user.name@domain.com!#');
  assert.equal(bank2, 'agaram-student-user-name-domain-com--');

  // Verify consistency
  const bank3 = getStudentBankId('student-uuid-1234');
  assert.equal(bank1, bank3);
});

test('calculateSpacedRepetitionInterval adjusts intervals based on rating', () => {
  // 'again' resets interval to 1
  assert.equal(calculateSpacedRepetitionInterval(3, 7, 'again'), 1);

  // consecutiveCorrect === 1 with 'good' returns 3
  assert.equal(calculateSpacedRepetitionInterval(1, 1, 'good'), 3);

  // consecutiveCorrect === 2 with 'good' returns 7
  assert.equal(calculateSpacedRepetitionInterval(2, 3, 'good'), 7);

  // consecutiveCorrect === 3 with 'good' expands to ~15
  const goodInterval = calculateSpacedRepetitionInterval(3, 7, 'good');
  assert.ok(goodInterval > 7);

  // 'easy' expands interval even more
  const easyInterval = calculateSpacedRepetitionInterval(3, 7, 'easy');
  assert.ok(easyInterval > goodInterval);
});

test('detectKnowledgeGap flags high confidence with low accuracy', () => {
  // 5/5 confidence with 40% accuracy -> high severity gap
  const gapHigh = detectKnowledgeGap(5, 40);
  assert.equal(gapHigh.isGap, true);
  assert.equal(gapHigh.severity, 'high');

  // 4/5 confidence with 85% accuracy -> no gap
  const gapNone = detectKnowledgeGap(4, 85);
  assert.equal(gapNone.isGap, false);
});

test('evaluateTopicMastery calculates percentage accurately with recency and mistake penalties', () => {
  // 1/4 correct -> 25% raw accuracy
  const masteryLow = evaluateTopicMastery(1, 4, 1.0, 0);
  assert.equal(masteryLow, 25);

  // 5/5 correct -> 100%
  const masteryHigh = evaluateTopicMastery(5, 5, 1.0, 0);
  assert.equal(masteryHigh, 100);

  // Penalty reduces mastery
  const masteryPenalized = evaluateTopicMastery(4, 5, 1.0, 15);
  assert.equal(masteryPenalized, 65);
});

test('hindsightReflection synthesizes patterns from learning events', () => {
  const events = [
    {
      id: 'e1',
      subjectId: 'cs',
      topicId: 'cs-01',
      type: 'question_asked' as const,
      timestamp: 1730900000000,
    },
    {
      id: 'e2',
      subjectId: 'cs',
      topicId: 'cs-01',
      type: 'example_requested' as const,
      notes: 'visual diagram please',
      timestamp: 1730900900000,
    },
  ];

  const reflection = hindsightReflection(events);
  assert.ok(Array.isArray(reflection.patterns));
  assert.ok(Array.isArray(reflection.insights));
  assert.ok(typeof reflection.suggestedAction === 'string');
});

test('Multi-Profile Data Isolation: newly created profiles start with clean zeroed values', async () => {
  const { db } = await import('./db');
  
  // Create a brand new student profile
  const newAccount = db.createProfile({
    name: 'Priya Sharma',
    educationLevel: 'undergraduate',
    courseOrGrade: 'Biochemistry 101',
    institution: 'National University',
    voiceGender: 'female',
  });

  // Verify zeroed initial metrics as specified by the requirements table
  assert.equal(newAccount.student.overallMastery, 0);
  assert.equal(newAccount.student.studyStreakDays, 0);
  assert.equal(newAccount.student.averageStudyDurationMinutes, 0);
  assert.equal(newAccount.student.questionAttempts, 0);
  assert.equal(newAccount.student.revisionDueCount, 0);
  assert.equal(newAccount.student.knowledgeGapsCount, 0);
  assert.equal(newAccount.student.consistencyScore, 0);
  assert.equal(newAccount.student.voiceGender, 'female');
  assert.equal(newAccount.subjects.length, 1);
  assert.equal(newAccount.subjects[0].masteryPercentage, 0);
  assert.equal(newAccount.subjects[0].masteredTopics, 0);
  assert.equal(newAccount.memories.length, 0);
  assert.equal(newAccount.knowledgeGaps.length, 0);
  assert.equal(newAccount.conversations.length, 0);
  assert.equal(newAccount.gamification.points, 0);
  assert.equal(newAccount.gamification.level, 1);

  // Verify Alex Morgan (student_1) data remains completely intact and isolated
  const alexAccount = db.accounts['student_1'];
  assert.ok(alexAccount !== undefined);
  assert.equal(alexAccount.student.name, 'Alex Morgan');
  assert.ok(alexAccount.student.overallMastery > 0);
  assert.ok(alexAccount.subjects.length >= 4);
  assert.ok(alexAccount.conversations.length > 0);

  // Switch between profiles and verify independence
  db.switchAccount(newAccount.student.id);
  assert.equal(db.student.name, 'Priya Sharma');
  assert.equal(db.subjects.length, 1);

  db.switchAccount('student_1');
  assert.equal(db.student.name, 'Alex Morgan');
  assert.ok(db.subjects.length >= 4);

  // Cleanup test account
  db.deleteProfile(newAccount.student.id);
});

