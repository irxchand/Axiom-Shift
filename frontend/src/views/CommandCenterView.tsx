import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  BookOpen,
  UserCheck,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  Activity,
  Sparkles,
  X
} from 'lucide-react';
import { backendAPI } from '../services/backendAPI';
import { SemesterMap3D } from '../components/3d/SemesterMap3D';
import { useUIStore } from '../store/useUIStore';

export const CommandCenterView: React.FC = () => {
  const { selected3DNode, setSelected3DNode } = useUIStore();

  const { data: currentClass } = useQuery({ queryKey: ['currentClass'], queryFn: backendAPI.getCurrentClass });
  const { data: nextClass } = useQuery({ queryKey: ['nextClass'], queryFn: backendAPI.getNextClass });
  const { data: academicOverview } = useQuery({ queryKey: ['academicOverview'], queryFn: backendAPI.getAcademicOverview });
  const { data: aiBriefing } = useQuery({ queryKey: ['aiBriefing'], queryFn: backendAPI.getAIBriefing });
  const { data: riskOverview } = useQuery({ queryKey: ['backendRiskOverview'], queryFn: backendAPI.getBackendRiskOverview });
  const { data: semester3DNodes = [] } = useQuery({ queryKey: ['semester3DNodes'], queryFn: backendAPI.getSemester3DNodes });


  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              TACTICAL HUD
            </span>
            <h1 className="text-xl font-extrabold text-white font-mono-tech tracking-tight">COMMAND CENTER</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono-tech">
            JARVIS Autonomous Semester Operating System // Mission Control Room
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono-tech">
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-2 text-slate-300">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>ESTIMATED SGPA: <strong className="text-cyan-300">{riskOverview?.estimatedSGPA ?? '---'}</strong></span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-2 text-slate-300">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>RISK LEVEL: <strong className="text-emerald-400">{riskOverview?.overallRiskLevel ?? 'SAFE'}</strong></span>
          </div>
        </div>
      </div>

      {/* Row 1: Current Class & Next Class Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Class Card */}
        <div className="lg:col-span-2 glass-panel-glow p-5 rounded-2xl border border-cyan-500/40 relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 status-pulse-green" />
              <span className="text-xs font-bold text-cyan-400 font-mono-tech tracking-wider">CURRENT ACTIVE SESSION</span>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 text-xs font-mono-tech border border-cyan-500/30">
              {currentClass?.startTime} - {currentClass?.endTime}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono-tech bg-slate-900 text-cyan-400 border border-cyan-500/30 font-bold">
                {currentClass?.subjectCode}
              </span>
              <h2 className="text-lg font-bold text-white tracking-wide">{currentClass?.subjectName}</h2>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-mono-tech text-slate-300 pt-1">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-cyan-400" /> {currentClass?.remainingMinutes} mins remaining</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-cyan-400" /> {currentClass?.classroom}</span>
              <span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-cyan-400" /> {currentClass?.facultyName}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono-tech text-slate-400">
              <span>Session Elapsed</span>
              <span className="text-cyan-400 font-bold">{currentClass?.progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-cyan-500/20 p-0.5">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_#06b6d4]"
                style={{ width: `${currentClass?.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Next Session Card */}
        <div className="glass-panel p-5 rounded-2xl border border-blue-500/25 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-blue-400 font-mono-tech tracking-wider">UPCOMING SESSION</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-blue-950 text-blue-300 border border-blue-500/30">
              STARTS IN {nextClass?.startsInMinutes}M
            </span>
          </div>

          <div className="space-y-2 my-auto">
            <span className="px-2 py-0.5 rounded text-xs font-mono-tech bg-slate-900 text-blue-400 border border-blue-500/30 font-bold inline-block">
              {nextClass?.subjectCode}
            </span>
            <h3 className="text-base font-bold text-slate-100">{nextClass?.subjectName}</h3>
            <p className="text-xs font-mono-tech text-slate-400">{nextClass?.classroom} // {nextClass?.facultyName}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-mono-tech text-slate-400">
            <span>Scheduled Time</span>
            <span className="text-blue-300 font-bold">{nextClass?.scheduledTime}</span>
          </div>
        </div>
      </div>

      {/* Row 2: 3D Holographic Semester Map Visualization */}
      <div className="relative">
        <SemesterMap3D
          nodes={semester3DNodes}
          onSelectNode={(node) => setSelected3DNode(node)}
        />

        {/* Selected Node Details Drawer */}
        {selected3DNode && (
          <div className="absolute top-4 right-4 z-20 w-80 glass-panel-glow p-5 rounded-xl border border-cyan-500/50 shadow-2xl animate-scaleUp text-slate-200">
            <div className="flex justify-between items-start mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                {selected3DNode.category}
              </span>
              <button
                onClick={() => setSelected3DNode(null)}
                className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h4 className="text-sm font-bold text-white font-mono-tech mb-2">{selected3DNode.label}</h4>
            <p className="text-xs text-slate-300 mb-3">{selected3DNode.details}</p>
            {selected3DNode.dueDate && (
              <div className="text-xs font-mono-tech text-cyan-400 bg-slate-900/90 p-2 rounded border border-cyan-500/30">
                DUE DATE: {selected3DNode.dueDate}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 3: Academic Overview & AI Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Overview Metrics */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono-tech">ACADEMIC OVERVIEW</h3>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-[11px] text-slate-400 font-mono-tech">ASSIGNMENTS COMPLETED</p>
                <p className="text-lg font-bold text-cyan-400 font-mono-tech">
                  {academicOverview?.completedAssignmentsCount} / {academicOverview?.totalAssignmentsCount}
                </p>
              </div>
              <span className="text-xs font-mono-tech text-cyan-300 font-bold">
                {academicOverview?.assignmentCompletionPercent}%
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-[11px] text-slate-400 font-mono-tech">NEXT MAJOR EXAM</p>
                <p className="text-xs font-bold text-slate-200">{academicOverview?.nextMajorExamName}</p>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono-tech bg-amber-950 text-amber-400 border border-amber-500/30 font-bold">
                IN {academicOverview?.daysUntilNextMajorExam} DAYS
              </span>
            </div>
          </div>
        </div>

        {/* AI Briefing Widget */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono-tech">JARVIS DAILY AI BRIEFING</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-tech bg-amber-950 text-amber-400 border border-amber-500/40 font-bold">
              {aiBriefing?.systemStatus}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-mono-tech bg-slate-900/70 p-3 rounded-xl border border-slate-800">
            {aiBriefing?.dailySummaryText}
          </p>

          {/* Critical Alerts */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 font-mono-tech">CRITICAL ACTION TELEMETRY</h4>
            {aiBriefing?.criticalAlerts.map(alert => (
              <div
                key={alert.id}
                className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between text-xs font-mono-tech"
              >
                <div className="flex items-center space-x-2 text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{alert.message}</span>
                </div>
                <button className="px-2.5 py-1 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-[11px] font-bold border border-rose-500/40 transition-colors">
                  {alert.actionLabel}
                </button>
              </div>
            ))}
          </div>

          {/* Suggested Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 font-mono-tech">RECOMMENDED STUDY INTERVENTIONS</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {aiBriefing?.suggestedActions.map(action => (
                <div key={action.id} className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/20 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono-tech">
                    <span className="text-cyan-400 font-bold">{action.category}</span>
                    <span className="text-slate-500">{action.estimatedMinutes}m</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium line-clamp-2">{action.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
