import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';

export const CinematicBootSequence: React.FC = () => {
  const { hasBooted, setHasBooted } = useUIStore();
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('INITIALIZING ACADEMIC ENGINE...');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (hasBooted) return;

    setProgress(0);
    setIsOpen(false);
    setStageText('INITIALIZING ACADEMIC ENGINE...');

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        const next = prev + 10;
        if (next === 30) setStageText('LOADING SEMESTER CHRONICLE...');
        else if (next === 60) setStageText('SYNCHRONIZING COURSE INTELLIGENCE...');
        else if (next === 90) setStageText('ACADEMIC DASHBOARD READY.');

        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [hasBooted]);

  const handleOpenBook = () => {
    setIsOpen(true);
    setTimeout(() => {
      setHasBooted(true);
    }, 400);
  };


  if (hasBooted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0806] p-6 select-none overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(107,29,47,0.3)_0%,rgba(11,8,6,0.98)_80%)] pointer-events-none" />

      <div
        className={`w-full max-w-md transition-all duration-500 transform ${
          isOpen ? 'scale-105 opacity-0 -translate-y-8' : 'scale-100 opacity-100'
        }`}
      >
        {/* Modern Card Frame */}
        <div className="modern-card p-8 rounded-2xl border border-[#28211a] shadow-[0_25px_60px_rgba(0,0,0,0.95)] space-y-6 text-center">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-cinzel font-bold text-gold-foil tracking-widest uppercase">
              SEMESTRIA
            </h1>
            <p className="text-xs text-[#9a9082] tracking-wider uppercase font-medium">
              STUDENT PRODUCTIVITY APPLICATION
            </p>
          </div>

          {/* Progress / Open Action */}
          <div className="space-y-3 pt-4 border-t border-[#28211a]">
            <p className="text-xs text-[#d8cebe] font-medium tracking-wide">
              {stageText}
            </p>

            <div className="w-full h-2 bg-[#0f0c0a] rounded-full overflow-hidden border border-[#28211a] p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#6b1d2f] via-[#c9a45c] to-[#d4af37] rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-[10px] text-[#9a9082]">{progress}% INDEXED</p>

            {progress >= 100 && (
              <button
                onClick={handleOpenBook}
                className="w-full mt-2 py-3 px-6 rounded-xl bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] font-sans font-semibold text-xs tracking-wider border border-[#c9a45c]/40 transition-all shadow-lg flex items-center justify-center space-x-2 transform hover:scale-[1.01]"
              >
                <span>OPEN DASHBOARD</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
