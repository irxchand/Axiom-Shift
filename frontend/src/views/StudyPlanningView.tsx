import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ListTodo, CheckCircle2, Clock, BookOpen, FileText, Check, X, Calendar, BarChart3 } from 'lucide-react';
import { backendAPI } from '../services/backendAPI';
import type { StudyTaskDTO } from '../types/dto';

export const StudyPlanningView: React.FC = () => {
  const { data: initialTasks = [], isLoading, isError } = useQuery({ 
    queryKey: ['studyTasks'], 
    queryFn: backendAPI.getStudyTasks 
  });
  const [tasks, setTasks] = useState<StudyTaskDTO[]>(initialTasks);

  useEffect(() => {
    if (initialTasks.length > 0) {
      setTasks(initialTasks);
    }
  }, [initialTasks]);


  if (isLoading) {
    return <div className="p-8 text-center text-cyan-400 font-mono-tech animate-pulse">LOADING STUDY PLANNING AGENDA...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-rose-400 font-mono-tech">ERROR LOADING STUDY TASKS</div>;
  }

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' };
      }
      return t;
    }));
  };

  const handleAcceptTask = (id: string, accept: boolean) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, isAccepted: accept };
      }
      return t;
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              MODULE 8
            </span>
            <h1 className="text-xl font-extrabold text-white font-mono-tech tracking-tight">STUDY PLANNING SYSTEM</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono-tech">
            Daily Agenda Timeline // Evidence-Based Task Prioritization
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Planner Agenda List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-white font-mono-tech flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-cyan-400" />
            <span>TODAY'S AI-OPTIMIZED AGENDA TIMELINE</span>
          </h2>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-5 rounded-2xl glass-panel transition-all border ${
                  task.status === 'COMPLETED' ? 'border-emerald-500/40 opacity-70' : 'border-slate-800 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                        task.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 hover:border-cyan-400'
                      }`}
                    >
                      {task.status === 'COMPLETED' && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold">
                          {task.subjectCode}
                        </span>
                        <h3 className={`text-sm font-bold ${task.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-white'}`}>
                          {task.taskTitle}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono-tech font-bold ${
                    task.priority === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-500/40' :
                    task.priority === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-500/40' :
                    'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                  }`}>
                    {task.priority} PRIORITY
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap justify-between items-center text-xs font-mono-tech text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-cyan-400" /> {task.timeSlot} ({task.estimatedMinutes}m)</span>
                    <span className="flex items-center gap-1.5 text-slate-500"><FileText className="w-3.5 h-3.5 text-slate-400" /> {task.evidenceReference}</span>
                  </div>

                  {!task.isAccepted && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptTask(task.id, true)}
                        className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleAcceptTask(task.id, false)}
                        className="px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-700 text-[10px]"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Workload Visualizer */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono-tech border-b border-slate-800 pb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>WEEKLY WORKLOAD DISTRIBUTION</span>
          </h3>

          <div className="space-y-3 font-mono-tech text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const hours = [3.5, 4.0, 5.5, 2.0, 4.5, 6.0, 1.5][idx];
              return (
                <div key={day} className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>{day}</span>
                    <span className="text-cyan-400 font-bold">{hours} hrs</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${(hours / 7) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
