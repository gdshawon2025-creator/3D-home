import React, { useState } from 'react';
import { ViewMode, Language } from '../types/office';
import { ROOMS } from '../data/officeData';
import { soundManager } from '../utils/audio';
import { ChevronRight, ChevronLeft, Layers, Compass } from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  language: Language;
  onInspectRoom?: (view: ViewMode) => void;
  onStartTour: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  language,
  onInspectRoom,
  onStartTour,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleRoomClick = (roomId: ViewMode) => {
    soundManager.playClick();
    onSelectView(roomId);
    if (onInspectRoom) {
      onInspectRoom(roomId);
    }
  };

  return (
    <div className="absolute top-20 left-5 z-20 pointer-events-none flex flex-col gap-3 max-w-[280px] w-full">
      {/* Mobile toggle button */}
      <div className="md:hidden pointer-events-auto self-start">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl glass-panel text-slate-800 shadow-md flex items-center gap-1.5 text-xs font-semibold"
        >
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>{isCollapsed ? (language === 'bn' ? 'রুম দেখুন' : 'Rooms') : (language === 'bn' ? 'লুকান' : 'Hide')}</span>
        </button>
      </div>

      <div
        className={`flex flex-col gap-3 transition-all duration-300 ${
          isCollapsed ? '-translate-x-[120%] opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto' : 'pointer-events-auto'
        }`}
      >
        {/* Info Card matching video reel */}
        <div className="glass-panel p-5 rounded-2xl shadow-xl border border-white/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] tracking-widest text-slate-400 font-extrabold uppercase">
              {language === 'bn' ? 'আপনার অফিস' : 'YOUR OFFICE'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug mb-1.5">
            {language === 'bn' ? 'অফিসটি ঘুরে দেখুন।' : 'Explore the office.'}
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            {language === 'bn'
              ? 'একটি রুম নির্বাচন করুন অথবা ভার্চুয়াল ট্যুর উপভোগ করুন।'
              : 'Select a room to look around, or take a tour.'}
          </p>

          <button
            onClick={() => {
              soundManager.playClick();
              onStartTour();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md active:scale-98 transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'bn' ? 'ক্যাম্পাস ট্যুর নিন ↗' : 'Take a tour ↗'}</span>
          </button>
        </div>

        {/* Sidebar Navigation: Room Pills list matching video */}
        <div className="glass-panel p-2 rounded-2xl shadow-xl flex flex-col gap-1 border border-white/60">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
            <span>{language === 'bn' ? 'রুম সমূহ' : 'ROOMS'}</span>
            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-mono">
              7 SPACES
            </span>
          </div>

          {ROOMS.map((room) => {
            const isActive = currentView === room.id;
            return (
              <button
                key={room.id}
                onClick={() => handleRoomClick(room.id)}
                className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-between group active:scale-98 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold transition-colors ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {room.code}
                  </span>
                  <span className="truncate">
                    {language === 'bn' ? room.nameBn.split(' ')[0] : room.nameEn}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Subtle active room indicator */}
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: room.color }}
                  />
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive ? 'text-white translate-x-0.5' : 'text-slate-400 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
