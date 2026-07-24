import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, AlertTriangle, ShieldCheck, Sparkles, Clock, Check, Moon, Trash2 } from 'lucide-react';
import { mockBackendAPI } from '../services/api';
import type { NotificationItemDTO } from '../types/dto';

export const NotificationCenterView: React.FC = () => {
  const { data: initialNotifs = [] } = useQuery({ queryKey: ['notifications'], queryFn: mockBackendAPI.getNotifications });
  const [notifications, setNotifications] = useState<NotificationItemDTO[]>(initialNotifs);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSnooze = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isSnoozed: true } : n));
  };

  const filteredNotifs = notifications.filter(n => filterPriority === 'ALL' || n.priority === filterPriority);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              MODULE 9
            </span>
            <h1 className="text-xl font-extrabold text-white font-mono-tech tracking-tight">NOTIFICATION CENTER</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono-tech">
            Academic Alert Dispatcher // Priority Ingestion & Telemetry Briefings
          </p>
        </div>

        {/* Priority Filter Tabs */}
        <div className="flex items-center space-x-2 text-xs font-mono-tech">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterPriority === p
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-cyan-500/20'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
        {filteredNotifs.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono-tech text-slate-500">
            No notifications matching selected priority filter.
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl transition-all border flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono-tech text-xs ${
                notif.priority === 'CRITICAL' ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' :
                notif.priority === 'HIGH' ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' :
                'bg-slate-900/80 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                {notif.priority === 'CRITICAL' ? <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" /> : <Bell className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold text-white">{notif.title}</span>
                    <span className="text-[10px] text-slate-500">• {notif.timestamp}</span>
                    {notif.isSnoozed && <span className="px-1.5 text-[9px] rounded bg-slate-800 text-slate-400">SNOOZED</span>}
                  </div>
                  <p className="text-slate-300">{notif.message}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleSnooze(notif.id)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700 text-[10px] flex items-center gap-1"
                >
                  <Moon className="w-3 h-3" /> Snooze
                </button>
                <button
                  onClick={() => handleDismiss(notif.id)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-rose-400 border border-rose-500/30 text-[10px] flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
