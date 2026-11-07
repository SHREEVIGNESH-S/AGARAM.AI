import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/server/db';
import { askTutor, generateAiSummary } from './src/server/ai';
import {
  calculateSpacedRepetitionInterval,
  detectKnowledgeGap,
  evaluateTopicMastery,
  hindsightReflection,
} from './src/utils/adaptiveLearning';
import {
  validateHindsightConnection,
  getHindsightStatus,
  retainLearningObservation,
  recallStudentMemories,
  reflectStudentLearning,
  testHindsightIntegration,
  getStudentBankId,
} from './src/server/hindsight';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize and validate Hindsight connection in background
validateHindsightConnection().catch(err => {
  console.warn('[Hindsight] Startup validation warning:', err?.message || err);
});

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Student Profile & Dashboard
app.get('/api/student/dashboard', (_req: Request, res: Response) => {
  const nextUpTopic = db.topics['cs']?.find(t => t.id === 'cs-05') || db.topics['cs']?.[0];

  res.json({
    student: db.student,
    stats: {
      studyStreakDays: db.student.studyStreakDays,
      revisionDueCount: db.revisionSchedule.filter(r => r.duePeriod === 'Today' && r.status === 'Pending').length,
      assignmentsCount: db.student.assignmentsCount,
      studySessionsCount: db.student.studySessionsCount,
      nextExamDate: db.student.nextExamDate,
      overallMastery: db.student.overallMastery,
      knowledgeGapsCount: db.knowledgeGaps.filter(g => !g.cleared).length,
    },
    subjects: db.subjects.filter(s => !s.isArchived),
    nextUp: nextUpTopic ? {
      title: nextUpTopic.title.replace(/^\d+\.\s*/, ''),
      subject: 'Computer Science',
      subjectId: 'cs',
      topicId: nextUpTopic.id,
      description: nextUpTopic.description,
      masteryPercentage: nextUpTopic.masteryPercentage,
    } : null,
    aiInsight: 'You understand new concepts fastest when explanations include visual memory-address maps and a worked example. Add more practice in Mathematics to close the quadratic roots gap.',
    recommendedFocus: {
      subject: 'Computer Science',
      topic: 'Pointer Arithmetic & Memory Bounds',
      reason: 'Accuracy dropped to 50% in recent assessment despite high confidence rating.',
      action: 'Start 5-minute memory trace exercise',
    },
    gamification: {
      points: db.gamification.points,
      level: db.gamification.level,
      nextLevelPoints: db.gamification.nextLevelPoints,
    },
  });
});

// Multi-Profile Management (Requirements 4, 5, 6)
app.get('/api/profiles', (_req: Request, res: Response) => {
  res.json(db.getAllProfiles());
});

app.post('/api/profiles/switch', (req: Request, res: Response) => {
  const { profileId } = req.body;
  if (!profileId) return res.status(400).json({ error: 'Profile ID required' });
  const switched = db.switchAccount(profileId);
  if (!switched) return res.status(404).json({ error: 'Profile not found' });
  res.json({ success: true, activeProfile: switched.student });
});

app.post('/api/profiles', (req: Request, res: Response) => {
  const newAccount = db.createProfile(req.body);
  res.status(201).json({ success: true, profile: newAccount.student });
});

app.put('/api/profiles/:id', (req: Request, res: Response) => {
  const updated = db.updateStudentProfile(req.body, req.params.id);
  res.json({ success: true, profile: updated });
});

app.delete('/api/profiles/:id', (req: Request, res: Response) => {
  const success = db.deleteProfile(req.params.id);
  if (!success) {
    return res.status(400).json({ error: 'Cannot delete the only remaining profile or profile not found' });
  }
  res.json({ success: true, activeProfile: db.student });
});

app.get('/api/student/profile', (_req: Request, res: Response) => {
  res.json(db.student);
});

app.put('/api/student/profile', (req: Request, res: Response) => {
  const updated = db.updateStudentProfile(req.body);
  res.json(updated);
});

// Authentication (Registration & Login)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const newAccount = db.createProfile(req.body);
  res.json({
    success: true,
    student: newAccount.student,
    token: `agaram_jwt_${Date.now()}`,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, profileId } = req.body;
  if (profileId) {
    db.switchAccount(profileId);
  } else if (email) {
    // Find account by email or update current
    const found = Object.values(db.accounts).find(a => a.student.email === email);
    if (found) {
      db.switchAccount(found.student.id);
    } else {
      db.student.email = email;
    }
  }
  res.json({
    success: true,
    student: db.student,
    token: `agaram_jwt_${Date.now()}`,
  });
});

// Subjects CRUD
app.get('/api/subjects', (_req: Request, res: Response) => {
  res.json(db.subjects.filter(s => !s.isArchived));
});

app.post('/api/subjects', (req: Request, res: Response) => {
  const { name, educationLevel, classOrCourse, syllabus, description, learningGoals } = req.body;
  const newSubject = {
    id: `subj_${Date.now()}`,
    name: name || 'Untitled Subject',
    educationLevel: educationLevel || db.student.educationLevel,
    classOrCourse: classOrCourse || 'General Course',
    syllabus: syllabus || '',
    description: description || 'Personal learning track',
    learningGoals: learningGoals || [],
    totalTopics: 1,
    masteredTopics: 0,
    masteryPercentage: 0,
    lastStudiedDate: 'Just now',
    lastStudiedFormatted: 'Just now',
    monthlyProgress: 0,
    practiceScore: 0,
  };
  db.subjects.push(newSubject);
  db.topics[newSubject.id] = [
    {
      id: `${newSubject.id}-01`,
      subjectId: newSubject.id,
      order: 1,
      title: '01. Foundational Concepts',
      description: 'Introductory axioms, definitions, and core mental models.',
      status: 'In Progress',
      masteryPercentage: 10,
      practiceScore: 0,
      confidenceRating: 3,
      lastStudiedDate: 'Just now',
    },
  ];
  db.addXp(50, `Created Subject: ${newSubject.name}`);
  res.status(201).json(newSubject);
});

app.get('/api/subjects/:id', (req: Request, res: Response) => {
  const subject = db.subjects.find(s => s.id === req.params.id);
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  const topics = db.topics[subject.id] || [];
  res.json({ ...subject, topics });
});

app.put('/api/subjects/:id', (req: Request, res: Response) => {
  const idx = db.subjects.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Subject not found' });
  db.subjects[idx] = { ...db.subjects[idx], ...req.body };
  res.json(db.subjects[idx]);
});

app.delete('/api/subjects/:id', (req: Request, res: Response) => {
  const idx = db.subjects.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Subject not found' });
  const deleted = db.subjects.splice(idx, 1)[0];
  delete db.topics[req.params.id];
  res.json({ success: true, deleted });
});

// Subject Workspace & Learning Path
app.get('/api/subjects/:id/learning-path', (req: Request, res: Response) => {
  const subject = db.subjects.find(s => s.id === req.params.id);
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  const topics = db.topics[subject.id] || [];
  res.json({
    subject,
    topics,
    stats: {
      masteryPercentage: subject.masteryPercentage,
      masteredTopics: topics.filter(t => t.status === 'Mastered').length,
      totalTopics: topics.length,
      practiceScore: subject.practiceScore,
      monthlyProgress: subject.monthlyProgress,
    },
  });
});

// Learning Events & Topic Completion
app.post('/api/learning/events', (req: Request, res: Response) => {
  const { subjectId, topicId, type, notes } = req.body;
  const event = db.recordLearningEvent({ subjectId, topicId, type, notes });
  res.status(201).json(event);
});

app.post('/api/learning/complete', (req: Request, res: Response) => {
  const { subjectId, topicId } = req.body;
  const topics = db.topics[subjectId];
  if (topics) {
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      topic.status = 'Mastered';
      topic.masteryPercentage = Math.max(topic.masteryPercentage, 90);
      topic.lastStudiedDate = 'Just now';
    }
    // Update subject mastery
    const subject = db.subjects.find(s => s.id === subjectId);
    if (subject) {
      const mastered = topics.filter(t => t.status === 'Mastered').length;
      subject.masteredTopics = mastered;
      subject.masteryPercentage = Math.round((mastered / topics.length) * 100);
      subject.lastStudiedDate = 'Just now';
      subject.lastStudiedFormatted = 'Just now';

      // Retain meaningful educational mastery event in Hindsight Cloud Memory
      if (topic) {
        retainLearningObservation(db.student.id, {
          text: `Mastered topic "${topic.title}" in ${subject.name} with ${topic.masteryPercentage}% mastery. Concept progression unlocked.`,
          context: `Learning Path Mastery - ${subject.name}`,
          subject: subject.name,
          topic: topic.title,
          classification: 'observed',
          tags: [subject.name, 'Topic Mastery'],
        }).catch(err => console.warn('[Hindsight] Topic mastery retain failed:', err));
      }
    }
  }
  db.addXp(75, 'Completed Learning Lesson');
  res.json({ success: true, pointsEarned: 75 });
});

// AI Tutor Conversations Management (Requirement 3, 5, 6)
app.get('/api/ai/conversations', (req: Request, res: Response) => {
  const { subjectId, search, archived } = req.query;
  let convs = db.getConversations();

  if (subjectId && typeof subjectId === 'string' && subjectId !== 'all') {
    convs = convs.filter(c => c.subjectId === subjectId);
  }
  if (archived === 'true') {
    convs = convs.filter(c => c.isArchived);
  } else if (archived === 'false' || archived === undefined) {
    convs = convs.filter(c => !c.isArchived);
  }
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase().trim();
    convs = convs.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.lastMessagePreview.toLowerCase().includes(q) ||
      (c.topicTitle && c.topicTitle.toLowerCase().includes(q))
    );
  }
  res.json(convs);
});

app.post('/api/ai/conversations', async (req: Request, res: Response) => {
  const { subjectId, topicId, topicTitle, title, isStructuredLesson } = req.body;
  const subject = db.subjects.find(s => s.id === subjectId) || db.subjects[0];
  const activeTopic = topicId ? db.topics[subject.id]?.find(t => t.id === topicId) : undefined;
  const resolvedTopicTitle = activeTopic?.title || topicTitle;

  let initialMessage: string | undefined;

  // If structured lesson, ask AI Tutor to generate the introductory concept overview & check question
  if (isStructuredLesson) {
    const tutorIntro = await askTutor({
      message: 'START_STRUCTURED_LESSON',
      subject: subject.name,
      topic: resolvedTopicTitle,
      controls: {
        explanationStyle: 'Visual',
        difficulty: 'Intermediate',
        contextMemory: true,
        responseLength: 'Medium',
      },
      isStructuredLesson: true,
    });
    initialMessage = tutorIntro.text;
  }

  const newConv = db.createConversation({
    subjectId: subject.id,
    topicId: activeTopic?.id || topicId,
    topicTitle: resolvedTopicTitle,
    title,
    isStructuredLesson: Boolean(isStructuredLesson),
    initialMessage,
  });

  res.status(201).json(newConv);
});

app.get('/api/ai/conversations/:id', (req: Request, res: Response) => {
  const conv = db.getConversation(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  res.json(conv);
});

app.put('/api/ai/conversations/:id', (req: Request, res: Response) => {
  const updated = db.updateConversation(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Conversation not found' });
  res.json(updated);
});

app.delete('/api/ai/conversations/:id', (req: Request, res: Response) => {
  const success = db.deleteConversation(req.params.id);
  if (!success) return res.status(404).json({ error: 'Conversation not found' });
  res.json({ success: true });
});

app.post('/api/ai/conversations/:id/messages', async (req: Request, res: Response) => {
  const conv = db.getConversation(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });

  const { message, controls, attachments } = req.body;
  const subject = db.subjects.find(s => s.id === conv.subjectId) || db.subjects[0];
  const activeTopic = conv.topicId ? db.topics[subject.id]?.find(t => t.id === conv.topicId) : undefined;

  // 1. Record student message with attachments
  const studentMsg = {
    id: `msg-${Date.now()}-u`,
    sender: 'student' as const,
    text: message || (attachments?.length ? `[Uploaded ${attachments.length} attachment(s)]` : ''),
    timestamp: 'Just now',
    attachments: attachments || [],
  };

  // Collect history prior to adding the new message
  const conversationHistory = (conv.messages || []).slice(-10).map(m => ({
    sender: m.sender,
    text: m.text,
  }));

  db.addMessageToConversation(conv.id, studentMsg);

  // 2. Retrieve memories & document contexts (check HINDSIGHT_ENABLED flag)
  const studentId = db.student.id;
  const hindsightEnabled = process.env.HINDSIGHT_ENABLED !== 'false' && Boolean(process.env.HINDSIGHT_API_KEY);
  let hindsightPrompt = '';
  let recalledHindsightMemories: Array<{ text: string; score?: number; type?: string }> = [];

  if (hindsightEnabled) {
    const memoryQuery = message || activeTopic?.title || subject.name;
    const recalled = await recallStudentMemories(
      studentId,
      memoryQuery,
      { subject: subject.name, topic: activeTopic?.title }
    );
    hindsightPrompt = recalled.formattedPrompt;
    recalledHindsightMemories = recalled.results;
  }

  const relevantMemories = db.memories
    .filter(m => m.subjectName.toLowerCase().includes(subject.name.toLowerCase()))
    .map(m => `${m.topicTitle}: ${m.observation} [${m.actionableInsight}]`);

  const documentSnippets = db.documents
    .filter(d => d.subjectId === subject.id)
    .map(d => `${d.fileName}: ${d.extractedSnippet}`);

  // 3. Ask AI Tutor with attachments, multimodal context, conversation history, and Hindsight Cloud memory
  const tutorReply = await askTutor({
    message: message || 'Please analyze the attached document or image and explain its core academic concept.',
    subject: subject.name,
    topic: activeTopic?.title || conv.topicTitle,
    controls: controls || {
      explanationStyle: 'Visual',
      difficulty: 'Intermediate',
      contextMemory: true,
      responseLength: 'Medium',
    },
    attachments: attachments || [],
    isStructuredLesson: conv.isStructuredLesson,
    memoryInsights: relevantMemories,
    hindsightCloudContext: hindsightPrompt,
    documentSnippets,
    history: conversationHistory,
    educationLevel: db.student.educationLevel,
  });

  const aiMsg = {
    id: `msg-${Date.now()}-ai`,
    sender: 'agaram' as const,
    text: tutorReply.text,
    codeSnippet: tutorReply.codeSnippet,
    codeLanguage: tutorReply.codeLanguage || 'cpp',
    suggestedActions: tutorReply.suggestedActions,
    relatedConcepts: tutorReply.relatedConcepts,
    timestamp: 'Just now',
    explanationStyleUsed: controls?.explanationStyle || 'Visual',
  };

  db.addMessageToConversation(conv.id, aiMsg);

  // Record learning event & reward XP
  db.recordLearningEvent({
    subjectId: subject.id,
    topicId: activeTopic?.id || 'general',
    type: 'question_asked',
    notes: (message || 'Attached document question').slice(0, 100),
  });

  // Asynchronously retain meaningful educational observation in Hindsight Cloud if enabled
  if (hindsightEnabled) {
    retainLearningObservation(studentId, {
      text: `Student asked: "${(message || 'Attached document analysis').slice(0, 120)}". Topic: ${activeTopic?.title || conv.topicTitle || subject.name}. Explanation style: ${controls?.explanationStyle || 'Visual'}. Key concepts: ${(tutorReply.relatedConcepts || []).slice(0, 3).join(', ')}.`,
      context: `${subject.name} - ${activeTopic?.title || conv.topicTitle || 'Doubt Session'}`,
      subject: subject.name,
      topic: activeTopic?.title || conv.topicTitle,
      classification: 'observed',
      tags: [subject.name, 'AI Tutor Q&A'],
    }).catch(err => console.warn('[Hindsight] Background retain error:', err));
  }

  db.addXp(15, 'Engaged with AI Tutor');

  res.json({
    conversation: conv,
    studentMessage: studentMsg,
    aiMessage: aiMsg,
    message: aiMsg,
    audioScript: tutorReply.audioScript || tutorReply.text,
    hindsightRecalledCount: recalledHindsightMemories.length,
    hindsightBankId: getStudentBankId(studentId),
  });
});

// Backwards compatibility endpoint with explicit HINDSIGHT_ENABLED check
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { subjectId, topicId, message, controls, attachments, conversationId, history: clientHistory } = req.body;
  const subject = db.subjects.find(s => s.id === subjectId) || db.subjects[0];
  const activeTopic = topicId ? db.topics[subject.id]?.find(t => t.id === topicId) : undefined;

  const studentId = db.student.id;
  // Check HINDSIGHT_ENABLED flag
  const hindsightEnabled = process.env.HINDSIGHT_ENABLED !== 'false' && Boolean(process.env.HINDSIGHT_API_KEY);
  let hindsightPrompt = '';
  let recalledHindsightMemories: Array<{ text: string; score?: number; type?: string }> = [];

  if (hindsightEnabled) {
    const memoryQuery = message || activeTopic?.title || subject.name;
    const recalled = await recallStudentMemories(
      studentId,
      memoryQuery,
      { subject: subject.name, topic: activeTopic?.title }
    );
    hindsightPrompt = recalled.formattedPrompt;
    recalledHindsightMemories = recalled.results;
  }

  const relevantMemories = db.memories
    .filter(m => m.subjectName.toLowerCase().includes(subject.name.toLowerCase()))
    .map(m => `${m.topicTitle}: ${m.observation} [${m.actionableInsight}]`);

  const documentSnippets = db.documents
    .filter(d => d.subjectId === subject.id)
    .map(d => `${d.fileName}: ${d.extractedSnippet}`);

  let history = clientHistory;
  if (!history && conversationId) {
    const conv = db.getConversation(conversationId);
    if (conv) {
      history = (conv.messages || []).slice(-10).map(m => ({ sender: m.sender, text: m.text }));
    }
  }

  const tutorReply = await askTutor({
    message,
    subject: subject.name,
    topic: activeTopic?.title,
    controls: controls || {
      explanationStyle: 'Visual',
      difficulty: 'Intermediate',
      contextMemory: true,
      responseLength: 'Medium',
    },
    attachments: attachments || [],
    memoryInsights: relevantMemories,
    hindsightCloudContext: hindsightPrompt,
    documentSnippets,
    history,
    educationLevel: db.student.educationLevel,
  });

  const aiMsg = {
    id: `msg-${Date.now()}-ai`,
    sender: 'agaram' as const,
    text: tutorReply.text,
    codeSnippet: tutorReply.codeSnippet,
    codeLanguage: tutorReply.codeLanguage || 'cpp',
    suggestedActions: tutorReply.suggestedActions,
    relatedConcepts: tutorReply.relatedConcepts,
    timestamp: 'Just now',
    explanationStyleUsed: controls?.explanationStyle || 'Visual',
  };

  db.recordLearningEvent({
    subjectId: subject.id,
    topicId: activeTopic?.id || 'general',
    type: 'question_asked',
    notes: (message || '').slice(0, 100),
  });

  // Retain observation asynchronously in Hindsight Cloud if enabled
  if (hindsightEnabled) {
    retainLearningObservation(studentId, {
      text: `Student asked: "${(message || '').slice(0, 120)}". Topic: ${activeTopic?.title || subject.name}. Explanation style: ${controls?.explanationStyle || 'Visual'}.`,
      context: `${subject.name} - ${activeTopic?.title || 'General Chat'}`,
      subject: subject.name,
      topic: activeTopic?.title,
      classification: 'observed',
      tags: [subject.name, 'AI Tutor Chat'],
    }).catch(err => console.warn('[Hindsight] Background retain error:', err));
  }

  db.addXp(15, 'Engaged with AI Tutor');

  res.json({
    message: aiMsg,
    audioScript: tutorReply.audioScript || tutorReply.text,
    memoryUsedCount: relevantMemories.length,
    hindsightRecalledCount: recalledHindsightMemories.length,
    hindsightBankId: getStudentBankId(studentId),
  });
});

// AI Study Summary
app.post('/api/ai/summary', async (req: Request, res: Response) => {
  const { subject, topic, difficulty, includeExamples, includeKeyTerms } = req.body;
  const generated = await generateAiSummary({
    subject: subject || 'Computer Science',
    topic: topic || 'Pointers',
    difficulty: difficulty || 'Intermediate',
    includeExamples: includeExamples ?? true,
    includeKeyTerms: includeKeyTerms ?? true,
  });

  const newSummary = {
    id: `sum-${Date.now()}`,
    subject: subject || 'Computer Science',
    topic: topic || 'Pointers',
    difficulty: difficulty || 'Intermediate',
    content: generated.content,
    keyIdeas: generated.keyIdeas || [],
    commonMistakes: generated.commonMistakes || [],
    workedExample: generated.workedExample,
    practiceQuestions: generated.practiceQuestions,
    createdAt: 'Just now',
  };

  db.summaries.unshift(newSummary);
  db.addXp(40, `Synthesized Study Summary: ${newSummary.topic}`);
  res.json(newSummary);
});

app.get('/api/summaries', (_req: Request, res: Response) => {
  res.json(db.summaries);
});

// Assessments & Results
app.get('/api/assessments', (_req: Request, res: Response) => {
  res.json(db.assessments);
});

app.get('/api/assessments/:id/results', (req: Request, res: Response) => {
  const assessment = db.assessments.find(a => a.id === req.params.id);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
  res.json(assessment);
});

app.post('/api/assessments/:id/submit', (req: Request, res: Response) => {
  const assessment = db.assessments.find(a => a.id === req.params.id);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

  const { answers, timeSpentSeconds, selfConfidenceRating } = req.body;
  // Calculate score
  let correctCount = 0;
  assessment.questions.forEach((q, idx) => {
    const studentAns = answers[q.id] ?? answers[idx];
    if (studentAns !== undefined && String(studentAns) === String(q.correctAnswer)) {
      correctCount += 1;
    }
  });

  const totalQuestions = assessment.questions.length;
  const accuracyPercentage = Math.round((correctCount / totalQuestions) * 100);

  // Knowledge gap detection
  const gapAnalysis = detectKnowledgeGap(selfConfidenceRating || 4, accuracyPercentage);
  if (gapAnalysis.isGap) {
    db.knowledgeGaps.unshift({
      id: `gap-${Date.now()}`,
      subject: assessment.subject,
      topicId: assessment.topic,
      conceptName: `${assessment.topic} (Assessment Result)`,
      severity: gapAnalysis.severity === 'high' ? 'High' : gapAnalysis.severity === 'medium' ? 'Medium' : 'Low',
      evidence: `Scored ${correctCount}/${totalQuestions} (${accuracyPercentage}%) while indicating high confidence (${selfConfidenceRating}/5).`,
      confidenceVsAccuracy: `Confidence: ${selfConfidenceRating}/5 | Accuracy: ${accuracyPercentage}% (Gap: ${gapAnalysis.delta}%)`,
      recommendedAction: gapAnalysis.recommendation,
      cleared: false,
      detectedDate: 'Just now',
    });
  }

  assessment.completed = true;
  assessment.score = correctCount * 2;
  assessment.accuracyPercentage = accuracyPercentage;
  assessment.timeSpentSeconds = timeSpentSeconds || 320;
  assessment.confidenceGapPercentage = Math.max(0, gapAnalysis.delta);
  assessment.completedAt = 'Just now';
  assessment.topicBreakdown = [
    { topic: `${assessment.topic} Foundations`, scorePercentage: accuracyPercentage },
    { topic: 'Application & Tracing', scorePercentage: Math.max(20, accuracyPercentage - 10) },
  ];
  assessment.recommendedActions = [
    accuracyPercentage >= 80 ? 'Well done! Maintain retention with a 3-day spaced review.' : 'Review core misconceptions in AI Tutor.',
    'Test with flash questions in tomorrow revision queue.',
  ];

  // Retain assessment performance & knowledge gap in Hindsight Cloud Memory
  retainLearningObservation(db.student.id, {
    text: `Assessment "${assessment.title}" (${assessment.subject}): Scored ${correctCount}/${totalQuestions} (${accuracyPercentage}%). Confidence rating: ${selfConfidenceRating || 3}/5.${gapAnalysis.isGap ? ` Knowledge gap detected in "${assessment.topic}": ${gapAnalysis.recommendation}` : ' Demonstrated solid mastery.'}`,
    context: `Assessment - ${assessment.subject}`,
    subject: assessment.subject,
    topic: assessment.topic,
    classification: gapAnalysis.isGap ? 'gap' : 'observed',
    tags: [assessment.subject, 'Assessment Result'],
  }).catch(err => console.warn('[Hindsight] Assessment retain failed:', err));

  // Award XP based on accuracy
  const xpEarned = accuracyPercentage === 100 ? 150 : accuracyPercentage >= 70 ? 100 : 50;
  db.addXp(xpEarned, `Completed Assessment: ${assessment.title} (${accuracyPercentage}%)`);

  res.json({
    success: true,
    assessment,
    gapDetected: gapAnalysis.isGap,
    xpEarned,
  });
});

// Memory Insights (Hindsight Memory: Retain, Reflect, Recall)
app.get('/api/memory/insights', (_req: Request, res: Response) => {
  const reflection = hindsightReflection(
    db.learningEvents.map(e => ({
      ...e,
      id: e.id,
      timestamp: e.timestamp,
      subjectId: e.subjectId,
      topicId: e.topicId,
      type: e.type as any,
    }))
  );

  const hindsightStatus = getHindsightStatus(db.student.id);

  res.json({
    memories: db.memories,
    reflections: {
      patterns: reflection.patterns,
      insights: reflection.insights,
      suggestedAction: reflection.suggestedAction,
    },
    whatTutorLearned: [
      'You understand new concepts faster when explanations include visual memory-address maps and a worked example.',
      'Recent pattern: pointer and array mistakes occur when tracing memory offsets and index boundaries.',
      'Worked examples in Mathematics immediately elevate equation accuracy from 50% to 85%.',
    ],
    hindsight: hindsightStatus,
  });
});

app.delete('/api/memory/:id', (req: Request, res: Response) => {
  db.memories = db.memories.filter(m => m.id !== req.params.id);
  res.json({ success: true });
});

app.post('/api/memory/clear', (_req: Request, res: Response) => {
  db.memories = [];
  res.json({ success: true, message: 'Learning history cleared' });
});

// Hindsight Cloud Memory Dedicated Endpoints
app.get('/api/hindsight/status', (_req: Request, res: Response) => {
  const status = getHindsightStatus(db.student.id);
  res.json(status);
});

app.get('/api/hindsight/test', async (_req: Request, res: Response) => {
  try {
    const testResults = await testHindsightIntegration();
    res.json(testResults);
  } catch (err: any) {
    res.status(500).json({ allPassed: false, error: err?.message || String(err) });
  }
});

app.post('/api/hindsight/retain', async (req: Request, res: Response) => {
  const { text, context, subject, topic, classification, tags } = req.body;
  if (!text) return res.status(400).json({ error: 'Observation text is required' });

  const result = await retainLearningObservation(db.student.id, {
    text,
    context,
    subject,
    topic,
    classification,
    tags,
  });
  res.json(result);
});

app.post('/api/hindsight/reflect', async (req: Request, res: Response) => {
  const { query, context } = req.body;
  const result = await reflectStudentLearning(
    db.student.id,
    query || 'What are the student\'s strongest areas, recurrent misconceptions, and recommended adaptive pedagogical actions?',
    context || 'AGARAM Cross-Session Cognitive Synthesis'
  );
  res.json(result);
});

// Smart Revision (Spaced Repetition)
app.get('/api/revision/schedule', (_req: Request, res: Response) => {
  res.json({
    dueToday: db.revisionSchedule.filter(r => r.duePeriod === 'Today'),
    thisWeek: db.revisionSchedule.filter(r => r.duePeriod !== 'Today'),
    recoveredCount: 3,
  });
});

app.post('/api/revision/complete', (req: Request, res: Response) => {
  const { id, performanceRating } = req.body;
  const item = db.revisionSchedule.find(r => r.id === id);
  if (!item) return res.status(404).json({ error: 'Revision item not found' });

  const nextInterval = calculateSpacedRepetitionInterval(
    item.consecutiveRecallCount,
    item.currentIntervalDays,
    performanceRating || 'good'
  );

  item.status = 'Completed';
  item.currentIntervalDays = nextInterval;
  item.consecutiveRecallCount += 1;
  item.duePeriod = nextInterval <= 1 ? 'Tomorrow' : nextInterval <= 3 ? 'Friday' : 'This Week';
  item.lastReviewedDate = 'Just now';

  // Retain spaced repetition revision progress in Hindsight Cloud
  retainLearningObservation(db.student.id, {
    text: `Completed spaced repetition review for "${item.conceptName}" (${item.subject}). Performance: ${performanceRating || 'good'}. New interval: ${nextInterval} days (recall count: ${item.consecutiveRecallCount}).`,
    context: `Spaced Repetition Review - ${item.subject}`,
    subject: item.subject,
    topic: item.conceptName,
    classification: 'observed',
    tags: [item.subject, 'Revision Review'],
  }).catch(err => console.warn('[Hindsight] Revision retain failed:', err));

  db.addXp(35, `Completed Revision: ${item.conceptName}`);
  res.json({ success: true, nextIntervalDays: nextInterval, item });
});

app.post('/api/revision/postpone', (req: Request, res: Response) => {
  const { id } = req.body;
  const item = db.revisionSchedule.find(r => r.id === id);
  if (!item) return res.status(404).json({ error: 'Revision item not found' });
  item.duePeriod = 'Tomorrow';
  res.json({ success: true, item });
});

// Knowledge Gaps
app.get('/api/knowledge-gaps', (_req: Request, res: Response) => {
  res.json({
    gaps: db.knowledgeGaps,
    activeCount: db.knowledgeGaps.filter(g => !g.cleared).length,
    clearedCount: db.knowledgeGaps.filter(g => g.cleared).length,
  });
});

app.post('/api/knowledge-gaps/resolve', (req: Request, res: Response) => {
  const { id } = req.body;
  const gap = db.knowledgeGaps.find(g => g.id === id);
  if (!gap) return res.status(404).json({ error: 'Gap not found' });
  gap.cleared = true;
  db.addXp(50, `Cleared Knowledge Gap: ${gap.conceptName}`);
  res.json({ success: true, gap });
});

// Uploaded Documents
app.get('/api/documents', (_req: Request, res: Response) => {
  res.json(db.documents);
});

app.post('/api/documents/upload', (req: Request, res: Response) => {
  const { fileName, fileType, subjectId, textContent, fileSize } = req.body;
  const newDoc = {
    id: `doc-${Date.now()}`,
    fileName: fileName || 'Uploaded_Notes.pdf',
    fileType: fileType || 'PDF',
    subjectId: subjectId || 'cs',
    uploadedAt: 'Just now',
    fileSizeFormatted: fileSize || '1.2 MB',
    chunkCount: Math.max(3, Math.ceil((textContent?.length || 500) / 400)),
    extractedSnippet: textContent?.slice(0, 300) || 'Verified student learning notes extracted and vectorized for AI Tutor context.',
  };
  db.documents.unshift(newDoc);
  db.addXp(30, `Uploaded Learning Material: ${newDoc.fileName}`);
  res.status(201).json(newDoc);
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  db.documents = db.documents.filter(d => d.id !== req.params.id);
  res.json({ success: true });
});

// Collaborative Study Groups
app.get('/api/groups', (_req: Request, res: Response) => {
  res.json(db.studyGroups);
});

app.post('/api/groups', (req: Request, res: Response) => {
  const { name, subject, description, meetingTime } = req.body;
  const newGroup = {
    id: `group-${Date.now()}`,
    name: name || 'Untitled Study Group',
    subject: subject || 'General',
    description: description || 'Peer collaborative learning circle.',
    iconName: 'Users',
    memberCount: 1,
    isMember: true,
    meetingTime: meetingTime || 'Weekly online check-in',
    sharedDocumentIds: [],
    questions: [],
    createdAt: 'Just now',
  };
  db.studyGroups.unshift(newGroup);
  db.addXp(60, `Created Study Group: ${newGroup.name}`);
  res.status(201).json(newGroup);
});

app.post('/api/groups/:id/join', (req: Request, res: Response) => {
  const group = db.studyGroups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  group.isMember = true;
  group.memberCount += 1;
  db.addXp(25, `Joined Study Group: ${group.name}`);
  res.json({ success: true, group });
});

app.post('/api/groups/:id/leave', (req: Request, res: Response) => {
  const group = db.studyGroups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  group.isMember = false;
  group.memberCount = Math.max(1, group.memberCount - 1);
  res.json({ success: true, group });
});

app.post('/api/groups/:id/questions', (req: Request, res: Response) => {
  const group = db.studyGroups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const { title, content, topicName, tags } = req.body;
  const newQuestion = {
    id: `q-grp-${Date.now()}`,
    groupId: group.id,
    authorName: db.student.name,
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    title: title || 'Discussion Question',
    content: content || '',
    subject: group.subject,
    topicName: topicName || 'General',
    createdAt: 'Just now',
    answers: [],
    tags: tags || ['discussion'],
  };
  group.questions.unshift(newQuestion);
  db.addXp(20, 'Posted question in study group');
  res.status(201).json(newQuestion);
});

app.post('/api/groups/:id/questions/:qId/answers', (req: Request, res: Response) => {
  const group = db.studyGroups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const question = group.questions.find(q => q.id === req.params.qId);
  if (!question) return res.status(404).json({ error: 'Question not found' });

  const { content } = req.body;
  const newAnswer = {
    id: `ans-${Date.now()}`,
    questionId: question.id,
    authorName: db.student.name,
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    content: content || '',
    createdAt: 'Just now',
    upvotes: 0,
    hasUpvoted: false,
  };
  question.answers.push(newAnswer);
  db.addXp(30, 'Contributed answer to group question');
  res.status(201).json(newAnswer);
});

app.post('/api/groups/:id/answers/:aId/upvote', (req: Request, res: Response) => {
  const group = db.studyGroups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  for (const q of group.questions) {
    const ans = q.answers.find(a => a.id === req.params.aId);
    if (ans) {
      if (ans.hasUpvoted) {
        ans.upvotes = Math.max(0, ans.upvotes - 1);
        ans.hasUpvoted = false;
      } else {
        ans.upvotes += 1;
        ans.hasUpvoted = true;
        db.addXp(5, 'Upvoted helpful peer answer');
      }
      return res.json({ success: true, answer: ans });
    }
  }
  res.status(404).json({ error: 'Answer not found' });
});

// Gamification & Leaderboard
app.get('/api/gamification', (_req: Request, res: Response) => {
  res.json({
    gamification: db.gamification,
    leaderboard: db.leaderboard,
  });
});

app.post('/api/gamification/add-xp', (req: Request, res: Response) => {
  const { points, reason } = req.body;
  db.addXp(points || 10, reason || 'Study activity');
  res.json(db.gamification);
});

// Analytics Overview
app.get('/api/analytics/overview', (_req: Request, res: Response) => {
  res.json({
    overallMastery: db.student.overallMastery,
    consistencyScore: db.student.consistencyScore,
    questionAttempts: db.student.questionAttempts,
    averageStudyDurationMinutes: db.student.averageStudyDurationMinutes,
    studyStreakDays: db.student.studyStreakDays,
    subjects: db.subjects.map(s => ({
      name: s.name,
      mastery: s.masteryPercentage,
      progress: s.monthlyProgress,
      practiceScore: s.practiceScore,
    })),
    retentionCurve: [
      { day: 'Day 1', retention: 100 },
      { day: 'Day 2', retention: 82 },
      { day: 'Day 4', retention: 76 },
      { day: 'Day 7', retention: 91 }, // Boosted by spaced repetition
      { day: 'Day 14', retention: 88 },
    ],
  });
});

// Mount Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AGARAM Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
