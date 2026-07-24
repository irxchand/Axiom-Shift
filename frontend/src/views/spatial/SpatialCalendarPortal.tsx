import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useMasterAgentStore } from '../../store/useMasterAgentStore';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';

export const SpatialCalendarPortal: React.FC = () => {
  const { events, addEvent } = useMasterAgentStore();
  const [filterType, setFilterType] = useState<'ALL' | 'EXAM' | 'ASSIGNMENT' | 'HACKATHON' | 'EVENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-08-01');
  const [newSubject, setNewSubject] = useState('CS602');
  const [newType, setNewType] = useState<'EXAM' | 'ASSIGNMENT' | 'EVENT' | 'HACKATHON'>('EXAM');
  const [newLocation, setNewLocation] = useState('Hall B');

  const filteredEvents = events.filter((e) => {
    const matchesType = filterType === 'ALL' || e.eventType === filterType;
    const matchesQuery =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

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
      details: 'User added academic schedule entry.'
    });

    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">ACADEMIC CALENDAR & EVENTS</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">EXAM SCHEDULE, DEADLINES & UNIVERSITY MILESTONES</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] font-semibold text-xs border border-[#c9a45c]/40 transition-all shadow-md"
          >
            + Add Academic Event
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#c9a45c] absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, exams..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-xs text-[#f5ebe0] placeholder-[#9a9082] focus:outline-none"
          />
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.length === 0 ? (
          <ParchmentCard className="p-8 text-center text-xs text-[#9a9082] lg:col-span-3">
            No events match the selected criteria.
          </ParchmentCard>
        ) : (
          filteredEvents.map((evt) => (
            <ParchmentCard key={evt.id} className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded text-xs bg-[#0f0c0a] text-[#d4af37] border border-[#28211a] font-semibold">
                  {evt.subjectCode}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    evt.eventType === 'EXAM'
                      ? 'bg-[#6b1d2f] text-[#f5ebe0]'
                      : evt.eventType === 'ASSIGNMENT'
                      ? 'bg-[#2a3c2a] text-emerald-300'
                      : 'bg-[#1b1612] text-[#c9a45c] border border-[#28211a]'
                  }`}
                >
                  {evt.eventType}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#f5ebe0]">{evt.title}</h3>
                <p className="text-xs text-[#9a9082] mt-1">{evt.details}</p>
              </div>

              <div className="pt-3 border-t border-[#28211a] flex justify-between items-center text-xs text-[#9a9082] font-medium">
                <span>{evt.date} • {evt.time}</span>
                <span>{evt.location}</span>
              </div>
            </ParchmentCard>
          ))
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0806]/80 backdrop-blur-md">
          <div className="w-full max-w-md modern-card p-6 rounded-2xl border border-[#28211a] space-y-4">
            <h3 className="text-base font-bold text-[#f5ebe0]">Schedule Academic Event</h3>
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
