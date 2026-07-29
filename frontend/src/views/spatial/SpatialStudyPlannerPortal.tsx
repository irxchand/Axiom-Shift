import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Play, Pause, Square, RotateCcw, Clock, History, CheckCircle2, Award, BookOpen } from 'lucide-react';
import { backendAPI } from '../../services/backendAPI';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';
import type { StudyTaskDTO } from '../../types/dto';

interface LoggedFocusSession {
  id: string;
  subjectCode: string;
  durationSeconds: number;
  timestamp: string;
}

export const SpatialStudyPlannerPortal: React.FC = () => {
  const { data: initialTasks = [], isLoading, isError } = useQuery({ 
    queryKey: ['studyTasks'], 
    queryFn: backendAPI.getStudyTasks 
  });
  const [tasks, setTasks] = useState<StudyTaskDTO[]>(initialTasks);

  // Manual Count-Up Focus Timer state (starts from 0)
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('CS602');
  const [loggedSessions, setLoggedSessions] = useState<LoggedFocusSession[]>([
    { id: 'sess-1', subjectCode: 'CS601', durationSeconds: 2700, timestamp: 'Yesterday at 4:30 PM' },
    { id: 'sess-2', subjectCode: 'CS604', durationSeconds: 1840, timestamp: 'Yesterday at 8:15 PM' }
  ]);
  const [lastClockedMessage, setLastClockedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialTasks.length > 0) {
      setTasks(initialTasks);
    }
  }, [initialTasks]);

  // Count-Up Timer Interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Auto-Clock on Component Unmount / Logout / Navigation if timer was running
  useEffect(() => {
    return () => {
      if (isTimerRunning && timerSeconds > 5) {
        // Auto-save session on unmount
        const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newSession: LoggedFocusSession = {
          id: `sess-${Date.now()}`,
          subjectCode: selectedSubject,
          durationSeconds: timerSeconds,
          timestamp: `Today at ${formattedTime}`
        };
        setLoggedSessions(prev => [newSession, ...prev]);
      }
    };
  }, [isTimerRunning, timerSeconds, selectedSubject]);

  if (isLoading) {
    return <ParchmentCard className="p-8 text-center text-xs text-gold-foil animate-pulse">Loading Study Journal...</ParchmentCard>;
  }

  if (isError) {
    return <ParchmentCard className="p-8 text-center text-xs text-[#6b1d2f]">Error loading study tasks.</ParchmentCard>;
  }

  const toggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } : t));
  };

  // Format seconds into HH:MM:SS or MM:SS
  const formatTimer = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDurationText = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${s}s`;
    if (mins > 0) return `${mins}m ${s}s`;
    return `${s}s`;
  };

  // Manual Clock / Stop Action
  const handleStopAndClockSession = () => {
    if (timerSeconds < 3) {
      setLastClockedMessage('Focus session too short to clock (minimum 3 seconds required).');
      setTimeout(() => setLastClockedMessage(null), 3000);
      setIsTimerRunning(false);
      setTimerSeconds(0);
      return;
    }

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const durationText = formatDurationText(timerSeconds);
    const newSession: LoggedFocusSession = {
      id: `sess-${Date.now()}`,
      subjectCode: selectedSubject,
      durationSeconds: timerSeconds,
      timestamp: `Today at ${formattedTime}`
    };

    setLoggedSessions(prev => [newSession, ...prev]);
    setLastClockedMessage(`Successfully clocked ${durationText} for ${selectedSubject}!`);
    setIsTimerRunning(false);
    setTimerSeconds(0);

    setTimeout(() => setLastClockedMessage(null), 4000);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">STUDY JOURNAL</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">Scholar's Workload Notebook & Manual Focus Stopwatch</p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#f5ebe0]">
            SESSIONS CLOCKED: <strong className="text-[#c9a45c] font-bold">{loggedSessions.length}</strong>
          </div>
        </div>
      </div>

      {lastClockedMessage && (
        <div className="p-3.5 rounded-xl bg-[#2a3c2a] border border-emerald-500/40 text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{lastClockedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Task Notebook List */}
        <div className="lg:col-span-2 space-y-4 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-[#28211a]">
            <h2 className="text-xs font-semibold text-[#c9a45c] tracking-wider uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#c9a45c]" />
              <span>ACTIVE STUDY TASKS & WORKLOAD</span>
            </h2>
          </div>

          <div className="space-y-3">
            {tasks.map(task => (
              <ParchmentCard key={task.id} className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleStatus(task.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        task.status === 'COMPLETED' ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300' : 'border-[#28211a] hover:border-[#c9a45c]/40 bg-[#0f0c0a]'
                      }`}
                    >
                      {task.status === 'COMPLETED' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <span className="px-2 py-0.5 rounded text-xs bg-[#0f0c0a] text-[#d4af37] border border-[#28211a] font-semibold">
                      {task.subjectCode}
                    </span>
                    <h3 className={`text-sm font-semibold ${task.status === 'COMPLETED' ? 'line-through text-[#9a9082]' : 'text-[#f5ebe0]'}`}>
                      {task.taskTitle}
                    </h3>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#6b1d2f] text-[#f5ebe0] font-semibold">
                    {task.priority}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#28211a] flex justify-between items-center text-[#9a9082] text-[11px] font-medium">
                  <span>{task.timeSlot} ({task.estimatedMinutes} mins)</span>
                  <span className="text-[10px]">{task.evidenceReference}</span>
                </div>
              </ParchmentCard>
            ))}
          </div>

          {/* Logged Study Sessions History Table */}
          <ParchmentCard className="p-5 space-y-4 mt-6">
            <div className="flex justify-between items-center border-b border-[#28211a] pb-3">
              <h3 className="text-xs font-bold text-[#c9a45c] font-cinzel uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-[#c9a45c]" />
                <span>CLOCKED FOCUS SESSIONS LEDGER</span>
              </h3>
              <span className="text-[10px] text-[#9a9082]">Realtime Session Logs</span>
            </div>

            <div className="space-y-2">
              {loggedSessions.length === 0 ? (
                <p className="text-xs text-[#9a9082] italic text-center py-4">No focus sessions clocked yet. Start the timer to log focus time!</p>
              ) : (
                loggedSessions.map(sess => (
                  <div key={sess.id} className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30 font-bold">
                        {sess.subjectCode}
                      </span>
                      <div>
                        <span className="text-[#f5ebe0] font-bold block">{formatDurationText(sess.durationSeconds)}</span>
                        <span className="text-[10px] text-[#9a9082]">{sess.timestamp}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded text-[10px] bg-[#2a3c2a] text-emerald-300 border border-emerald-500/30 font-bold">
                      LOGGED & SAVED 🟢
                    </span>
                  </div>
                ))
              )}
            </div>
          </ParchmentCard>
        </div>

        {/* Manual Focus Stopwatch Controller (Fills Full Height Void) */}
        <ParchmentCard glow className="p-6 flex flex-col justify-between text-center space-y-6 h-full min-h-[550px] border border-[#28211a]">
          <div className="space-y-5">
            <div className="space-y-1 border-b border-[#28211a] pb-3">
              <h3 className="text-xs font-bold text-[#c9a45c] font-cinzel uppercase tracking-wider flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-[#c9a45c]" />
                <span>MANUAL FOCUS STOPWATCH</span>
              </h3>
              <p className="text-xs text-[#9a9082]">Counts up from 00:00 • Clocked on Stop or Exit</p>
            </div>

            {/* Subject Selector */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] text-[#9a9082] font-bold uppercase tracking-wider block">TARGET SUBJECT</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-xs text-[#c9a45c] font-bold focus:outline-none"
              >
                <option value="CS601">CS601 - Deep Learning</option>
                <option value="CS602">CS602 - Distributed Systems</option>
                <option value="CS603">CS603 - Compiler Design</option>
                <option value="CS604">CS604 - Algorithms</option>
                <option value="CS605">CS605 - Quantum Computing</option>
              </select>
            </div>

            {/* Big Count-Up Timer Ring */}
            <div className="w-40 h-40 rounded-full bg-[#6b1d2f] border-4 border-[#c9a45c]/50 flex flex-col items-center justify-center shadow-[0_0_35px_rgba(107,29,47,0.6)] mx-auto relative my-4">
              <span className="text-3xl font-mono font-bold text-[#f5ebe0] tracking-wider">{formatTimer(timerSeconds)}</span>
              <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isTimerRunning ? 'text-emerald-400 animate-pulse' : 'text-[#c9a45c]'}`}>
                {isTimerRunning ? '● FOCUSING...' : 'READY'}
              </span>
            </div>

            {/* Action Buttons: Start/Pause, Stop & Clock, Reset */}
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center space-x-2 ${
                    isTimerRunning
                      ? 'bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/40 hover:bg-[#28211a]'
                      : 'bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] border border-[#c9a45c]/40'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
                </button>

                <button
                  onClick={handleResetTimer}
                  className="p-3 rounded-xl bg-[#0f0c0a] text-[#9a9082] hover:text-[#f5ebe0] border border-[#28211a] hover:border-[#c9a45c]/40 transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Stop & Clock Session Action */}
              <button
                onClick={handleStopAndClockSession}
                disabled={timerSeconds === 0}
                className="w-full py-3 px-4 rounded-xl bg-[#2a3c2a] hover:bg-[#354c35] text-emerald-200 font-bold text-xs border border-emerald-500/40 transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Square className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>Stop & Clock Session</span>
              </button>
            </div>
          </div>

          {/* Daily Goal & Study Telemetry Card (Stretches & Fills Void) */}
          <div className="p-4 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-3 text-left">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#c9a45c] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#c9a45c]" /> DAILY STUDY GOAL
              </span>
              <span className="text-[10px] font-bold text-emerald-400">75% REACHED</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#9a9082]">
                <span>Logged Today</span>
                <strong className="text-[#f5ebe0]">1h 15m / 3h Target</strong>
              </div>
              <div className="w-full bg-[#1b1612] h-2 rounded-full overflow-hidden border border-[#28211a]">
                <div className="bg-gradient-to-r from-[#6b1d2f] via-[#c9a45c] to-emerald-400 h-full w-[75%] rounded-full" />
              </div>
            </div>

            <div className="pt-2 border-t border-[#28211a]/60 flex justify-between items-center text-[10px] text-[#9a9082]">
              <span>🔥 7 Day Study Streak</span>
              <span className="text-[#c9a45c] font-bold">94% Mastery</span>
            </div>
          </div>
        </ParchmentCard>
      </div>
    </div>
  );
};
