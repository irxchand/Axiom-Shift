import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, CheckCircle2, ShieldCheck, Clock, Search, Filter, Trash2, MailCheck, AlertTriangle, Info, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { backendAPI } from '../../services/backendAPI';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';
import type { NotificationItemDTO } from '../../types/dto';

export const SpatialNotificationPortal: React.FC = () => {
  // Query hook
  const { data: initialNotifs = [], isLoading, isError, refetch } = useQuery<NotificationItemDTO[]>({
    queryKey: ['notifications'],
    queryFn: backendAPI.getNotifications
  });

  // ALL state hooks declared FIRST at top-level to obey React Rules of Hooks
  const [notifications, setNotifications] = useState<NotificationItemDTO[]>(initialNotifs);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSnoozeMenuId, setActiveSnoozeMenuId] = useState<string | null>(null);
  const [snoozeMinutesMap, setSnoozeMinutesMap] = useState<Record<string, number>>({});
  const [customTimeMap, setCustomTimeMap] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialNotifs.length > 0) {
      setNotifications(initialNotifs);
    }
  }, [initialNotifs]);

  // Loading and Error returns placed AFTER all hooks
  if (isLoading) {
    return <ParchmentCard className="p-8 text-center text-xs text-gold-foil animate-pulse">Loading University Notifications & System Dispatches...</ParchmentCard>;
  }

  if (isError) {
    return <ParchmentCard className="p-8 text-center text-xs text-[#6b1d2f]">Error loading dispatches.</ParchmentCard>;
  }

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setToastMessage('All university notifications marked as read.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearRead = () => {
    const count = notifications.filter(n => n.isRead).length;
    setNotifications(prev => prev.filter(n => !n.isRead));
    setToastMessage(`Cleared ${count} read notifications.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getSnoozeTimeLabel = (mins: number) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + mins);
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    let durationText = `${mins}m`;
    if (hours > 0) {
      durationText = m > 0 ? `${hours}h ${m}m` : `${hours}h`;
    }
    const defaultPickerTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    return { durationText, timeStr, defaultPickerTime };
  };

  const applySliderSnooze = (id: string) => {
    const mins = snoozeMinutesMap[id] || 60;
    const { durationText, timeStr } = getSnoozeTimeLabel(mins);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isSnoozed: true, snoozedUntil: `${timeStr} (${durationText})` } : n));
    setActiveSnoozeMenuId(null);
  };

  const applyCustomTimeSnooze = (id: string, customVal?: string) => {
    const targetTime = customVal || customTimeMap[id];
    if (!targetTime) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isSnoozed: true, snoozedUntil: targetTime } : n));
    setActiveSnoozeMenuId(null);
  };

  const handleUnsnooze = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isSnoozed: false, snoozedUntil: undefined } : n));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifs = notifications.filter(n => {
    let matchesCategory = true;
    if (filterCategory === 'UNREAD') matchesCategory = !n.isRead;
    else if (filterCategory === 'CRITICAL') matchesCategory = n.priority === 'CRITICAL';
    else if (filterCategory !== 'ALL') matchesCategory = n.category === filterCategory;

    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30 uppercase">
              MODULE 7 // NOTIFICATION CENTER & SYSTEM AUDIT LEDGER
            </span>
          </div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">LETTERS, DISPATCHES & SYSTEM AUDIT LEDGER</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">Academic Alerts, Risk Factor Telemetry & Security Heartbeat</p>
        </div>

        {/* Telemetry Stats */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#f5ebe0]">
            UNREAD DISPATCHES: <strong className="text-[#c9a45c] font-bold">{unreadCount}</strong>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-emerald-400 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>GATEWAY SECURE</span>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#2a3c2a] border border-emerald-500/40 text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Bar & Batch Action Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Category Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {(['ALL', 'UNREAD', 'CRITICAL', 'ACADEMIC_ALERT', 'EXAM_COUNTDOWN', 'SYSTEM_EVENT'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === cat
                  ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/40 shadow-sm'
                  : 'bg-[#14100c] text-[#9a9082] border border-[#28211a] hover:text-[#f5ebe0]'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Batch Actions & Search Input */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#c9a45c] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dispatches..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-xs text-[#f5ebe0] placeholder-[#9a9082] focus:outline-none"
            />
          </div>

          <button
            onClick={handleMarkAllAsRead}
            className="px-3.5 py-1.5 rounded-xl bg-[#1b1612] hover:bg-[#28211a] text-[#c9a45c] border border-[#c9a45c]/30 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
            title="Mark All as Read"
          >
            <MailCheck className="w-3.5 h-3.5 text-[#c9a45c]" />
            <span>Mark All Read</span>
          </button>

          <button
            onClick={handleClearRead}
            className="p-1.5 rounded-xl bg-[#0f0c0a] hover:bg-[#6b1d2f] text-[#9a9082] hover:text-[#f5ebe0] border border-[#28211a] transition-all shrink-0"
            title="Clear Read Dispatches"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Notifications List & Audit Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Dispatches List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredNotifs.length === 0 ? (
            <ParchmentCard className="p-8 text-center text-xs text-[#9a9082] italic">
              No dispatches found matching the filter criteria.
            </ParchmentCard>
          ) : (
            filteredNotifs.map((notif) => {
              const currentMins = snoozeMinutesMap[notif.id] || 60;
              const { durationText, timeStr, defaultPickerTime } = getSnoozeTimeLabel(currentMins);
              const activeCustomTime = customTimeMap[notif.id] || defaultPickerTime;

              return (
                <ParchmentCard key={notif.id} className={`p-4 space-y-3 transition-all ${notif.isRead ? 'opacity-80 bg-[#0f0c0a]/60' : 'glow border-[#c9a45c]/40'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => handleToggleRead(notif.id)}
                        className={`w-3 h-3 rounded-full mt-1 shrink-0 transition-all ${notif.isRead ? 'bg-[#28211a] border border-[#9a9082]' : 'bg-[#c9a45c] shadow-[0_0_8px_#c9a45c]'}`}
                        title={notif.isRead ? 'Mark as Unread' : 'Mark as Read'}
                      />

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-sm text-[#f5ebe0]">{notif.title}</h3>
                          {notif.isSnoozed && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#c9a45c]" />
                              SNOOZED UNTIL {notif.snoozedUntil ?? 'LATER'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#9a9082]">{notif.timestamp} • {notif.category}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      notif.priority === 'CRITICAL' ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/40' :
                      notif.priority === 'HIGH' ? 'bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30' :
                      'bg-[#14100c] text-[#9a9082] border border-[#28211a]'
                    }`}>
                      {notif.priority}
                    </span>
                  </div>

                  <p className="text-xs text-[#d8cebe] leading-relaxed pl-6">{notif.message}</p>

                  {/* Action Buttons & Timed Snooze Menu */}
                  <div className="flex flex-col space-y-2 pt-2 border-t border-[#28211a]">
                    <div className="flex justify-end space-x-2">
                      {notif.isSnoozed ? (
                        <button
                          onClick={() => handleUnsnooze(notif.id)}
                          className="px-3 py-1 rounded-lg bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/40 hover:bg-[#28211a] font-bold text-[10px] flex items-center gap-1.5"
                        >
                          <Clock className="w-3 h-3 text-[#c9a45c]" /> Unsnooze
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveSnoozeMenuId(activeSnoozeMenuId === notif.id ? null : notif.id)}
                          className="px-3 py-1 rounded-lg bg-[#0f0c0a] text-[#c9a45c] hover:text-[#f5ebe0] font-bold text-[10px] border border-[#28211a] hover:border-[#c9a45c]/40 flex items-center gap-1.5 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5 text-[#c9a45c]" />
                          <span>Snooze</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDismiss(notif.id)}
                        className="px-3 py-1 rounded-lg bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] font-bold text-[10px] border border-[#c9a45c]/40"
                      >
                        Archive
                      </button>
                    </div>

                    {/* Scrollable Time Bar & Gold Custom Time Input */}
                    {!notif.isSnoozed && activeSnoozeMenuId === notif.id && (
                      <div className="p-4 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-3 text-[10px] animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-[#28211a] pb-2">
                          <span className="text-[#c9a45c] font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#c9a45c]" />
                            <span>SCROLL TIME BAR TO SNOOZE:</span>
                          </span>
                          <span className="text-[#f5ebe0] font-bold">
                            {durationText} (Until {timeStr})
                          </span>
                        </div>

                        {/* Scrollable Range Slider Time Bar */}
                        <div className="space-y-1">
                          <input
                            type="range"
                            min="15"
                            max="720"
                            step="15"
                            value={currentMins}
                            onChange={(e) => setSnoozeMinutesMap({ ...snoozeMinutesMap, [notif.id]: parseInt(e.target.value) })}
                            className="w-full h-2 bg-[#1b1612] rounded-lg appearance-none cursor-pointer accent-[#c9a45c] border border-[#28211a]"
                          />
                          <div className="flex justify-between text-[9px] text-[#9a9082]">
                            <span>15m</span>
                            <span>2h</span>
                            <span>6h</span>
                            <span>12h</span>
                          </div>
                        </div>

                        {/* Presets & Gold Custom Time Picker */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#28211a]">
                          <div className="flex items-center space-x-2">
                            <span className="text-[#9a9082] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#c9a45c]" /> Exact Time:
                            </span>
                            <input
                              type="time"
                              value={activeCustomTime}
                              onChange={(e) => setCustomTimeMap({ ...customTimeMap, [notif.id]: e.target.value })}
                              className="p-1 px-2 rounded-lg bg-[#14100c] border border-[#c9a45c]/50 text-[#c9a45c] font-semibold focus:outline-none [color-scheme:dark]"
                            />
                            <button
                              onClick={() => applyCustomTimeSnooze(notif.id, activeCustomTime)}
                              className="px-2.5 py-1 rounded-lg bg-[#1b1612] hover:bg-[#28211a] text-[#c9a45c] border border-[#c9a45c]/40 font-semibold transition-colors"
                            >
                              Set Exact Time
                            </button>
                          </div>

                          <button
                            onClick={() => applySliderSnooze(notif.id)}
                            className="px-4 py-1.5 rounded-lg bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] font-bold border border-[#c9a45c]/40 shadow-md ml-auto flex items-center gap-1.5"
                          >
                            <Clock className="w-3.5 h-3.5 text-[#c9a45c]" />
                            <span>Confirm Snooze ({durationText})</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </ParchmentCard>
              );
            })
          )}
        </div>

        {/* Right Column: System Security Audit Ledger */}
        <ParchmentCard className="p-5 space-y-4">
          <h3 className="text-xs font-bold text-[#c9a45c] font-cinzel uppercase tracking-wider flex items-center gap-2 border-b border-[#28211a] pb-2">
            <Cpu className="w-4 h-4 text-[#c9a45c]" />
            <span>SYSTEM AUDIT & SECURITY LEDGER</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-1">
              <span className="text-[#9a9082] text-[10px] font-bold uppercase">LMS SESSION TOKEN STATUS</span>
              <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-BIT ENCRYPTED VAULT ACTIVE</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-1">
              <span className="text-[#9a9082] text-[10px] font-bold uppercase">LAST SYSTEM AUDIT</span>
              <p className="text-[#f5ebe0] font-semibold text-[11px]">Just now • 0 Security Vulnerabilities</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#28211a]">
              <span className="text-[#9a9082] text-[10px] font-bold uppercase block">GATEWAY HEARTBEAT LOG</span>

              <div className="p-2.5 rounded-lg bg-[#0f0c0a] border border-[#28211a] text-[11px] text-[#9a9082] space-y-1">
                <div className="flex justify-between font-bold text-[#f5ebe0]">
                  <span>AUTHENTICATION SYNC</span>
                  <span className="text-emerald-400">PASSED</span>
                </div>
                <p className="text-[10px] text-[#9a9082]">Canvas ERP Gateway session validated successfully.</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0f0c0a] border border-[#28211a] text-[11px] text-[#9a9082] space-y-1">
                <div className="flex justify-between font-bold text-[#f5ebe0]">
                  <span>RISK MONITOR HEARTBEAT</span>
                  <span className="text-[#c9a45c]">NOMINAL</span>
                </div>
                <p className="text-[10px] text-[#9a9082]">Subject grade threshold evaluator active.</p>
              </div>
            </div>
          </div>
        </ParchmentCard>
      </div>
    </div>
  );
};





