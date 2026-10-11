import React, { useEffect, useState } from 'react';
import { Sparkles, Moon, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeExit, setFadeExit] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds total splash duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setFadeExit(true);
        setTimeout(() => {
          onComplete();
        }, 350); // allow fade out animation to finish
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    setFadeExit(true);
    setTimeout(() => {
      onComplete();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#0F172A] text-white select-none transition-opacity duration-300 ${
        fadeExit ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top subtle brand status */}
      <div className="w-full max-w-sm flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-ping" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-slate-400">
            TIME AUDIT SYSTEM
          </span>
        </div>
        <button
          onClick={handleSkip}
          className="text-[11px] font-bold text-slate-400 hover:text-[#FACC15] transition cursor-pointer px-2 py-1 rounded-md"
        >
          Skip
        </button>
      </div>

      {/* Center Hero Identity Graphic */}
      <div className="flex flex-col items-center text-center my-auto max-w-sm">
        {/* Animated 24-Hour Circular Dial Vector */}
        <div className="relative w-44 h-44 mb-8 flex items-center justify-center">
          {/* Subtle Outer Glow */}
          <div className="absolute inset-0 rounded-full bg-[#FACC15]/10 blur-xl animate-pulse" />

          {/* SVG Clock Dial */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r="66"
              fill="none"
              stroke="#1E293B"
              strokeWidth="6"
            />
            {/* Hour tick marks */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line
                key={i}
                x1="80"
                y1="10"
                x2="80"
                y2="15"
                stroke="#334155"
                strokeWidth="2"
                transform={`rotate(${angle} 80 80)`}
              />
            ))}
            {/* Animated Loading Sweep Arc */}
            <circle
              cx="80"
              cy="80"
              r="66"
              fill="none"
              stroke="#FACC15"
              strokeWidth="6"
              strokeDasharray={414.7}
              strokeDashoffset={414.7 - (414.7 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-75"
            />
            {/* Inner secondary focus ring */}
            <circle
              cx="80"
              cy="80"
              r="48"
              fill="none"
              stroke="#0B132B"
              strokeWidth="4"
            />
          </svg>

          {/* Center Insomnia Icon & Brand Hub */}
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-2xl bg-[#1E293B] border border-slate-700/80 flex items-center justify-center shadow-lg">
              <Moon className="w-8 h-8 text-[#FACC15] transform -rotate-12" />
            </div>
          </div>
        </div>

        {/* Title & Hierarchy */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[#FACC15] text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-[#FACC15]" />
            <span>24-Hour Allocation Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
            INSOMNIA
          </h1>

          <p className="text-sm font-bold text-[#FACC15] uppercase tracking-wider">
            Lost Hours
          </p>

          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed pt-1">
            Reclaim unintentional drift without penalizing intentional rest.
          </p>
        </div>
      </div>

      {/* Bottom Progress Bar & Indicator */}
      <div className="w-full max-w-sm pb-6 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
            Initializing Time Audit
          </span>
          <span className="font-bold text-[#FACC15]">{progress}%</span>
        </div>

        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#FACC15] h-full rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
          <ShieldCheck className="w-3 h-3 text-slate-400" />
          <span>Local Data Preservation • Zero Ad Tracking</span>
        </div>
      </div>
    </div>
  );
};
