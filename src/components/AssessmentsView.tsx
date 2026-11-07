import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Award,
  Play,
  BarChart2,
} from 'lucide-react';
import { Assessment, AssessmentQuestion } from '../types';

interface AssessmentsViewProps {
  onAskTutor: (topicTitle?: string) => void;
  onRefreshStudent: () => void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({
  onAskTutor,
  onRefreshStudent,
}) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | string>>({});
  const [selfConfidence, setSelfConfidence] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<Assessment | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const loadAssessments = () => {
    fetch('/api/assessments')
      .then(r => r.json())
      .then((data: Assessment[]) => {
        setAssessments(data);
        // If an assessment has been completed, show it as initial result example
        const completed = data.find(a => a.completed);
        if (completed && !assessmentResult && !activeAssessment) {
          setAssessmentResult(completed);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  // Timer when active
  useEffect(() => {
    let timer: any = null;
    if (activeAssessment && !assessmentResult) {
      timer = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeAssessment, assessmentResult]);

  const handleStartAssessment = (assessment: Assessment) => {
    setActiveAssessment(assessment);
    setAssessmentResult(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setElapsedSeconds(0);
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number | string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitAssessment = async () => {
    if (!activeAssessment) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/assessments/${activeAssessment.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: selectedAnswers,
          timeSpentSeconds: elapsedSeconds,
          selfConfidenceRating: selfConfidence,
        }),
      });
      const data = await res.json();
      if (data.assessment) {
        setAssessmentResult(data.assessment);
        setActiveAssessment(null);
        loadAssessments();
        onRefreshStudent();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#FF681F] mb-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>Evaluation Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Assessments & Quizzes
        </h1>
        <p className="text-[#9299A3] text-sm mt-1">
          Adaptive tests, quick topic checks, and targeted recovery practice.
        </p>
      </div>

      {/* 3 Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#151A20] border border-[#292F36] rounded-xl p-5">
          <div className="text-xs text-[#9299A3] font-semibold uppercase">Assessments Taken</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {assessments.filter(a => a.completed).length + 3}
          </div>
          <div className="text-xs text-[#27C281] font-semibold mt-1">All attempts saved permanently</div>
        </div>

        <div className="bg-[#151A20] border border-[#292F36] rounded-xl p-5">
          <div className="text-xs text-[#9299A3] font-semibold uppercase">Average Accuracy</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#27C281] mt-1">
            80%
          </div>
          <div className="text-xs text-[#9299A3] mt-1">Across 142 total question items</div>
        </div>

        <div className="bg-[#151A20] border border-[#292F36] rounded-xl p-5">
          <div className="text-xs text-[#9299A3] font-semibold uppercase">Questions Solved</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            142
          </div>
          <div className="text-xs text-[#FF681F] font-semibold mt-1">+18 this week</div>
        </div>
      </div>

      {/* ACTIVE ASSESSMENT TAKER */}
      {activeAssessment && !assessmentResult && (
        <div className="bg-[#151A20] border border-[#FF681F] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-[#292F36]">
            <div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-[#FF681F]/20 text-[#FF681F]">
                {activeAssessment.mode}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5">
                {activeAssessment.title}
              </h2>
            </div>

            <div className="flex items-center space-x-2 text-[#F4F5F7] bg-[#101419] px-3 py-1.5 rounded-lg border border-[#292F36] text-xs font-mono">
              <Clock className="w-4 h-4 text-[#FF681F]" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
          </div>

          {/* Current Question */}
          {activeAssessment.questions[currentQuestionIndex] && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-[#9299A3]">
                <span>
                  Question {currentQuestionIndex + 1} of {activeAssessment.questions.length}
                </span>
                <span className="font-semibold text-white">
                  {activeAssessment.questions[currentQuestionIndex].topicName}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {activeAssessment.questions[currentQuestionIndex].question}
              </h3>

              {/* Code snippet if present */}
              {activeAssessment.questions[currentQuestionIndex].codeSnippet && (
                <div className="bg-[#080A0D] border border-[#292F36] rounded-xl p-4 font-mono text-xs sm:text-sm text-[#FF8247] overflow-x-auto">
                  <pre>{activeAssessment.questions[currentQuestionIndex].codeSnippet}</pre>
                </div>
              )}

              {/* Options */}
              <div className="space-y-3 pt-2">
                {activeAssessment.questions[currentQuestionIndex].options?.map((opt, idx) => {
                  const qId = activeAssessment.questions[currentQuestionIndex].id;
                  const isSelected = selectedAnswers[qId] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(qId, idx)}
                      className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#FF681F]/20 border-2 border-[#FF681F] text-white shadow-md'
                          : 'bg-[#101419] border border-[#292F36] text-[#F4F5F7] hover:border-[#FF681F]/50'
                      }`}
                    >
                      <span>{opt}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#FF681F] bg-[#FF681F]' : 'border-[#292F36]'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Confidence Rating Slider (for knowledge gap detection) */}
              <div className="mt-6 pt-4 border-t border-[#292F36] bg-[#101419] p-4 rounded-xl">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold uppercase text-[#FF681F]">
                    Indicate Your Confidence (1-5)
                  </span>
                  <span className="text-white font-bold">{selfConfidence} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={selfConfidence}
                  onChange={e => setSelfConfidence(Number(e.target.value))}
                  className="w-full accent-[#FF681F] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#9299A3] mt-1">
                  <span>1 - Guessing</span>
                  <span>3 - Somewhat sure</span>
                  <span>5 - Fully confident</span>
                </div>
              </div>

              {/* Navigation & Submit Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#292F36]">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(i => i - 1)}
                  className="px-4 py-2 rounded-lg bg-[#101419] border border-[#292F36] text-xs font-semibold text-[#9299A3] hover:text-white disabled:opacity-30"
                >
                  Previous
                </button>

                {currentQuestionIndex < activeAssessment.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex(i => i + 1)}
                    className="px-5 py-2.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitAssessment}
                    className="px-6 py-2.5 rounded-lg bg-[#27C281] hover:bg-[#27C281]/90 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#27C281]/25"
                  >
                    {isSubmitting ? 'Evaluating...' : 'SUBMIT ASSESSMENT'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ASSESSMENT RESULTS VIEW (matching Page 7 specification) */}
      {assessmentResult && (
        <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#292F36]">
            <div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-[#27C281]/20 text-[#27C281]">
                Completed Assessment
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5">
                {assessmentResult.title}
              </h2>
              <p className="text-xs text-[#9299A3] mt-1">
                Completed {assessmentResult.completedAt || 'Recently'} • {assessmentResult.subject}
              </p>
            </div>

            <button
              onClick={() => handleStartAssessment(assessmentResult)}
              className="px-4 py-2 bg-[#1B222A] hover:bg-[#292F36] text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 border border-[#292F36]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#FF681F]" />
              <span>Retake Quiz</span>
            </button>
          </div>

          {/* Results Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#101419] border border-[#292F36] rounded-xl p-4">
              <div className="text-xs text-[#9299A3] uppercase font-bold">Total Score</div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {assessmentResult.score ?? 8} / 10
              </div>
            </div>

            <div className="bg-[#101419] border border-[#292F36] rounded-xl p-4">
              <div className="text-xs text-[#9299A3] uppercase font-bold">Accuracy</div>
              <div className="text-2xl sm:text-3xl font-black text-[#27C281] mt-1">
                {assessmentResult.accuracyPercentage ?? 80}%
              </div>
            </div>

            <div className="bg-[#101419] border border-[#292F36] rounded-xl p-4">
              <div className="text-xs text-[#9299A3] uppercase font-bold">Time Taken</div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {Math.round((assessmentResult.timeSpentSeconds || 720) / 60)} mins
              </div>
            </div>

            <div className="bg-[#101419] border border-[#292F36] rounded-xl p-4">
              <div className="text-xs text-[#9299A3] uppercase font-bold">Confidence Gap</div>
              <div className="text-2xl sm:text-3xl font-black text-[#F2B84B] mt-1">
                {assessmentResult.confidenceGapPercentage ?? 18}%
              </div>
            </div>
          </div>

          {/* Topic-wise breakdown matching Page 7 */}
          {assessmentResult.topicBreakdown && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9299A3]">
                Topic-Wise Performance Breakdown
              </h3>
              <div className="space-y-2">
                {assessmentResult.topicBreakdown.map((t, idx) => (
                  <div key={idx} className="bg-[#101419] p-3 rounded-xl border border-[#292F36]">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-white">{t.topic}</span>
                      <span
                        className={
                          t.scorePercentage >= 80
                            ? 'text-[#27C281]'
                            : t.scorePercentage >= 60
                            ? 'text-[#F2B84B]'
                            : 'text-[#EF6262]'
                        }
                      >
                        {t.scorePercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-[#1B222A] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          t.scorePercentage >= 80
                            ? 'bg-[#27C281]'
                            : t.scorePercentage >= 60
                            ? 'bg-[#F2B84B]'
                            : 'bg-[#EF6262]'
                        }`}
                        style={{ width: `${t.scorePercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended actions */}
          {assessmentResult.recommendedActions && (
            <div className="bg-[#1B222A] border border-[#292F36] rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold uppercase text-[#FF681F]">
                Recommended Actions
              </div>
              <ul className="text-xs text-[#F4F5F7] space-y-1.5 list-disc list-inside">
                {assessmentResult.recommendedActions.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
              <div className="pt-2">
                <button
                  onClick={() => onAskTutor(assessmentResult.topic)}
                  className="px-4 py-2 bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Review Weak Areas in AI Tutor -&gt;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Available Assessments List */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-white">
          Curated & Adaptive Assessments
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assessments.map(assess => (
            <div
              key={assess.id}
              className="bg-[#151A20] border border-[#292F36] rounded-2xl p-6 flex flex-col justify-between hover:border-[#FF681F]/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#101419] border border-[#292F36] text-[#FF681F]">
                    {assess.subject}
                  </span>
                  <span className="text-[10px] font-semibold text-[#9299A3]">
                    {assess.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-3">
                  {assess.title}
                </h3>
                <p className="text-xs text-[#9299A3] mt-1">
                  Topic: {assess.topic}
                </p>

                <div className="mt-4 flex items-center space-x-4 text-xs text-[#9299A3]">
                  <span>{assess.questionsCount || assess.questions.length} Questions</span>
                  <span>•</span>
                  <span>~{assess.estimatedDurationMinutes} mins</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#292F36] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#FF681F]">
                  {assess.mode}
                </span>

                <button
                  onClick={() => handleStartAssessment(assess)}
                  className="px-4 py-2 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-[#FF681F]/20"
                >
                  START -&gt;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
