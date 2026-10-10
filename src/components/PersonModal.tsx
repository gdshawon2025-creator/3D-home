import React from 'react';
import { PersonProfile } from '../data/peopleData';
import { Language } from '../types/office';
import { soundManager } from '../utils/audio';
import { X, MessageSquare, Sparkles, Trophy, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PersonModalProps {
  person: PersonProfile | null;
  language: Language;
  onClose: () => void;
  onCheerPerson: () => void;
  onKickBall: () => void;
}

export const PersonModal: React.FC<PersonModalProps> = ({
  person,
  language,
  onClose,
  onCheerPerson,
  onKickBall,
}) => {
  if (!person) return null;

  const hexColor = `#${person.shirtColor.toString(16).padStart(6, '0')}`;

  const handleCheer = () => {
    soundManager.playSuccess();
    onCheerPerson();
    confetti({
      particleCount: 45,
      spread: 55,
      origin: { y: 0.65 },
    });
  };

  return (
    <div className="absolute top-20 right-5 z-25 pointer-events-auto max-w-sm w-full animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="glass-panel p-5 rounded-3xl shadow-2xl border border-white/80 relative">
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

        {/* Character Avatar & Badge */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-md flex-shrink-0"
            style={{ backgroundColor: hexColor }}
          >
            {person.nameEn[0]}
          </div>

          <div className="min-w-0 pr-6">
            <h3 className="text-base font-extrabold text-slate-900 leading-snug truncate">
              {language === 'bn' ? person.nameBn : person.nameEn}
            </h3>
            <p className="text-xs font-semibold text-slate-500 truncate">
              {language === 'bn' ? person.roleBn : person.roleEn}
            </p>
          </div>
        </div>

        {/* Live Speech Bubble */}
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3 mb-3 relative">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-amber-950 italic leading-relaxed">
              &ldquo;{language === 'bn' ? person.speechBn : person.speechEn}&rdquo;
            </p>
          </div>
        </div>

        {/* Current Activity */}
        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100 text-xs text-slate-600 mb-4 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span>{language === 'bn' ? person.activityBn : person.activityEn}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCheer}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? 'উল্লাস করো 🎉' : 'Cheer 🎉'}</span>
          </button>

          {person.category === 'footballer' && (
            <button
              onClick={() => {
                soundManager.playKick();
                onKickBall();
              }}
              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-200" />
              <span>{language === 'bn' ? 'বল পাস ⚽' : 'Pass ⚽'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
