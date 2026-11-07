import React, { useState } from 'react';
import {
  User,
  Calendar,
  Flame,
  BookOpen,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  Zap,
  Volume2,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface LearningProfileViewProps {
  student: StudentProfile;
  onUpdateProfile: (data: Partial<StudentProfile>) => void;
}

export const LearningProfileView: React.FC<LearningProfileViewProps> = ({
  student,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(student.name);
  const [preferredFormat, setPreferredFormat] = useState(student.preferredFormat);
  const [learningPace, setLearningPace] = useState(student.learningPace);
  const [bestStudyWindow, setBestStudyWindow] = useState(student.bestStudyWindow);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      preferredFormat,
      learningPace,
      bestStudyWindow,
    });
    setIsEditing(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#FF681F] mb-1">
            <User className="w-4 h-4" />
            <span>Evolving Student Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Learning Profile & Habits
          </h1>
          <p className="text-[#9299A3] text-sm mt-1">
            Cognitive attributes and study behaviors learned from verified learning evidence.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-lg bg-[#151A20] hover:bg-[#1B222A] border border-[#292F36] text-white text-xs font-semibold self-start sm:self-auto"
        >
          {isEditing ? 'Cancel Edit' : 'Edit Preferences'}
        </button>
      </div>

      {/* Main Student Identity Card */}
      <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FF681F]/20 border border-[#FF681F] flex items-center justify-center text-2xl font-bold text-[#FF681F]">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{student.name}</h2>
            <div className="text-xs text-[#9299A3] mt-1">
              {student.courseOrGrade} • {student.institution || 'University'}
            </div>
            <div className="flex items-center space-x-2 text-xs text-[#27C281] font-semibold mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Learning since {student.learningSince}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t md:border-t-0 md:border-l border-[#292F36] pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-[10px] text-[#9299A3] uppercase font-bold">Strongest Subject</div>
            <div className="text-sm font-bold text-white mt-0.5">{student.strongestSubject}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#9299A3] uppercase font-bold">Learning Pace</div>
            <div className="text-sm font-bold text-[#FF681F] mt-0.5">{student.learningPace}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#9299A3] uppercase font-bold">Best Study Window</div>
            <div className="text-xs font-semibold text-white mt-0.5">{student.bestStudyWindow}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#9299A3] uppercase font-bold">Overall Mastery</div>
            <div className="text-sm font-bold text-[#27C281] mt-0.5">{student.overallMastery}%</div>
          </div>
        </div>
      </div>

      {/* Edit Form Drawer */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-[#101419] border border-[#FF681F]/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase text-[#FF681F]">Edit Profile Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#9299A3] mb-1 font-semibold uppercase">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#151A20] border border-[#292F36] rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-[#9299A3] mb-1 font-semibold uppercase">Preferred Learning Format</label>
              <input
                type="text"
                value={preferredFormat}
                onChange={e => setPreferredFormat(e.target.value)}
                className="w-full bg-[#151A20] border border-[#292F36] rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-[#9299A3] mb-1 font-semibold uppercase">Learning Pace</label>
              <select
                value={learningPace}
                onChange={e => setLearningPace(e.target.value as any)}
                className="w-full bg-[#151A20] border border-[#292F36] rounded-lg px-3 py-2 text-white"
              >
                <option value="Structured">Structured</option>
                <option value="Self-paced">Self-paced</option>
                <option value="Accelerated">Accelerated</option>
              </select>
            </div>

            <div>
              <label className="block text-[#9299A3] mb-1 font-semibold uppercase">Best Study Window</label>
              <input
                type="text"
                value={bestStudyWindow}
                onChange={e => setBestStudyWindow(e.target.value)}
                className="w-full bg-[#151A20] border border-[#292F36] rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs text-[#9299A3] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-bold rounded-lg"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* AI Voice Preferences (Male and Female voice selection) */}
      <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#292F36] pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#FF681F]">
              <Volume2 className="w-4 h-4" />
              <span>AI Voice Preferences</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">AI Tutor Voice Persona</h2>
            <p className="text-xs sm:text-sm text-[#9299A3] mt-0.5">
              Select your preferred voice persona for read-aloud explanations and concept walkthroughs.
            </p>
          </div>
          <div className="text-xs px-3 py-1 bg-[#101419] border border-[#292F36] rounded-full text-[#27C281] font-semibold self-start sm:self-auto">
            Active: {student.voiceGender === 'female' ? 'Female Voice' : 'Male Voice'}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Male Voice Card */}
          <div
            onClick={() => onUpdateProfile({ voiceGender: 'male' })}
            className={`cursor-pointer rounded-xl p-5 border transition-all flex flex-col justify-between ${
              (student.voiceGender || 'male') === 'male'
                ? 'bg-[#FF681F]/10 border-[#FF681F] shadow-lg shadow-[#FF681F]/10'
                : 'bg-[#101419] border-[#292F36] hover:border-[#9299A3]/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🎙️</span>
                  <span className="font-bold text-white text-base">Male Voice</span>
                  {(student.voiceGender || 'male') === 'male' && (
                    <span className="text-[10px] uppercase font-bold bg-[#FF681F] text-black px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#9299A3] mt-2 leading-relaxed">
                  Clear, articulate, and steady academic resonance. Optimized for step-by-step logic and code dry-runs.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#292F36] flex items-center justify-between">
              <span className="text-[11px] text-[#9299A3]">Pitch: 0.95 • Rate: 1.0x</span>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance('Hello, I am your AGARAM AI Tutor. Ready to guide your learning in Computer Science and Mathematics.');
                    u.rate = 1.0;
                    u.pitch = 0.9;
                    const voices = window.speechSynthesis.getVoices();
                    const maleVoice = voices.find(v =>
                      v.lang.startsWith('en') &&
                      (v.name.toLowerCase().includes('david') ||
                        v.name.toLowerCase().includes('male') ||
                        v.name.toLowerCase().includes('guy') ||
                        v.name.toLowerCase().includes('mark') ||
                        v.name.toLowerCase().includes('george'))
                    ) || voices.find(v => v.lang.startsWith('en'));
                    if (maleVoice) u.voice = maleVoice;
                    window.speechSynthesis.speak(u);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-[#1B222A] hover:bg-[#FF681F] hover:text-white text-xs font-semibold text-[#F4F5F7] border border-[#292F36] transition-colors flex items-center space-x-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Preview Male Voice</span>
              </button>
            </div>
          </div>

          {/* Female Voice Card */}
          <div
            onClick={() => onUpdateProfile({ voiceGender: 'female' })}
            className={`cursor-pointer rounded-xl p-5 border transition-all flex flex-col justify-between ${
              student.voiceGender === 'female'
                ? 'bg-[#FF681F]/10 border-[#FF681F] shadow-lg shadow-[#FF681F]/10'
                : 'bg-[#101419] border-[#292F36] hover:border-[#9299A3]/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🎧</span>
                  <span className="font-bold text-white text-base">Female Voice</span>
                  {student.voiceGender === 'female' && (
                    <span className="text-[10px] uppercase font-bold bg-[#FF681F] text-black px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#9299A3] mt-2 leading-relaxed">
                  Warm, expressive, and encouraging pedagogical cadence. Ideal for conceptual walkthroughs and analogies.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#292F36] flex items-center justify-between">
              <span className="text-[11px] text-[#9299A3]">Pitch: 1.15 • Rate: 1.0x</span>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance('Hello, I am your AGARAM AI Tutor. I will help you master complex topics step by step.');
                    u.rate = 1.0;
                    u.pitch = 1.15;
                    const voices = window.speechSynthesis.getVoices();
                    const femaleVoice = voices.find(v =>
                      v.lang.startsWith('en') &&
                      (v.name.toLowerCase().includes('zira') ||
                        v.name.toLowerCase().includes('female') ||
                        v.name.toLowerCase().includes('samantha') ||
                        v.name.toLowerCase().includes('victoria') ||
                        v.name.toLowerCase().includes('jenny'))
                    ) || voices.find(v => v.lang.startsWith('en'));
                    if (femaleVoice) u.voice = femaleVoice;
                    window.speechSynthesis.speak(u);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-[#1B222A] hover:bg-[#FF681F] hover:text-white text-xs font-semibold text-[#F4F5F7] border border-[#292F36] transition-colors flex items-center space-x-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Preview Female Voice</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Behavior Metrics matching Page 10 */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-white">
          Observed Learning Behavior
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#151A20] border border-[#292F36] rounded-xl p-4">
            <div className="text-xs text-[#9299A3] font-bold uppercase">Consistency Score</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#27C281] mt-1">
              {student.consistencyScore}%
            </div>
            <div className="text-[11px] text-[#9299A3] mt-1">Based on daily study streak</div>
          </div>

          <div className="bg-[#151A20] border border-[#292F36] rounded-xl p-4">
            <div className="text-xs text-[#9299A3] font-bold uppercase">Question Attempts</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {student.questionAttempts}
            </div>
            <div className="text-[11px] text-[#9299A3] mt-1">Across all subjects</div>
          </div>

          <div className="bg-[#151A20] border border-[#292F36] rounded-xl p-4">
            <div className="text-xs text-[#9299A3] font-bold uppercase">Skip Frequency</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {student.skipFrequency}
            </div>
            <div className="text-[11px] text-[#27C281] mt-1">High persistence</div>
          </div>

          <div className="bg-[#151A20] border border-[#292F36] rounded-xl p-4">
            <div className="text-xs text-[#9299A3] font-bold uppercase">Avg Study Session</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {student.averageStudyDurationMinutes}m
            </div>
            <div className="text-[11px] text-[#9299A3] mt-1">Optimal focus window</div>
          </div>
        </div>
      </div>

      {/* Strengths & Growth Areas matching Page 10 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#151A20] border border-[#27C281]/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#27C281]">
            <CheckCircle className="w-4 h-4" />
            <span>Verified Cognitive Strengths</span>
          </div>

          <div className="space-y-2.5">
            {student.strengths.map((str, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#101419] border border-[#292F36] text-xs sm:text-sm text-[#F4F5F7] flex items-center space-x-3"
              >
                <div className="w-2 h-2 rounded-full bg-[#27C281] shrink-0" />
                <span>{str}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#151A20] border border-[#FF681F]/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#FF681F]">
            <Sparkles className="w-4 h-4" />
            <span>Target Growth Areas</span>
          </div>

          <div className="space-y-2.5">
            {student.growthAreas.map((area, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#101419] border border-[#292F36] text-xs sm:text-sm text-[#F4F5F7] flex items-center space-x-3"
              >
                <div className="w-2 h-2 rounded-full bg-[#FF681F] shrink-0" />
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
