import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, ShieldAlert, Award, TrendingUp, AlertOctagon, Target, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { mockBackendAPI } from '../services/api';

export const EvaluationRiskView: React.FC = () => {
  const { data: riskOverview } = useQuery({ queryKey: ['backendRiskOverview'], queryFn: mockBackendAPI.getBackendRiskOverview });
  const { data: gradeCards = [] } = useQuery({ queryKey: ['gradeCards'], queryFn: mockBackendAPI.getGradeCards });

  // Historical SGPA trajectory (provided by backend)
  const trajectoryData = [
    { sem: 'Sem 1', sgpa: 8.4 },
    { sem: 'Sem 2', sgpa: 8.6 },
    { sem: 'Sem 3', sgpa: 8.5 },
    { sem: 'Sem 4', sgpa: 8.9 },
    { sem: 'Sem 5', sgpa: 9.1 },
    { sem: 'Sem 6 (Est)', sgpa: riskOverview?.estimatedSGPA ?? 8.92 }
  ];

  // Radar data for risk categories
  const radarData = (riskOverview?.riskFactors || []).map(rf => ({
    subject: rf.category,
    A: rf.impactScore * 5
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              MODULE 4
            </span>
            <h1 className="text-xl font-extrabold text-white font-mono-tech tracking-tight">EVALUATION AND RISK SYSTEM</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono-tech">
            Academic Performance Analytics // Backend DTO Risk Telemetry
          </p>
        </div>

        {/* Backend DTO SGPA & CGPA Pill */}
        <div className="flex items-center space-x-3 text-xs font-mono-tech">
          <div className="px-4 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center space-x-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>ESTIMATED SGPA: <strong className="text-cyan-300 font-bold">{riskOverview?.estimatedSGPA}</strong></span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-blue-950/80 border border-blue-500/40 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>CURRENT CGPA: <strong className="text-blue-300 font-bold">{riskOverview?.estimatedCGPA}</strong></span>
          </div>
        </div>
      </div>

      {/* Grade Distribution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {gradeCards.map((card) => (
          <div
            key={card.subjectCode}
            className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-cyan-400 font-mono-tech">{card.subjectCode}</span>
                <span className={`px-1.5 py-0.2 text-[9px] rounded font-mono-tech font-bold ${
                  card.backendRiskLevel === 'SAFE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                  card.backendRiskLevel === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' :
                  'bg-rose-950 text-rose-400 border border-rose-500/30'
                }`}>
                  {card.backendRiskLevel}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white truncate">{card.subjectName}</h3>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-end">
              <div>
                <span className="text-[10px] text-slate-500 font-mono-tech block">SCORE</span>
                <span className="text-base font-bold text-slate-200 font-mono-tech">{card.obtainedScore}/100</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-mono-tech block">PREDICTED</span>
                <span className="text-base font-bold text-cyan-300 font-mono-tech">{card.predictedGrade}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Trajectory & Backend Target Marks Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trajectory Area Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono-tech flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>HISTORICAL SGPA TRAJECTORY (BACKEND PROJECTION)</span>
            </h3>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData}>
                <defs>
                  <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="sem" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[7.5, 10]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sgpa" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorSgpa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Backend Target Marks DTO Matrix */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono-tech flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>TARGET MARKS MATRIX (BACKEND DTO)</span>
            </h3>
          </div>

          <div className="space-y-3">
            {(riskOverview?.requiredMarksDTO || []).map((item) => (
              <div key={item.subjectCode} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 font-mono-tech text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-cyan-400">{item.subjectCode}</span>
                  <span className="text-[11px] text-slate-400">Current: {item.currentMarksAccrued}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-[11px] truncate max-w-[150px]">{item.subjectName}</span>
                  <span className="text-emerald-400 font-bold">Target Grade A: {item.targetMarksForGradeA}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
