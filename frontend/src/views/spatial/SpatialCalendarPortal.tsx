import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Clock, MapPin, List, Grid, X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useMasterAgentStore } from '../../store/useMasterAgentStore';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';
import type { AcademicEventDTO } from '../../types/dto';

export const SpatialCalendarPortal: React.FC = () => {
  const { events, addEvent } = useMasterAgentStore();
  const [filterType, setFilterType] = useState<'ALL' | 'EXAM' | 'ASSIGNMENT' | 'HACKATHON' | 'EVENT'>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK' | 'LIST'>('MONTH');

  // Calendar State (Defaulting to July 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed: 6 = July
  const [selectedDateStr, setSelectedDateStr] = useState('2026-07-28');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-07-30');
  const [newSubject, setNewSubject] = useState('CS602');
  const [newType, setNewType] = useState<'EXAM' | 'ASSIGNMENT' | 'EVENT' | 'HACKATHON'>('EXAM');
  const [newLocation, setNewLocation] = useState('Main Hall');
  const [newDetails, setNewDetails] = useState('');

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  // Live Countdown Calculator from today (July 28, 2026)
  const getCountdownBadge = (dateStr: string) => {
    const today = new Date('2026-07-28T00:00:00');
    const eventDate = new Date(`${dateStr}T00:00:00`);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { label: '⚡ DUE TODAY', style: 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]' };
    if (diffDays === 1) return { label: '⚡ DUE TOMORROW', style: 'bg-[#6b1d2f]/80 text-[#f5ebe0] border border-[#c9a45c]/80' };
    if (diffDays > 1 && diffDays <= 7) return { label: `📅 IN ${diffDays} DAYS`, style: 'bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/40' };
    if (diffDays > 7) return { label: `📅 IN ${diffDays} DAYS`, style: 'bg-[#0f0c0a] text-[#9a9082] border border-[#28211a]' };
    return { label: 'PAST EVENT', style: 'bg-[#0f0c0a] text-[#6b6052] border border-[#28211a]' };
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(6); // July
    setSelectedDateStr('2026-07-28');
  };

  // Generate calendar grid days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYearNum = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevYearNum}-${(prevMonthIdx + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    calendarCells.push({ dayNum, dateStr, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    calendarCells.push({ dayNum: d, dateStr, isCurrentMonth: true });
  }
  const remainingCells = 35 - calendarCells.length;
  const nextMonthCellsCount = remainingCells >= 0 ? remainingCells : 42 - calendarCells.length;
  for (let d = 1; d <= nextMonthCellsCount; d++) {
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYearNum = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextYearNum}-${(nextMonthIdx + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    calendarCells.push({ dayNum: d, dateStr, isCurrentMonth: false });
  }

  // Filter events
  const filteredEvents = events.filter((e) => {
    const matchesType = filterType === 'ALL' || e.eventType === filterType;
    const matchesSubject = filterSubject === 'ALL' || e.subjectCode === filterSubject;
    const matchesQuery =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSubject && matchesQuery;
  });

  const selectedDateEvents = filteredEvents.filter(e => e.date === selectedDateStr);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addEvent({
      title: newTitle,
      date: newDate,
      time: '10:00 AM',
      subjectCode: newSubject,
      eventType: newType,
      location: newLocation,
      details: newDetails || 'User added academic schedule entry.'
    });

    setNewTitle('');
    setNewDetails('');
    setShowAddModal(false);
  };

  const getEventTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'EXAM':
        return 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/40';
      case 'ASSIGNMENT':
        return 'bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30';
      case 'HACKATHON':
        return 'bg-[#2a3c2a] text-emerald-300 border border-emerald-500/30';
      default:
        return 'bg-[#0f0c0a] text-[#9a9082] border border-[#28211a]';
    }
  };

  // Week View Days (July 27 to August 2, 2026)
  const weekDays = [
    { name: 'MON', dateStr: '2026-07-27', dayNum: 27 },
    { name: 'TUE', dateStr: '2026-07-28', dayNum: 28 },
    { name: 'WED', dateStr: '2026-07-29', dayNum: 29 },
    { name: 'THU', dateStr: '2026-07-30', dayNum: 30 },
    { name: 'FRI', dateStr: '2026-07-31', dayNum: 31 },
    { name: 'SAT', dateStr: '2026-08-01', dayNum: 1 },
    { name: 'SUN', dateStr: '2026-08-02', dayNum: 2 },
  ];

  const timeSlots = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* App Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30">
              ACADEMIC CALENDAR & MILESTONES
            </span>
          </div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">
            {monthNames[currentMonth]} {currentYear}
          </h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">
            Interactive Semester Calendar, Exams & Live Countdown Ledger
          </p>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Today & Month Navigation */}
          <div className="flex items-center space-x-1 bg-[#0f0c0a] p-1 rounded-xl border border-[#28211a]">
            <button
              onClick={handleToday}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-[#c9a45c] hover:bg-[#1b1612] transition-colors"
            >
              Today
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-[#9a9082] hover:text-[#f5ebe0] hover:bg-[#1b1612] transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-[#9a9082] hover:text-[#f5ebe0] hover:bg-[#1b1612] transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Switcher: Month | Week | List */}
          <div className="flex bg-[#0f0c0a] p-1 rounded-xl border border-[#28211a]">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'MONTH' ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/40 shadow-sm' : 'text-[#9a9082] hover:text-[#f5ebe0]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Month Grid</span>
            </button>
            <button
              onClick={() => setViewMode('WEEK')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'WEEK' ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/40 shadow-sm' : 'text-[#9a9082] hover:text-[#f5ebe0]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Week View</span>
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'LIST' ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/40 shadow-sm' : 'text-[#9a9082] hover:text-[#f5ebe0]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda List</span>
            </button>
          </div>

          <button
            onClick={() => {
              setNewDate(selectedDateStr);
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] font-semibold text-xs border border-[#c9a45c]/40 transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs, Subject Filter & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Type Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {(['ALL', 'EXAM', 'ASSIGNMENT', 'HACKATHON', 'EVENT'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === type
                  ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/40 shadow-sm'
                  : 'bg-[#14100c] text-[#9a9082] border border-[#28211a] hover:text-[#f5ebe0]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Subject Filter & Search Bar */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="p-1.5 px-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-xs text-[#c9a45c] font-semibold focus:outline-none"
          >
            <option value="ALL">All Subjects</option>
            <option value="CS601">CS601 - Deep Learning</option>
            <option value="CS602">CS602 - Distributed Systems</option>
            <option value="CS603">CS603 - Compiler Design</option>
            <option value="CS604">CS604 - Algorithms</option>
            <option value="CS605">CS605 - Quantum Computing</option>
            <option value="GEN">General Events</option>
          </select>

          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-[#c9a45c] absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-xs text-[#f5ebe0] placeholder-[#9a9082] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* MONTH GRID VIEW */}
      {viewMode === 'MONTH' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Month Grid (3 Columns) */}
          <div className="lg:col-span-3 space-y-2">
            <ParchmentCard className="p-4 space-y-3">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 text-center border-b border-[#28211a] pb-2 font-cinzel text-xs font-bold text-[#c9a45c]">
                <span>SUN</span>
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
              </div>

              {/* Month Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarCells.map((cell, idx) => {
                  const dayEvents = filteredEvents.filter(e => e.date === cell.dateStr);
                  const isSelected = selectedDateStr === cell.dateStr;
                  const isToday = cell.dateStr === '2026-07-28';

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      className={`min-h-[95px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        !cell.isCurrentMonth
                          ? 'bg-[#0f0c0a]/30 border-[#28211a]/40 text-[#554a3e]'
                          : isSelected
                          ? 'bg-[#1b1612] border-[#c9a45c] shadow-[0_0_15px_rgba(201,164,92,0.25)]'
                          : isToday
                          ? 'bg-[#18130f] border-[#6b1d2f] text-[#f5ebe0]'
                          : 'bg-[#0f0c0a] border-[#28211a] hover:border-[#c9a45c]/40 text-[#f5ebe0]'
                      }`}
                    >
                      {/* Date Header Number */}
                      <div className="flex justify-between items-center text-xs font-bold mb-1">
                        <span className={`px-1.5 py-0.5 rounded ${isToday ? 'bg-[#6b1d2f] text-[#f5ebe0]' : isSelected ? 'text-[#c9a45c]' : ''}`}>
                          {cell.dayNum}
                        </span>
                        {isToday && <span className="text-[8px] font-bold text-[#c9a45c]">TODAY</span>}
                      </div>

                      {/* Event Chips List */}
                      <div className="space-y-1 overflow-hidden flex-1">
                        {dayEvents.slice(0, 2).map(evt => {
                          const cd = getCountdownBadge(evt.date);
                          return (
                            <div
                              key={evt.id}
                              className={`p-1 rounded text-[9px] font-bold truncate flex items-center justify-between gap-1 ${getEventTypeBadgeClass(evt.eventType)}`}
                              title={`${evt.title} (${evt.time})`}
                            >
                              <span className="truncate">{evt.title}</span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-[8px] text-[#c9a45c] font-bold text-right px-1">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ParchmentCard>
          </div>

          {/* Right Side Inspector: Selected Date Agenda with Countdown Badges */}
          <div className="space-y-4">
            <ParchmentCard className="p-5 space-y-4">
              <div className="border-b border-[#28211a] pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#9a9082] uppercase tracking-wider font-bold block">SELECTED DATE AGENDA</span>
                  <h3 className="text-base font-bold text-[#c9a45c] font-cinzel">{selectedDateStr}</h3>
                </div>
                <button
                  onClick={() => {
                    setNewDate(selectedDateStr);
                    setShowAddModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#6b1d2f] text-[#f5ebe0] text-[10px] font-bold border border-[#c9a45c]/40 hover:bg-[#801c2e]"
                >
                  + Event
                </button>
              </div>

              {/* Events for Selected Date */}
              <div className="space-y-3">
                {selectedDateEvents.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#9a9082] italic">
                    No academic events or exams scheduled for this date.
                  </div>
                ) : (
                  selectedDateEvents.map(evt => {
                    const cd = getCountdownBadge(evt.date);
                    return (
                      <div key={evt.id} className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-2">
                        <div className="flex justify-between items-start gap-1">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30 font-bold">
                            {evt.subjectCode}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${cd.style}`}>
                            {cd.label}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-[#f5ebe0]">{evt.title}</h4>
                          <p className="text-[10px] text-[#9a9082] mt-0.5">{evt.details}</p>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-[#9a9082] pt-1.5 border-t border-[#28211a]/60">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#c9a45c]" /> {evt.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#c9a45c]" /> {evt.location}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ParchmentCard>
          </div>
        </div>
      )}

      {/* GOOGLE/APPLE-STYLE WEEK TIMELINE VIEW */}
      {viewMode === 'WEEK' && (
        <ParchmentCard className="p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#28211a] pb-3">
            <h3 className="text-sm font-bold text-[#f5ebe0] font-cinzel">
              HOURLY WEEK TIMELINE MATRIX (JULY 27 – AUGUST 2, 2026)
            </h3>
            <span className="text-xs text-[#c9a45c] font-bold">7-Day Hourly Schedule</span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px] space-y-2">
              {/* Days Header Row */}
              <div className="grid grid-cols-8 gap-2 text-center border-b border-[#28211a] pb-2 text-xs font-bold font-cinzel">
                <div className="text-[#9a9082] text-left">TIME</div>
                {weekDays.map(wd => (
                  <div
                    key={wd.dateStr}
                    onClick={() => setSelectedDateStr(wd.dateStr)}
                    className={`p-2 rounded-xl cursor-pointer transition-all ${
                      wd.dateStr === '2026-07-28' ? 'bg-[#6b1d2f] text-[#f5ebe0]' : 'bg-[#0f0c0a] text-[#c9a45c] border border-[#28211a]'
                    }`}
                  >
                    <span>{wd.name}</span>
                    <span className="block text-[10px] opacity-80">{wd.dayNum}</span>
                  </div>
                ))}
              </div>

              {/* Time Slots Rows */}
              {timeSlots.map(time => (
                <div key={time} className="grid grid-cols-8 gap-2 border-b border-[#28211a]/40 py-2 text-xs items-center">
                  <div className="text-[10px] font-bold text-[#9a9082]">{time}</div>
                  {weekDays.map(wd => {
                    const matchedEvents = filteredEvents.filter(e => e.date === wd.dateStr);
                    return (
                      <div key={wd.dateStr} className="min-h-[45px] p-1 rounded-lg bg-[#0f0c0a]/60 border border-[#28211a]/50 flex flex-col justify-center">
                        {matchedEvents.map(evt => {
                          const cd = getCountdownBadge(evt.date);
                          return (
                            <div
                              key={evt.id}
                              onClick={() => setSelectedDateStr(evt.date)}
                              className={`p-1.5 rounded text-[9px] font-bold space-y-0.5 cursor-pointer ${getEventTypeBadgeClass(evt.eventType)}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="truncate">{evt.title}</span>
                              </div>
                              <div className="text-[8px] opacity-80 flex justify-between">
                                <span>{evt.subjectCode}</span>
                                <span>{evt.location}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </ParchmentCard>
      )}

      {/* AGENDA LIST VIEW WITH COUNTDOWNS */}
      {viewMode === 'LIST' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.length === 0 ? (
            <ParchmentCard className="p-8 text-center text-xs text-[#9a9082] lg:col-span-3">
              No events match the selected criteria.
            </ParchmentCard>
          ) : (
            filteredEvents.map((evt) => {
              const cd = getCountdownBadge(evt.date);
              return (
                <ParchmentCard key={evt.id} className="p-5 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs bg-[#0f0c0a] text-[#d4af37] border border-[#28211a] font-semibold">
                      {evt.subjectCode}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cd.style}`}>
                      {cd.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#f5ebe0]">{evt.title}</h3>
                    <p className="text-xs text-[#9a9082] mt-1">{evt.details}</p>
                  </div>

                  <div className="pt-3 border-t border-[#28211a] flex justify-between items-center text-xs text-[#9a9082] font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#c9a45c]" /> {evt.date} • {evt.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#c9a45c]" /> {evt.location}
                    </span>
                  </div>
                </ParchmentCard>
              );
            })
          )}
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0806]/80 backdrop-blur-md">
          <div className="w-full max-w-md modern-card p-6 rounded-2xl border border-[#28211a] space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-[#28211a] pb-3">
              <h3 className="text-base font-bold text-[#f5ebe0] font-cinzel">Schedule Academic Event</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#9a9082] hover:text-[#f5ebe0]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="text-[#9a9082] font-medium block mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. CS602 Midterm Exam"
                  className="w-full p-2.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#f5ebe0] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9a9082] font-medium block mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#f5ebe0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#9a9082] font-medium block mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#f5ebe0] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9a9082] font-medium block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#f5ebe0] focus:outline-none"
                  >
                    <option value="EXAM">EXAM</option>
                    <option value="ASSIGNMENT">ASSIGNMENT</option>
                    <option value="EVENT">EVENT</option>
                    <option value="HACKATHON">HACKATHON</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#9a9082] font-medium block mb-1">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#f5ebe0] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#9a9082] font-medium block mb-1">Description / Details</label>
                <input
                  type="text"
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="e.g. Covers Chapters 1 to 5"
                  className="w-full p-2.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#f5ebe0] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#14100c] text-[#9a9082] hover:text-[#f5ebe0] border border-[#28211a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] font-semibold border border-[#c9a45c]/40"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


