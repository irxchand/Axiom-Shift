import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Calendar, Clock, MapPin, User, Play, Grid, List, X, BookOpen, AlertCircle } from 'lucide-react';
import { backendAPI } from '../../services/backendAPI';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';
import type { TimetableSlotDTO } from '../../types/dto';

export const SpatialTimetablePortal: React.FC = () => {
  const { data: slots = [], isLoading: isLoadingSlots, isError: isErrorSlots } = useQuery({ 
    queryKey: ['timetableSlots'], 
    queryFn: backendAPI.getTimetableSlots 
  });

  const { data: academicEvents = [] } = useQuery({
    queryKey: ['academicEvents'],
    queryFn: backendAPI.getAcademicEvents
  });

  const [selectedDay, setSelectedDay] = useState<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'>('MON');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlotDTO | null>(null);

  if (isLoadingSlots) {
    return <ParchmentCard className="p-8 text-center text-xs text-gold-foil animate-pulse">Loading Academic Schedule Telemetry...</ParchmentCard>;
  }

  if (isErrorSlots) {
    return <ParchmentCard className="p-8 text-center text-xs text-[#6b1d2f]">Error loading timetable slots.</ParchmentCard>;
  }

  const days: Array<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'> = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const filtered = slots.filter(s => {
    const matchesDay = viewMode === 'WEEKLY' ? true : s.dayOfWeek === selectedDay;
    const matchesQuery = s.subjectName.toLowerCase().includes(query.toLowerCase()) ||
                         s.subjectCode.toLowerCase().includes(query.toLowerCase()) ||
                         s.room.toLowerCase().includes(query.toLowerCase());
    return matchesDay && matchesQuery;
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
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30">
              MODULE 3 // TIMETABLE INTELLIGENCE
            </span>
          </div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">ACADEMIC SCHEDULE & TELEMETRY</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">Weekly Scholar Timetable, Room Matrix & Live Session Tracker</p>
        </div>

        {/* View Mode Switcher & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-[#0f0c0a] p-1 rounded-xl border border-[#28211a]">
            <button
              onClick={() => setViewMode('DAILY')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'DAILY' ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/40 shadow-sm' : 'text-[#9a9082] hover:text-[#f5ebe0]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daily</span>
            </button>
            <button
              onClick={() => setViewMode('WEEKLY')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'WEEKLY' ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/40 shadow-sm' : 'text-[#9a9082] hover:text-[#f5ebe0]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Weekly Grid</span>
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#c9a45c] absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter subject, room..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-xs text-[#f5ebe0] placeholder-[#9a9082] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Days Tabs (Shown in Daily Mode) */}
      {viewMode === 'DAILY' && (
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {days.map(day => {
            const hasClasses = slots.some(s => s.dayOfWeek === day);
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/50 shadow-md scale-105'
                    : 'bg-[#14100c] text-[#9a9082] border border-[#28211a] hover:text-[#f5ebe0] hover:border-[#c9a45c]/30'
                }`}
              >
                <span>{day}</span>
                {hasClasses && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#c9a45c]' : 'bg-[#4a3d31]'}`} />}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Schedule Display */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-[#f5ebe0] font-cinzel flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#c9a45c]" />
            <span>{viewMode === 'DAILY' ? `SCHEDULE FOR ${selectedDay}` : 'WEEKLY TIMETABLE MATRIX (MON - SUN)'}</span>
          </h2>

          {/* Daily Mode */}
          {viewMode === 'DAILY' && (
            filtered.length === 0 ? (
              <ParchmentCard className="p-8 text-center text-xs text-[#9a9082]">
                No sessions recorded for {selectedDay} matching filter criteria.
              </ParchmentCard>
            ) : (
              filtered.map(slot => (
                <ParchmentCard
                  key={slot.id}
                  glow={slot.isCurrentSession}
                  className="p-5 space-y-3 cursor-pointer hover:border-[#c9a45c]/50 transition-all"
                  onClick={() => setSelectedSlot(slot)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-0.5 rounded text-xs bg-[#0f0c0a] text-[#d4af37] border border-[#28211a] font-semibold">
                        {slot.subjectCode}
                      </span>
                      <h3 className="text-base font-bold text-[#f5ebe0]">{slot.subjectName}</h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#0f0c0a] text-[#9a9082] border border-[#28211a] font-semibold">
                        {slot.type}
                      </span>
                      {slot.isCurrentSession && (
                        <span className="px-3 py-0.5 rounded-full text-[10px] bg-[#6b1d2f] text-[#f5ebe0] font-semibold border border-[#c9a45c]/40 flex items-center gap-1">
                          <Play className="w-3 h-3 text-[#c9a45c] fill-[#c9a45c]" /> LIVE SESSION
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#9a9082] pt-2 border-t border-[#28211a] font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#c9a45c]" /> {slot.startTime} - {slot.endTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#c9a45c]" /> {slot.room}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#c9a45c]" /> {slot.faculty}
                    </span>
                  </div>
                </ParchmentCard>
              ))
            )
          )}

          {/* Weekly Grid Mode */}
          {viewMode === 'WEEKLY' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {days.map(day => {
                const daySlots = filtered.filter(s => s.dayOfWeek === day);
                return (
                  <ParchmentCard key={day} className="p-4 space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-[#28211a]">
                      <span className="font-bold text-xs text-[#c9a45c]">{day}</span>
                      <span className="text-[10px] text-[#9a9082]">{daySlots.length} Sessions</span>
                    </div>

                    {daySlots.length === 0 ? (
                      <p className="text-[11px] text-[#9a9082] italic py-2">No sessions</p>
                    ) : (
                      <div className="space-y-2">
                        {daySlots.map(slot => (
                          <div
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            className="p-2.5 rounded-lg bg-[#0f0c0a] border border-[#28211a] hover:border-[#c9a45c]/40 cursor-pointer space-y-1 transition-all"
                          >
                            <div className="flex justify-between items-center text-[11px] font-bold text-[#f5ebe0]">
                              <span>{slot.subjectCode}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30">{slot.room}</span>
                            </div>
                            <p className="text-[10px] text-[#9a9082] truncate">{slot.subjectName}</p>
                            <div className="text-[9px] text-[#9a9082] flex justify-between pt-1 border-t border-[#28211a]/50">
                              <span>{slot.startTime}</span>
                              <span className="text-[#c9a45c]">{slot.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ParchmentCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Workload Matrix & Academic Events */}
        <div className="space-y-6">
          {/* Dynamic Workload Summary */}
          <ParchmentCard className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#f5ebe0] font-cinzel border-b border-[#28211a] pb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#c9a45c]" />
              <span>DYNAMIC WORKLOAD MATRIX</span>
            </h3>

            <div className="space-y-3">
              {Object.values(workloadBySubject).map(item => (
                <div key={item.subjectCode} className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#c9a45c] block">{item.subjectCode}</span>
                    <span className="text-[10px] text-[#9a9082] truncate block max-w-[140px]">{item.subjectName}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-[#1b1612] text-[#f5ebe0] border border-[#28211a] text-[10px] font-bold block">
                      {item.count} Sessions/wk
                    </span>
                    <span className="text-[9px] text-[#c9a45c] mt-0.5 block">{Array.from(item.types).join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </ParchmentCard>

          {/* Academic Milestones & Events */}
          <ParchmentCard className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#f5ebe0] font-cinzel border-b border-[#28211a] pb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#c9a45c]" />
              <span>ACADEMIC MILESTONES & EXAMS</span>
            </h3>

            <div className="space-y-3">
              {academicEvents.slice(0, 4).map(evt => (
                <div key={evt.id} className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-1.5">
                  <div className="flex justify-between items-start text-xs">
                    <span className="font-bold text-[#f5ebe0] flex-1 pr-2">{evt.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      evt.eventType === 'EXAM' ? 'bg-[#6b1d2f] text-[#f5ebe0]' : 'bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30'
                    }`}>
                      {evt.eventType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#9a9082]">
                    <span>{evt.date} @ {evt.time}</span>
                    <span className="text-[#c9a45c] font-bold">{evt.subjectCode}</span>
                  </div>
                </div>
              ))}
            </div>
          </ParchmentCard>
        </div>
      </div>

      {/* Slot Details Telemetry Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-[#0b0806]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="modern-card p-6 rounded-2xl border border-[#28211a] max-w-lg w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-start border-b border-[#28211a] pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] bg-[#0f0c0a] text-[#c9a45c] border border-[#c9a45c]/30 font-bold">
                  {selectedSlot.subjectCode}
                </span>
                <h3 className="text-lg font-bold text-[#f5ebe0] font-cinzel mt-1">{selectedSlot.subjectName}</h3>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="p-1 rounded-lg bg-[#0f0c0a] text-[#9a9082] hover:text-[#f5ebe0] border border-[#28211a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-1">
                <span className="text-[10px] text-[#9a9082]">Day & Time</span>
                <p className="text-[#c9a45c] font-bold">{selectedSlot.dayOfWeek} // {selectedSlot.startTime} - {selectedSlot.endTime}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-1">
                <span className="text-[10px] text-[#9a9082]">Location</span>
                <p className="text-[#c9a45c] font-bold">{selectedSlot.room}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-1">
                <span className="text-[10px] text-[#9a9082]">Faculty</span>
                <p className="text-[#f5ebe0] font-bold">{selectedSlot.faculty}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-1">
                <span className="text-[10px] text-[#9a9082]">Session Type</span>
                <p className="text-[#f5ebe0] font-bold">{selectedSlot.type}</p>
              </div>
            </div>

            {/* Linked Academic Events */}
            {selectedSlotEvents.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#28211a]">
                <h4 className="text-xs font-bold text-[#c9a45c]">Linked Academic Events & Exams</h4>
                <div className="space-y-2">
                  {selectedSlotEvents.map(e => (
                    <div key={e.id} className="p-2.5 rounded-lg bg-[#14100c] border border-[#c9a45c]/30 text-xs space-y-1">
                      <div className="flex justify-between text-[#f5ebe0] font-bold">
                        <span>{e.title}</span>
                        <span className="text-[#c9a45c]">{e.date}</span>
                      </div>
                      <p className="text-[10px] text-[#9a9082]">{e.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-4 py-2 rounded-xl bg-[#14100c] hover:bg-[#28211a] text-[#f5ebe0] text-xs font-semibold border border-[#28211a]"
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

