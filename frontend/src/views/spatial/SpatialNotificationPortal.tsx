import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { backendAPI } from '../../services/backendAPI';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';
import type { NotificationItemDTO } from '../../types/dto';

export const SpatialNotificationPortal: React.FC = () => {
  const { data: initialNotifs = [], isLoading, isError } = useQuery({ 
    queryKey: ['notifications'], 
    queryFn: backendAPI.getNotifications 
  });
  const [notifications, setNotifications] = useState<NotificationItemDTO[]>(initialNotifs);
  const [activeSnoozeMenuId, setActiveSnoozeMenuId] = useState<string | null>(null);
  const [snoozeMinutesMap, setSnoozeMinutesMap] = useState<Record<string, number>>({});
  const [customTimeMap, setCustomTimeMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialNotifs.length > 0) {
      setNotifications(initialNotifs);
    }
  }, [initialNotifs]);

  const handleDismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

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

  if (isLoading) {
    return <ParchmentCard className="p-8 text-center text-xs text-gold-foil">Loading Dispatches...</ParchmentCard>;
  }

  if (isError) {
    return <ParchmentCard className="p-8 text-center text-xs text-[#6b1d2f]">Error loading university dispatches.</ParchmentCard>;
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">LETTERS & DISPATCHES</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">University Notifications & Announcements</p>
        </div>
      </div>

      {/* Dispatches List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <ParchmentCard className="p-8 text-center text-xs text-[#9a9082]">
            All university dispatches have been archived.
          </ParchmentCard>
        ) : (
          notifications.map((notif) => {
            const currentMins = snoozeMinutesMap[notif.id] || 60;
            const { durationText, timeStr, defaultPickerTime } = getSnoozeTimeLabel(currentMins);
            const activeCustomTime = customTimeMap[notif.id] || defaultPickerTime;

            return (
              <ParchmentCard key={notif.id} className={`p-4 space-y-3 transition-all ${notif.isSnoozed ? 'opacity-70 border-[#28211a]/60 bg-[#0f0c0a]/40' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm text-[#f5ebe0]">{notif.title}</h3>
                      {notif.isSnoozed && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#c9a45c]" />
                          SNOOZED UNTIL {notif.snoozedUntil ?? 'LATER'}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#9a9082]">{notif.timestamp}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    notif.priority === 'CRITICAL' ? 'bg-[#6b1d2f] text-[#f5ebe0]' : 'bg-[#1b1612] text-[#c9a45c] border border-[#28211a]'
                  }`}>
                    {notif.priority}
                  </span>
                </div>

                <p className="text-xs text-[#9a9082] leading-relaxed">{notif.message}</p>

                {/* Action Buttons & Timed Snooze Menu */}
                <div className="flex flex-col space-y-2 pt-2 border-t border-[#28211a]">
                  <div className="flex justify-end space-x-2">
                    {notif.isSnoozed ? (
                      <button
                        onClick={() => handleUnsnooze(notif.id)}
                        className="px-3 py-1 rounded-lg bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/40 hover:bg-[#28211a] font-medium text-[10px] flex items-center gap-1.5"
                      >
                        <Clock className="w-3 h-3 text-[#c9a45c]" /> Unsnooze
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveSnoozeMenuId(activeSnoozeMenuId === notif.id ? null : notif.id)}
                        className="px-3 py-1 rounded-lg bg-[#0f0c0a] text-[#c9a45c] hover:text-[#f5ebe0] font-medium text-[10px] border border-[#28211a] hover:border-[#c9a45c]/40 flex items-center gap-1.5 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#c9a45c]" />
                        <span>Snooze</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDismiss(notif.id)}
                      className="px-3 py-1 rounded-lg bg-[#6b1d2f] text-[#f5ebe0] font-semibold text-[10px] border border-[#c9a45c]/40 hover:bg-[#801c2e]"
                    >
                      Archive
                    </button>
                  </div>

                  {/* Scrollable Time Bar & Gold Custom Time Input */}
                  {!notif.isSnoozed && activeSnoozeMenuId === notif.id && (
                    <div className="p-4 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-3 text-[10px] animate-fadeIn">
                      <div className="flex justify-between items-center border-b border-[#28211a] pb-2">
                        <span className="text-[#c9a45c] font-semibold flex items-center gap-1.5">
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
                          className="px-4 py-1.5 rounded-lg bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] font-semibold border border-[#c9a45c]/40 shadow-md ml-auto flex items-center gap-1.5"
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
    </div>
  );
};




