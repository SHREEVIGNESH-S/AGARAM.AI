import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { SubjectsView } from './components/SubjectsView';
import { SubjectWorkspaceView } from './components/SubjectWorkspaceView';
import { AiTutorView } from './components/AiTutorView';
import { AssessmentsView } from './components/AssessmentsView';
import { StudyGroupsView } from './components/StudyGroupsView';
import { GamificationView } from './components/GamificationView';
import { MemoryInsightsView } from './components/MemoryInsightsView';
import { SmartRevisionView } from './components/SmartRevisionView';
import { KnowledgeGapsView } from './components/KnowledgeGapsView';
import { StudySummaryView } from './components/StudySummaryView';
import { LearningProfileView } from './components/LearningProfileView';
import { VoiceExplainerModal } from './components/VoiceExplainerModal';
import { StudentProfile, Subject, GamificationState, UploadedDocument, Conversation } from './types';

export default function App() {
  // Support ?autostart=1 query parameter to go straight to main dashboard
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialAutostart = urlParams?.get('autostart') === '1';
  const initialViewParam = urlParams?.get('view');

  const [currentView, setCurrentView] = useState<string>(
    initialViewParam || (initialAutostart ? 'dashboard' : 'landing')
  );

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [gamification, setGamification] = useState<GamificationState | null>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Active AI Conversation ID
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Voice Explainer Modal state
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [voiceModalText, setVoiceModalText] = useState('');
  const [voiceModalTitle, setVoiceModalTitle] = useState('Concept Explanation');

  // Load initial student & app data
  const loadInitialData = async () => {
    try {
      const [dashRes, subjRes, gamRes, docRes] = await Promise.all([
        fetch('/api/student/dashboard').then(r => r.json()),
        fetch('/api/subjects').then(r => r.json()),
        fetch('/api/gamification').then(r => r.json()),
        fetch('/api/documents').then(r => r.json()),
      ]);

      if (dashRes.student) {
        setStudent(dashRes.student);
      }
      if (subjRes && Array.isArray(subjRes)) {
        setSubjects(subjRes);
        const cs = subjRes.find((s: Subject) => s.id === 'cs') || subjRes[0];
        setCurrentSubject(cs);
      }
      if (gamRes.gamification) {
        setGamification(gamRes.gamification);
      }
      if (docRes && Array.isArray(docRes)) {
        setDocuments(docRes);
      }
    } catch (e) {
      console.error('Failed to load initial data:', e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleRegisterStudent = async (data: Partial<StudentProfile>) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.student) {
      setStudent(result.student);
      setCurrentView('dashboard');
      loadInitialData();
    }
  };

  const handleSwitchProfile = async (profileId: string) => {
    try {
      const res = await fetch('/api/profiles/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.activeProfile) {
          setStudent(data.activeProfile);
        }
        await loadInitialData();
      }
    } catch (err) {
      console.error('Failed to switch profile:', err);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      const res = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadInitialData();
      }
    } catch (err) {
      console.error('Failed to delete profile:', err);
    }
  };

  const handleEditProfile = async (profileId: string, updates: Partial<StudentProfile>) => {
    try {
      const res = await fetch(`/api/profiles/${profileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await loadInitialData();
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleCreateSubject = async (data: Partial<Subject>) => {
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      loadInitialData();
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    await fetch(`/api/subjects/${subjectId}`, { method: 'DELETE' });
    loadInitialData();
  };

  const handleUploadDocument = async (doc: Partial<UploadedDocument>) => {
    await fetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    loadInitialData();
  };

  const handleDeleteDocument = async (id: string) => {
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    loadInitialData();
  };

  const handleSpeakText = (text: string, title?: string) => {
    setVoiceModalText(text);
    if (title) setVoiceModalTitle(title);
    setVoiceModalOpen(true);
  };

  const handleSelectSubjectAndOpenWorkspace = (subjectId: string) => {
    const found = subjects.find(s => s.id === subjectId);
    if (found) {
      setCurrentSubject(found);
      setCurrentView('workspace');
    }
  };

  // Requirement 3: ASK AI TUTOR creates a fresh new conversation record in the database
  const handleStartNewChat = async (subjectId?: string, topicTitle?: string) => {
    const targetSubject = subjectId
      ? subjects.find(s => s.id === subjectId) || currentSubject
      : currentSubject;
    const resolvedSubject = targetSubject || subjects[0];

    try {
      const res = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: resolvedSubject ? resolvedSubject.id : 'cs',
          topicTitle: topicTitle || undefined,
          title: topicTitle
            ? `${topicTitle} – Doubts`
            : `${resolvedSubject?.name || 'Subject'} – Doubt Session`,
          isStructuredLesson: false,
        }),
      });
      const conv: Conversation = await res.json();
      if (resolvedSubject) setCurrentSubject(resolvedSubject);
      setActiveConversationId(conv.id);
      setCurrentView('tutor');
      return conv.id;
    } catch (err) {
      console.error('Failed to create new chat:', err);
      setCurrentView('tutor');
    }
  };

  // Requirement 3: CONTINUE creates a new conversation and starts teaching the topic
  const handleContinueLearning = async (
    subjectId: string,
    topicId?: string,
    topicTitle?: string
  ) => {
    const targetSubject = subjects.find(s => s.id === subjectId) || currentSubject;
    const resolvedSubject = targetSubject || subjects[0];

    try {
      const res = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: resolvedSubject ? resolvedSubject.id : subjectId,
          topicId,
          topicTitle,
          title: topicTitle ? `Lesson: ${topicTitle}` : `Lesson: ${resolvedSubject?.name || 'Concept'}`,
          isStructuredLesson: true,
        }),
      });
      const conv: Conversation = await res.json();
      if (resolvedSubject) setCurrentSubject(resolvedSubject);
      setActiveConversationId(conv.id);
      setCurrentView('tutor');
    } catch (err) {
      console.error('Failed to start continue lesson:', err);
      setCurrentView('tutor');
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0D] text-[#F4F5F7] flex flex-col antialiased selection:bg-[#FF681F]/30 selection:text-white">
      {/* If on landing view, render full-screen Landing Page matching Screenshot 1 */}
      {currentView === 'landing' ? (
        <LandingView
          student={student}
          onContinue={async (profileId) => {
            if (profileId) {
              await handleSwitchProfile(profileId);
            }
            setCurrentView('dashboard');
          }}
          onRegister={handleRegisterStudent}
          onSwitchProfile={handleSwitchProfile}
          onDeleteProfile={handleDeleteProfile}
          onEditProfile={handleEditProfile}
        />
      ) : (
        /* Authenticated Student Views: NO traditional top header! Full height, static fixed sidebar */
        <div className="flex w-full min-h-screen relative overflow-x-hidden">
          {/* Static fixed left sidebar (100vh height, fixed to left, stationary during scroll) */}
          <Sidebar
            currentView={currentView}
            onNavigate={view => setCurrentView(view)}
            student={student}
            gamification={gamification}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
            revisionDueCount={student?.revisionDueCount}
            knowledgeGapsCount={student?.knowledgeGapsCount}
          />

          {/* Main Content Workspace: Starts immediately after sidebar, occupies remaining width */}
          <main className="flex-1 md:ml-20 min-h-screen overflow-y-auto agaram-grid-bg relative pb-16 md:pb-0">
            {currentView === 'dashboard' && student && (
              <DashboardView
                student={student}
                subjects={subjects}
                gamification={gamification}
                onSelectSubject={handleSelectSubjectAndOpenWorkspace}
                onAddNewSubject={() => setCurrentView('subjects')}
                onStartRevision={() => setCurrentView('revision')}
                onOpenNextUp={() => setCurrentView('workspace')}
                onContinueLearning={handleContinueLearning}
                onStartNewChat={handleStartNewChat}
                onNavigate={view => setCurrentView(view)}
              />
            )}

            {currentView === 'subjects' && (
              <SubjectsView
                subjects={subjects}
                onSelectSubject={handleSelectSubjectAndOpenWorkspace}
                onCreateSubject={handleCreateSubject}
                onDeleteSubject={handleDeleteSubject}
              />
            )}

            {currentView === 'workspace' && currentSubject && (
              <SubjectWorkspaceView
                subject={currentSubject}
                onAskTutor={topicTitle => handleStartNewChat(currentSubject.id, topicTitle)}
                onContinueLearning={handleContinueLearning}
                onStartPractice={() => setCurrentView('assessments')}
                onCompleteTopic={async topicId => {
                  await fetch('/api/learning/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subjectId: currentSubject.id, topicId }),
                  });
                  loadInitialData();
                }}
              />
            )}

            {currentView === 'tutor' && currentSubject && (
              <AiTutorView
                currentSubject={currentSubject}
                subjects={subjects}
                onSelectSubject={id => {
                  const found = subjects.find(s => s.id === id);
                  if (found) setCurrentSubject(found);
                }}
                voiceEnabled={voiceEnabled}
                voiceGender={student?.voiceGender || 'male'}
                activeConversationId={activeConversationId}
                onSelectConversation={id => setActiveConversationId(id)}
                onStartNewConversation={handleStartNewChat}
              />
            )}

            {currentView === 'assessments' && (
              <AssessmentsView
                onAskTutor={topicTitle => handleStartNewChat(undefined, topicTitle)}
                onRefreshStudent={loadInitialData}
              />
            )}

            {currentView === 'groups' && (
              <StudyGroupsView
                documents={documents}
                onUploadNotes={() => setCurrentView('summary')}
              />
            )}

            {currentView === 'gamification' && gamification && (
              <GamificationView gamification={gamification} onRefresh={loadInitialData} />
            )}

            {currentView === 'memory' && (
              <MemoryInsightsView
                onAskTutor={topicTitle => handleStartNewChat(undefined, topicTitle)}
              />
            )}

            {currentView === 'revision' && (
              <SmartRevisionView
                onAskTutor={topicTitle => handleStartNewChat(undefined, topicTitle)}
                onRefreshStudent={loadInitialData}
              />
            )}

            {currentView === 'gaps' && (
              <KnowledgeGapsView
                onAskTutor={topicTitle => handleStartNewChat(undefined, topicTitle)}
                onTakeAssessment={() => setCurrentView('assessments')}
                onRefreshStudent={loadInitialData}
              />
            )}

            {currentView === 'summary' && (
              <StudySummaryView
                subjects={subjects}
                documents={documents}
                onUploadDocument={handleUploadDocument}
                onDeleteDocument={handleDeleteDocument}
                onAskTutor={topicTitle => handleStartNewChat(undefined, topicTitle)}
              />
            )}

            {currentView === 'profile' && student && (
              <LearningProfileView
                student={student}
                onUpdateProfile={async updated => {
                  await fetch('/api/student/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updated),
                  });
                  loadInitialData();
                }}
              />
            )}
          </main>
        </div>
      )}

      {/* Voice Explainer Audio Player Modal */}
      <VoiceExplainerModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        textToSpeak={voiceModalText}
        conceptTitle={voiceModalTitle}
      />
    </div>
  );
}
