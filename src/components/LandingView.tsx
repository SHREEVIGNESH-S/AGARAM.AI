import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  UserCheck,
  BookOpen,
  User,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  X,
  Volume2,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface LandingViewProps {
  student: StudentProfile | null;
  onContinue: (profileId?: string) => void;
  onRegister: (data: Partial<StudentProfile>) => void;
  onSwitchProfile?: (profileId: string) => Promise<void>;
  onDeleteProfile?: (profileId: string) => Promise<void>;
  onEditProfile?: (profileId: string, updates: Partial<StudentProfile>) => Promise<void>;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
];

export const LandingView: React.FC<LandingViewProps> = ({
  student,
  onContinue,
  onRegister,
  onSwitchProfile,
  onDeleteProfile,
  onEditProfile,
}) => {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<StudentProfile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<StudentProfile | null>(null);

  // New Profile Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [educationLevel, setEducationLevel] = useState<StudentProfile['educationLevel']>('undergraduate');
  const [courseOrGrade, setCourseOrGrade] = useState('');
  const [institution, setInstitution] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');

  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [editInstitution, setEditInstitution] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editVoice, setEditVoice] = useState<'male' | 'female'>('male');

  // Fetch all saved profiles
  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/profiles');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProfiles(data);
        }
      }
    } catch (err) {
      console.error('Failed to load profiles:', err);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    onRegister({
      name: fullName.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.') || 'student'}@agaram.edu`,
      educationLevel,
      courseOrGrade: courseOrGrade.trim() || 'General Studies',
      institution: institution.trim() || 'University / School',
      avatar: selectedAvatar,
      voiceGender,
    });

    setShowRegisterModal(false);
    setFullName('');
    setEmail('');
    setCourseOrGrade('');
    setInstitution('');
    setTimeout(fetchProfiles, 300);
  };

  const handleSelectProfileToContinue = async (profId: string) => {
    if (onSwitchProfile) {
      await onSwitchProfile(profId);
    } else {
      await fetch('/api/profiles/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profId }),
      });
    }
    onContinue(profId);
  };

  const openEditModal = (prof: StudentProfile) => {
    setEditingProfile(prof);
    setEditName(prof.name);
    setEditCourse(prof.courseOrGrade || '');
    setEditInstitution(prof.institution || '');
    setEditAvatar(prof.avatar || PRESET_AVATARS[0]);
    setEditVoice(prof.voiceGender || 'male');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    if (onEditProfile) {
      await onEditProfile(editingProfile.id, {
        name: editName,
        courseOrGrade: editCourse,
        institution: editInstitution,
        avatar: editAvatar,
        voiceGender: editVoice,
      });
    } else {
      await fetch(`/api/profiles/${editingProfile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          courseOrGrade: editCourse,
          institution: editInstitution,
          avatar: editAvatar,
          voiceGender: editVoice,
        }),
      });
    }

    setEditingProfile(null);
    fetchProfiles();
  };

  const handleConfirmDelete = async () => {
    if (!deletingProfile) return;

    if (onDeleteProfile) {
      await onDeleteProfile(deletingProfile.id);
    } else {
      await fetch(`/api/profiles/${deletingProfile.id}`, {
        method: 'DELETE',
      });
    }

    setDeletingProfile(null);
    fetchProfiles();
  };

  const activeStudentId = student?.id || 'student_1';

  return (
    <div className="relative min-h-screen agaram-grid-bg flex flex-col items-center justify-center px-4 py-12 select-none overflow-y-auto">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF681F]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Logo & Tagline matching Screenshot 1 */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <span className="agaram-brand-font text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white">
            agaram
          </span>
          <span className="agaram-brand-font text-6xl sm:text-7xl md:text-8xl font-black text-[#FF681F] ml-3">
            AI
          </span>
        </div>

        {/* Orange horizontal divider line matching Screenshot 1 */}
        <div className="w-full max-w-xl h-1 bg-[#FF681F] my-6 rounded-full opacity-90 shadow-lg shadow-[#FF681F]/20" />

        {/* Tagline */}
        <p className="text-[#9299A3] text-lg sm:text-xl font-normal tracking-wide">
          Your personal learning companion
        </p>

        {/* Multi-Profile Selector Card */}
        <div className="mt-10 w-full max-w-xl bg-[#151A20] border border-[#292F36] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm text-left">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#292F36]">
            <div>
              <h2 className="text-xl font-bold text-white">
                Start your educational journey !
              </h2>
              <p className="text-xs text-[#9299A3] mt-0.5">
                Select your student profile or create an isolated study space.
              </p>
            </div>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-3.5 py-2 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-[#FF681F]/25 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Profile</span>
            </button>
          </div>

          {/* Profiles List */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {profiles.length > 0 ? (
              profiles.map(prof => {
                const isActive = prof.id === activeStudentId;
                const avatarUrl =
                  prof.avatar ||
                  (prof.id === 'student_1'
                    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
                    : undefined);

                return (
                  <div
                    key={prof.id}
                    className={`rounded-xl p-4 border transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-[#1B222A] border-[#FF681F] shadow-md shadow-[#FF681F]/10'
                        : 'bg-[#101419] border-[#292F36] hover:border-[#9299A3]/50'
                    }`}
                  >
                    <div
                      onClick={() => handleSelectProfileToContinue(prof.id)}
                      className="flex items-center space-x-3.5 cursor-pointer flex-1 min-w-0"
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={prof.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#FF681F]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#FF681F]/20 text-[#FF681F] border border-[#FF681F] flex items-center justify-center font-bold text-lg shrink-0">
                          {prof.name.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm truncate">{prof.name}</span>
                          {isActive && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FF681F] text-black px-2 py-0.5 rounded-full shrink-0">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#9299A3] truncate mt-0.5">
                          {prof.courseOrGrade || 'Student'} • {prof.institution || 'University'}
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] text-[#27C281] font-semibold mt-1">
                          <span>Mastery: {prof.overallMastery || 0}%</span>
                          <span>•</span>
                          <span>Streak: {prof.studyStreakDays || 0}d</span>
                          <span>•</span>
                          <span className="text-[#9299A3]">Voice: {prof.voiceGender === 'female' ? 'Female' : 'Male'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => openEditModal(prof)}
                        className="p-1.5 text-[#9299A3] hover:text-white rounded hover:bg-[#1B222A]"
                        title="Edit profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {profiles.length > 1 && (
                        <button
                          onClick={() => setDeletingProfile(prof)}
                          className="p-1.5 text-[#9299A3] hover:text-red-400 rounded hover:bg-[#1B222A]"
                          title="Delete profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleSelectProfileToContinue(prof.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-semibold flex items-center space-x-1"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Fallback single continue button */
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#FF681F]/25 hover:shadow-[#FF681F]/40 active:scale-95"
                >
                  <span>Create new student profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onContinue()}
                  className="text-[#9299A3] hover:text-[#FF681F] text-sm font-medium transition-colors underline-offset-4 hover:underline py-2"
                >
                  Continue as {student?.name || 'Alex Morgan'} ...
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Features preview pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-[#9299A3]">
          <span className="px-3 py-1 bg-[#101419] border border-[#292F36] rounded-full">
            🧠 Adaptive Hindsight Memory
          </span>
          <span className="px-3 py-1 bg-[#101419] border border-[#292F36] rounded-full">
            🎙️ Voice Concept Tutoring
          </span>
          <span className="px-3 py-1 bg-[#101419] border border-[#292F36] rounded-full">
            👥 Collaborative Groups
          </span>
          <span className="px-3 py-1 bg-[#101419] border border-[#292F36] rounded-full">
            🏆 Gamified Mastery & XP
          </span>
        </div>
      </div>

      {/* CREATE NEW PROFILE MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151A20] border border-[#292F36] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Create New Student Profile</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1 text-[#9299A3] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[#9299A3] mb-6">
              Create an independent profile with completely isolated metrics, subjects, and personal Hindsight memory bank.
            </p>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Choose Avatar
                </label>
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {PRESET_AVATARS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Preset"
                      onClick={() => setSelectedAvatar(url)}
                      className={`w-11 h-11 rounded-full object-cover cursor-pointer border-2 transition-all shrink-0 ${
                        selectedAvatar === url ? 'border-[#FF681F] scale-110 shadow-md shadow-[#FF681F]/30' : 'border-[#292F36] opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                    Education Level
                  </label>
                  <select
                    value={educationLevel}
                    onChange={e => setEducationLevel(e.target.value as any)}
                    className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                  >
                    <option value="school">School / Middle School</option>
                    <option value="high_school">High School (Grade 9-12)</option>
                    <option value="undergraduate">College / Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="professional">Lifelong Learner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                    Class / Course
                  </label>
                  <input
                    type="text"
                    value={courseOrGrade}
                    onChange={e => setCourseOrGrade(e.target.value)}
                    placeholder="e.g. CS-101 / Grade 10"
                    className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  AI Voice Preference
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVoiceGender('male')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 ${
                      voiceGender === 'male'
                        ? 'bg-[#FF681F]/20 border-[#FF681F] text-white'
                        : 'bg-[#101419] border-[#292F36] text-[#9299A3]'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#FF681F]" />
                    <span>Male Voice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceGender('female')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 ${
                      voiceGender === 'female'
                        ? 'bg-[#FF681F]/20 border-[#FF681F] text-white'
                        : 'bg-[#101419] border-[#292F36] text-[#9299A3]'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#FF681F]" />
                    <span>Female Voice</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Institution (Optional)
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="e.g. National Science Academy"
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#292F36]">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-sm text-[#9299A3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white font-semibold text-sm transition-colors shadow-md shadow-[#FF681F]/30"
                >
                  Create & Launch Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151A20] border border-[#292F36] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Edit Profile Details</h3>
              <button
                onClick={() => setEditingProfile(null)}
                className="p-1 text-[#9299A3] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Avatar Selection
                </label>
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {PRESET_AVATARS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Preset"
                      onClick={() => setEditAvatar(url)}
                      className={`w-11 h-11 rounded-full object-cover cursor-pointer border-2 transition-all shrink-0 ${
                        editAvatar === url ? 'border-[#FF681F] scale-110 shadow-md shadow-[#FF681F]/30' : 'border-[#292F36] opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                    Course / Grade
                  </label>
                  <input
                    type="text"
                    value={editCourse}
                    onChange={e => setEditCourse(e.target.value)}
                    className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                    Voice Preference
                  </label>
                  <select
                    value={editVoice}
                    onChange={e => setEditVoice(e.target.value as any)}
                    className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                  >
                    <option value="male">Male Voice</option>
                    <option value="female">Female Voice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  value={editInstitution}
                  onChange={e => setEditInstitution(e.target.value)}
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#292F36]">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="px-4 py-2 text-sm text-[#9299A3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white font-semibold text-sm transition-colors shadow-md shadow-[#FF681F]/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PROFILE CONFIRMATION MODAL */}
      {deletingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151A20] border border-red-500/50 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Delete Student Profile?</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#9299A3] leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{deletingProfile.name}"</strong>? All associated study metrics, test attempts, and local records for this profile will be permanently removed. Other student profiles will not be affected.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#292F36]">
              <button
                type="button"
                onClick={() => setDeletingProfile(null)}
                className="px-4 py-2 text-xs font-semibold text-[#9299A3] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
              >
                Yes, Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
