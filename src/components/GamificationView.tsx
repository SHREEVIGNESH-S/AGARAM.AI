import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  CheckCircle,
  Users,
  Brain,
  Moon,
  TrendingUp,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { Badge, LeaderboardEntry, GamificationState } from '../types';

interface GamificationViewProps {
  gamification: GamificationState;
  onRefresh: () => void;
}

export const GamificationView: React.FC<GamificationViewProps> = ({ gamification }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges' | 'history'>('leaderboard');

  useEffect(() => {
    fetch('/api/gamification')
      .then(r => r.json())
      .then(data => {
        if (data.leaderboard) setLeaderboard(data.leaderboard);
      })
      .catch(() => {});
  }, []);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award': return Award;
      case 'Sparkles': return Sparkles;
      case 'Flame': return Flame;
      case 'Brain': return Brain;
      case 'Users': return Users;
      case 'Moon': return Moon;
      default: return Star;
    }
  };

  const progressToNextLevel = Math.min(
    100,
    Math.round(((gamification.points % 500) / 500) * 100)
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#FF681F] mb-1">
            <Trophy className="w-4 h-4" />
            <span>Gamified Mastery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Leaderboard & Milestones
          </h1>
          <p className="text-[#9299A3] text-sm mt-1">
            Earn experience points for lessons, revisions, and peer help. Unlock milestone badges and rise on the leaderboard.
          </p>
        </div>

        {/* Level & XP Overview Card */}
        <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-4 sm:p-5 flex items-center space-x-4 shrink-0 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-[#FF681F]/20 border border-[#FF681F] flex items-center justify-center font-black text-xl text-[#FF681F]">
            {gamification.level}
          </div>
          <div>
            <div className="text-xs text-[#9299A3] uppercase font-bold">
              Level {gamification.level} Scholar
            </div>
            <div className="text-xl font-extrabold text-white">
              {gamification.points.toLocaleString()} <span className="text-[#FF681F] text-sm">XP</span>
            </div>
            <div className="w-32 bg-[#101419] h-2 rounded-full overflow-hidden mt-1.5 border border-[#292F36]">
              <div
                className="bg-[#FF681F] h-full transition-all"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#292F36] pb-2">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'leaderboard'
              ? 'bg-[#151A20] text-[#FF681F] border border-[#292F36]'
              : 'text-[#9299A3] hover:text-white'
          }`}
        >
          🏆 Student Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'badges'
              ? 'bg-[#151A20] text-[#FF681F] border border-[#292F36]'
              : 'text-[#9299A3] hover:text-white'
          }`}
        >
          🎖️ Milestone Badges ({gamification.badges.filter(b => b.unlocked).length}/{gamification.badges.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'history'
              ? 'bg-[#151A20] text-[#FF681F] border border-[#292F36]'
              : 'text-[#9299A3] hover:text-white'
          }`}
        >
          📈 Recent XP Activity
        </button>
      </div>

      {/* TAB 1: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="bg-[#151A20] border border-[#292F36] rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-[#292F36] flex items-center justify-between text-xs font-bold uppercase text-[#9299A3]">
              <span className="w-16">Rank</span>
              <span className="flex-1">Student</span>
              <span className="hidden sm:inline w-28 text-center">Top Subject</span>
              <span className="hidden md:inline w-24 text-center">Streak</span>
              <span className="w-24 text-right">Points</span>
            </div>

            <div className="divide-y divide-[#292F36]/60">
              {leaderboard.map(entry => {
                const isTop3 = entry.rank <= 3;
                return (
                  <div
                    key={entry.studentId}
                    className={`px-6 py-4 flex items-center justify-between transition-colors ${
                      entry.isCurrentUser
                        ? 'bg-[#FF681F]/10 border-l-4 border-l-[#FF681F]'
                        : 'hover:bg-[#1B222A]'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-16 flex items-center space-x-1.5">
                      {entry.rank === 1 ? (
                        <span className="text-xl">🥇</span>
                      ) : entry.rank === 2 ? (
                        <span className="text-xl">🥈</span>
                      ) : entry.rank === 3 ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        <span className="font-bold text-sm text-[#9299A3]">#{entry.rank}</span>
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-[#1B222A] border border-[#292F36] flex items-center justify-center font-bold text-xs text-white overflow-hidden shrink-0">
                        {entry.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center space-x-2">
                          <span>{entry.name}</span>
                          {entry.isCurrentUser && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-[#FF681F] text-black px-1.5 py-0.2 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#9299A3]">
                          Level {entry.level} • {entry.badgesCount} badges
                        </div>
                      </div>
                    </div>

                    {/* Top Subject */}
                    <div className="hidden sm:inline w-28 text-center text-xs text-[#9299A3] font-medium">
                      {entry.topSubject}
                    </div>

                    {/* Streak */}
                    <div className="hidden md:flex items-center justify-center w-24 space-x-1 text-xs text-[#FF681F] font-semibold">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{entry.streakDays}d</span>
                    </div>

                    {/* Points */}
                    <div className="w-24 text-right">
                      <span className="text-sm sm:text-base font-extrabold text-[#F4F5F7]">
                        {entry.points.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#FF681F] font-bold ml-1">XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONE BADGES */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gamification.badges.map(badge => {
            const Icon = getBadgeIcon(badge.icon);
            return (
              <div
                key={badge.id}
                className={`bg-[#151A20] border rounded-2xl p-6 relative overflow-hidden transition-all ${
                  badge.unlocked
                    ? 'border-[#FF681F]/50 shadow-lg shadow-[#FF681F]/10'
                    : 'border-[#292F36] opacity-60'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      badge.unlocked
                        ? 'bg-[#FF681F]/20 text-[#FF681F] border border-[#FF681F]'
                        : 'bg-[#101419] text-[#9299A3] border border-[#292F36]'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">
                        {badge.name}
                      </h4>
                      {badge.unlocked && (
                        <span className="text-[10px] font-bold uppercase text-[#27C281] bg-[#27C281]/15 px-2 py-0.5 rounded">
                          Unlocked
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#9299A3] mt-1.5 leading-relaxed">
                      {badge.description}
                    </p>

                    {badge.unlocked && badge.unlockedAt && (
                      <div className="text-[11px] text-[#27C281] font-semibold mt-3">
                        Earned {badge.unlockedAt}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: XP RECENT HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase text-white tracking-wider">
            Recent Experience Log
          </h3>

          <div className="space-y-3">
            {gamification.recentXpGains.map((gain, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#101419] border border-[#292F36]"
              >
                <div>
                  <div className="text-sm font-bold text-white">{gain.reason}</div>
                  <div className="text-xs text-[#9299A3] mt-0.5">{gain.timestamp}</div>
                </div>
                <div className="text-sm font-extrabold text-[#27C281] bg-[#27C281]/10 px-3 py-1 rounded-lg">
                  +{gain.points} XP
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
