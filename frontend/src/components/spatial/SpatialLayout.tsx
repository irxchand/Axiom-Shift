import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SpatialUniverse3D } from '../3d/SpatialUniverse3D';
import { SpatialNavigationDock } from './SpatialNavigationDock';
import { CinematicBootSequence } from './CinematicBootSequence';
import { CommandPaletteModal } from '../layout/CommandPaletteModal';
import { useUIStore } from '../../store/useUIStore';

export const SpatialLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSelectedSubjectCode } = useUIStore();

  const handleSelectSubject = (code: string) => {
    setSelectedSubjectCode(code);
    navigate('/subjects');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden select-none font-sans">
      {/* Interactive 3D Spatial WebGL Universe Background */}
      <SpatialUniverse3D
        activePortal={location.pathname}
        onSelectSubject={handleSelectSubject}
      />

      {/* Cinematic Boot Sequence Startup */}
      <CinematicBootSequence />

      {/* Main Spatial Stage Overlay */}
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <Outlet />
      </div>

      {/* Floating Apple Vision Pro Style Orbital Navigation Dock */}
      <SpatialNavigationDock />

      {/* Global Command Palette Modal (Cmd+K) */}
      <CommandPaletteModal />
    </div>
  );
};
