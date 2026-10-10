import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sun, Sunset, Moon, Globe, Sparkles, Users, Sliders } from 'lucide-react';
import { TimeOfDay, Language } from '../types/office';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  timeOfDay: TimeOfDay;
  setTimeOfDay: (t: TimeOfDay) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  onStartTour: () => void;
  peopleCount?: number;
  onCelebrateAll?: () => void;
  onOpenCustomizer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  timeOfDay,
  setTimeOfDay,
  language,
  setLanguage,
  onStartTour,
  peopleCount = 18,
  onCelebrateAll,
  onOpenCustomizer,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAudioToggle = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundManager.startAmbient();
      soundManager.playClick();
    }
  };

  const cycleTimeOfDay = () => {
    soundManager.playClick();
    if (timeOfDay === 'day') setTimeOfDay('sunset');
    else if (timeOfDay === 'sunset') setTimeOfDay('night');
    else setTimeOfDay('day');
  };

  const toggleLanguage = () => {
    soundManager.playClick();
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-4 pointer-events-none">
      {/* Brand & Logo matching video */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md border border-slate-700/60">
          <span className="text-emerald-400 text-xs">□</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <h1 className="font-extrabold tracking-wider text-slate-900 text-sm md:text-base uppercase">
            {language === 'bn' ? 'দ্য অফিস' : 'THE OFFICE'}
          </h1>
          <span className="text-slate-400 font-semibold text-xs tracking-widest">/ 01</span>
        </div>

        {/* Live campus status badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{language === 'bn' ? 'ক্যাম্পাস লাইভ' : 'Campus Live'}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-[11px] font-mono font-medium text-slate-600 shadow-sm">
          <span>{timeStr}</span>
          <span className="text-[10px] text-slate-400">GMT+6</span>
        </div>

        {/* Time of Day Cycle Button */}
        <button
          onClick={cycleTimeOfDay}
          title={
            language === 'bn'
              ? `সময় পরিবর্তন: ${timeOfDay === 'day' ? 'দিন' : timeOfDay === 'sunset' ? 'সূর্যাস্ত' : 'রাত'}`
              : `Lighting: ${timeOfDay}`
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-white transition-all shadow-sm active:scale-95"
        >
          {timeOfDay === 'day' && (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline text-[11px]">Day</span>
            </>
          )}
          {timeOfDay === 'sunset' && (
            <>
              <Sunset className="w-3.5 h-3.5 text-orange-500" />
              <span className="hidden sm:inline text-[11px]">Sunset</span>
            </>
          )}
          {timeOfDay === 'night' && (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline text-[11px]">Night</span>
            </>
          )}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleAudioToggle}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className={`p-2 rounded-xl glass-panel text-xs font-medium transition-all shadow-sm active:scale-95 ${
            isMuted ? 'text-slate-400' : 'text-slate-800'
          }`}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
        </button>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-white transition-all shadow-sm active:scale-95"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px]">{language === 'en' ? 'বাংলা' : 'EN'}</span>
        </button>

        {/* Citizens / People on Campus Button */}
        <button
          onClick={() => {
            soundManager.playSuccess();
            if (onCelebrateAll) onCelebrateAll();
          }}
          title={language === 'bn' ? 'ক্যাম্পাসের মানুষ: উল্লাস করান 🎉' : 'Campus People: Trigger Celebration 🎉'}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-white transition-all shadow-sm active:scale-95"
        >
          <Users className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[11px]">
            {language === 'bn' ? `${peopleCount} জন মানুষ` : `${peopleCount} People`}
          </span>
        </button>

        {/* Customizer / Settings Button */}
        <button
          onClick={onOpenCustomizer}
          title={language === 'bn' ? 'ক্যাম্পাস কাস্টমাইজ ও কন্ট্রোল করুন' : 'Campus Customizer & Control'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <Sliders className="w-3.5 h-3.5 text-white" />
          <span className="text-[11px]">{language === 'bn' ? 'কাস্টমাইজার' : 'Customize'}</span>
        </button>

        {/* Quick Tour Button */}
        <button
          onClick={onStartTour}
          className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'bn' ? 'ট্যুর শুরু' : 'Guided Tour'}</span>
        </button>
      </div>
    </header>
  );
};
