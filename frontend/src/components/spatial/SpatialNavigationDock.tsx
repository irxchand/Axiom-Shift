import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Library,
  Award,
  Feather,
  Mail,
  BookMarked,
  Scroll,
  Search,
  Volume2,
  VolumeX,
  Compass
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

const archiveChapters = [
  { path: '/', label: 'Semester Chronicle', icon: BookOpen },
  { path: '/calendar', label: 'Academic Calendar', icon: Calendar, badge: 'EVENTS' },
  { path: '/timetable', label: 'Academic Schedule', icon: Calendar },
  { path: '/subjects', label: 'Course Library', icon: Library },
  { path: '/evaluations', label: 'Academic Records', icon: Award },
  { path: '/ai-chat', label: 'Academic Librarian AI', icon: Feather, badge: 'AI' },
  { path: '/ingest', label: 'Manuscript Ingestion', icon: Scroll },
  { path: '/planner', label: 'Study Journal', icon: BookMarked },
  { path: '/notifications', label: 'Letters & Dispatches', icon: Mail, badge: '3' },
  { path: '/workspace', label: 'Archive Parameters', icon: Compass }
];

export const SpatialNavigationDock: React.FC = () => {
  const { openCommandPalette, isAudioMuted, toggleAudio, setHasBooted } = useUIStore();

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 select-none max-w-full px-4">
      {/* Modern Floating Dock Pill */}
      <div className="px-3.5 py-2 rounded-2xl bg-[#14100c]/90 border border-[#28211a] shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center space-x-1.5 md:space-x-2 backdrop-blur-xl">
        
        {/* Search Command Palette Button */}
        <button
          onClick={openCommandPalette}
          className="p-2 rounded-xl bg-[#0f0c0a] border border-[#28211a] hover:border-[#c9a45c]/40 text-[#c9a45c] transition-all hover:scale-105 flex items-center gap-1.5"
          title="Search Catalog (⌘K)"
        >
          <Search className="w-4 h-4 text-[#d4af37]" />
        </button>

        <div className="h-5 w-[1px] bg-[#28211a]" />

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1">
          {archiveChapters.map((chapter) => (
            <NavLink
              key={chapter.path}
              to={chapter.path}
              className={({ isActive }) =>
                `p-2 rounded-xl transition-all duration-200 relative group flex items-center justify-center ${
                  isActive
                    ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/50 shadow-md scale-105'
                    : 'text-[#9a9082] hover:text-[#f5ebe0] hover:bg-[#1b1612]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <chapter.icon className={`w-4 h-4 ${isActive ? 'text-[#d4af37]' : 'group-hover:text-[#c9a45c]'}`} />

                  {/* Clean Hover Tooltip */}
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl bg-[#14100c] border border-[#28211a] text-xs font-sans text-[#f5ebe0] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                    <span>{chapter.label}</span>
                    {chapter.badge && (
                      <span className="ml-2 px-1.5 py-0.2 text-[9px] rounded-full bg-[#6b1d2f] text-[#f5ebe0] font-bold">
                        {chapter.badge}
                      </span>
                    )}
                  </div>

                  {/* Active Gold Dot Indicator */}
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="h-5 w-[1px] bg-[#28211a]" />

        {/* Audio Mute & Restart Boot Buttons */}
        <button
          onClick={toggleAudio}
          className="p-2 rounded-xl bg-[#0f0c0a] border border-[#28211a] hover:border-[#c9a45c]/40 text-[#9a9082] hover:text-[#f5ebe0] transition-all"
          title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#c9a45c]" />}
        </button>

        <button
          onClick={() => setHasBooted(false)}
          className="p-2 rounded-xl bg-[#0f0c0a] border border-[#28211a] hover:border-[#c9a45c]/40 text-[#9a9082] hover:text-[#f5ebe0] transition-all"
          title="Re-open Startup Screen"
        >
          <BookOpen className="w-4 h-4 text-[#c9a45c]" />
        </button>
      </div>
    </div>
  );
};
