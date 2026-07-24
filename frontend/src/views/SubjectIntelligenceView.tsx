import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain } from 'lucide-react';
import { mockBackendAPI } from '../services/api';
import { KnowledgeGraph3D } from '../components/3d/KnowledgeGraph3D';

export const SubjectIntelligenceView: React.FC = () => {
  const { data: subjects = [] } = useQuery({ queryKey: ['subjects'], queryFn: mockBackendAPI.getSubjects });
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('CS602');

  const selectedSubject = subjects.find(s => s.code === selectedSubjectCode) || subjects[0];

  const { data: conceptNodes = [] } = useQuery({
    queryKey: ['knowledgeConcepts', selectedSubjectCode],
    queryFn: () => mockBackendAPI.getKnowledgeConcepts(selectedSubjectCode)
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              MODULE 3
            </span>
            <h1 className="text-xl font-extrabold text-white font-mono-tech tracking-tight">SUBJECT INTELLIGENCE VIEW</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono-tech">
            Academic Concept Mapping // Syllabus Tracking & 3D Knowledge Graph
          </p>
        </div>
      </div>

      {/* Subject Tabs Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {subjects.map((sub) => {
          const isSelected = sub.code === selectedSubjectCode;
          return (
            <button
              key={sub.code}
              onClick={() => setSelectedSubjectCode(sub.code)}
              className={`p-4 rounded-xl text-left font-mono-tech transition-all duration-200 ${
                isSelected
                  ? 'glass-panel-glow border-cyan-500/60 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                  : 'glass-panel border-slate-800 text-slate-400 hover:border-cyan-500/30 hover:text-slate-200'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs">{sub.code}</span>
                <span className={`px-1.5 py-0.2 text-[9px] rounded font-bold ${
                  sub.riskTier === 'LOW' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                  sub.riskTier === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' :
                  'bg-rose-950 text-rose-400 border border-rose-500/30'
                }`}>
                  {sub.riskTier} RISK
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium truncate mb-2">{sub.name}</p>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${sub.syllabusProgressPercent}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed View for Selected Subject */}
      {selectedSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Topics Breakdown & Metrics */}
          <div className="space-y-6">
            <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold">
                  {selectedSubject.code}
                </span>
                <h2 className="text-lg font-bold text-white mt-1">{selectedSubject.name}</h2>
                <p className="text-xs text-slate-400 font-mono-tech">{selectedSubject.faculty} // {selectedSubject.credits} Credits</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono-tech">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">SYLLABUS PROGRESS</span>
                  <span className="text-lg font-bold text-cyan-400">{selectedSubject.syllabusProgressPercent}%</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">ASSIGNMENTS</span>
                  <span className="text-lg font-bold text-emerald-400">{selectedSubject.assignmentsSubmitted}/{selectedSubject.assignmentsTotal}</span>
                </div>
              </div>

              {/* Topics List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 font-mono-tech">SYLLABUS MODULE TOPICS</h3>
                {selectedSubject.topics.map(topic => (
                  <div key={topic.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center text-xs font-mono-tech">
                    <div>
                      <span className="text-slate-200 font-medium block">{topic.title}</span>
                      <span className="text-[10px] text-slate-500">Difficulty: {topic.difficulty}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      topic.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                      topic.status === 'IN_PROGRESS' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' :
                      'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}>
                      {topic.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 3D Concept Knowledge Graph */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white font-mono-tech flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span>3D CONCEPT KNOWLEDGE GRAPH TELEMETRY</span>
              </h3>
            </div>

            <KnowledgeGraph3D concepts={conceptNodes} />
          </div>
        </div>
      )}
    </div>
  );
};
