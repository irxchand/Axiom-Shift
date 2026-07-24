import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TopCommandBar } from './TopCommandBar';
import { Sidebar } from './Sidebar';
import { CommandPaletteModal } from './CommandPaletteModal';
import { BootSequence } from './BootSequence';
import { Background3D } from '../3d/Background3D';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !isNaN(Number(e.key))) {
        const num = Number(e.key);
        const routes = ['/', '/timetable', '/subjects', '/evaluations', '/workspace', '/ingest', '/ai-chat', '/planner', '/notifications'];
        if (num >= 1 && num <= routes.length) {
          e.preventDefault();
          navigate(routes[num - 1]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans select-none">
      {/* 3D Interactive Ambient Background */}
      <Background3D />

      {/* Boot Sequence modal layer */}
      <BootSequence />

      {/* Top Header Command Bar */}
      <TopCommandBar />

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar HUD */}
        <Sidebar />

        {/* Main Operational Stage */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette Modal (Cmd+K) */}
      <CommandPaletteModal />
    </div>
  );
};
