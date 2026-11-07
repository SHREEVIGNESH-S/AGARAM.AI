import {
  StudentProfile,
  Subject,
  Topic,
  MemoryRecord,
  KnowledgeGap,
  RevisionItem,
  Assessment,
  ChatMessage,
  UploadedDocument,
  StudySummary,
  StudyGroup,
  GroupQuestion,
  GroupAnswer,
  Badge,
  LeaderboardEntry,
  GamificationState,
  Conversation,
  ChatAttachment,
} from '../types';

export interface StudentAccountData {
  student: StudentProfile;
  subjects: Subject[];
  topics: Record<string, Topic[]>;
  memories: MemoryRecord[];
  knowledgeGaps: KnowledgeGap[];
  revisionSchedule: RevisionItem[];
  assessments: Assessment[];
  conversations: Conversation[];
  documents: UploadedDocument[];
  summaries: StudySummary[];
  studyGroups: StudyGroup[];
  gamification: GamificationState;
  learningEvents: Array<{
    id: string;
    timestamp: number;
    subjectId: string;
    topicId: string;
    type: string;
    notes?: string;
  }>;
}

function getDefaultBadges(): Badge[] {
  return [
    {
      id: 'badge-1',
      name: 'Mastered 10 Topics',
      description: 'Achieved 85%+ verified mastery across ten distinct curriculum topics.',
      icon: 'Award',
      unlocked: false,
      category: 'mastery',
    },
    {
      id: 'badge-2',
      name: 'Perfect Score',
      description: 'Scored 100% on any adaptive assessment or quick quiz without hint prompts.',
      icon: 'Sparkles',
      unlocked: false,
      category: 'assessment',
    },
    {
      id: 'badge-3',
      name: '7-Day Streak Warrior',
      description: 'Engaged with AGARAM for seven consecutive days without a missed revision.',
      icon: 'Flame',
      unlocked: false,
      category: 'streak',
    },
    {
      id: 'badge-4',
      name: 'Memory Master',
      description: 'Cleared 3 knowledge gaps through targeted spaced repetition sessions.',
      icon: 'Brain',
      unlocked: false,
      category: 'mastery',
    },
    {
      id: 'badge-5',
      name: 'Peer Helper',
      description: 'Posted an answer that received 10+ student upvotes in a collaborative study group.',
      icon: 'Users',
      unlocked: false,
      category: 'collaboration',
    },
    {
      id: 'badge-6',
      name: 'Night Owl Scholar',
      description: 'Completed 5 late-evening study and summary synthesis sessions.',
      icon: 'Moon',
      unlocked: false,
      category: 'streak',
    },
  ];
}

class AgaramDatabase {
  public activeStudentId: string = 'student_1';
  public accounts: Record<string, StudentAccountData> = {};
  public leaderboard: LeaderboardEntry[];
  public studentBankMapping: Record<string, string>;

  constructor() {
    // 1. Initialise Alex Morgan's rich baseline account (student_1)
    const alexProfile: StudentProfile = {
      id: 'student_1',
      name: 'Alex Morgan',
      email: 'alex.morgan@university.edu',
      educationLevel: 'undergraduate',
      institution: 'Institute of Science and Technology',
      courseOrGrade: 'B.Tech Computer Science & Engineering',
      preferredLanguage: 'English',
      timeZone: 'UTC+05:30',
      learningSince: 'September 2026',
      preferredFormat: 'Visual explanations with step-by-step memory diagrams',
      learningPace: 'Structured',
      strongestSubject: 'Computer Science',
      bestStudyWindow: 'Morning (08:00 AM - 11:30 AM)',
      studyStreakDays: 7,
      studySessionsCount: 24,
      assignmentsCount: 15,
      revisionDueCount: 4,
      nextExamDate: '14 | 11 | 2026',
      nextExamSubject: 'Computer Science & Mathematics',
      overallMastery: 76,
      knowledgeGapsCount: 3,
      consistencyScore: 92,
      questionAttempts: 142,
      skipFrequency: 'Low (4%)',
      averageStudyDurationMinutes: 45,
      strengths: [
        'Visual reasoning with pointer models',
        'Algorithm decomposition',
        'Mathematical induction',
      ],
      growthAreas: [
        'Pointer arithmetic & memory bounds',
        'Quadratic discriminant edge conditions',
        'Chemical stoichiometry balancing',
      ],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      voiceGender: 'female',
    };

    const alexSubjects: Subject[] = [
      {
        id: 'cs',
        name: 'Computer Science',
        iconName: 'Cpu',
        educationLevel: 'undergraduate',
        classOrCourse: 'CS-201 Data Structures & C++',
        syllabus: 'Memory allocation, Pointers, Arrays, Structs, OOP, Dynamic memory',
        description: 'A structured path through concepts, practice and mastery.',
        learningGoals: ['Master low-level memory pointers', 'Write leak-free C++ code', 'Understand cache locality'],
        totalTopics: 6,
        masteredTopics: 3,
        masteryPercentage: 74,
        lastStudiedDate: '3 days ago',
        lastStudiedFormatted: '3 days ago',
        monthlyProgress: 18,
        practiceScore: 82,
      },
      {
        id: 'math',
        name: 'Mathematics',
        iconName: 'Calculator',
        educationLevel: 'undergraduate',
        classOrCourse: 'MATH-102 Linear Algebra & Calculus',
        syllabus: 'Matrices, Eigenvalues, Quadratic systems, Integration by parts',
        description: 'Abstract algebraic foundations, analytical geometry, and calculus.',
        learningGoals: ['Solve systems of equations in under 2 mins', 'Master quadratic and complex roots'],
        totalTopics: 8,
        masteredTopics: 5,
        masteryPercentage: 78,
        lastStudiedDate: '2 hours ago',
        lastStudiedFormatted: '2h ago',
        monthlyProgress: 24,
        practiceScore: 88,
      },
      {
        id: 'chem',
        name: 'Chemistry',
        iconName: 'FlaskConical',
        educationLevel: 'undergraduate',
        classOrCourse: 'CHEM-101 Physical & Organic Chemistry',
        syllabus: 'Chemical bonding, Thermodynamics, Reaction kinetics, Hybridization',
        description: 'Molecular orbital theory, reaction mechanisms, and kinetics.',
        learningGoals: ['Understand covalent geometry', 'Predict reaction enthalpies'],
        totalTopics: 10,
        masteredTopics: 6,
        masteryPercentage: 82,
        lastStudiedDate: 'Yesterday',
        lastStudiedFormatted: 'Yesterday',
        monthlyProgress: 12,
        practiceScore: 79,
      },
      {
        id: 'phys',
        name: 'Physics',
        iconName: 'Atom',
        educationLevel: 'undergraduate',
        classOrCourse: 'PHYS-101 Mechanics & Electromagnetism',
        syllabus: 'Rotational dynamics, Wave optics, Gauss law, Maxwell equations',
        description: 'Classical mechanics, energy conservation, and electromagnetism.',
        learningGoals: ['Rigid body mechanics', 'Field lines and flux calculation'],
        totalTopics: 8,
        masteredTopics: 4,
        masteryPercentage: 65,
        lastStudiedDate: '2 days ago',
        lastStudiedFormatted: '2 days ago',
        monthlyProgress: 9,
        practiceScore: 71,
      },
    ];

    const alexTopics: Record<string, Topic[]> = {
      cs: [
        {
          id: 'cs-01',
          subjectId: 'cs',
          order: 1,
          title: '01. Programming Foundations',
          description: 'Variables, primitive types, memory footprints, and compilation pipeline.',
          status: 'Mastered',
          masteryPercentage: 96,
          practiceScore: 94,
          confidenceRating: 5,
          lastStudiedDate: '5 days ago',
          keyFormulasOrRules: ['sizeof(int) is 4 bytes on 64-bit systems', 'Stack memory is LIFO auto-allocated'],
        },
        {
          id: 'cs-02',
          subjectId: 'cs',
          order: 2,
          title: '02. Conditions and Loops',
          description: 'Branching logic, while/for iteration, break/continue jump control.',
          status: 'Mastered',
          masteryPercentage: 92,
          practiceScore: 90,
          confidenceRating: 5,
          lastStudiedDate: '4 days ago',
          keyFormulasOrRules: ['Always guarantee termination conditions', 'Loop invariants verify correctness'],
        },
        {
          id: 'cs-03',
          subjectId: 'cs',
          order: 3,
          title: '03. Functions',
          description: 'Call stacks, pass-by-value vs pass-by-reference, recursive frames.',
          status: 'Mastered',
          masteryPercentage: 88,
          practiceScore: 86,
          confidenceRating: 4,
          lastStudiedDate: '3 days ago',
          keyFormulasOrRules: ['Pass-by-const-ref `const T&` avoids expensive copies', 'Recursion requires base case'],
        },
        {
          id: 'cs-04',
          subjectId: 'cs',
          order: 4,
          title: '04. Arrays and Strings',
          description: 'Contiguous memory layout, 0-indexed bounds, null terminator \\0.',
          status: 'In Progress',
          masteryPercentage: 72,
          practiceScore: 75,
          confidenceRating: 4,
          lastStudiedDate: 'Yesterday',
          keyFormulasOrRules: ['Array index offset = base_addr + (index * sizeof(T))', 'C-strings terminate at \\0'],
        },
        {
          id: 'cs-05',
          subjectId: 'cs',
          order: 5,
          title: '05. Pointers',
          description: 'Memory addresses, * dereferencing, pointer arithmetic, dynamic heap allocation.',
          status: 'In Progress',
          masteryPercentage: 64,
          practiceScore: 68,
          confidenceRating: 3,
          lastStudiedDate: '3 days ago',
          keyFormulasOrRules: [
            'A pointer stores a memory address (e.g. 0x7ffd98)',
            'Dereferencing with *ptr fetches the value stored at address ptr',
            '&var extracts the address-of variable',
            'Always initialize pointers to nullptr if unassigned',
          ],
        },
        {
          id: 'cs-06',
          subjectId: 'cs',
          order: 6,
          title: '06. Object-Oriented Programming',
          description: 'Encapsulation, classes, constructors, vtables, and inheritance hierarchies.',
          status: 'Up Next',
          masteryPercentage: 25,
          practiceScore: 30,
          confidenceRating: 2,
          lastStudiedDate: '1 week ago',
          keyFormulasOrRules: ['Vtables enable runtime dynamic dispatch polymorphism'],
        },
      ],
      math: [
        {
          id: 'math-01',
          subjectId: 'math',
          order: 1,
          title: '01. Quadratic Equations',
          description: 'Standard form ax² + bx + c = 0, discriminant D = b² - 4ac, real & complex roots.',
          status: 'In Progress',
          masteryPercentage: 78,
          practiceScore: 80,
          confidenceRating: 4,
          lastStudiedDate: '2 hours ago',
          keyFormulasOrRules: ['x = (-b ± √(b² - 4ac)) / (2a)', 'If D > 0: two distinct real roots; D=0: one real root; D < 0: conjugate complex'],
        },
        {
          id: 'math-02',
          subjectId: 'math',
          order: 2,
          title: '02. Matrix Algebra',
          description: 'Determinants, row reduction, inverse matrices and Cramer rule.',
          status: 'Mastered',
          masteryPercentage: 91,
          practiceScore: 92,
          confidenceRating: 5,
          lastStudiedDate: 'Yesterday',
        },
      ],
      chem: [
        {
          id: 'chem-01',
          subjectId: 'chem',
          order: 1,
          title: '01. Chemical Bonding',
          description: 'Ionic vs covalent bonding, Lewis structures, electronegativity differences.',
          status: 'In Progress',
          masteryPercentage: 82,
          practiceScore: 84,
          confidenceRating: 4,
          lastStudiedDate: 'Yesterday',
        },
      ],
      phys: [
        {
          id: 'phys-01',
          subjectId: 'phys',
          order: 1,
          title: '01. Rotational Dynamics',
          description: 'Torque, moment of inertia, angular momentum conservation.',
          status: 'In Progress',
          masteryPercentage: 65,
          practiceScore: 68,
          confidenceRating: 3,
          lastStudiedDate: '2 days ago',
        },
      ],
    };

    const alexMemories: MemoryRecord[] = [
      {
        id: 'mem-1',
        topicTitle: 'Pointer Dereferencing',
        subjectName: 'Computer Science',
        observation: 'Student asked for a visual explanation. Understood instantly once mapped to numbered memory boxes.',
        classification: 'Effective',
        timestamp: '3 days ago',
        actionableInsight: 'Use visual address diagrams whenever introducing pointers or linked lists.',
        evidenceCount: 3,
      },
      {
        id: 'mem-2',
        topicTitle: 'Array Indexing',
        subjectName: 'Computer Science',
        observation: 'Repeated off-by-one error when terminating while loops over array bounds (<= size instead of < size).',
        classification: 'Pattern',
        timestamp: '4 days ago',
        actionableInsight: 'Prompt with boundary-checking questions during code reviews.',
        evidenceCount: 4,
      },
      {
        id: 'mem-3',
        topicTitle: 'Quadratic Equations',
        subjectName: 'Mathematics',
        observation: 'Worked examples before practice improved equation accuracy from 50% to 85%.',
        classification: 'Retained',
        timestamp: 'Yesterday',
        actionableInsight: 'Show full step-by-step discriminant evaluation before giving independent problems.',
        evidenceCount: 5,
      },
      {
        id: 'mem-4',
        topicTitle: 'Chemical Bonding',
        subjectName: 'Chemistry',
        observation: 'Needs spaced revision: tends to confuse dipole-dipole attractions with London dispersion forces after 4 days.',
        classification: 'Pattern',
        timestamp: '2 days ago',
        actionableInsight: 'Schedule flash recall prompts for intermolecular forces.',
        evidenceCount: 2,
      },
    ];

    const alexGaps: KnowledgeGap[] = [
      {
        id: 'gap-1',
        subject: 'Computer Science',
        topicId: 'cs-05',
        conceptName: 'Pointer Arithmetic & Bounds',
        severity: 'High',
        evidence: 'Confidence rated 5/5, but recent assessment accuracy was 50%. Confusion between `*(ptr + 1)` and `*ptr + 1`.',
        confidenceVsAccuracy: 'Confidence: High (5/5) | Accuracy: 50% (Gap: 30%)',
        recommendedAction: 'Explain operator precedence in your own words, then try a visual memory trace question.',
        cleared: false,
        detectedDate: '3 days ago',
      },
      {
        id: 'gap-2',
        subject: 'Mathematics',
        topicId: 'math-01',
        conceptName: 'Quadratic Discriminant Signs',
        severity: 'Medium',
        evidence: 'Sign calculation mistake when b is negative in -b ± √(b² - 4ac).',
        confidenceVsAccuracy: 'Confidence: Medium (3/5) | Accuracy: 65% (Gap: 15%)',
        recommendedAction: 'Work through 3 negative coefficient equations step-by-step.',
        cleared: false,
        detectedDate: 'Yesterday',
      },
      {
        id: 'gap-3',
        subject: 'Chemistry',
        topicId: 'chem-01',
        conceptName: 'Intermolecular vs Intramolecular Forces',
        severity: 'Low',
        evidence: 'Hesitation during multiple-choice questions on boiling point trends.',
        confidenceVsAccuracy: 'Confidence: Medium (3/5) | Accuracy: 72% (Gap: 10%)',
        recommendedAction: 'Quick 2-minute concept review card.',
        cleared: false,
        detectedDate: '2 days ago',
      },
    ];

    const alexRevisions: RevisionItem[] = [
      {
        id: 'rev-1',
        subject: 'Computer Science',
        topicId: 'cs-05',
        conceptName: 'Pointer Dereferencing',
        duePeriod: 'Today',
        currentIntervalDays: 1,
        consecutiveRecallCount: 1,
        lastReviewedDate: 'Yesterday',
        status: 'Pending',
        sampleQuestion: 'Given `int v = 42; int* p = &v;`, what is the exact output of `*p = 100; cout << v;`?',
      },
      {
        id: 'rev-2',
        subject: 'Mathematics',
        topicId: 'math-01',
        conceptName: 'Quadratic Equations',
        duePeriod: 'Today',
        currentIntervalDays: 3,
        consecutiveRecallCount: 2,
        lastReviewedDate: '3 days ago',
        status: 'Pending',
        sampleQuestion: 'What does a negative discriminant (b² - 4ac < 0) tell you about the graph of y = ax² + bx + c?',
      },
      {
        id: 'rev-3',
        subject: 'Chemistry',
        topicId: 'chem-01',
        conceptName: 'Chemical Bonding',
        duePeriod: 'Tomorrow',
        currentIntervalDays: 3,
        consecutiveRecallCount: 2,
        lastReviewedDate: '2 days ago',
        status: 'Pending',
        sampleQuestion: 'Why do polar molecules have higher boiling points than nonpolar molecules of comparable molar mass?',
      },
      {
        id: 'rev-4',
        subject: 'Computer Science',
        topicId: 'cs-04',
        conceptName: 'Array Traversal & Termination',
        duePeriod: 'Friday',
        currentIntervalDays: 7,
        consecutiveRecallCount: 3,
        lastReviewedDate: '4 days ago',
        status: 'Pending',
        sampleQuestion: 'Why is accessing `arr[N]` on an array declared as `int arr[N]` undefined behavior in C++?',
      },
    ];

    const alexAssessments: Assessment[] = [
      {
        id: 'assess-1',
        title: 'Pointers and Memory',
        subject: 'Computer Science',
        topic: 'Pointers & Dereferencing',
        difficulty: 'Intermediate',
        mode: 'Adaptive Test',
        estimatedDurationMinutes: 12,
        questionsCount: 5,
        completed: true,
        score: 8,
        accuracyPercentage: 80,
        timeSpentSeconds: 720,
        confidenceGapPercentage: 18,
        completedAt: 'Yesterday at 4:30 PM',
        topicBreakdown: [
          { topic: 'Pointer Basics', scorePercentage: 100 },
          { topic: 'Dereferencing (*ptr)', scorePercentage: 80 },
          { topic: 'Pointer Arithmetic', scorePercentage: 50 },
        ],
        recommendedActions: [
          'Review pointer arithmetic offset rules (*ptr + 1 vs *(ptr + 1))',
          'Practise five memory tracing questions in AI Tutor',
          'Retake a short 3-minute quiz tomorrow',
        ],
        questions: [
          {
            id: 'q1',
            question: 'What is stored in a pointer variable?',
            type: 'mcq',
            options: ['The value of an integer', 'A hexadecimal memory address', 'The size of the variable', 'A compile-time flag'],
            correctAnswer: 1,
            explanation: 'A pointer holds the memory address (location in RAM) where another variable resides.',
            topicName: 'Pointer Basics',
          },
          {
            id: 'q2',
            question: 'What will be output by this code snippet?',
            type: 'code',
            codeSnippet: `int x = 10;\nint* ptr = &x;\ncout << *ptr;`,
            options: ['Memory address of x (e.g. 0x7ffd)', '10', 'Compilation error', 'Garbage value'],
            correctAnswer: 1,
            explanation: 'The * operator dereferences ptr, returning the value 10 stored at address &x.',
            topicName: 'Dereferencing',
          },
          {
            id: 'q3',
            question: 'Given `int arr[3] = {10, 20, 30}; int* p = arr;`, what is `*(p + 1)`?',
            type: 'mcq',
            options: ['11', '20', '30', '10'],
            correctAnswer: 1,
            explanation: 'p points to arr[0] (10). p + 1 points to arr[1]. Dereferencing yields 20.',
            topicName: 'Pointer Arithmetic',
          },
        ],
      },
    ];

    const alexConversations: Conversation[] = [
      {
        id: 'conv-cs-1',
        studentId: 'student_1',
        title: 'Understanding Pointer Dereferencing',
        subjectId: 'cs',
        subjectName: 'Computer Science',
        topicId: 'cs-05',
        topicTitle: '05. Pointers',
        createdAt: '3 days ago',
        updatedAt: '3 days ago',
        lastMessagePreview: 'A pointer stores a memory address. Dereferencing uses the * operator...',
        isArchived: false,
        messages: [
          {
            id: 'chat-init-1',
            sender: 'student',
            text: 'Can you explain pointer dereferencing?',
            timestamp: '3 days ago',
          },
          {
            id: 'chat-init-2',
            sender: 'agaram',
            text: 'A pointer stores a memory address. Dereferencing uses the * operator to access the value stored at that address.',
            codeSnippet: `int x = 10;\nint* ptr = &x;\ncout << *ptr; // 10`,
            codeLanguage: 'cpp',
            suggestedActions: ['TRY A DRY RUN', 'SHOW AN EXAMPLE', 'EXPLAIN AGAIN'],
            relatedConcepts: ['Memory Addresses', 'Pointer Variables', 'Dereferencing', 'References (&)'],
            timestamp: '3 days ago',
            explanationStyleUsed: 'Simple',
          },
        ],
      },
    ];

    const alexDocuments: UploadedDocument[] = [
      {
        id: 'doc-1',
        fileName: 'CS201_Pointers_and_Memory.pdf',
        fileType: 'PDF',
        subjectId: 'cs',
        uploadedAt: 'Nov 02, 2026',
        fileSizeFormatted: '1.4 MB',
        chunkCount: 18,
        extractedSnippet: 'Chapter 4: Pointer arithmetic in C++. Given a pointer p of type T*, the expression p + 1 points to the address (p + sizeof(T)). Dereferencing nullptr causes SIGSEGV on UNIX...',
      },
    ];

    const alexSummaries: StudySummary[] = [
      {
        id: 'sum-1',
        subject: 'Computer Science',
        topic: 'Pointers in C++',
        difficulty: 'Intermediate',
        content: 'A pointer is a variable that stores the memory address of another variable rather than storing data directly.',
        keyIdeas: ['Pointers store hexadecimal RAM addresses', 'Dereferencing (*) accesses stored memory value'],
        commonMistakes: ['Dereferencing nullptr', 'Forgetting sizeof(T) stride'],
        workedExample: 'int score = 95;\nint* p = &score;',
        practiceQuestions: ['What happens if you execute int* p; *p = 5; without assigning p?'],
        createdAt: 'Nov 05, 2026',
      },
    ];

    const alexStudyGroups: StudyGroup[] = [
      {
        id: 'group-1',
        name: 'C++ Memory & Systems Masters',
        subject: 'Computer Science',
        description: 'Deep dive into pointers, dynamic allocation, heap mechanics, and algorithmic efficiency.',
        iconName: 'Terminal',
        memberCount: 38,
        isMember: true,
        meetingTime: 'Tuesdays & Thursdays at 6:00 PM',
        sharedDocumentIds: ['doc-1'],
        createdAt: 'Oct 15, 2026',
        questions: [],
      },
    ];

    const alexGamification: GamificationState = {
      points: 1850,
      level: 5,
      nextLevelPoints: 2500,
      recentXpGains: [
        { reason: 'Completed Pointers and Memory Adaptive Assessment', points: 150, timestamp: 'Yesterday' },
        { reason: 'Completed Daily Revision: Pointer Dereferencing', points: 50, timestamp: '2 days ago' },
        { reason: '7-Day Study Streak Maintained', points: 100, timestamp: 'Today' },
      ],
      badges: [
        {
          id: 'badge-1',
          name: 'Mastered 10 Topics',
          description: 'Achieved 85%+ verified mastery across ten distinct curriculum topics.',
          icon: 'Award',
          unlocked: true,
          unlockedAt: 'Oct 28, 2026',
          category: 'mastery',
        },
        {
          id: 'badge-2',
          name: 'Perfect Score',
          description: 'Scored 100% on any adaptive assessment or quick quiz without hint prompts.',
          icon: 'Sparkles',
          unlocked: true,
          unlockedAt: 'Nov 01, 2026',
          category: 'assessment',
        },
        {
          id: 'badge-3',
          name: '7-Day Streak Warrior',
          description: 'Engaged with AGARAM for seven consecutive days without a missed revision.',
          icon: 'Flame',
          unlocked: true,
          unlockedAt: 'Today',
          category: 'streak',
        },
      ],
    };

    this.accounts['student_1'] = {
      student: alexProfile,
      subjects: alexSubjects,
      topics: alexTopics,
      memories: alexMemories,
      knowledgeGaps: alexGaps,
      revisionSchedule: alexRevisions,
      assessments: alexAssessments,
      conversations: alexConversations,
      documents: alexDocuments,
      summaries: alexSummaries,
      studyGroups: alexStudyGroups,
      gamification: alexGamification,
      learningEvents: [],
    };

    this.leaderboard = [
      {
        rank: 1,
        studentId: 'stud-2',
        name: 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
        points: 2420,
        streakDays: 14,
        level: 6,
        topSubject: 'Computer Science',
        badgesCount: 7,
        isCurrentUser: false,
      },
      {
        rank: 2,
        studentId: 'student_1',
        name: 'Alex Morgan',
        avatar: alexProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
        points: 1850,
        streakDays: 7,
        level: 5,
        topSubject: 'Computer Science',
        badgesCount: 5,
        isCurrentUser: true,
      },
      {
        rank: 3,
        studentId: 'stud-3',
        name: 'David Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        points: 1790,
        streakDays: 9,
        level: 5,
        topSubject: 'Mathematics',
        badgesCount: 5,
        isCurrentUser: false,
      },
    ];

    this.studentBankMapping = {
      student_1: 'agaram-student-student-1',
    };
  }

  // Active account management
  public getActiveAccount(): StudentAccountData {
    if (!this.accounts[this.activeStudentId]) {
      this.activeStudentId = Object.keys(this.accounts)[0] || 'student_1';
    }
    return this.accounts[this.activeStudentId];
  }

  public getAccount(id: string): StudentAccountData | undefined {
    return this.accounts[id];
  }

  public switchAccount(id: string): StudentAccountData | undefined {
    if (this.accounts[id]) {
      this.activeStudentId = id;
      // Update leaderboard isCurrentUser flag
      this.leaderboard.forEach(entry => {
        entry.isCurrentUser = (entry.studentId === id);
      });
      return this.accounts[id];
    }
    return undefined;
  }

  public getAllProfiles(): Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    courseOrGrade: string;
    educationLevel: string;
    overallMastery: number;
    studyStreakDays: number;
    isActive: boolean;
  }> {
    return Object.values(this.accounts).map(acc => ({
      id: acc.student.id,
      name: acc.student.name,
      email: acc.student.email,
      avatar: acc.student.avatar,
      courseOrGrade: acc.student.courseOrGrade,
      educationLevel: acc.student.educationLevel,
      overallMastery: acc.student.overallMastery,
      studyStreakDays: acc.student.studyStreakDays,
      isActive: acc.student.id === this.activeStudentId,
    }));
  }

  /**
   * Requirement 4: Create Completely Independent Student Profiles
   * Must start with clean, zeroed student data matching the specification table.
   */
  public createProfile(data: Partial<StudentProfile>): StudentAccountData {
    const newId = `stud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const avatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    ];
    const assignedAvatar = data.avatar || avatars[Object.keys(this.accounts).length % avatars.length];

    // Clean zeroed profile
    const newStudent: StudentProfile = {
      id: newId,
      name: data.name || 'New Student',
      email: data.email || `${newId}@agaram.edu`,
      educationLevel: data.educationLevel || 'undergraduate',
      institution: data.institution || 'University',
      courseOrGrade: data.courseOrGrade || 'First Year Studies',
      preferredLanguage: data.preferredLanguage || 'English',
      timeZone: data.timeZone || 'UTC+05:30',
      learningSince: 'Just started',
      preferredFormat: data.preferredFormat || 'Step-by-step interactive tutor',
      learningPace: 'Structured',
      strongestSubject: 'General Studies',
      bestStudyWindow: 'Flexible',
      studyStreakDays: 0,
      studySessionsCount: 0,
      assignmentsCount: 0,
      revisionDueCount: 0,
      nextExamDate: 'Not scheduled',
      nextExamSubject: 'None',
      overallMastery: 0,
      knowledgeGapsCount: 0,
      consistencyScore: 0,
      questionAttempts: 0,
      skipFrequency: 'None',
      averageStudyDurationMinutes: 0,
      strengths: [],
      growthAreas: [],
      avatar: assignedAvatar,
      voiceGender: data.voiceGender || 'female',
    };

    // Clean default subject
    const initialSubjectId = `subj_${Date.now()}`;
    const initialSubjectName = data.educationLevel === 'school' ? 'Science' : 'Core Foundations';
    const newSubject: Subject = {
      id: initialSubjectId,
      name: initialSubjectName,
      iconName: 'BookOpen',
      educationLevel: newStudent.educationLevel,
      classOrCourse: newStudent.courseOrGrade,
      description: 'Your primary active learning curriculum track.',
      learningGoals: ['Complete foundations', 'Master first principles'],
      totalTopics: 1,
      masteredTopics: 0,
      masteryPercentage: 0,
      lastStudiedDate: 'Not started',
      lastStudiedFormatted: 'Not started',
      monthlyProgress: 0,
      practiceScore: 0,
    };

    const newTopics: Record<string, Topic[]> = {
      [initialSubjectId]: [
        {
          id: `${initialSubjectId}-01`,
          subjectId: initialSubjectId,
          order: 1,
          title: '01. Introductory Foundations',
          description: 'Core concepts, definitions, and mental models to begin your learning journey.',
          status: 'In Progress',
          masteryPercentage: 0,
          practiceScore: 0,
          confidenceRating: 3,
          lastStudiedDate: 'Just created',
          keyFormulasOrRules: ['Active recall cements long-term memory'],
        },
      ],
    };

    // Clean zeroed gamification state
    const newGamification: GamificationState = {
      points: 0,
      level: 1,
      nextLevelPoints: 500,
      recentXpGains: [],
      badges: getDefaultBadges(),
    };

    const newAccount: StudentAccountData = {
      student: newStudent,
      subjects: [newSubject],
      topics: newTopics,
      memories: [],
      knowledgeGaps: [],
      revisionSchedule: [],
      assessments: [],
      conversations: [],
      documents: [],
      summaries: [],
      studyGroups: [],
      gamification: newGamification,
      learningEvents: [],
    };

    // Store permanently in database
    this.accounts[newId] = newAccount;

    // Register clean student bank mapping
    const bankId = `agaram-student-${newId.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}`;
    this.studentBankMapping[newId] = bankId;

    // Add to leaderboard
    this.leaderboard.push({
      rank: this.leaderboard.length + 1,
      studentId: newId,
      name: newStudent.name,
      avatar: newStudent.avatar || '',
      points: 0,
      streakDays: 0,
      level: 1,
      topSubject: newSubject.name,
      badgesCount: 0,
      isCurrentUser: true,
    });

    // Switch active student to this new profile
    this.switchAccount(newId);

    return newAccount;
  }

  public deleteProfile(id: string): boolean {
    if (Object.keys(this.accounts).length <= 1) {
      return false; // Cannot delete the only remaining profile
    }
    if (!this.accounts[id]) return false;

    delete this.accounts[id];
    delete this.studentBankMapping[id];
    this.leaderboard = this.leaderboard.filter(e => e.studentId !== id);

    if (this.activeStudentId === id) {
      this.activeStudentId = Object.keys(this.accounts)[0] || 'student_1';
    }
    return true;
  }

  public updateStudentProfile(updates: Partial<StudentProfile>, targetStudentId?: string): StudentProfile {
    const sId = targetStudentId || this.activeStudentId;
    const account = this.accounts[sId] || this.getActiveAccount();
    account.student = { ...account.student, ...updates };

    if (updates.name) {
      const userEntry = this.leaderboard.find(e => e.studentId === sId);
      if (userEntry) {
        userEntry.name = updates.name;
      }
    }
    if (updates.avatar) {
      const userEntry = this.leaderboard.find(e => e.studentId === sId);
      if (userEntry) {
        userEntry.avatar = updates.avatar;
      }
    }

    return account.student;
  }

  // Active student getters & setters for transparent backward compatibility
  public get student(): StudentProfile {
    return this.getActiveAccount().student;
  }
  public set student(s: StudentProfile) {
    this.getActiveAccount().student = s;
  }

  public get subjects(): Subject[] {
    return this.getActiveAccount().subjects;
  }
  public set subjects(s: Subject[]) {
    this.getActiveAccount().subjects = s;
  }

  public get topics(): Record<string, Topic[]> {
    return this.getActiveAccount().topics;
  }
  public set topics(t: Record<string, Topic[]>) {
    this.getActiveAccount().topics = t;
  }

  public get memories(): MemoryRecord[] {
    return this.getActiveAccount().memories;
  }
  public set memories(m: MemoryRecord[]) {
    this.getActiveAccount().memories = m;
  }

  public get knowledgeGaps(): KnowledgeGap[] {
    return this.getActiveAccount().knowledgeGaps;
  }
  public set knowledgeGaps(g: KnowledgeGap[]) {
    this.getActiveAccount().knowledgeGaps = g;
  }

  public get revisionSchedule(): RevisionItem[] {
    return this.getActiveAccount().revisionSchedule;
  }
  public set revisionSchedule(r: RevisionItem[]) {
    this.getActiveAccount().revisionSchedule = r;
  }

  public get assessments(): Assessment[] {
    return this.getActiveAccount().assessments;
  }
  public set assessments(a: Assessment[]) {
    this.getActiveAccount().assessments = a;
  }

  public get conversations(): Conversation[] {
    return this.getActiveAccount().conversations;
  }
  public set conversations(c: Conversation[]) {
    this.getActiveAccount().conversations = c;
  }

  public get documents(): UploadedDocument[] {
    return this.getActiveAccount().documents;
  }
  public set documents(d: UploadedDocument[]) {
    this.getActiveAccount().documents = d;
  }

  public get summaries(): StudySummary[] {
    return this.getActiveAccount().summaries;
  }
  public set summaries(s: StudySummary[]) {
    this.getActiveAccount().summaries = s;
  }

  public get studyGroups(): StudyGroup[] {
    return this.getActiveAccount().studyGroups;
  }
  public set studyGroups(g: StudyGroup[]) {
    this.getActiveAccount().studyGroups = g;
  }

  public get gamification(): GamificationState {
    return this.getActiveAccount().gamification;
  }
  public set gamification(g: GamificationState) {
    this.getActiveAccount().gamification = g;
  }

  public get learningEvents() {
    return this.getActiveAccount().learningEvents;
  }
  public set learningEvents(e) {
    this.getActiveAccount().learningEvents = e;
  }

  // Bank ID resolution per student
  public getStudentBankId(studentId: string): string {
    if (!this.studentBankMapping[studentId]) {
      const sanitized = studentId.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      this.studentBankMapping[studentId] = `agaram-student-${sanitized}`;
    }
    return this.studentBankMapping[studentId];
  }

  public setStudentBankId(studentId: string, bankId: string): void {
    this.studentBankMapping[studentId] = bankId;
  }

  public recordMemory(record: MemoryRecord, targetStudentId?: string) {
    const account = targetStudentId ? (this.accounts[targetStudentId] || this.getActiveAccount()) : this.getActiveAccount();
    account.memories.unshift(record);
    if (account.memories.length > 50) {
      account.memories.pop();
    }
    account.student.knowledgeGapsCount = account.knowledgeGaps.filter(g => !g.cleared).length;
    return record;
  }

  public recordLearningEvent(event: {
    subjectId: string;
    topicId: string;
    type: string;
    notes?: string;
  }, targetStudentId?: string) {
    const account = targetStudentId ? (this.accounts[targetStudentId] || this.getActiveAccount()) : this.getActiveAccount();
    const newEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      ...event,
    };
    account.learningEvents.push(newEvent);
    account.student.questionAttempts += 1;
    return newEvent;
  }

  public addXp(points: number, reason: string, targetStudentId?: string) {
    const sId = targetStudentId || this.activeStudentId;
    const account = this.accounts[sId] || this.getActiveAccount();

    account.gamification.points += points;
    account.gamification.recentXpGains.unshift({
      points,
      reason,
      timestamp: 'Just now',
    });
    if (account.gamification.recentXpGains.length > 10) {
      account.gamification.recentXpGains.pop();
    }

    const newLevel = Math.floor(account.gamification.points / 500) + 1;
    account.gamification.level = newLevel;
    account.gamification.nextLevelPoints = newLevel * 500;

    const userEntry = this.leaderboard.find(e => e.studentId === sId);
    if (userEntry) {
      userEntry.points = account.gamification.points;
      userEntry.level = newLevel;
    }
    this.leaderboard.sort((a, b) => b.points - a.points);
    this.leaderboard.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });
  }

  // Conversation Management Methods
  public createConversation(params: {
    subjectId: string;
    topicId?: string;
    topicTitle?: string;
    title?: string;
    isStructuredLesson?: boolean;
    initialMessage?: string;
    studentId?: string;
  }): Conversation {
    const sId = params.studentId || this.activeStudentId;
    const account = this.accounts[sId] || this.getActiveAccount();

    const subject = account.subjects.find(s => s.id === params.subjectId) || account.subjects[0];
    const convId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    let defaultTitle = params.title;
    if (!defaultTitle) {
      if (params.isStructuredLesson) {
        defaultTitle = params.topicTitle ? `Learning: ${params.topicTitle}` : `Lesson – ${subject?.name || 'Concept'}`;
      } else if (params.topicTitle) {
        defaultTitle = `${params.topicTitle} – Study`;
      } else {
        defaultTitle = `${subject?.name || 'Subject'} – Doubt Session`;
      }
    }

    const messages: ChatMessage[] = [];
    if (params.initialMessage) {
      messages.push({
        id: `msg-${Date.now()}-init`,
        sender: 'agaram',
        text: params.initialMessage,
        timestamp: 'Just now',
        explanationStyleUsed: 'Visual',
      });
    }

    const newConv: Conversation = {
      id: convId,
      studentId: sId,
      title: defaultTitle,
      subjectId: subject ? subject.id : params.subjectId,
      subjectName: subject ? subject.name : 'General',
      topicId: params.topicId,
      topicTitle: params.topicTitle,
      messages,
      createdAt: 'Just now',
      updatedAt: 'Just now',
      lastMessagePreview: params.initialMessage ? params.initialMessage.slice(0, 80) : 'New conversation started',
      isArchived: false,
      isStructuredLesson: params.isStructuredLesson || false,
    };

    account.conversations.unshift(newConv);
    return newConv;
  }

  public getConversations(studentId?: string): Conversation[] {
    const sId = studentId || this.activeStudentId;
    const account = this.accounts[sId] || this.getActiveAccount();
    return account.conversations.filter(c => c.studentId === sId);
  }

  public getConversation(id: string): Conversation | undefined {
    // Search across active account first, then all accounts
    const activeConv = this.getActiveAccount().conversations.find(c => c.id === id);
    if (activeConv) return activeConv;

    for (const acc of Object.values(this.accounts)) {
      const found = acc.conversations.find(c => c.id === id);
      if (found) return found;
    }
    return undefined;
  }

  public updateConversation(id: string, updates: Partial<Conversation>): Conversation | undefined {
    const conv = this.getConversation(id);
    if (!conv) return undefined;
    Object.assign(conv, updates, { updatedAt: 'Just now' });
    return conv;
  }

  public deleteConversation(id: string): boolean {
    for (const acc of Object.values(this.accounts)) {
      const idx = acc.conversations.findIndex(c => c.id === id);
      if (idx !== -1) {
        acc.conversations.splice(idx, 1);
        return true;
      }
    }
    return false;
  }

  public addMessageToConversation(id: string, message: ChatMessage): Conversation | undefined {
    const conv = this.getConversation(id);
    if (!conv) return undefined;

    conv.messages.push(message);
    conv.updatedAt = 'Just now';
    conv.lastMessagePreview = message.text ? message.text.slice(0, 90) : 'Attachment shared';

    if (conv.messages.filter(m => m.sender === 'student').length === 1 && message.text) {
      const cleanSnippet = message.text.replace(/[\n\r]+/g, ' ').trim().slice(0, 36);
      if (cleanSnippet && conv.title.includes('Doubt Session')) {
        conv.title = cleanSnippet + (message.text.length > 36 ? '...' : '');
      }
    }

    return conv;
  }
}

export const db = new AgaramDatabase();
