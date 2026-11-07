import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Lock,
  MessageSquareCode,
  Play,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Subject, Topic } from '../types';

interface SubjectWorkspaceViewProps {
  subject: Subject;
  onAskTutor: (topicTitle?: string) => void;
  onContinueLearning: (subjectId: string, topicId?: string, topicTitle?: string) => void;
  onStartPractice: (topicId: string) => void;
  onCompleteTopic: (topicId: string) => void;
}

export const SubjectWorkspaceView: React.FC<SubjectWorkspaceViewProps> = ({
  subject,
  onAskTutor,
  onContinueLearning,
  onStartPractice,
  onCompleteTopic,
}) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  useEffect(() => {
    fetch(`/api/subjects/${subject.id}/learning-path`)
      .then(r => r.json())
      .then(data => {
        if (data.topics) {
          setTopics(data.topics);
          setSelectedTopic(data.topics.find((t: Topic) => t.id === 'cs-05') || data.topics[0]);
        }
      })
      .catch(() => {});
  }, [subject.id]);

  const nextRecommended = topics.find(t => t.status === 'In Progress') || topics.find(t => t.status === 'Up Next') || topics[0];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header matching Part 4 specification */}
      <div className="border-b border-[#292F36] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider text-[#FF681F]">
            {subject.name}
          </h1>
          <p className="text-[#9299A3] text-sm sm:text-base mt-1">
            {subject.description || 'A structured path through concepts, practice and mastery.'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onAskTutor()}
            className="px-4 py-2.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md shadow-[#FF681F]/30"
          >
            <MessageSquareCode className="w-4 h-4" />
            <span>Ask Subject Tutor</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#151A20] border border-[#292F36] rounded-xl p-4">
          <div className="text-xs text-[#9299A3] font-semibold uppercase">Subject Mastery</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {subject.masteryPercentage}%
          </div>
          <div className="w-full bg-[#292F36] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#FF681F] h-full" style={{ width: `${subject.masteryPercentage}%` }} />
          </div>
        </div>

        <div className="bg-[#151A20] border border-[#292F36] rounded-xl p-4">
          <div className="text-xs text-[#9299A3] font-semibold uppercase">Topics Mastered</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {topics.filter(t => t.status === 'Mastered').length} / {topics.length}
          </div>
          <div className="text-xs text-[#27C281] font-semibold mt-1">
            {Math.round((topics.filter(t => t.status === 'Mastered').length / Math.max(1, topics.length)) * 100)}% complete
          </div>
        </div>

        <div className="bg-[#151A20] border border-[#292F36] rounded-xl p-4">
          <div className="text-xs text-[#9299A3] font-semibold uppercase">Practice Score</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {subject.practiceScore}%
          </div>
          <div className="text-xs text-[#9299A3] mt-1">From assessments & drills</div>
        </div>

        <div className="bg-[#151A20] border border-[#292F36] rounded-xl p-4">
          <div className="text-xs text-[#9299A3] font-semibold uppercase">Monthly Progress</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#27C281] mt-1">
            +{subject.monthlyProgress}%
          </div>
          <div className="text-xs text-[#9299A3] mt-1">Past 30 days retention</div>
        </div>
      </div>

      {/* Continue Learning Banner */}
      {nextRecommended && (
        <div className="bg-[#1B222A] border border-[#FF681F]/40 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#FF681F] mb-1">
              CONTINUE LEARNING
            </div>
            <h3 className="text-xl font-bold text-white">
              {nextRecommended.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#9299A3] mt-1">
              {nextRecommended.description}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onContinueLearning(subject.id, nextRecommended.id, nextRecommended.title)}
              className="px-5 py-2.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md shadow-[#FF681F]/30"
            >
              <span>CONTINUE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Learning Path (Ordered Topics 01 to 06) */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-white">
          Learning Path
        </h2>

        <div className="space-y-3">
          {topics.map(topic => {
            const isMastered = topic.status === 'Mastered';
            const isInProgress = topic.status === 'In Progress';
            const isUpNext = topic.status === 'Up Next';

            return (
              <div
                key={topic.id}
                className={`bg-[#151A20] border rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  isInProgress
                    ? 'border-[#FF681F]/60 bg-[#1B222A]'
                    : isMastered
                    ? 'border-[#292F36] hover:border-[#27C281]/40'
                    : 'border-[#292F36] opacity-75'
                }`}
              >
                <div className="flex items-start sm:items-center space-x-4">
                  {/* Status Indicator */}
                  <div className="mt-0.5 sm:mt-0 shrink-0">
                    {isMastered ? (
                      <div className="w-7 h-7 rounded-full bg-[#27C281]/15 text-[#27C281] flex items-center justify-center font-bold">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    ) : isInProgress ? (
                      <div className="w-7 h-7 rounded-full bg-[#FF681F]/20 text-[#FF681F] flex items-center justify-center font-bold text-xs">
                        {topic.order}
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#292F36] text-[#9299A3] flex items-center justify-center text-xs">
                        {topic.order}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        {topic.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isMastered
                            ? 'bg-[#27C281]/20 text-[#27C281]'
                            : isInProgress
                            ? 'bg-[#FF681F]/20 text-[#FF681F]'
                            : 'bg-[#292F36] text-[#9299A3]'
                        }`}
                      >
                        {topic.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#9299A3] mt-1">
                      {topic.description}
                    </p>

                    {topic.keyFormulasOrRules && topic.keyFormulasOrRules.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {topic.keyFormulasOrRules.slice(0, 2).map((rule, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-mono bg-[#080A0D] text-[#9299A3] px-2 py-0.5 rounded border border-[#292F36]"
                          >
                            {rule}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#292F36]">
                  <button
                    onClick={() => onAskTutor(topic.title)}
                    className="px-3 py-1.5 rounded-lg bg-[#1B222A] hover:bg-[#292F36] text-xs font-semibold text-[#F4F5F7] flex items-center space-x-1.5 transition-colors border border-[#292F36]"
                  >
                    <MessageSquareCode className="w-3.5 h-3.5 text-[#FF681F]" />
                    <span>Ask AI Tutor</span>
                  </button>

                  <button
                    onClick={() => onStartPractice(topic.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#151A20] hover:bg-[#1B222A] text-xs font-semibold text-[#F4F5F7] flex items-center space-x-1.5 transition-colors border border-[#292F36]"
                  >
                    <Play className="w-3 h-3 text-[#27C281]" />
                    <span>Practise</span>
                  </button>

                  {!isMastered && (
                    <button
                      onClick={() => onCompleteTopic(topic.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#27C281]/15 hover:bg-[#27C281]/25 text-xs font-semibold text-[#27C281] transition-colors border border-[#27C281]/30"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
