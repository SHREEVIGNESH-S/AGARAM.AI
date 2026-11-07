import React from 'react';
import {
  Flame,
  RotateCcw,
  BookOpen,
  CheckSquare,
  Clock,
  ArrowRight,
  Plus,
  Sparkles,
  TrendingUp,
  Brain,
  Lightbulb,
} from 'lucide-react';
import { StudentProfile, Subject, GamificationState } from '../types';
import { AgaramLogo } from './Header';

interface DashboardViewProps {
  student: StudentProfile;
  subjects: Subject[];
  gamification: GamificationState | null;
  onSelectSubject: (subjectId: string) => void;
  onAddNewSubject: () => void;
  onStartRevision: () => void;
  onOpenNextUp: () => void;
  onContinueLearning?: (subjectId: string, topicId?: string, topicTitle?: string) => void;
  onStartNewChat?: (subjectId?: string, topicTitle?: string) => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  student,
  subjects,
  gamification,
  onSelectSubject,
  onAddNewSubject,
  onStartRevision,
  onOpenNextUp,
  onContinueLearning,
  onStartNewChat,
  onNavigate,
}) => {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Greeting Header matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Good morning, {student.name}
          </h1>
          <p className="text-[#9299A3] text-sm sm:text-base mt-1">
            Keep learning. Keep growing.
          </p>
        </div>

        {/* Top Right Logo matching Screenshot 2 */}
        <div className="hidden sm:block">
          <AgaramLogo size="md" />
        </div>
      </div>

      {/* Row of 5 Stat Cards matching Screenshot 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Study Streak */}
        <div className="bg-[#151A20] border border-[#292F36] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#FF681F]/40 transition-colors">
          <div className="flex items-center space-x-2 text-[#9299A3]">
            <Flame className="w-5 h-5 text-[#FF681F]" />
            <span className="text-xs sm:text-sm font-medium">Study Streak</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {student.studyStreakDays} days
            </div>
            <div className="text-xs font-semibold text-[#27C281] mt-1">
              keep going !
            </div>
          </div>
        </div>

        {/* 2. Revision */}
        <div
          onClick={onStartRevision}
          className="bg-[#151A20] border border-[#292F36] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#FF681F]/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center space-x-2 text-[#9299A3]">
            <RotateCcw className="w-5 h-5 text-[#FF681F] group-hover:rotate-45 transition-transform" />
            <span className="text-xs sm:text-sm font-medium">Revision</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {student.revisionDueCount}
            </div>
            <div className="text-xs font-semibold text-[#27C281] mt-1">
              topics to be completed ...
            </div>
          </div>
        </div>

        {/* 3. Assignments */}
        <div className="bg-[#151A20] border border-[#292F36] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#FF681F]/40 transition-colors">
          <div className="flex items-center space-x-2 text-[#9299A3]">
            <CheckSquare className="w-5 h-5 text-[#FF681F]" />
            <span className="text-xs sm:text-sm font-medium">Assignments</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {student.assignmentsCount}
            </div>
            <div className="text-xs font-semibold text-[#27C281] mt-1">
              +3 completed this week
            </div>
          </div>
        </div>

        {/* 4. Study sessions */}
        <div className="bg-[#151A20] border border-[#292F36] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#FF681F]/40 transition-colors">
          <div className="flex items-center space-x-2 text-[#9299A3]">
            <BookOpen className="w-5 h-5 text-[#FF681F]" />
            <span className="text-xs sm:text-sm font-medium">Study sessions</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {student.studySessionsCount}
            </div>
            <div className="text-xs font-semibold text-[#27C281] mt-1">
              +5 completed this week
            </div>
          </div>
        </div>

        {/* 5. Examinations in */}
        <div className="col-span-2 lg:col-span-1 bg-[#151A20] border border-[#292F36] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#FF681F]/40 transition-colors">
          <div className="flex items-center space-x-2 text-[#9299A3]">
            <Clock className="w-5 h-5 text-[#FF681F]" />
            <span className="text-xs sm:text-sm font-medium">Examinations in</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              2 weeks
            </div>
            <div className="text-xs font-semibold text-[#27C281] mt-1">
              {student.nextExamDate}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Subjects Created + Next Up + AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SUBJECTS CREATED Card matching Screenshot 2 (Col 7) */}
        <div className="lg:col-span-7 bg-[#151A20] border border-[#292F36] rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-white mb-6">
              SUBJECTS CREATED
            </h2>

            <div className="space-y-4">
              {subjects.map(subject => (
                <div
                  key={subject.id}
                  onClick={() => onSelectSubject(subject.id)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1B222A] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-3.5">
                    {/* Orange Dot matching screenshot */}
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF681F] shrink-0" />
                    <div>
                      <div className="text-sm sm:text-base font-semibold text-[#F4F5F7] group-hover:text-[#FF681F] transition-colors">
                        {subject.name}
                      </div>
                      <div className="text-xs text-[#9299A3]">
                        {subject.totalTopics} topics • {subject.masteryPercentage}% mastery
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-[#9299A3]">
                    <span>{subject.lastStudiedFormatted}</span>
                    <ArrowRight className="w-4 h-4 text-[#9299A3] group-hover:text-[#FF681F] transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ADD NEW SUBJECT -> Button matching Screenshot 2 */}
          <div className="mt-8 pt-4 border-t border-[#292F36]/60 flex items-center justify-center">
            <button
              onClick={onAddNewSubject}
              className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#FF681F] hover:text-[#FF8247] flex items-center space-x-1.5 py-2 px-4 rounded-lg hover:bg-[#FF681F]/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>ADD NEW SUBJECT -&gt;</span>
            </button>
          </div>
        </div>

        {/* Right Column: NEXT UP & AI Insights & Recommendations (Col 5) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          {/* NEXT UP Card matching Screenshot 2 */}
          <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-6 sm:p-7 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF681F]" />
            <div className="text-xs font-bold uppercase tracking-widest text-[#FF681F] mb-1">
              NEXT UP
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Advanced pointers
            </h3>
            <p className="text-xs sm:text-sm text-[#9299A3] mt-2">
              Trace memory bounds, double pointers (`int**`), and array decay rules.
            </p>

            <div className="mt-5 flex items-center space-x-3">
              <button
                onClick={() => {
                  if (onContinueLearning) {
                    onContinueLearning('cs', 'cs-05', 'Advanced pointers');
                  } else {
                    onOpenNextUp();
                  }
                }}
                className="px-5 py-2.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md shadow-[#FF681F]/25 active:scale-95"
              >
                <span>CONTINUE LESSON</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (onStartNewChat) {
                    onStartNewChat('cs', 'Advanced pointers');
                  } else {
                    onNavigate('tutor');
                  }
                }}
                className="px-4 py-2.5 rounded-lg bg-[#1B222A] hover:bg-[#292F36] text-[#F4F5F7] font-medium text-xs sm:text-sm transition-colors"
              >
                Ask AI Tutor
              </button>
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-6 flex-1">
            <div className="flex items-center space-x-2 text-[#FF681F] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>AI Learning Observation</span>
            </div>
            <p className="text-sm text-[#F4F5F7] leading-relaxed">
              "You learn best with visual examples. Add more practice in Mathematics to close the quadratic roots gap."
            </p>

            <div className="mt-4 pt-4 border-t border-[#292F36] flex items-center justify-between text-xs">
              <span className="text-[#9299A3]">Derived from Hindsight Memory</span>
              <button
                onClick={() => onNavigate('memory')}
                className="text-[#FF681F] hover:underline font-semibold"
              >
                View Memory Insights -&gt;
              </button>
            </div>
          </div>

          {/* Recommended Focus Action Card */}
          <div className="bg-[#1B222A] border border-[#292F36] rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#F2B84B]">
                Recommended Focus
              </div>
              <div className="text-sm font-bold text-white">
                Quadratic Roots & Discriminant
              </div>
              <div className="text-xs text-[#9299A3]">
                Recall due in today's spaced queue
              </div>
            </div>

            <button
              onClick={() => onNavigate('revision')}
              className="px-4 py-2 bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-bold rounded-lg transition-colors shrink-0 ml-3"
            >
              GO -&gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
