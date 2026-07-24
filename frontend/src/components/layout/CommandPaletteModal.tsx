import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const CommandPaletteModal: React.FC = () => {
  const { isCommandPaletteOpen, closeCommandPalette } = useUIStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        useUIStore.getState().toggleCommandPalette();
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        closeCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, closeCommandPalette]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    { title: 'Semester Chronicle - Overview', category: 'Dashboard', path: '/' },
    { title: 'Academic Calendar & Events Ledger', category: 'Events & Exams', path: '/calendar' },
    { title: 'Academic Schedule & Weekly Timetable', category: 'Schedule', path: '/timetable' },
    { title: 'CS602 Operating Systems Volume', category: 'Course Library', path: '/subjects' },
    { title: 'CS604 Computer Networks Volume', category: 'Course Library', path: '/subjects' },
    { title: 'Academic Records & Risk Assessment', category: 'Analytics', path: '/evaluations' },
    { title: 'Manuscript Ingestion & Master Agent', category: 'Ingest & Agent', path: '/ingest' },
    { title: 'Academic Librarian AI Companion', category: 'AI Assistant', path: '/ai-chat' },
    { title: 'Study Journal & Notebook Planner', category: 'Planner', path: '/planner' },
    { title: 'Letters & Dispatches', category: 'Notifications', path: '/notifications' },
    { title: 'Archive Parameters & Settings', category: 'Settings', path: '/workspace' },
  ];

  const filteredActions = actions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    closeCommandPalette();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0806]/80 backdrop-blur-md animate-fadeIn select-none font-sans"
      onClick={closeCommandPalette}
    >
      <div
        className="w-full max-w-xl modern-card rounded-2xl overflow-hidden shadow-2xl border border-[#28211a] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-[#28211a] flex items-center space-x-3 bg-[#0f0c0a]">
          <Search className="w-5 h-5 text-[#c9a45c]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, event, or subject..."
            className="w-full bg-transparent text-sm text-[#f5ebe0] placeholder-[#9a9082] focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded text-[10px] bg-[#1b1612] text-[#9a9082] border border-[#28211a]">
            ESC
          </kbd>
        </div>

        {/* Action Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 bg-[#14100c]">
          {filteredActions.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#9a9082]">
              No matches found for "{query}"
            </div>
          ) : (
            filteredActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(action.path)}
                className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs transition-colors hover:bg-[#1b1612] border border-[#28211a]/40 hover:border-[#28211a] group text-left"
              >
                <div>
                  <p className="text-[#f5ebe0] font-medium group-hover:text-[#d4af37]">{action.title}</p>
                  <p className="text-[10px] text-[#9a9082]">{action.category}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#9a9082] group-hover:text-[#c9a45c] transition-transform group-hover:translate-x-1" />
              </button>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-4 border-t border-[#28211a] bg-[#0f0c0a] flex justify-between items-center text-[10px] text-[#9a9082]">
          <span>SEMESTRIA CATALOG INDEX</span>
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
        </div>
      </div>
    </div>
  );
};
