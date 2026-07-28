import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, User, Search, Play, Grid, List, X, BookOpen, AlertCircle, ChevronRight } from 'lucide-react';
import { backendAPI } from '../services/backendAPI';
import type { TimetableSlotDTO, AcademicEventDTO } from '../types/dto';

export const TimetableIntelligenceView: React.FC = () => {
  const { data: slots = [], isLoading: isLoadingSlots, isError: isErrorSlots } = useQuery({ 
    queryKey: ['timetableSlots'], 
    queryFn: backendAPI.getTimetableSlots 
  });

  const { data: academicEvents = [] } = useQuery({
    queryKey: ['academicEvents'],
    queryFn: backendAPI.getAcademicEvents
  });

  const [selectedDay, setSelectedDay] = useState<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'>('MON');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlotDTO | null>(null);

  if (isLoadingSlots) {
    return <div className="p-8 text-center text-cyan-400 font-mono-tech animate-pulse">LOADING TIMETABLE TELEMETRY...</div>;
  }

  if (isErrorSlots) {
    return <div className="p-8 text-center text-rose-400 font-mono-tech">ERROR LOADING TIMETABLE DATA</div>;
  }

  const days: Array<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'> = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const filteredSlots = slots.filter(s => {
    const matchesDay = viewMode === 'WEEKLY' ? true : s.dayOfWeek === selectedDay;
    const matchesSearch = s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.room.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDay && matchesSearch;
  });

  // Calculate dynamic weekly workload matrix grouped by subjectCode
  const workloadBySubject = slots.reduce<Record<string, { subjectCode: string; subjectName: string; count: number; types: Set<string> }>>((acc, s) => {
    if (!acc[s.subjectCode]) {
      acc[s.subjectCode] = { subjectCode: s.subjectCode, subjectName: s.subjectName, count: 0, types: new Set() };
    }
    acc[s.subjectCode].count += 1;
    acc[s.subjectCode].types.add(s.type);
    return acc;
  }, {});

  const selectedSlotEvents = selectedSlot 
    ? academicEvents.filter(e => e.subjectCode === selectedSlot.subjectCode)
    : [];

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

        {/* View Switcher & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-cyan-500/30">
            <button
              onClick={() => setViewMode('DAILY')}
              className={`px-3 py-1 rounded-lg text-xs font-mono-tech flex items-center gap-1.5 transition-colors ${
                viewMode === 'DAILY' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daily</span>
            </button>
            <button
              onClick={() => setViewMode('WEEKLY')}
              className={`px-3 py-1 rounded-lg text-xs font-mono-tech flex items-center gap-1.5 transition-colors ${
                viewMode === 'WEEKLY' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Weekly Grid</span>
            </button>
          </div>

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

      {/* Day Selector Tabs (Shown in Daily Mode) */}
      {viewMode === 'DAILY' && (
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
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Schedule Display */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-white font-mono-tech flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>{viewMode === 'DAILY' ? `SCHEDULE FOR ${selectedDay}` : 'WEEKLY TIMETABLE MATRIX (MON - SUN)'}</span>
          </h2>

          {/* Daily Timeline Mode */}
          {viewMode === 'DAILY' && (
            filteredSlots.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center text-xs font-mono-tech text-slate-500 border border-slate-800">
                No sessions scheduled for {selectedDay} matching filter.
              </div>
            ) : (
              filteredSlots.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-5 rounded-2xl transition-all duration-300 cursor-pointer border ${
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
            )
          )}

          {/* Weekly Grid Mode */}
          {viewMode === 'WEEKLY' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {days.map((day) => {
                const daySlots = filteredSlots.filter(s => s.dayOfWeek === day);
                return (
                  <div key={day} className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                      <span className="font-mono-tech text-xs font-bold text-cyan-400">{day}</span>
                      <span className="text-[10px] font-mono-tech text-slate-500">{daySlots.length} Sessions</span>
                    </div>

                    {daySlots.length === 0 ? (
                      <p className="text-[11px] font-mono-tech text-slate-600 italic py-2">No sessions</p>
                    ) : (
                      <div className="space-y-2">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer space-y-1 transition-all"
                          >
                            <div className="flex justify-between items-center text-[11px] font-mono-tech font-bold text-white">
                              <span>{slot.subjectCode}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 border border-cyan-500/20">{slot.room}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">{slot.subjectName}</p>
                            <div className="text-[9px] text-slate-500 font-mono-tech flex justify-between pt-1">
                              <span>{slot.startTime}</span>
                              <span className="text-slate-400">{slot.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Workload Matrix & Upcoming Milestones */}
        <div className="space-y-6">
          {/* Dynamic Workload Summary */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono-tech border-b border-slate-800 pb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>DYNAMIC WORKLOAD MATRIX</span>
            </h3>

            <div className="space-y-3">
              {Object.values(workloadBySubject).map((item) => (
                <div key={item.subjectCode} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center text-xs font-mono-tech">
                  <div>
                    <span className="font-bold text-cyan-400 block">{item.subjectCode}</span>
                    <span className="text-[10px] text-slate-500 truncate block max-w-[140px]">{item.subjectName}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 text-[10px] font-bold block">
                      {item.count} Sessions/wk
                    </span>
                    <span className="text-[9px] text-cyan-400/80 mt-0.5 block">{Array.from(item.types).join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Academic Milestones & Exams */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono-tech border-b border-slate-800 pb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>ACADEMIC MILESTONES & EXAMS</span>
            </h3>

            <div className="space-y-3">
              {academicEvents.slice(0, 4).map((evt) => (
                <div key={evt.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-start text-xs font-mono-tech">
                    <span className="font-bold text-white flex-1 pr-2">{evt.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      evt.eventType === 'EXAM' ? 'bg-rose-950 text-rose-400 border border-rose-500/40' : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                    }`}>
                      {evt.eventType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono-tech">
                    <span>{evt.date} @ {evt.time}</span>
                    <span className="text-cyan-400">{evt.subjectCode}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slot Details Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/50 max-w-lg w-full space-y-4 shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-fadeIn">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-tech bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-bold">
                  {selectedSlot.subjectCode}
                </span>
                <h3 className="text-lg font-bold text-white font-mono-tech mt-1">{selectedSlot.subjectName}</h3>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono-tech">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500">Day & Time</span>
                <p className="text-cyan-400 font-bold">{selectedSlot.dayOfWeek} // {selectedSlot.startTime} - {selectedSlot.endTime}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500">Location</span>
                <p className="text-cyan-400 font-bold">{selectedSlot.room}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500">Faculty</span>
                <p className="text-slate-200 font-bold">{selectedSlot.faculty}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500">Session Type</span>
                <p className="text-slate-200 font-bold">{selectedSlot.type}</p>
              </div>
            </div>

            {/* Linked Academic Events */}
            {selectedSlotEvents.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 font-mono-tech">Linked Academic Events & Exams</h4>
                <div className="space-y-2">
                  {selectedSlotEvents.map(e => (
                    <div key={e.id} className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs font-mono-tech space-y-1">
                      <div className="flex justify-between text-white font-bold">
                        <span>{e.title}</span>
                        <span className="text-amber-400">{e.date}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{e.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono-tech border border-slate-700"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

