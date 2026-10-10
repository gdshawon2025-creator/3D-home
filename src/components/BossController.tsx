import React, { useState } from 'react';
import { ViewMode, CameraMode, Language } from '../types/office';
import { ROOMS } from '../data/officeData';
import { soundManager } from '../utils/audio';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Navigation, 
  UserCheck, 
  Eye, 
  DoorOpen, 
  Zap, 
  Compass, 
  ChevronDown 
} from 'lucide-react';

interface BossControllerProps {
  language: Language;
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
  onMoveBoss: (dx: number, dz: number) => void;
  onTeleportBoss: (targetPos: [number, number, number], viewName?: ViewMode) => void;
  bossPos: [number, number, number];
  isInsideBuilding: boolean;
  activeRoomId: ViewMode | null;
  onEnterInterior: (roomId: ViewMode) => void;
  onExitInterior: () => void;
}

export const BossController: React.FC<BossControllerProps> = ({
  language,
  cameraMode,
  onSetCameraMode,
  onMoveBoss,
  onTeleportBoss,
  bossPos,
  isInsideBuilding,
  activeRoomId,
  onEnterInterior,
  onExitInterior,
}) => {
  const [isTeleportOpen, setIsTeleportOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const speed = isRunning ? 0.6 : 0.3;

  const handleDirection = (dx: number, dz: number) => {
    soundManager.playClick();
    onMoveBoss(dx * speed, dz * speed);
  };

  return (
    <div className="absolute bottom-20 right-5 z-25 pointer-events-none flex flex-col items-end gap-2.5">
      {/* Boss Control Card */}
      <div className="glass-panel p-3.5 rounded-3xl shadow-2xl border border-white/70 pointer-events-auto flex flex-col gap-2.5 max-w-[260px] w-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              👑
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">
                {language === 'bn' ? 'বস কন্ট্রোলার' : 'Boss Controller'}
              </h4>
              <p className="text-[10px] text-slate-500 font-mono">
                X:{bossPos[0].toFixed(1)} Z:{bossPos[2].toFixed(1)}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              setIsRunning(!isRunning);
            }}
            title={isRunning ? 'Fast Run' : 'Normal Walk'}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
              isRunning
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>{isRunning ? 'RUN' : 'WALK'}</span>
          </button>
        </div>

        {/* Camera Mode Toggles */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          <button
            onClick={() => {
              soundManager.playClick();
              onSetCameraMode('follow_boss');
            }}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              cameraMode === 'follow_boss'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Navigation className="w-3 h-3 text-emerald-400" />
            <span>{language === 'bn' ? 'বস ফলো 🎥' : 'Follow Boss'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onSetCameraMode('orbit');
            }}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              cameraMode === 'orbit'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3 h-3 text-sky-400" />
            <span>{language === 'bn' ? 'অরবিট ভিউ' : 'Orbit View'}</span>
          </button>
        </div>

        {/* Enter / Exit Building Interior Button */}
        {isInsideBuilding ? (
          <button
            onClick={() => {
              soundManager.playClick();
              onExitInterior();
            }}
            className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
          >
            <DoorOpen className="w-4 h-4" />
            <span>{language === 'bn' ? 'বিল্ডিং থেকে বের হন (Exit)' : 'Exit Building (Campus)'}</span>
          </button>
        ) : (
          <button
            onClick={() => {
              soundManager.playClick();
              // Enter active room or Boss Cabin by default
              onEnterInterior(activeRoomId || 'cabin');
            }}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
          >
            <DoorOpen className="w-4 h-4" />
            <span>{language === 'bn' ? 'বিল্ডিংয়ের ভিতরে ঢুকুন 🚪' : 'Enter Inside Building 🚪'}</span>
          </button>
        )}

        {/* Teleport Boss Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsTeleportOpen(!isTeleportOpen)}
            className="w-full py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-50 flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Compass className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'bn' ? 'বসকে নিয়ে যান...' : 'Teleport Boss to...'}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isTeleportOpen && (
            <div className="absolute bottom-full mb-1.5 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 p-1.5 flex flex-col gap-1 max-h-48 overflow-y-auto z-40">
              <div className="px-2 py-1 text-[9px] font-extrabold text-slate-400 uppercase">
                {language === 'bn' ? 'স্থান নির্বাচন করুন' : 'SELECT DESTINATION'}
              </div>

              {ROOMS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    soundManager.playClick();
                    setIsTeleportOpen(false);
                    onTeleportBoss(r.interiorPosition, r.id);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between font-medium"
                >
                  <span className="truncate">
                    {language === 'bn' ? r.code + ' ' + r.nameBn.split(' ')[0] : r.code + ' ' + r.nameEn}
                  </span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                </button>
              ))}

              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsTeleportOpen(false);
                  onTeleportBoss([0, 0.35, 2.5], 'football');
                }}
                className="px-2.5 py-1.5 rounded-lg text-left text-xs text-emerald-700 font-semibold hover:bg-emerald-50 flex items-center gap-1.5"
              >
                <span>⚽</span>
                <span>{language === 'bn' ? 'ফুটবল গ্রাউন্ড' : 'Football Ground'}</span>
              </button>
            </div>
          )}
        </div>

        {/* On-screen Directional D-Pad (Touch & Click) */}
        <div className="pt-1 border-t border-slate-200/60 flex flex-col items-center gap-1">
          <p className="text-[9px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
            {language === 'bn' ? 'কন্ট্রোল (WASD / অ্যারো)' : 'MOVE BOSS (WASD / ARROWS)'}
          </p>

          {/* D-Pad Buttons */}
          <div className="grid grid-cols-3 gap-1 w-28">
            <div />
            <button
              onClick={() => handleDirection(0, -1)}
              className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-90 flex items-center justify-center shadow-sm"
              title="Forward (W / Up)"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div />

            <button
              onClick={() => handleDirection(-1, 0)}
              className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-90 flex items-center justify-center shadow-sm"
              title="Left (A / Left)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDirection(0, 1)}
              className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-90 flex items-center justify-center shadow-sm"
              title="Backward (S / Down)"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDirection(1, 0)}
              className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-90 flex items-center justify-center shadow-sm"
              title="Right (D / Right)"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
