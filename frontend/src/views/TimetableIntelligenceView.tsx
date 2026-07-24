import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, User, Search, Filter, CheckCircle, Play } from 'lucide-react';
import { mockBackendAPI } from '../services/api';
import type { TimetableSlotDTO } from '../types/dto';

export const TimetableIntelligenceView: React.FC = () => {
  const { data: slots = [] } = useQuery({ queryKey: ['timetableSlots'], queryFn: mockBackendAPI.getTimetableSlots });
  const [selectedDay, setSelectedDay] = useState<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'>('MON');
  const [searchQuery, setSearchQuery] = useState('');

  const days: Array<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'> = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const filteredSlots = slots.filter(s => {
    const matchesDay = s.dayOfWeek === selectedDay;
    const matchesSearch = s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.room.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDay && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              MODULE 2
            </span>
            <h1 className="text-xl font-extrabold text-white font-mono-tech tracking-tight">TIMETABLE INTELLIGENCE</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono-tech">
            Dynamic Schedule Telemetry // Room Matrix & Live Session Tracker
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by subject, room..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs font-mono-tech text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((day) => {
          const hasClasses = slots.some(s => s.dayOfWeek === day);
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono-tech font-bold transition-all duration-200 flex items-center space-x-2 shrink-0 ${
                isSelected
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-cyan-500/20'
              }`}
            >
              <span>{day}</span>
              {hasClasses && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-600'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Timeline view for Selected Day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Schedule Slot Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-white font-mono-tech flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>SCHEDULE FOR {selectedDay}</span>
          </h2>

          {filteredSlots.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-xs font-mono-tech text-slate-500 border border-slate-800">
              No sessions scheduled for {selectedDay} matching filter.
            </div>
          ) : (
            filteredSlots.map((slot) => (
              <div
                key={slot.id}
                className={`p-5 rounded-2xl transition-all duration-300 border ${
                  slot.isCurrentSession
                    ? 'glass-panel-glow border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                    : 'glass-panel border-slate-800 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono-tech bg-slate-900 text-cyan-400 border border-cyan-500/30 font-bold">
                      {slot.subjectCode}
                    </span>
                    <h3 className="text-base font-bold text-white">{slot.subjectName}</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-slate-900 text-slate-400 border border-slate-700 font-bold">
                      {slot.type}
                    </span>
                    {slot.isCurrentSession && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-tech bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-1">
                        <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" /> IN PROGRESS
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-tech text-slate-300 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{slot.room}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate">{slot.faculty}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Weekly Summary Panel */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono-tech border-b border-slate-800 pb-3">
            WEEKLY WORKLOAD MATRIX
          </h3>

          <div className="space-y-3">
            {['CS601', 'CS602', 'CS603', 'CS604', 'CS605'].map((code, idx) => (
              <div key={code} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center text-xs font-mono-tech">
                <div>
                  <span className="font-bold text-cyan-400 block">{code}</span>
                  <span className="text-[10px] text-slate-500">{3 + (idx % 2)} Sessions / Week</span>
                </div>
                <span className="px-2 py-1 rounded bg-slate-950 text-slate-300 border border-slate-700 text-[11px]">
                  {4 + idx} Hrs
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
