import React, { useState } from 'react';
import { Language } from '../types/office';
import { soundManager } from '../utils/audio';
import { X, Trophy, Activity, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FootballModalProps {
  language: Language;
  onKick: () => void;
  onClose: () => void;
}

export const FootballModal: React.FC<FootballModalProps> = ({
  language,
  onKick,
  onClose,
}) => {
  const [goals, setGoals] = useState(0);

  const handleKickAction = () => {
    soundManager.playKick();
    onKick();
    setGoals((g) => g + 1);
    if ((goals + 1) % 3 === 0) {
      soundManager.playSuccess();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  return (
    <div className="absolute top-20 right-5 z-20 pointer-events-auto max-w-sm w-full animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="glass-panel p-5 rounded-3xl shadow-2xl border border-white/70 relative">
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⚽</span>
          <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
            CAMPUS ARENA
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
            {language === 'bn' ? 'ম্যাচ মাঠ' : 'Active Pitch'}
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">
          {language === 'bn' ? 'ক্যাম্পাস ফুটবল গ্রাউন্ড' : 'The Football Ground'}
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {language === 'bn'
            ? 'আন্তর্জাতিক মানের সবুজ টার্ফ ফুটবল মাঠ, ফ্লাডলাইট এবং রানিং ট্র্যাক।'
            : 'Regulation green turf pitch equipped with corner flags, nets, and night match floodlights.'}
        </p>

        {/* Match Stats */}
        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'bn' ? 'পেনাল্টি গোল স্কোর' : 'Penalty Goals Scored'}</span>
            </span>
            <span className="font-mono font-bold text-emerald-600 text-sm">
              {goals} GOALS
            </span>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span>{language === 'bn' ? 'পরবর্তী ম্যাচ:' : 'Next Match:'}</span>
            <span className="font-semibold text-slate-800">
              {language === 'bn' ? 'ইঞ্জিনিয়ারিং বনাম ডিজাইন (সন্ধ্যা ৫:০০)' : 'Engineering vs Design (5:00 PM)'}
            </span>
          </div>
        </div>

        {/* Kick Ball Button */}
        <button
          onClick={handleKickAction}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95"
        >
          <Zap className="w-4 h-4 text-emerald-200" />
          <span>{language === 'bn' ? 'বল শট করুন! (Kick Ball)' : 'Kick The Ball!'}</span>
        </button>
      </div>
    </div>
  );
};
