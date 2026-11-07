import React from 'react';
import { Flame, Trophy, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { StudentProfile, GamificationState } from '../types';

interface HeaderProps {
  student: StudentProfile | null;
  gamification: GamificationState | null;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onNavigate: (view: string) => void;
}

export const AgaramLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const textSize = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-xl' : 'text-2xl';
  const aiSize = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-xl' : 'text-2xl';

  return (
    <div className="flex items-center select-none">
      <span className={`agaram-brand-font font-bold tracking-tight text-white ${textSize}`}>
        agaram
      </span>
      <span className={`agaram-brand-font font-black text-[#FF681F] ml-1.5 ${aiSize}`}>
        AI
      </span>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({
  student,
  gamification,
  voiceEnabled,
  onToggleVoice,
  onNavigate,
}) => {
  return (
    <header className="h-16 border-b border-[#292F36] bg-[#080A0D]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="focus:outline-none flex items-center hover:opacity-90 transition-opacity"
          aria-label="AGARAM Home"
        >
          <AgaramLogo size="md" />
        </button>
        <span className="hidden md:inline-block text-xs uppercase tracking-wider text-[#9299A3] border-l border-[#292F36] pl-4">
          Adaptive Learning Companion
        </span>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-5">
        {/* Voice Toggle */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Voice concept explanations active' : 'Enable voice explanations'}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            voiceEnabled
              ? 'bg-[#FF681F]/15 border-[#FF681F] text-[#FF681F]'
              : 'bg-[#151A20] border-[#292F36] text-[#9299A3] hover:text-[#F4F5F7]'
          }`}
          aria-label="Toggle voice concept narration"
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
        </button>

        {/* Gamification Level & XP Badge */}
        {gamification && (
          <button
            onClick={() => onNavigate('gamification')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#151A20] border border-[#292F36] hover:border-[#FF681F]/50 transition-colors"
            title="View Leaderboard & Badges"
          >
            <Trophy className="w-4 h-4 text-[#F2B84B]" />
            <div className="text-left hidden sm:block">
              <div className="text-[10px] text-[#9299A3] uppercase font-semibold leading-none">
                Lvl {gamification.level}
              </div>
              <div className="text-xs font-bold text-[#F4F5F7] leading-none mt-0.5">
                {gamification.points.toLocaleString()} <span className="text-[#FF681F]">XP</span>
              </div>
            </div>
            <span className="sm:hidden text-xs font-bold text-[#FF681F]">{gamification.points} XP</span>
          </button>
        )}

        {/* Study Streak */}
        {student && (
          <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#151A20] border border-[#292F36] text-[#FF681F] text-xs font-semibold">
            <Flame className="w-4 h-4" />
            <span>{student.studyStreakDays}d</span>
          </div>
        )}

        {/* Student Avatar / Profile Link */}
        {student && (
          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center space-x-2 pl-2 focus:outline-none group"
            aria-label="View Student Profile"
          >
            <div className="w-8 h-8 rounded-full bg-[#1B222A] border border-[#FF681F]/60 flex items-center justify-center text-xs font-bold text-white group-hover:border-[#FF681F] transition-colors">
              {student.name.charAt(0)}
            </div>
            <span className="hidden lg:inline text-xs font-medium text-[#F4F5F7] group-hover:text-[#FF681F] transition-colors">
              {student.name}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
