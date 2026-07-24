import { create } from 'zustand';
import type { Semester3DNodeDTO } from '../types/dto';

interface UIState {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;

  hasBooted: boolean;
  setHasBooted: (booted: boolean) => void;

  isAudioMuted: boolean;
  toggleAudio: () => void;

  selectedSubjectCode: string;
  setSelectedSubjectCode: (code: string) => void;

  selected3DNode: Semester3DNodeDTO | null;
  setSelected3DNode: (node: Semester3DNodeDTO | null) => void;

  active3DMode: 'SEMESTER_MAP' | 'KNOWLEDGE_GRAPH';
  setActive3DMode: (mode: 'SEMESTER_MAP' | 'KNOWLEDGE_GRAPH') => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  isCommandPaletteOpen: false,
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),

  hasBooted: false,
  setHasBooted: (booted) => set({ hasBooted: booted }),

  isAudioMuted: false,
  toggleAudio: () => set((state) => ({ isAudioMuted: !state.isAudioMuted })),

  selectedSubjectCode: 'CS602',
  setSelectedSubjectCode: (code) => set({ selectedSubjectCode: code }),

  selected3DNode: null,
  setSelected3DNode: (node) => set({ selected3DNode: node }),

  active3DMode: 'SEMESTER_MAP',
  setActive3DMode: (mode) => set({ active3DMode: mode }),
}));
