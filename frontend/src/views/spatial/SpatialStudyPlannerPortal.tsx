import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Play, Pause, RotateCcw } from 'lucide-react';
import { mockBackendAPI } from '../../services/api';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';
import type { StudyTaskDTO } from '../../types/dto';

export const SpatialStudyPlannerPortal: React.FC = () => {
  const { data: initialTasks = [] } = useQuery({ queryKey: ['studyTasks'], queryFn: mockBackendAPI.getStudyTasks });
  const [tasks, setTasks] = useState<StudyTaskDTO[]>(initialTasks);

  // Focus Timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const toggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } : t));
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">STUDY JOURNAL</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">Scholar's Workload Notebook & Focus Timer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Notebook List */}
        <div className="lg:col-span-2 space-y-3 text-xs">
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

        {/* Focus Timer */}
        <ParchmentCard glow className="p-6 flex flex-col items-center justify-between text-center space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-[#c9a45c] uppercase tracking-wider">
              FOCUS TIMER
            </h3>
            <p className="text-xs text-[#9a9082]">Pomodoro Cycle</p>
          </div>

          <div className="w-32 h-32 rounded-full bg-[#6b1d2f] border-2 border-[#c9a45c]/50 flex flex-col items-center justify-center shadow-xl">
            <span className="text-2xl font-bold text-[#f5ebe0]">{formatTimer(timerSeconds)}</span>
            <span className="text-[10px] text-[#c9a45c] uppercase">{isTimerRunning ? 'Running' : 'Paused'}</span>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-4 py-2 rounded-xl bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] font-semibold text-xs border border-[#c9a45c]/40 shadow-md flex items-center space-x-2"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button
              onClick={() => { setIsTimerRunning(false); setTimerSeconds(25 * 60); }}
              className="p-2 rounded-xl bg-[#0f0c0a] text-[#c9a45c] border border-[#28211a] hover:border-[#c9a45c]/40"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </ParchmentCard>
      </div>
    </div>
  );
};
