import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Library,
  Award,
  Compass,
  Scroll,
  Feather,
  BookMarked,
  Mail,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

const navItems = [
  { path: '/', label: 'Semester Chronicle', icon: BookOpen, shortcut: '⌘1' },
  { path: '/calendar', label: 'Academic Calendar', icon: Calendar, badge: 'EVENTS', shortcut: '⌘2' },
  { path: '/timetable', label: 'Academic Schedule', icon: Calendar, shortcut: '⌘3' },
  { path: '/subjects', label: 'Course Library', icon: Library, shortcut: '⌘4' },
  { path: '/evaluations', label: 'Academic Records', icon: Award, shortcut: '⌘5' },
  { path: '/workspace', label: 'Archive Gateway', icon: Compass, shortcut: '⌘6' },
  { path: '/ingest', label: 'Manuscript Ingest', icon: Scroll, shortcut: '⌘7' },
  { path: '/ai-chat', label: 'Librarian AI', icon: Feather, shortcut: '⌘8' },
  { path: '/planner', label: 'Study Journal', icon: BookMarked, shortcut: '⌘9' },
  { path: '/notifications', label: 'Letters & Dispatches', icon: Mail, badge: '3' }
];

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={`relative z-30 modern-card rounded-none border-r border-[#28211a] transition-all duration-300 ease-in-out flex flex-col justify-between select-none font-sans ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Section */}
      <div className="p-3">
        {/* Header Label / Collapse Button */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#28211a]">
          {!isSidebarCollapsed && (
            <span className="text-xs font-semibold text-[#f5ebe0] tracking-wider uppercase px-2">NAVIGATION</span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-[#0f0c0a] border border-[#28211a] hover:border-[#c9a45c]/40 text-[#9a9082] hover:text-[#f5ebe0] transition-colors mx-auto"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/40 shadow-sm font-semibold'
                    : 'text-[#9a9082] hover:text-[#f5ebe0] hover:bg-[#1b1612] border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-[#d4af37]' : 'text-[#c9a45c] group-hover:text-[#d4af37]'
                    }`}
                  />

                  {!isSidebarCollapsed && (
                    <div className="ml-3 flex-1 flex items-center justify-between overflow-hidden">
                      <span className="truncate">{item.label}</span>
                      <div className="flex items-center space-x-1.5 ml-2">
                        {item.badge && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-[#0f0c0a] text-[#c9a45c] border border-[#28211a]">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-[#9a9082] hidden group-hover:inline-block">
                          {item.shortcut}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Active Indicator Pin */}
                  {isActive && (
                    <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#d4af37] rounded-r" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Footer Telemetry */}
      {!isSidebarCollapsed && (
        <div className="p-3 m-3 rounded-xl inset-section text-xs text-[#d8cebe]">
          <div className="flex items-center justify-between text-[#9a9082] mb-1 text-[11px]">
            <span>SEMESTER STATUS</span>
            <span className="text-[#d4af37] font-semibold">ACTIVE</span>
          </div>
          <p className="text-[10px] text-[#9a9082]">
            Semestria AI Platform v4.2
          </p>
        </div>
      )}
    </aside>
  );
};
