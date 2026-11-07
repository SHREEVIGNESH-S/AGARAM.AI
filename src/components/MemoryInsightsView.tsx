import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  Cloud,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Database,
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react';
import { MemoryRecord, HindsightStatus } from '../types';

interface MemoryInsightsViewProps {
  onAskTutor: (topicTitle?: string) => void;
}

export const MemoryInsightsView: React.FC<MemoryInsightsViewProps> = ({ onAskTutor }) => {
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [whatTutorLearned, setWhatTutorLearned] = useState<string[]>([]);
  const [reflections, setReflections] = useState<{
    patterns: string[];
    insights: string[];
    suggestedAction: string;
  } | null>(null);
  const [hindsightStatus, setHindsightStatus] = useState<HindsightStatus | null>(null);

  // Cloud reflection state
  const [isReflecting, setIsReflecting] = useState(false);
  const [cloudReflection, setCloudReflection] = useState<string | null>(null);

  // Diagnostics test state
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<{
    allPassed: boolean;
    results: Record<string, { pass: boolean; details: string }>;
  } | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Manual retain state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newObservation, setNewObservation] = useState('');
  const [newSubject, setNewSubject] = useState('Computer Science');
  const [newTopic, setNewTopic] = useState('Pointer Arithmetic');
  const [newClassification, setNewClassification] = useState<'observed' | 'gap' | 'preference'>('observed');
  const [isSubmittingRetain, setIsSubmittingRetain] = useState(false);

  const loadMemories = () => {
    fetch('/api/memory/insights')
      .then(r => r.json())
      .then(data => {
        if (data.memories) setMemories(data.memories);
        if (data.whatTutorLearned) setWhatTutorLearned(data.whatTutorLearned);
        if (data.reflections) setReflections(data.reflections);
        if (data.hindsight) setHindsightStatus(data.hindsight);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleDeleteMemory = async (id: string) => {
    await fetch(`/api/memory/${id}`, { method: 'DELETE' });
    loadMemories();
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to delete your stored learning memory history?')) {
      await fetch('/api/memory/clear', { method: 'POST' });
      loadMemories();
    }
  };

  const handleTriggerCloudReflection = async () => {
    setIsReflecting(true);
    try {
      const res = await fetch('/api/hindsight/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Synthesize the student’s learning trajectory, recurrent misconceptions, and optimal adaptive teaching strategies.',
        }),
      });
      const data = await res.json();
      if (data.reflectionText) {
        setCloudReflection(data.reflectionText);
      }
    } catch (err) {
      console.error('Reflection failed', err);
    } finally {
      setIsReflecting(false);
    }
  };

  const handleRunDiagnostics = async () => {
    setIsRunningTests(true);
    setShowDiagnostics(true);
    try {
      const res = await fetch('/api/hindsight/test');
      const data = await res.json();
      setTestResults(data);
    } catch (err) {
      console.error('Diagnostics failed', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObservation.trim()) return;

    setIsSubmittingRetain(true);
    try {
      await fetch('/api/hindsight/retain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newObservation.trim(),
          context: `Manual Tutor Entry - ${newSubject}`,
          subject: newSubject,
          topic: newTopic,
          classification: newClassification,
          tags: [newSubject, newTopic, 'Observation'],
        }),
      });
      setNewObservation('');
      setShowAddModal(false);
      loadMemories();
    } catch (err) {
      console.error('Retain observation failed', err);
    } finally {
      setIsSubmittingRetain(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#FF681F] mb-1">
            <Brain className="w-4 h-4" />
            <span>Hindsight Memory Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Memory Insights & Cloud Intelligence
          </h1>
          <p className="text-[#9299A3] text-sm mt-1">
            How AGARAM remembers your interactions, retains educational observations, reflects across sessions, and recalls context into AI Tutor.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto flex-wrap gap-y-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-lg bg-[#FF681F] hover:bg-[#E55310] text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors shadow-md"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Observation</span>
          </button>

          <button
            onClick={handleRunDiagnostics}
            className="px-3.5 py-2 rounded-lg bg-[#151A20] hover:bg-[#1B222A] border border-[#292F36] hover:border-[#FF681F]/40 text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#27C281]" />
            <span>Verify Engine</span>
          </button>

          <button
            onClick={handleClearAll}
            className="px-3.5 py-2 rounded-lg bg-[#151A20] hover:bg-red-500/15 border border-[#292F36] hover:border-red-500/40 text-xs font-semibold text-[#9299A3] hover:text-red-400 flex items-center space-x-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Cloud Status Banner */}
      <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className={`p-2.5 rounded-xl ${hindsightStatus?.connected ? 'bg-[#27C281]/15 text-[#27C281]' : 'bg-[#F2B84B]/15 text-[#F2B84B]'}`}>
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">
                {hindsightStatus?.connected ? 'Hindsight Cloud Memory: Active & Connected' : 'Hindsight Local Adaptive Memory'}
              </span>
              <span className={`inline-block w-2 h-2 rounded-full ${hindsightStatus?.connected ? 'bg-[#27C281] animate-pulse' : 'bg-[#F2B84B]'}`} />
              {hindsightStatus?.apiVersion && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#1B222A] border border-[#292F36] text-[#9299A3]">
                  v{hindsightStatus.apiVersion}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-[#9299A3] mt-0.5">
              <span>Personal Bank:</span>
              <code className="text-[#FF681F] font-mono font-medium">
                {hindsightStatus?.bankId || 'agaram-student-student-1'}
              </code>
              <span className="text-[#555C68]">•</span>
              <span>Isolated UUID Boundary</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleTriggerCloudReflection}
          disabled={isReflecting}
          className="px-4 py-2 rounded-xl bg-[#1B222A] hover:bg-[#FF681F] border border-[#292F36] hover:border-[#FF681F] text-xs font-bold text-white flex items-center justify-center space-x-2 transition-all self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isReflecting ? 'animate-spin' : ''}`} />
          <span>{isReflecting ? 'Synthesizing...' : 'Trigger Cloud Reflection'}</span>
        </button>
      </div>

      {/* Diagnostics Modal / Panel */}
      {showDiagnostics && (
        <div className="bg-[#1B222A] border border-[#27C281]/50 rounded-2xl p-6 space-y-4 shadow-2xl relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#27C281]">
              <ShieldCheck className="w-4 h-4" />
              <span>Hindsight Cloud Integration Verification Suite</span>
            </div>
            <button
              onClick={() => setShowDiagnostics(false)}
              className="text-xs text-[#9299A3] hover:text-white px-2 py-1 rounded-md bg-[#151A20]"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-[#9299A3]">
            Runs full end-to-end tests against Hindsight Cloud: Authentication, Bank Provisioning, Retain, Recall, Reflect, Two-Student Memory Isolation, and Cleanup.
          </p>

          {isRunningTests ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 text-[#FF681F] animate-spin" />
              <span className="text-xs text-[#F4F5F7]">Executing live Hindsight Cloud test suite...</span>
            </div>
          ) : testResults ? (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#292F36]">
                <span className="text-xs font-bold text-white">Overall Status:</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${testResults.allPassed ? 'bg-[#27C281]/20 text-[#27C281]' : 'bg-red-500/20 text-red-400'}`}>
                  {testResults.allPassed ? 'ALL TESTS PASSED (7/7)' : 'FAILURES DETECTED'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(testResults.results || {}).map(([key, item]) => (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-[#151A20] border border-[#292F36] flex items-start space-x-2.5"
                  >
                    {item.pass ? (
                      <CheckCircle2 className="w-4 h-4 text-[#27C281] shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs space-y-0.5 overflow-hidden">
                      <div className="font-bold text-white capitalize">
                        {key.replace(/^\d+_/, '').replace(/_/g, ' ')}
                      </div>
                      <div className="text-[#9299A3] text-[11px] leading-relaxed break-words">
                        {item.details}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Cloud Cognitive Reflection Result Card */}
      {cloudReflection && (
        <div className="bg-[#1B222A] border border-[#FF681F]/60 rounded-2xl p-6 sm:p-7 space-y-3 shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#FF681F]">
            <Zap className="w-4 h-4" />
            <span>Live Hindsight Cross-Session Cognitive Synthesis</span>
          </div>
          <div className="p-4 rounded-xl bg-[#151A20] border border-[#292F36] text-xs sm:text-sm text-[#F4F5F7] leading-relaxed font-sans">
            {cloudReflection}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => onAskTutor('Pointer Arithmetic')}
              className="text-xs text-[#FF681F] hover:underline font-bold flex items-center space-x-1"
            >
              <span>Personalize AI Tutor with this insight</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3 Pillars of Hindsight Memory: Retain / Reflect / Recall */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-5 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#27C281]">
            01. RETAIN
          </div>
          <h3 className="text-base font-bold text-white">Observations & Evidence</h3>
          <p className="text-xs text-[#9299A3] leading-relaxed">
            Captures meaningful educational observations: strengths, misconceptions, assessment gaps, and preferred teaching formats into your student memory bank.
          </p>
        </div>

        <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-5 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#FF681F]">
            02. REFLECT
          </div>
          <h3 className="text-base font-bold text-white">Cross-Session Synthesis</h3>
          <p className="text-xs text-[#9299A3] leading-relaxed">
            Synthesizes trends across multiple sessions and assessments to deduce optimal cognitive explanations, pacing, and remediation.
          </p>
        </div>

        <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-5 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#F2B84B]">
            03. RECALL
          </div>
          <h3 className="text-base font-bold text-white">Dynamic Context Injection</h3>
          <p className="text-xs text-[#9299A3] leading-relaxed">
            Queries your personal bank before AI answers every question, passing context without overriding your prompt or leaking between students.
          </p>
        </div>
      </div>

      {/* What Your Tutor Has Learned Card matching Page 8 */}
      <div className="bg-[#1B222A] border border-[#FF681F]/40 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#FF681F]">
          <Sparkles className="w-4 h-4" />
          <span>What Your Tutor Has Learned</span>
        </div>

        <div className="space-y-3">
          {whatTutorLearned.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#151A20] border border-[#292F36] flex items-start space-x-3"
            >
              <Lightbulb className="w-4 h-4 text-[#F2B84B] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#F4F5F7] leading-relaxed">
                {item}
              </p>
            </div>
          ))}
        </div>

        {reflections?.suggestedAction && (
          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-[#9299A3]">
              Next Suggested Adaptive Step: <strong className="text-white">{reflections.suggestedAction}</strong>
            </span>
            <button
              onClick={() => onAskTutor('Pointer Arithmetic')}
              className="text-[#FF681F] hover:underline font-bold"
            >
              Take Action -&gt;
            </button>
          </div>
        )}
      </div>

      {/* Memory Activity Log matching Page 8 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-white">
            Recorded Learning Observations ({memories.length})
          </h2>
          <span className="text-xs text-[#9299A3]">
            Synced with Hindsight Cloud Bank
          </span>
        </div>

        <div className="space-y-3">
          {memories.map(mem => {
            const isEffective = mem.classification === 'Effective';
            const isPattern = mem.classification === 'Pattern';
            const isRetained = mem.classification === 'Retained';

            return (
              <div
                key={mem.id}
                className="bg-[#151A20] border border-[#292F36] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#FF681F]/40 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-bold text-white">
                      {mem.topicTitle}
                    </span>
                    <span className="text-xs text-[#9299A3]">
                      ({mem.subjectName})
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isEffective
                          ? 'bg-[#27C281]/20 text-[#27C281]'
                          : isPattern
                          ? 'bg-[#FF681F]/20 text-[#FF681F]'
                          : 'bg-[#F2B84B]/20 text-[#F2B84B]'
                      }`}
                    >
                      {mem.classification}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#F4F5F7] leading-relaxed">
                    {mem.observation}
                  </p>

                  <div className="text-xs text-[#9299A3] flex items-center space-x-2">
                    <span className="text-[#FF681F] font-semibold">Tutor strategy:</span>
                    <span>{mem.actionableInsight}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#292F36]">
                  <button
                    onClick={() => onAskTutor(mem.topicTitle)}
                    className="px-3 py-1.5 bg-[#1B222A] hover:bg-[#FF681F] text-white text-xs font-semibold rounded-lg transition-colors border border-[#292F36]"
                  >
                    REVIEW
                  </button>

                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="p-1.5 text-[#9299A3] hover:text-[#EF6262] transition-colors"
                    title="Remove observation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Observation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Brain className="w-4 h-4 text-[#FF681F]" />
                <span>Retain Educational Observation</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#9299A3] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddObservation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9299A3] mb-1">
                  Learning Observation
                </label>
                <textarea
                  rows={3}
                  value={newObservation}
                  onChange={e => setNewObservation(e.target.value)}
                  placeholder="e.g. Student mastered memory address tracing with visual tables but struggled with void pointers."
                  className="w-full bg-[#1B222A] border border-[#292F36] rounded-xl p-3 text-xs text-white placeholder-[#555C68] focus:outline-none focus:border-[#FF681F]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9299A3] mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="w-full bg-[#1B222A] border border-[#292F36] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FF681F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9299A3] mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                    className="w-full bg-[#1B222A] border border-[#292F36] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FF681F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9299A3] mb-1">
                  Classification
                </label>
                <select
                  value={newClassification}
                  onChange={e => setNewClassification(e.target.value as any)}
                  className="w-full bg-[#1B222A] border border-[#292F36] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FF681F]"
                >
                  <option value="observed">Observed Fact / Progress</option>
                  <option value="gap">Knowledge Gap / Misconception</option>
                  <option value="preference">Preferred Teaching Style</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-[#1B222A] text-xs font-semibold text-[#9299A3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRetain}
                  className="px-4 py-2 rounded-xl bg-[#FF681F] hover:bg-[#E55310] text-xs font-bold text-white flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingRetain ? 'Retaining...' : 'Retain to Cloud'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
