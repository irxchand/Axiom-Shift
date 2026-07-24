import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { mockBackendAPI } from '../../services/api';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';

export const SpatialTimetablePortal: React.FC = () => {
  const { data: slots = [] } = useQuery({ queryKey: ['timetableSlots'], queryFn: mockBackendAPI.getTimetableSlots });
  const [selectedDay, setSelectedDay] = useState<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'>('MON');
  const [query, setQuery] = useState('');

  const days: Array<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'> = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const filtered = slots.filter(s => s.dayOfWeek === selectedDay && (
    s.subjectName.toLowerCase().includes(query.toLowerCase()) ||
    s.subjectCode.toLowerCase().includes(query.toLowerCase()) ||
    s.room.toLowerCase().includes(query.toLowerCase())
  ));

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">ACADEMIC SCHEDULE</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">Weekly Scholar Timetable & Lecture Ledger</p>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
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

      {/* Days Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedDay === day
                ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/50 shadow-md scale-105'
                : 'bg-[#14100c] text-[#9a9082] border border-[#28211a] hover:text-[#f5ebe0] hover:border-[#c9a45c]/30'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule Slot Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <ParchmentCard className="p-8 text-center text-xs text-[#9a9082]">
            No sessions recorded for {selectedDay} matching filter criteria.
          </ParchmentCard>
        ) : (
          filtered.map(slot => (
            <ParchmentCard
              key={slot.id}
              glow={slot.isCurrentSession}
              className="p-5 space-y-3"
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
                    <span className="px-3 py-0.5 rounded-full text-[10px] bg-[#6b1d2f] text-[#f5ebe0] font-semibold border border-[#c9a45c]/40">
                      LIVE SESSION
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#9a9082] pt-2 border-t border-[#28211a] font-medium">
                <span>{slot.startTime} - {slot.endTime}</span>
                <span>• {slot.room}</span>
                <span>• {slot.faculty}</span>
              </div>
            </ParchmentCard>
          ))
        )}
      </div>
    </div>
  );
};
