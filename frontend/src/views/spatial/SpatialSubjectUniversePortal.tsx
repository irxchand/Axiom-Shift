import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { backendAPI } from '../../services/backendAPI';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';
import { KnowledgeGraph3D } from '../../components/3d/KnowledgeGraph3D';

export const SpatialSubjectUniversePortal: React.FC = () => {
  const { data: subjects = [], isLoading, isError } = useQuery({ 
    queryKey: ['subjects'], 
    queryFn: backendAPI.getSubjects 
  });
  const [selectedCode, setSelectedCode] = useState('CS602');

  const selectedSubject = subjects.find(s => s.code === selectedCode) || subjects[0];
  const { data: concepts = [] } = useQuery({
    queryKey: ['knowledgeConcepts', selectedCode],
    queryFn: () => backendAPI.getKnowledgeConcepts(selectedCode)
  });

  if (isLoading) {
    return <ParchmentCard className="p-8 text-center text-xs text-gold-foil">Loading Course Library...</ParchmentCard>;
  }

  if (isError) {
    return <ParchmentCard className="p-8 text-center text-xs text-[#6b1d2f]">Error loading course catalog.</ParchmentCard>;
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">COURSE LIBRARY</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">Academic Subject Catalog & Syllabus</p>
        </div>
      </div>

      {/* Subject Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {subjects.map(sub => (
          <button
            key={sub.code}
            onClick={() => setSelectedCode(sub.code)}
            className={`p-4 rounded-xl text-left transition-all relative overflow-hidden ${
              sub.code === selectedCode
                ? 'modern-card text-[#f5ebe0] border border-[#c9a45c]/50 bg-[#1b1612] shadow-lg scale-105'
                : 'modern-card text-[#d8cebe] border border-[#28211a] hover:border-[#c9a45c]/30'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`font-semibold text-xs ${sub.code === selectedCode ? 'text-[#d4af37]' : 'text-[#c9a45c]'}`}>
                {sub.code}
              </span>
              <span className="text-[10px] font-semibold text-[#9a9082]">
                {sub.syllabusProgressPercent}%
              </span>
            </div>
            <p className="text-xs font-bold truncate mb-2 text-[#f5ebe0]">{sub.name}</p>
            <div className="w-full bg-[#0f0c0a] h-1.5 rounded-full overflow-hidden border border-[#28211a]">
              <div className="bg-gradient-to-r from-[#6b1d2f] to-[#c9a45c] h-full rounded-full" style={{ width: `${sub.syllabusProgressPercent}%` }} />
            </div>
          </button>
        ))}
      </div>

      {/* Detailed Stage */}
      {selectedSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ParchmentCard className="p-5 space-y-4">
            <div className="border-b border-[#28211a] pb-4">
              <span className="px-2.5 py-0.5 rounded text-xs bg-[#0f0c0a] text-[#d4af37] border border-[#28211a] font-semibold inline-block mb-2">
                {selectedSubject.code}
              </span>
              <h2 className="text-xl font-bold text-[#f5ebe0]">{selectedSubject.name}</h2>
              <p className="text-xs text-[#9a9082] mt-1">Instructor: {selectedSubject.faculty} — {selectedSubject.credits} Credits</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#c9a45c] uppercase tracking-wider">
                SYLLABUS TOPICS
              </h3>
              {selectedSubject.topics.map(t => (
                <div key={t.id} className="p-3 rounded-xl inset-section flex justify-between items-center text-xs font-medium border border-[#28211a]">
                  <span className="text-[#f5ebe0]">{t.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#0f0c0a] text-[#c9a45c] border border-[#28211a]">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </ParchmentCard>

          {/* 3D Concept Graph Stage */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold text-[#d8cebe] tracking-wider uppercase">
              3D CONCEPT KNOWLEDGE NETWORK
            </h3>
            <KnowledgeGraph3D concepts={concepts} />
          </div>
        </div>
      )}
    </div>
  );
};
