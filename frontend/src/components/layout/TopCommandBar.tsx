import React, { useState, useEffect } from 'react';
import { Search, Volume2, VolumeX } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const TopCommandBar: React.FC = () => {
  const { openCommandPalette, isAudioMuted, toggleAudio, setHasBooted } = useUIStore();
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 modern-card rounded-none border-b border-[#28211a] px-4 flex items-center justify-between sticky top-0 z-40 select-none shadow-md font-sans">
      {/* Left section: Identity */}
      <div className="flex items-center space-x-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-cinzel font-bold text-sm tracking-wider text-gold-foil">SEMESTRIA</span>
            <span className="px-2 py-0.5 text-[9px] font-sans font-semibold rounded bg-[#1b1612] text-[#c9a45c] border border-[#28211a]">
              v4.2 PROD
            </span>
          </div>
          <p className="text-[10px] text-[#9a9082]">SEMESTER VI // ACTIVE RUNTIME</p>
        </div>
      </div>

      {/* Middle section: Search Trigger */}
      <div className="flex-1 max-w-md mx-6">
        <button
          onClick={openCommandPalette}
          className="w-full h-9 px-4 rounded-xl inset-section flex items-center justify-between text-xs text-[#9a9082] transition-all duration-200 group hover:border-[#c9a45c]/40 shadow-inner"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-[#c9a45c]" />
            <span className="group-hover:text-[#f5ebe0]">Search subjects, schedule, tasks...</span>
          </div>
          <kbd className="px-2 py-0.5 rounded text-[10px] bg-[#1b1612] text-[#9a9082] border border-[#28211a]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: Clock & Controls */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Clock */}
        <div className="hidden lg:flex flex-col items-end text-right px-3 py-1 bg-[#0f0c0a] rounded-xl border border-[#28211a]">
          <span className="font-bold text-[#d4af37] tracking-wider">{timeString}</span>
          <span className="text-[10px] text-[#9a9082]">LIBRARY TIME</span>
        </div>

        {/* Audio Mute */}
        <button
          onClick={toggleAudio}
          className="p-2 rounded-xl bg-[#0f0c0a] border border-[#28211a] hover:border-[#c9a45c]/40 text-[#9a9082] hover:text-[#f5ebe0] transition-all"
          title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#c9a45c]" />}
        </button>

        {/* Re-boot Action */}
        <button
          onClick={() => setHasBooted(false)}
          className="px-2.5 py-1.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] hover:border-[#c9a45c]/40 text-[10px] font-semibold text-[#9a9082] hover:text-[#f5ebe0] transition-all"
          title="Re-open Startup Screen"
        >
          RE-BOOT
        </button>

        {/* User Pill */}
        <div className="flex items-center space-x-2 pl-3 border-l border-[#28211a]">
          <div className="w-7 h-7 rounded-full bg-[#6b1d2f] flex items-center justify-center text-[#f5ebe0] border border-[#c9a45c]/40 font-bold text-[11px]">
            AV
          </div>
          <div className="hidden xl:block text-left">
            <p className="font-semibold text-[#f5ebe0] leading-tight text-xs">User</p>
            <p className="text-[10px] text-[#9a9082]">CS Honors</p>
          </div>
        </div>
      </div>
    </header>
  );
};
