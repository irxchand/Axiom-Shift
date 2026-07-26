import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { backendAPI } from '../../services/backendAPI';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';

export const SpatialThreatRiskPortal: React.FC = () => {
  const { data: riskOverview, isLoading, isError } = useQuery({ 
    queryKey: ['backendRiskOverview'], 
    queryFn: backendAPI.getBackendRiskOverview 
  });

  if (isLoading) {
    return <ParchmentCard className="p-8 text-center text-xs text-gold-foil">Loading Academic Records...</ParchmentCard>;
  }

  if (isError) {
    return <ParchmentCard className="p-8 text-center text-xs text-[#6b1d2f]">Error loading academic risk overview.</ParchmentCard>;
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">ACADEMIC RECORDS</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">Scholastic Performance & Risk Analysis</p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#f5ebe0]">
            ESTIMATED SGPA: <strong className="text-[#d4af37] font-bold">{riskOverview?.estimatedSGPA}</strong>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#f5ebe0]">
            CGPA: <strong className="text-[#d4af37] font-bold">{riskOverview?.estimatedCGPA}</strong>
          </div>
        </div>
      </div>

      {/* Threat & Ledger Core Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ParchmentCard glow className="p-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#2a3c2a] flex items-center justify-center text-emerald-400 font-bold text-lg shadow-md border border-emerald-500/30 mx-auto">
            A
          </div>
          <div className="text-center w-full">
            <span className="text-xs text-[#9a9082] block font-medium uppercase tracking-wider mb-1">SCHOLASTIC STANDING</span>
            <h2 className="text-2xl font-bold text-[#c9a45c] uppercase tracking-wide">{riskOverview?.overallRiskLevel ?? 'SAFE'}</h2>
            <p className="text-xs text-[#9a9082] mt-1 font-medium">Academic Risk Index: {riskOverview?.backendRiskScore ?? 12} / 100</p>
          </div>
        </ParchmentCard>


        {/* Risk Breakdown Factors */}
        <ParchmentCard className="lg:col-span-2 p-5 space-y-3">
          <h3 className="text-xs font-semibold text-[#c9a45c] uppercase tracking-wider">
            ACADEMIC RISK FACTOR EVALUATION
          </h3>

          <div className="space-y-2.5">
            {(riskOverview?.riskFactors || []).map((rf, idx) => (
              <div key={idx} className="p-3.5 rounded-xl inset-section flex justify-between items-center text-xs border border-[#28211a]">
                <div>
                  <span className="font-semibold text-[#d4af37] text-sm block">{rf.category}</span>
                  <span className="text-[#9a9082] text-xs">{rf.description}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#0f0c0a] text-[#c9a45c] font-semibold border border-[#28211a]">
                  Impact {rf.impactScore}
                </span>
              </div>
            ))}
          </div>
        </ParchmentCard>
      </div>

      {/* Target Marks Vector Ledger */}
      <ParchmentCard className="p-5 space-y-3">
        <h3 className="text-xs font-semibold text-[#c9a45c] uppercase tracking-wider">
          TARGET MARKS LEDGER FOR GRADE 'A' DISTINCTION
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {(riskOverview?.requiredMarksDTO || []).map((item) => (
            <div key={item.subjectCode} className="p-3.5 rounded-xl inset-section border border-[#28211a] space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#c9a45c]">{item.subjectCode}</span>
                <span className="text-[#9a9082] text-[10px]">Accrued: {item.currentMarksAccrued}</span>
              </div>
              <p className="text-[#f5ebe0] font-semibold text-sm truncate">{item.subjectName}</p>
              <div className="pt-2 border-t border-[#28211a] flex justify-between items-center text-[#d4af37] font-semibold">
                <span>Target</span>
                <span>{item.targetMarksForGradeA} Required</span>
              </div>
            </div>
          ))}
        </div>
      </ParchmentCard>
    </div>
  );
};
