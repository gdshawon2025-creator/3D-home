import React from 'react';
import { ViewMode, Language } from '../types/office';
import { soundManager } from '../utils/audio';
import { Plus, Minus, Compass, Maximize2, RotateCcw } from 'lucide-react';

interface BottomBarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  language: Language;
  onStartTour: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  currentView,
  onSelectView,
  language,
  onStartTour,
  onZoomIn,
  onZoomOut,
}) => {
  const handleView = (v: ViewMode) => {
    soundManager.playClick();
    onSelectView(v);
  };

  return (
    <div className="absolute bottom-5 left-0 right-0 z-20 pointer-events-none flex justify-center px-4">
      <div className="glass-panel px-4 py-2.5 rounded-full shadow-2xl pointer-events-auto border border-white/60 flex items-center gap-2 sm:gap-3 text-xs max-w-full overflow-x-auto no-scrollbar">
        {/* Instruction hint matching video */}
        <span className="text-[11px] text-slate-500 hidden xl:inline font-medium whitespace-nowrap pl-2 pr-1">
          {language === 'bn'
            ? 'ঘুরিয়ে দেখতে ড্র্যাগ করুন · সরাতে রাইট-ক্লিক ড্র্যাগ · জুম করতে স্ক্রোল'
            : 'Drag to rotate · Right-drag to move view · Scroll to zoom'}
        </span>

        <div className="h-4 w-[1px] bg-slate-300 hidden xl:block" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-100/90 rounded-full p-0.5 border border-slate-200/60">
          <button
            onClick={() => {
              soundManager.playClick();
              onZoomIn();
            }}
            title="Zoom In"
            className="p-1.5 rounded-full hover:bg-white text-slate-700 hover:text-slate-900 transition-colors active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onZoomOut();
            }}
            title="Zoom Out"
            className="p-1.5 rounded-full hover:bg-white text-slate-700 hover:text-slate-900 transition-colors active:scale-95"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Selection Buttons from video */}
        <button
          onClick={() => handleView('full')}
          className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap active:scale-95 ${
            currentView === 'full'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          {language === 'bn' ? 'সম্পূর্ণ ভিউ' : 'Full view'}
        </button>

        <button
          onClick={() => handleView('football')}
          className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
            currentView === 'football'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <span>⚽</span>
          <span>{language === 'bn' ? 'ফুটবল গ্রাউন্ড' : 'Football ground'}</span>
        </button>

        <button
          onClick={() => handleView('neighbourhood')}
          className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap active:scale-95 ${
            currentView === 'neighbourhood'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          {language === 'bn' ? 'উপকূল ও বাতিঘর' : 'Neighbourhood'}
        </button>

        {/* Take a Tour action button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onStartTour();
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ml-1"
        >
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'bn' ? 'ট্যুর নিন ↗' : 'Take a tour ↗'}</span>
        </button>
      </div>
    </div>
  );
};
