import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  X,
  Gauge,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface VoiceExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  textToSpeak: string;
  conceptTitle?: string;
}

export const VoiceExplainerModal: React.FC<VoiceExplainerModalProps> = ({
  isOpen,
  onClose,
  textToSpeak,
  conceptTitle = 'Concept Explanation',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        if (available.length > 0) {
          setVoices(available);
          // Prefer English voice
          const enIdx = available.findIndex(v => v.lang.startsWith('en'));
          if (enIdx !== -1) setSelectedVoiceIndex(enIdx);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // When modal opens with new text, auto-start speaking
  useEffect(() => {
    if (isOpen && textToSpeak) {
      speak(textToSpeak);
    } else {
      stop();
    }
    return () => {
      stop();
    };
  }, [isOpen, textToSpeak]);

  const speak = (content: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Clean markdown symbols for natural voice narration
    const cleanText = content
      .replace(/[*#_`>]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseResume = () => {
    if (typeof window === 'undefined') return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        speak(textToSpeak);
      }
    }
  };

  const stop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#151A20] border-2 border-[#FF681F] rounded-2xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#292F36]">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-[#FF681F] animate-pulse" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              Voice Tutor Narration
            </h3>
          </div>

          <button
            onClick={() => {
              stop();
              onClose();
            }}
            className="p-1 rounded-lg text-[#9299A3] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Concept Title */}
        <div className="mt-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF681F]">
            AUDIO CONCEPT BREAKDOWN
          </span>
          <h4 className="text-xl font-black text-white mt-0.5">
            {conceptTitle}
          </h4>
        </div>

        {/* Audio Wave Visualizer Animation */}
        <div className="my-6 bg-[#080A0D] border border-[#292F36] rounded-xl p-5 flex flex-col items-center justify-center">
          <div className="flex items-center space-x-1.5 h-12">
            {[35, 60, 90, 45, 80, 100, 70, 50, 85, 40, 65, 95, 55, 75, 40].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlaying ? 'bg-[#FF681F]' : 'bg-[#292F36]'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(15, (h * (i % 2 === 0 ? 0.9 : 1.1)) % 100)}%` : '15%',
                  animationDuration: `${0.4 + (i % 5) * 0.1}s`,
                }}
              />
            ))}
          </div>
          <div className="text-[11px] font-semibold text-[#9299A3] mt-2">
            {isPlaying ? 'Speaking explanation...' : 'Paused'}
          </div>
        </div>

        {/* Text Transcript Box */}
        <div className="max-h-36 overflow-y-auto bg-[#101419] p-4 rounded-xl border border-[#292F36] text-xs text-[#F4F5F7] leading-relaxed mb-5">
          {textToSpeak}
        </div>

        {/* Controls: Play/Pause, Stop, Speed */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#292F36]">
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePauseResume}
              className="px-5 py-2.5 rounded-xl bg-[#FF681F] hover:bg-[#FF8247] text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md shadow-[#FF681F]/30"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              onClick={stop}
              className="p-2.5 rounded-xl bg-[#101419] hover:bg-[#1B222A] border border-[#292F36] text-[#9299A3] hover:text-white"
              title="Stop Narration"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center space-x-2 text-xs">
            <Gauge className="w-3.5 h-3.5 text-[#9299A3]" />
            <span className="text-[#9299A3]">Speed:</span>
            {[0.8, 1.0, 1.2, 1.5].map(s => (
              <button
                key={s}
                onClick={() => {
                  setRate(s);
                  speak(textToSpeak);
                }}
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  rate === s
                    ? 'bg-[#FF681F] text-white'
                    : 'bg-[#101419] text-[#9299A3] hover:text-white border border-[#292F36]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
