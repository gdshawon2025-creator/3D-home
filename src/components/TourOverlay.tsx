import React, { useEffect, useState } from 'react';
import { ViewMode, Language } from '../types/office';
import { TOUR_STEPS } from '../data/officeData';
import { soundManager } from '../utils/audio';
import { Play, Pause, ChevronRight, ChevronLeft, X, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TourOverlayProps {
  language: Language;
  onSelectView: (view: ViewMode) => void;
  onClose: () => void;
}

export const TourOverlay: React.FC<TourOverlayProps> = ({
  language,
  onSelectView,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const step = TOUR_STEPS[currentStepIndex];

  // Update view when step changes
  useEffect(() => {
    onSelectView(step.view);
  }, [currentStepIndex, step.view, onSelectView]);

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next step
          if (currentStepIndex < TOUR_STEPS.length - 1) {
            setCurrentStepIndex((s) => s + 1);
            return 0;
          } else {
            // Tour complete!
            soundManager.playSuccess();
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
            setIsPlaying(false);
            return 100;
          }
        }
        return prev + 2.5; // ~4 seconds per step
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex]);

  const handleNext = () => {
    soundManager.playClick();
    setProgress(0);
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((s) => s + 1);
    } else {
      soundManager.playSuccess();
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  const handlePrev = () => {
    soundManager.playClick();
    setProgress(0);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((s) => s - 1);
    }
  };

  const handleTogglePlay = () => {
    soundManager.playClick();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="absolute inset-x-0 bottom-24 z-30 pointer-events-none flex justify-center px-4">
      <div className="glass-panel p-5 rounded-3xl shadow-2xl border border-white/70 max-w-xl w-full pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Top bar with progress and exit */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              {language === 'bn' ? 'ক্যাম্পাস গাইড ট্যুর' : 'CAMPUS GUIDED TOUR'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
              {currentStepIndex + 1} / {TOUR_STEPS.length}
            </span>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden mb-4">
          <div
            className="h-full bg-slate-900 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="mb-4">
          <h3 className="text-lg md:text-xl font-extrabold text-slate-900 mb-1">
            {language === 'bn' ? step.titleBn : step.titleEn}
          </h3>
          <p className="text-xs md:text-sm text-slate-600 mb-2">
            {language === 'bn' ? step.subtitleBn : step.subtitleEn}
          </p>

          <div className="bg-emerald-50/90 border border-emerald-200/60 rounded-xl p-2.5 flex items-start gap-2 text-xs text-emerald-900 font-medium">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{language === 'bn' ? step.factBn : step.factEn}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 disabled:opacity-40 transition-colors active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleTogglePlay}
              className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors active:scale-95 shadow-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === TOUR_STEPS.length - 1}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 disabled:opacity-40 transition-colors active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {language === 'bn' ? 'ট্যুর সমাপ্ত' : 'End Tour'}
          </button>
        </div>
      </div>
    </div>
  );
};
