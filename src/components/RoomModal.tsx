import React, { useState } from 'react';
import { RoomInfo, Language } from '../types/office';
import { soundManager } from '../utils/audio';
import { X, Users, CheckCircle2, Calendar, Wifi, Sparkles, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoomModalProps {
  room: RoomInfo | null;
  language: Language;
  onClose: () => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({ room, language, onClose }) => {
  const [isBooked, setIsBooked] = useState(false);

  if (!room) return null;

  const handleBooking = () => {
    soundManager.playSuccess();
    setIsBooked(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    setTimeout(() => {
      setIsBooked(false);
    }, 3500);
  };

  const occupancyPercent = Math.round((room.occupants / room.capacity) * 100);

  return (
    <div className="absolute top-20 right-5 z-20 pointer-events-auto max-w-sm w-full animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="glass-panel p-5 rounded-3xl shadow-2xl border border-white/70 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Room Header */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: room.color }}
          />
          <span className="font-mono text-xs font-bold text-slate-400">
            SPACE #{room.code}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
            {language === 'bn' ? room.floorBn : room.floorEn}
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">
          {language === 'bn' ? room.nameBn : room.nameEn}
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {language === 'bn' ? room.descriptionBn : room.descriptionEn}
        </p>

        {/* Live Occupancy Metric */}
        <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'bn' ? 'বর্তমান উপস্থিতি' : 'Live Occupancy'}</span>
            </span>
            <span className="font-mono font-bold text-slate-900">
              {room.occupants} / {room.capacity}
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${occupancyPercent}%`,
                backgroundColor: room.color,
              }}
            />
          </div>

          {/* Current Activity */}
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-start gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="leading-tight">
              {language === 'bn' ? room.currentActivityBn : room.currentActivityEn}
            </span>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {language === 'bn' ? 'সুবিধাসমূহ' : 'AMENITIES'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(language === 'bn' ? room.amenitiesBn : room.amenitiesEn).map((am, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-white text-slate-700 text-[11px] font-medium border border-slate-200/80 shadow-2xs"
              >
                {am}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleBooking}
          disabled={isBooked}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 ${
            isBooked
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-lg'
          }`}
        >
          {isBooked ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{language === 'bn' ? 'সফলভাবে বুকিং সম্পন্ন হয়েছে!' : 'Space Reserved! Check Email'}</span>
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'এই রুমটি বুক করুন' : 'Book this Space'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
