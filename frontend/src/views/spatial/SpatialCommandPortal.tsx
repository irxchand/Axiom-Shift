import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { backendAPI } from '../../services/backendAPI';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';

export const SpatialCommandPortal: React.FC = () => {
  const { data: currentClass } = useQuery({ queryKey: ['currentClass'], queryFn: backendAPI.getCurrentClass });
  const { data: nextClass } = useQuery({ queryKey: ['nextClass'], queryFn: backendAPI.getNextClass });
  const { data: academicOverview } = useQuery({ queryKey: ['academicOverview'], queryFn: backendAPI.getAcademicOverview });
  const { data: aiBriefing } = useQuery({ queryKey: ['aiBriefing'], queryFn: backendAPI.getAIBriefing });
  const { data: riskOverview } = useQuery({ queryKey: ['backendRiskOverview'], queryFn: backendAPI.getBackendRiskOverview });


  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">SEMESTER CHRONICLE</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">Overview & Active Dispatches</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#f5ebe0]">
            ESTIMATED SGPA: <strong className="text-[#d4af37] font-bold">{riskOverview?.estimatedSGPA ?? '3.82'}</strong>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[#2a3c2a] text-[#f5ebe0] font-semibold border border-emerald-500/30">
            STANDING: {riskOverview?.overallRiskLevel ?? 'EXEMPLARY'}
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Active Session & Schedule */}
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-[#28211a]">
            <h2 className="text-xs font-semibold text-[#c9a45c] tracking-wider uppercase">
              ACTIVE LECTURE SESSION
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0f0c0a] text-[#9a9082] text-xs border border-[#28211a]">
              {currentClass?.startTime} - {currentClass?.endTime}
            </span>
          </div>

          {/* Current Lecture Card */}
          <ParchmentCard glow className="p-6 space-y-4">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/30 inline-block">
                {currentClass?.subjectCode}
              </span>
              <h3 className="text-xl font-bold text-[#f5ebe0]">{currentClass?.subjectName}</h3>
              
              <div className="flex flex-wrap gap-4 text-xs text-[#9a9082] pt-2 font-medium">
                <span>{currentClass?.remainingMinutes} mins remaining</span>
                <span>• {currentClass?.classroom}</span>
                <span>• {currentClass?.facultyName}</span>
              </div>
            </div>

            {/* Progress Meter */}
            <div className="space-y-1.5 pt-3 border-t border-[#28211a]">
              <div className="flex justify-between text-xs text-[#9a9082]">
                <span>Session Progress</span>
                <span className="text-[#d4af37] font-semibold">{currentClass?.progressPercent}%</span>
              </div>
              <div className="w-full bg-[#0f0c0a] h-2 rounded-full overflow-hidden border border-[#28211a] p-0.5">
                <div
                  className="bg-gradient-to-r from-[#6b1d2f] via-[#c9a45c] to-[#d4af37] h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentClass?.progressPercent}%` }}
                />
              </div>
            </div>
          </ParchmentCard>

          {/* Next Lecture Session */}
          <ParchmentCard className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-[#c9a45c]">UPCOMING LECTURE</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#1b1612] text-[#f5ebe0] font-semibold border border-[#28211a]">
                IN {nextClass?.startsInMinutes} MINS
              </span>
            </div>
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#0f0c0a] text-[#c9a45c] font-semibold inline-block mb-1">
                {nextClass?.subjectCode}
              </span>
              <h4 className="text-base font-bold text-[#f5ebe0]">{nextClass?.subjectName}</h4>
              <p className="text-xs text-[#9a9082] mt-0.5">{nextClass?.classroom} — {nextClass?.facultyName}</p>
            </div>
          </ParchmentCard>

          {/* Assignment Milestone Card (Option 1 Segmented Step Tracker) */}
          <ParchmentCard className="p-5 space-y-3.5">
            <div className="flex justify-between items-center border-b border-[#28211a] pb-2.5">
              <div>
                <h4 className="text-xs font-semibold text-[#c9a45c] uppercase tracking-wider">ASSIGNMENT MILESTONES</h4>
                <p className="text-xs text-[#9a9082] mt-0.5">
                  Completed <strong className="text-[#f5ebe0]">{academicOverview?.completedAssignmentsCount}</strong> of <strong className="text-[#f5ebe0]">{academicOverview?.totalAssignmentsCount}</strong> Submissions
                </p>
              </div>

              {/* Space-Occupying Badge */}
              <div className="px-4 py-2 rounded-xl bg-[#6b1d2f] border border-[#c9a45c]/50 text-center shadow-md">
                <span className="text-sm font-black text-[#f5ebe0] font-mono block">
                  {academicOverview?.assignmentCompletionPercent}%
                </span>
                <span className="text-[8px] font-bold text-[#c9a45c] uppercase tracking-wider block">
                  COMPLETED
                </span>
              </div>
            </div>

            {/* Segmented Milestone Step Tracker Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-[#1b1612] border border-emerald-500/40 flex items-center justify-between text-xs">
                <div className="truncate">
                  <span className="text-[9px] text-[#9a9082] block font-mono">CS601</span>
                  <span className="text-[11px] font-bold text-[#f5ebe0] truncate">Lab 1 Report</span>
                </div>
                <span className="text-emerald-400 font-bold text-xs shrink-0">✓</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1b1612] border border-emerald-500/40 flex items-center justify-between text-xs">
                <div className="truncate">
                  <span className="text-[9px] text-[#9a9082] block font-mono">CS602</span>
                  <span className="text-[11px] font-bold text-[#f5ebe0] truncate">Quiz 1 Set</span>
                </div>
                <span className="text-emerald-400 font-bold text-xs shrink-0">✓</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1b1612] border border-emerald-500/40 flex items-center justify-between text-xs">
                <div className="truncate">
                  <span className="text-[9px] text-[#9a9082] block font-mono">CS604</span>
                  <span className="text-[11px] font-bold text-[#f5ebe0] truncate">Algo Project</span>
                </div>
                <span className="text-emerald-400 font-bold text-xs shrink-0">✓</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#6b1d2f]/40 border border-[#c9a45c]/50 flex items-center justify-between text-xs">
                <div className="truncate">
                  <span className="text-[9px] text-[#c9a45c] block font-mono">CS603</span>
                  <span className="text-[11px] font-bold text-[#f5ebe0] truncate">Compiler Lab</span>
                </div>
                <span className="text-[#c9a45c] font-bold text-[9px] px-1.5 py-0.5 rounded bg-[#1b1612] shrink-0">DUE 2D</span>
              </div>
            </div>
          </ParchmentCard>
        </div>

        {/* RIGHT COLUMN: AI Librarian Briefing */}
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-[#28211a]">
            <h2 className="text-xs font-semibold text-[#c9a45c] tracking-wider uppercase">
              ACADEMIC LIBRARIAN BRIEFING
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#6b1d2f] text-[#f5ebe0] font-semibold">
              {aiBriefing?.systemStatus ?? 'ACTIVE'}
            </span>
          </div>

          {/* AI Daily Summary Banner */}
          <div className="p-5 rounded-xl inset-section space-y-3 border border-[#28211a]">
            <div className="text-xs text-[#c9a45c] font-semibold uppercase tracking-wider">
              Scholar's Memorandum
            </div>
            <p className="text-xs text-[#d8cebe] leading-relaxed">
              {aiBriefing?.dailySummaryText}
            </p>
            <div className="text-right text-xs text-[#d4af37] font-medium pt-1">
              — Academic Librarian AI Engine
            </div>
          </div>

          {/* Recommended Study Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#c9a45c] uppercase tracking-wider">
              RECOMMENDED STUDY ACTIONS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {aiBriefing?.suggestedActions?.map(action => (
                <ParchmentCard key={action.id} className="p-3.5 space-y-1">
                  <span className="text-[#d4af37] font-semibold text-[10px] block">{action.category}</span>
                  <p className="text-[#f5ebe0] text-xs font-medium line-clamp-2">{action.title}</p>
                </ParchmentCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
