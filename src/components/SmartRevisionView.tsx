import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Eye,
  CalendarCheck,
} from 'lucide-react';
import { RevisionItem, PerformanceRating } from '../types';

interface SmartRevisionViewProps {
  onAskTutor: (topicTitle?: string) => void;
  onRefreshStudent: () => void;
}

export const SmartRevisionView: React.FC<SmartRevisionViewProps> = ({
  onAskTutor,
  onRefreshStudent,
}) => {
  const [dueToday, setDueToday] = useState<RevisionItem[]>([]);
  const [thisWeek, setThisWeek] = useState<RevisionItem[]>([]);
  const [activeDrillItem, setActiveDrillItem] = useState<RevisionItem | null>(null);
  const [revealed, setRevealed] = useState(false);

  const loadSchedule = () => {
    fetch('/api/revision/schedule')
      .then(r => r.json())
      .then(data => {
        if (data.dueToday) setDueToday(data.dueToday);
        if (data.thisWeek) setThisWeek(data.thisWeek);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const handleStartDrill = (item: RevisionItem) => {
    setActiveDrillItem(item);
    setRevealed(false);
  };

  const handleCompleteRating = async (rating: PerformanceRating) => {
    if (!activeDrillItem) return;

    await fetch('/api/revision/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: activeDrillItem.id, performanceRating: rating }),
    });

    setActiveDrillItem(null);
    loadSchedule();
    onRefreshStudent();
  };

  const handlePostpone = async (id: string) => {
    await fetch('/api/revision/postpone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadSchedule();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#FF681F] mb-1">
          <RotateCcw className="w-4 h-4" />
          <span>Spaced Repetition Algorithm</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Smart Revision
        </h1>
        <p className="text-[#9299A3] text-sm mt-1">
          Recover knowledge at the optimal forgetting curve threshold (1 day, 3 days, 7 days, 14 days).
        </p>
      </div>

      {/* 3 Metric Cards matching Page 9 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#151A20] border border-[#FF681F]/50 rounded-2xl p-5 shadow-lg">
          <div className="text-xs text-[#9299A3] font-bold uppercase">Due Today</div>
          <div className="text-3xl font-black text-[#FF681F] mt-1">
            {dueToday.filter(r => r.status === 'Pending').length}
          </div>
          <div className="text-xs text-[#27C281] font-semibold mt-1">
            Ready for active recall check
          </div>
        </div>

        <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-5">
          <div className="text-xs text-[#9299A3] font-bold uppercase">This Week</div>
          <div className="text-3xl font-black text-white mt-1">
            {thisWeek.length}
          </div>
          <div className="text-xs text-[#9299A3] mt-1">
            Scheduled across spaced intervals
          </div>
        </div>

        <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-5">
          <div className="text-xs text-[#9299A3] font-bold uppercase">Recovered Concepts</div>
          <div className="text-3xl font-black text-[#27C281] mt-1">
            18
          </div>
          <div className="text-xs text-[#9299A3] mt-1">
            Successfully retained in long-term memory
          </div>
        </div>
      </div>

      {/* ACTIVE REVISION DRILL MODAL / CARD */}
      {activeDrillItem && (
        <div className="bg-[#151A20] border-2 border-[#FF681F] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="flex items-center justify-between pb-4 border-b border-[#292F36]">
            <div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-[#FF681F]/20 text-[#FF681F]">
                Active Recall Drill
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5">
                {activeDrillItem.conceptName}
              </h2>
              <p className="text-xs text-[#9299A3]">
                {activeDrillItem.subject} • Current Interval: {activeDrillItem.currentIntervalDays}d
              </p>
            </div>

            <button
              onClick={() => setActiveDrillItem(null)}
              className="text-xs text-[#9299A3] hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="bg-[#101419] p-5 rounded-xl border border-[#292F36] space-y-3">
            <div className="text-xs font-bold uppercase text-[#9299A3]">
              Recall Prompt
            </div>
            <p className="text-sm sm:text-base text-white font-medium leading-relaxed">
              {activeDrillItem.sampleQuestion ||
                `Explain the core mechanism of ${activeDrillItem.conceptName} and describe its most common pitfall.`}
            </p>
          </div>

          {!revealed ? (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setRevealed(true)}
                className="px-6 py-3 rounded-xl bg-[#FF681F] hover:bg-[#FF8247] text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-[#FF681F]/30"
              >
                <Eye className="w-4 h-4" />
                <span>Show Model Answer & Evaluate</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-[#1B222A] p-4 rounded-xl border border-[#27C281]/40 text-xs sm:text-sm text-[#F4F5F7] leading-relaxed">
                <span className="font-bold text-[#27C281] block mb-1">Key Retention Points:</span>
                • Exact address vs dereference operator distinction (* vs &)<br />
                • Operator precedence (*ptr + 1 adds 1 to value; *(ptr + 1) offsets address)<br />
                • Always check for nullptr before dereferencing
              </div>

              <div>
                <div className="text-xs font-bold uppercase text-center text-[#9299A3] mb-3">
                  How well did you recall this concept?
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleCompleteRating('again')}
                    className="p-3 rounded-xl bg-[#101419] border border-red-500/40 hover:bg-red-500/20 text-red-400 font-bold text-xs transition-colors"
                  >
                    <div>Again</div>
                    <div className="text-[10px] text-[#9299A3] font-normal mt-0.5">&lt; 1 day</div>
                  </button>

                  <button
                    onClick={() => handleCompleteRating('hard')}
                    className="p-3 rounded-xl bg-[#101419] border border-[#F2B84B]/40 hover:bg-[#F2B84B]/20 text-[#F2B84B] font-bold text-xs transition-colors"
                  >
                    <div>Hard</div>
                    <div className="text-[10px] text-[#9299A3] font-normal mt-0.5">2 days</div>
                  </button>

                  <button
                    onClick={() => handleCompleteRating('good')}
                    className="p-3 rounded-xl bg-[#101419] border border-[#27C281]/40 hover:bg-[#27C281]/20 text-[#27C281] font-bold text-xs transition-colors"
                  >
                    <div>Good</div>
                    <div className="text-[10px] text-[#9299A3] font-normal mt-0.5">7 days</div>
                  </button>

                  <button
                    onClick={() => handleCompleteRating('easy')}
                    className="p-3 rounded-xl bg-[#101419] border border-[#FF681F]/40 hover:bg-[#FF681F]/20 text-[#FF681F] font-bold text-xs transition-colors"
                  >
                    <div>Easy</div>
                    <div className="text-[10px] text-[#9299A3] font-normal mt-0.5">14 days</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TODAY'S REVISION QUEUE matching Page 9 */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-white flex items-center space-x-2">
          <CalendarCheck className="w-5 h-5 text-[#FF681F]" />
          <span>TODAY'S DUE QUEUE</span>
        </h2>

        <div className="space-y-3">
          {dueToday.map(item => (
            <div
              key={item.id}
              className="bg-[#151A20] border border-[#292F36] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#FF681F]/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase text-[#FF681F] bg-[#FF681F]/15 px-2 py-0.5 rounded">
                    {item.subject}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white">
                    {item.conceptName}
                  </span>
                </div>
                <div className="text-xs text-[#9299A3]">
                  Interval: {item.currentIntervalDays}d • Recall Streak: {item.consecutiveRecallCount} consecutive
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStartDrill(item)}
                  className="px-4 py-2 bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-[#FF681F]/25"
                >
                  START REVISION
                </button>

                <button
                  onClick={() => handlePostpone(item.id)}
                  className="px-3 py-2 bg-[#1B222A] hover:bg-[#292F36] text-[#9299A3] hover:text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Postpone
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UPCOMING REVISION (Tomorrow & Friday) matching Page 9 */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-white">
          Upcoming Spaced Revisions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {thisWeek.map(item => (
            <div
              key={item.id}
              className="bg-[#151A20] border border-[#292F36] rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-[#9299A3]">
                  Due: {item.duePeriod}
                </span>
                <h4 className="text-base font-bold text-white mt-1">
                  {item.conceptName}
                </h4>
                <div className="text-xs text-[#9299A3] mt-0.5">
                  {item.subject} • Interval: {item.currentIntervalDays}d
                </div>
              </div>

              <button
                onClick={() => handleStartDrill(item)}
                className="px-3 py-1.5 bg-[#1B222A] hover:bg-[#292F36] text-white text-xs font-semibold rounded-lg border border-[#292F36]"
              >
                Review Early
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
