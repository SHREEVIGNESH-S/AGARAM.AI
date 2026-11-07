import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldAlert,
  Play,
  Layers,
} from 'lucide-react';
import { KnowledgeGap } from '../types';

interface KnowledgeGapsViewProps {
  onAskTutor: (topicTitle?: string) => void;
  onTakeAssessment: (topicTitle?: string) => void;
  onRefreshStudent: () => void;
}

export const KnowledgeGapsView: React.FC<KnowledgeGapsViewProps> = ({
  onAskTutor,
  onTakeAssessment,
  onRefreshStudent,
}) => {
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedRecoveryGap, setSelectedRecoveryGap] = useState<KnowledgeGap | null>(null);

  const loadGaps = () => {
    fetch('/api/knowledge-gaps')
      .then(r => r.json())
      .then(data => {
        if (data.gaps) {
          setGaps(data.gaps);
          if (!selectedRecoveryGap && data.gaps.length > 0) {
            setSelectedRecoveryGap(data.gaps[0]);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadGaps();
  }, []);

  const handleResolveGap = async (id: string) => {
    await fetch('/api/knowledge-gaps/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadGaps();
    onRefreshStudent();
  };

  const activeGaps = gaps.filter(g => !g.cleared);
  const clearedGaps = gaps.filter(g => g.cleared);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#EF6262] mb-1">
          <AlertCircle className="w-4 h-4" />
          <span>Cognitive Diagnosis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Knowledge Gaps & Recovery
        </h1>
        <p className="text-[#9299A3] text-sm mt-1">
          Detect concepts where subjective confidence diverges from empirical problem-solving accuracy.
        </p>
      </div>

      {/* 3 Metric Cards matching Page 11 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#151A20] border border-[#EF6262]/40 rounded-2xl p-5">
          <div className="text-xs text-[#9299A3] uppercase font-bold">Gaps Detected</div>
          <div className="text-3xl font-black text-[#EF6262] mt-1">
            {activeGaps.length}
          </div>
          <div className="text-xs text-[#EF6262] font-semibold mt-1">Require targeted intervention</div>
        </div>

        <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-5">
          <div className="text-xs text-[#9299A3] uppercase font-bold">Hidden Weaknesses</div>
          <div className="text-3xl font-black text-[#F2B84B] mt-1">
            2
          </div>
          <div className="text-xs text-[#9299A3] mt-1">Overconfidence bias identified</div>
        </div>

        <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-5">
          <div className="text-xs text-[#9299A3] uppercase font-bold">Recently Cleared</div>
          <div className="text-3xl font-black text-[#27C281] mt-1">
            {clearedGaps.length + 5}
          </div>
          <div className="text-xs text-[#27C281] font-semibold mt-1">Remediated through drills</div>
        </div>
      </div>

      {/* 4-STEP KNOWLEDGE RECOVERY METHOD matching Page 12 */}
      {selectedRecoveryGap && (
        <div className="bg-[#151A20] border-2 border-[#FF681F]/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#292F36]">
            <div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-[#FF681F]/20 text-[#FF681F]">
                Knowledge Recovery Protocol
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5">
                Target Concept: {selectedRecoveryGap.conceptName}
              </h2>
              <p className="text-xs text-[#9299A3]">
                {selectedRecoveryGap.subject} • Severity: {selectedRecoveryGap.severity}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onAskTutor(selectedRecoveryGap.conceptName)}
                className="px-4 py-2 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-bold transition-colors"
              >
                Launch Recovery Tutor
              </button>
            </div>
          </div>

          {/* 4 Steps Visual Tracker */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { num: 1, title: '01. Recall', desc: 'Active retrieval prompt without looking at notes' },
              { num: 2, title: '02. Review Example', desc: 'Trace clean verified model demonstration' },
              { num: 3, title: '03. Solve Questions', desc: '2 targeted problem checks' },
              { num: 4, title: '04. Confirm', desc: 'Empirical gap closure recorded' },
            ].map(step => (
              <button
                key={step.num}
                onClick={() => setActiveStep(step.num)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  activeStep === step.num
                    ? 'bg-[#1B222A] border-[#FF681F] shadow-md'
                    : 'bg-[#101419] border-[#292F36] opacity-75'
                }`}
              >
                <div
                  className={`text-xs font-bold uppercase ${
                    activeStep === step.num ? 'text-[#FF681F]' : 'text-[#9299A3]'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-[11px] text-[#9299A3] mt-1 leading-tight">
                  {step.desc}
                </div>
              </button>
            ))}
          </div>

          {/* Step Content */}
          <div className="bg-[#101419] p-5 rounded-xl border border-[#292F36] space-y-4">
            {activeStep === 1 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">Step 1: Attempt Mental Recall</h4>
                <p className="text-xs sm:text-sm text-[#F4F5F7] leading-relaxed">
                  In your own words: what is the fundamental rule of <strong>{selectedRecoveryGap.conceptName}</strong>?
                  Why did your previous attempt produce an index or calculation discrepancy?
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-4 py-2 bg-[#1B222A] hover:bg-[#FF681F] text-white text-xs font-semibold rounded-lg transition-colors border border-[#292F36]"
                  >
                    Next: Review Worked Example -&gt;
                  </button>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">Step 2: Trace The Canonical Model</h4>
                <div className="bg-[#080A0D] p-3 rounded-lg font-mono text-xs text-[#FF8247] border border-[#292F36]">
                  {`// Verified demonstration:\nint arr[3] = {10, 20, 30};\nint* ptr = arr;\ncout << *(ptr + 1); // Exact offset: 20 (not 11)`}
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveStep(3)}
                    className="px-4 py-2 bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Next: Solve 2 Recovery Questions -&gt;
                  </button>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Step 3: Verification Problem</h4>
                <p className="text-xs text-[#F4F5F7]">
                  Given <code>int* p = &v;</code>, what is the operator difference between <code>*p + 1</code> and <code>*(p + 1)</code>?
                </p>
                <button
                  onClick={() => setActiveStep(4)}
                  className="px-4 py-2 bg-[#27C281] hover:bg-[#27C281]/90 text-black text-xs font-bold rounded-lg transition-colors"
                >
                  I Understand: Proceed to Confirm Closure -&gt;
                </button>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-[#27C281] font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Knowledge Gap Cleared Successfully!</span>
                </div>
                <p className="text-xs text-[#9299A3]">
                  Hindsight memory updated. This concept will now enter the 3-day spaced repetition queue.
                </p>
                <button
                  onClick={() => handleResolveGap(selectedRecoveryGap.id)}
                  className="px-5 py-2.5 bg-[#27C281] hover:bg-[#27C281]/90 text-black text-xs font-bold rounded-lg"
                >
                  Confirm & Mark Gap Cleared (+50 XP)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRIORITY KNOWLEDGE GAPS LIST matching Page 11 */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-white">
          Priority Concepts Requiring Attention
        </h2>

        <div className="space-y-3">
          {activeGaps.map(gap => {
            const isHigh = gap.severity === 'High';
            const isMedium = gap.severity === 'Medium';

            return (
              <div
                key={gap.id}
                onClick={() => setSelectedRecoveryGap(gap)}
                className="bg-[#151A20] border border-[#292F36] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#FF681F]/50 cursor-pointer transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isHigh
                          ? 'bg-[#EF6262]/20 text-[#EF6262]'
                          : isMedium
                          ? 'bg-[#F2B84B]/20 text-[#F2B84B]'
                          : 'bg-[#9299A3]/20 text-[#9299A3]'
                      }`}
                    >
                      {gap.severity} Priority
                    </span>
                    <span className="text-base font-bold text-white">
                      {gap.conceptName}
                    </span>
                    <span className="text-xs text-[#9299A3]">
                      ({gap.subject})
                    </span>
                  </div>

                  <div className="bg-[#101419] p-3 rounded-lg border border-[#292F36] text-xs space-y-1">
                    <div className="text-[#EF6262] font-semibold">
                      {gap.confidenceVsAccuracy}
                    </div>
                    <div className="text-[#9299A3]">{gap.evidence}</div>
                  </div>

                  <div className="text-xs text-[#F4F5F7]">
                    <strong className="text-[#FF681F]">Recommendation: </strong>
                    {gap.recommendedAction}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#292F36]">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onTakeAssessment(gap.conceptName);
                    }}
                    className="px-4 py-2 bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-[#FF681F]/25"
                  >
                    TEST UNDERSTANDING
                  </button>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleResolveGap(gap.id);
                    }}
                    className="px-3 py-2 bg-[#1B222A] hover:bg-[#27C281]/20 text-[#27C281] text-xs font-semibold rounded-lg border border-[#27C281]/30 transition-colors"
                  >
                    Mark Cleared
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
