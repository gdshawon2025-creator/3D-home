import React from 'react';
import { CampusConfig, BuildingTheme, WeatherMode, Language } from '../types/office';
import { THEME_COLORS } from '../data/officeData';
import { soundManager } from '../utils/audio';
import { 
  Sliders, 
  X, 
  Sun, 
  CloudRain, 
  CloudFog, 
  Palette, 
  Layers, 
  Gauge, 
  Eye, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface CustomizerPanelProps {
  language: Language;
  config: CampusConfig;
  onChangeConfig: (updates: Partial<CampusConfig>) => void;
  onResetDefaults: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomizerPanel: React.FC<CustomizerPanelProps> = ({
  language,
  config,
  onChangeConfig,
  onResetDefaults,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const themes: BuildingTheme[] = ['emerald', 'midnight', 'minimal', 'cyberpunk', 'terracotta'];

  return (
    <div className="absolute top-20 right-5 z-35 pointer-events-auto max-w-sm w-full animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="glass-panel p-5 rounded-3xl shadow-2xl border border-white/80 max-h-[82vh] overflow-y-auto no-scrollbar relative flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900 text-white shadow-sm">
              <Sliders className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                {language === 'bn' ? 'ক্যাম্পাস কাস্টমাইজার' : 'Campus Customizer'}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                {language === 'bn' ? 'সবকিছু নিজের মতো পরিবর্তন করুন' : 'Control and change everything'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Building Architecture Theme */}
        <div>
          <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            <span>{language === 'bn' ? 'বিল্ডিং কালার থিম' : 'Building Color Theme'}</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {themes.map((theme) => {
              const info = THEME_COLORS[theme];
              const isSelected = config.buildingTheme === theme;
              return (
                <button
                  key={theme}
                  onClick={() => {
                    soundManager.playClick();
                    onChangeConfig({ buildingTheme: theme });
                  }}
                  className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-102'
                      : 'bg-white/80 text-slate-700 border-slate-200/80 hover:bg-white'
                  }`}
                >
                  <span className="truncate text-[11px]">
                    {language === 'bn' ? info.nameBn : info.nameEn}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/10"
                      style={{ backgroundColor: `#${info.secondary.toString(16).padStart(6, '0')}` }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/10"
                      style={{ backgroundColor: `#${info.accent.toString(16).padStart(6, '0')}` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Cutaway Roofs (See Inside All Buildings) */}
        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {language === 'bn' ? 'কাটঅ্যাওয়ে ছাদ (ভিতর দেখুন)' : 'Cutaway Roofs (See Inside)'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {language === 'bn' ? 'সকল রুমের ভেতরের আসবাবপত্র দৃশ্যমান' : 'Slice open roofs to view interior spaces'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                onChangeConfig({ cutawayRoofs: !config.cutawayRoofs });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                config.cutawayRoofs ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  config.cutawayRoofs ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3. Weather Conditions */}
        <div>
          <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 text-blue-500" />
            <span>{language === 'bn' ? 'আবহাওয়া পরিবর্তন' : 'Weather Condition'}</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['sunny', 'rain', 'foggy'] as WeatherMode[]).map((w) => {
              const isSelected = config.weather === w;
              return (
                <button
                  key={w}
                  onClick={() => {
                    soundManager.playClick();
                    onChangeConfig({ weather: w });
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-center text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white/80 text-slate-700 border-slate-200/80 hover:bg-white'
                  }`}
                >
                  {w === 'sunny' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  {w === 'rain' && <CloudRain className="w-3.5 h-3.5 text-blue-500" />}
                  {w === 'foggy' && <CloudFog className="w-3.5 h-3.5 text-slate-500" />}
                  <span className="text-[10px]">
                    {w === 'sunny'
                      ? (language === 'bn' ? 'রৌদ্রোজ্জ্বল' : 'Sunny')
                      : w === 'rain'
                      ? (language === 'bn' ? 'বৃষ্টি' : 'Rain')
                      : (language === 'bn' ? 'কুয়াশা' : 'Foggy')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Lighting & Environment Sliders */}
        <div className="flex flex-col gap-3 bg-slate-50/90 rounded-2xl p-3 border border-slate-100">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>{language === 'bn' ? 'সূর্যের আলো (Sunlight)' : 'Sunlight Intensity'}</span>
              <span className="font-mono text-slate-900">{config.sunIntensity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={config.sunIntensity}
              onChange={(e) => onChangeConfig({ sunIntensity: parseFloat(e.target.value) })}
              className="w-full accent-slate-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>{language === 'bn' ? 'গাড়ির গতি (Traffic Speed)' : 'Traffic Speed'}</span>
              <span className="font-mono text-slate-900">{config.trafficSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.5"
              step="0.1"
              value={config.trafficSpeed}
              onChange={(e) => onChangeConfig({ trafficSpeed: parseFloat(e.target.value) })}
              className="w-full accent-slate-900"
            />
          </div>
        </div>

        {/* Reset Defaults */}
        <button
          onClick={() => {
            soundManager.playClick();
            onResetDefaults();
          }}
          className="w-full py-2 px-3 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'ডিফল্ট সেটিংসে ফিরুন' : 'Reset to Defaults'}</span>
        </button>
      </div>
    </div>
  );
};
