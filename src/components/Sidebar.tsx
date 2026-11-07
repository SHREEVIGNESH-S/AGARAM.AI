import React from 'react';
import {
  Home,
  BookOpen,
  MessageSquareCode,
  CheckCircle2,
  Brain,
  RotateCcw,
  Users,
  Trophy,
  AlertCircle,
  FileText,
  User,
  Volume2,
  VolumeX,
  Flame,
} from 'lucide-react';
import { StudentProfile, GamificationState } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  student: StudentProfile | null;
  gamification: GamificationState | null;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  revisionDueCount?: number;
  knowledgeGapsCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  student,
  gamification,
  voiceEnabled,
  onToggleVoice,
  revisionDueCount = 0,
  knowledgeGapsCount = 0,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'subjects', label: 'My Subjects', icon: BookOpen },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquareCode },
    { id: 'assessments', label: 'Assessments', icon: CheckCircle2 },
    { id: 'groups', label: 'Study Groups', icon: Users },
    { id: 'gamification', label: 'Leaderboard & Badges', icon: Trophy },
    { id: 'memory', label: 'Memory Insights', icon: Brain },
    { id: 'revision', label: 'Smart Revision', icon: RotateCcw, badgeCount: revisionDueCount },
    { id: 'gaps', label: 'Knowledge Gaps', icon: AlertCircle, badgeCount: knowledgeGapsCount },
    { id: 'summary', label: 'AI Summary & Docs', icon: FileText },
    { id: 'profile', label: 'Learning Profile', icon: User },
  ];

  const studentName = student?.name || 'Alex Morgan';
  const initial = studentName.charAt(0).toUpperCase();

  return (
    <>
      {/* DESKTOP FIXED SIDEBAR (Occupies 100vh, fixed to left, never scrolls with page) */}
      <aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 h-screen w-16 md:w-20 bg-[#080A0D] border-r border-[#292F36] flex-col justify-between py-3 select-none z-40 overflow-y-auto"
        aria-label="Sidebar Navigation"
      >
        {/* Top: AGARAM Branding */}
        <div className="flex flex-col items-center pt-1 pb-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex flex-col items-center group focus:outline-none"
            title="AGARAM Home"
            aria-label="AGARAM Home"
          >
            <div className="flex items-center">
              <span className="agaram-brand-font text-lg font-bold text-white tracking-tight">
                a
              </span>
              <span className="agaram-brand-font text-lg font-black text-[#FF681F]">
                AI
              </span>
            </div>
            <div className="w-6 h-0.5 bg-[#FF681F] rounded-full mt-0.5 opacity-80 group-hover:w-8 transition-all" />
          </button>
        </div>

        {/* Middle: Icon Navigation Stack */}
        <nav className="flex flex-col items-center space-y-1.5 w-full my-auto py-2">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={item.label}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all group ${
                  isActive
                    ? 'bg-[#1B222A] text-[#FF681F] border border-[#292F36]'
                    : 'text-[#9299A3] hover:text-[#F4F5F7] hover:bg-[#151A20]'
                }`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Vibrant orange active marker strip on the very left border */}
                {isActive && (
                  <div className="absolute -left-2.5 sm:-left-3.5 w-1.5 h-7 bg-[#FF681F] rounded-r-md" />
                )}

                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />

                {/* Notification Badge */}
                {Boolean(item.badgeCount && item.badgeCount > 0) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF681F] text-black text-[10px] font-black flex items-center justify-center animate-pulse">
                    {item.badgeCount}
                  </span>
                )}

                {/* Tooltip on hover */}
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#1B222A] text-[#F4F5F7] text-xs font-semibold rounded-md shadow-xl border border-[#292F36] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Voice, Streak, XP, Student Profile Avatar */}
        <div className="flex flex-col items-center space-y-2 pt-2 border-t border-[#292F36]/60">
          {/* Voice Toggle Button */}
          <button
            onClick={onToggleVoice}
            title={voiceEnabled ? 'Voice Explanations: Active' : 'Voice Explanations: Muted'}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              voiceEnabled
                ? 'bg-[#FF681F]/20 text-[#FF681F] border border-[#FF681F]/50'
                : 'text-[#9299A3] hover:text-white bg-[#151A20]'
            }`}
            aria-label="Toggle Voice"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Streak indicator */}
          {student && (
            <div
              className="flex items-center justify-center text-[#FF681F] text-[11px] font-bold py-0.5"
              title={`7-Day Streak: ${student.studyStreakDays} days active!`}
            >
              <Flame className="w-3.5 h-3.5 mr-0.5" />
              <span>{student.studyStreakDays}d</span>
            </div>
          )}

          {/* Gamification Level */}
          {gamification && (
            <button
              onClick={() => onNavigate('gamification')}
              title={`Level ${gamification.level} (${gamification.points.toLocaleString()} XP)`}
              className="text-[10px] font-black uppercase text-[#F2B84B] bg-[#151A20] px-1.5 py-0.5 rounded border border-[#292F36] hover:border-[#F2B84B] transition-colors"
            >
              L{gamification.level}
            </button>
          )}

          {/* Actual Student Profile Avatar */}
          <button
            onClick={() => onNavigate('profile')}
            title={`Logged in as ${studentName} (${student?.educationLevel || 'Student'})`}
            className="w-9 h-9 rounded-full bg-[#1B222A] border border-[#FF681F]/70 hover:border-[#FF681F] flex items-center justify-center text-xs font-bold text-white transition-all hover:scale-105 relative group"
            aria-label={`Student Profile for ${studentName}`}
          >
            <span>{initial}</span>
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#1B222A] text-[#F4F5F7] text-xs font-semibold rounded-md shadow-xl border border-[#292F36] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              {studentName} (Profile)
            </div>
          </button>
        </div>
      </aside>

      {/* MOBILE RESPONSIVE BOTTOM NAVIGATION (Only on screens < md, never blocks chat composer) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#080A0D]/95 backdrop-blur-md border-t border-[#292F36] flex items-center justify-around px-2 z-40"
        aria-label="Mobile Navigation"
      >
        {[
          { id: 'dashboard', icon: Home, label: 'Home' },
          { id: 'subjects', icon: BookOpen, label: 'Subjects' },
          { id: 'tutor', icon: MessageSquareCode, label: 'Tutor' },
          { id: 'assessments', icon: CheckCircle2, label: 'Tests' },
          { id: 'groups', icon: Users, label: 'Groups' },
          { id: 'profile', icon: User, label: 'Profile' },
        ].map(item => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
                isActive ? 'text-[#FF681F]' : 'text-[#9299A3]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
