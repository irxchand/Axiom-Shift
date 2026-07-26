import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { backendAPI } from '../../services/backendAPI';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';
import type { NotificationItemDTO } from '../../types/dto';

export const SpatialNotificationPortal: React.FC = () => {
  const { data: initialNotifs = [], isLoading, isError } = useQuery({ 
    queryKey: ['notifications'], 
    queryFn: backendAPI.getNotifications 
  });
  const [notifications, setNotifications] = useState<NotificationItemDTO[]>(initialNotifs);

  useEffect(() => {
    if (initialNotifs.length > 0) {
      setNotifications(initialNotifs);
    }
  }, [initialNotifs]);


  const handleDismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const handleSnooze = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isSnoozed: true } : n));

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
          notifications.map(notif => (
            <ParchmentCard key={notif.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-sm text-[#f5ebe0]">{notif.title}</h3>
                  <span className="text-[10px] text-[#9a9082]">{notif.timestamp}</span>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  notif.priority === 'CRITICAL' ? 'bg-[#6b1d2f] text-[#f5ebe0]' : 'bg-[#1b1612] text-[#c9a45c] border border-[#28211a]'
                }`}>
                  {notif.priority}
                </span>
              </div>

              <p className="text-xs text-[#9a9082] leading-relaxed">{notif.message}</p>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#28211a]">
                <button
                  onClick={() => handleSnooze(notif.id)}
                  className="px-3 py-1 rounded-lg bg-[#0f0c0a] text-[#9a9082] hover:text-[#f5ebe0] font-medium text-[10px] border border-[#28211a]"
                >
                  Snooze
                </button>
                <button
                  onClick={() => handleDismiss(notif.id)}
                  className="px-3 py-1 rounded-lg bg-[#6b1d2f] text-[#f5ebe0] font-semibold text-[10px] border border-[#c9a45c]/40 hover:bg-[#801c2e]"
                >
                  Archive
                </button>
              </div>
            </ParchmentCard>
          ))
        )}
      </div>
    </div>
  );
};
