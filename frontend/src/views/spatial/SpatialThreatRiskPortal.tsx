import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, ShieldAlert, TrendingUp, BookOpen, AlertTriangle, CheckCircle, Calculator } from 'lucide-react';
import { backendAPI } from '../../services/backendAPI';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';

export const SpatialThreatRiskPortal: React.FC = () => {
  const { data: riskOverview, isLoading: isLoadingRisk, isError: isErrorRisk } = useQuery({ 
    queryKey: ['backendRiskOverview'], 
    queryFn: backendAPI.getBackendRiskOverview 
  });

  const { data: gradeCards = [], isLoading: isLoadingGrades } = useQuery({
    queryKey: ['gradeCards'],
    queryFn: backendAPI.getGradeCards
  });

  const [selectedSubject, setSelectedSubject] = useState<string>('CS601');
  const [simulatedExamScore, setSimulatedExamScore] = useState<number>(85);

  const { data: sgpaData } = useQuery({
    queryKey: ['sgpaScenarios', selectedSubject, simulatedExamScore],
    queryFn: () => backendAPI.getSgpaScenarios(selectedSubject, simulatedExamScore)
  });

  if (isLoadingRisk || isLoadingGrades) {
    return <ParchmentCard className="p-8 text-center text-xs text-gold-foil animate-pulse">Loading Academic Standing & Evaluation Records...</ParchmentCard>;
  }

  if (isErrorRisk) {
    return <ParchmentCard className="p-8 text-center text-xs text-[#6b1d2f]">Error loading academic risk overview.</ParchmentCard>;
  }

  const getGradeBadgeClass = (grade: string) => {
    switch (grade) {
      case 'O':
        return 'bg-[#2a3c2a] text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(52,211,153,0.3)] font-black';
      case 'A+':
        return 'bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/50 font-bold';
      case 'A':
        return 'bg-[#0f0c0a] text-[#d4af37] border border-[#28211a] font-bold';
      case 'B+':
      case 'B':
        return 'bg-[#18130f] text-[#9a9082] border border-[#28211a] font-medium';
      default:
        return 'bg-[#0f0c0a] text-[#9a9082] border border-[#28211a]';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30 uppercase">
              MODULE 4 // EVALUATION & RISK UI
            </span>
          </div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">SCHOLASTIC EVALUATION & RISK PORTAL</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">Academic Health, Grade Predictions & Target Marks Ledger</p>
        </div>

        {/* SGPA & CGPA Highlights */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-4 py-2 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#f5ebe0] shadow-md">
            ESTIMATED SGPA: <strong className="text-[#c9a45c] font-bold text-sm ml-1">{riskOverview?.estimatedSGPA ?? '8.92'}</strong>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#f5ebe0] shadow-md">
            ESTIMATED CGPA: <strong className="text-[#c9a45c] font-bold text-sm ml-1">{riskOverview?.estimatedCGPA ?? '8.78'}</strong>
          </div>
        </div>
      </div>

      {/* Top Telemetry & Scholastic Standing Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scholastic Standing Badge (Standing starting from 'O') */}
        <ParchmentCard glow className="p-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#1b1612] flex items-center justify-center text-[#c9a45c] font-bold text-2xl shadow-xl border border-[#c9a45c]/50 mx-auto">
            O
          </div>
          <div className="text-center w-full">
            <span className="text-[10px] text-[#9a9082] block font-bold uppercase tracking-wider mb-1">PREDICTED STANDING DISTINCTION</span>
            <h2 className="text-2xl font-bold text-[#c9a45c] uppercase tracking-wide font-cinzel">{riskOverview?.overallRiskLevel ?? 'SAFE'} STATUS</h2>
            <p className="text-xs text-[#9a9082] mt-1 font-medium">Backend Academic Risk Score: <strong className="text-[#f5ebe0]">{riskOverview?.backendRiskScore ?? 18.5} / 100</strong></p>
          </div>
        </ParchmentCard>

        {/* Academic Risk Factor Evaluation Matrix */}
        <ParchmentCard className="lg:col-span-2 p-5 space-y-4">
          <h3 className="text-xs font-bold text-[#c9a45c] font-cinzel uppercase tracking-wider flex items-center gap-2 border-b border-[#28211a] pb-2">
            <ShieldAlert className="w-4 h-4 text-[#c9a45c]" />
            <span>BACKEND RISK FACTOR EVALUATION</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(riskOverview?.riskFactors || []).map((rf, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#c9a45c] text-xs">{rf.category}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#6b1d2f] text-[#f5ebe0] font-bold border border-[#c9a45c]/30">
                    Impact {rf.impactScore}
                  </span>
                </div>
                <p className="text-[#9a9082] text-xs leading-relaxed">{rf.description}</p>
              </div>
            ))}
          </div>
        </ParchmentCard>
      </div>

      {/* Subject Grade Cards Ledger (Predicted Grades starting from O) */}
      <ParchmentCard className="p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-[#28211a] pb-3">
          <h3 className="text-sm font-bold text-[#f5ebe0] font-cinzel flex items-center gap-2">
            <Award className="w-4 h-4 text-[#c9a45c]" />
            <span>SUBJECT GRADE CARDS & LETTER PREDICTIONS (O, A+, A, B+, B)</span>
          </h3>
          <span className="text-xs text-[#9a9082]">5 Course Modules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gradeCards.map((gc) => (
            <div
              key={gc.subjectCode}
              onClick={() => setSelectedSubject(gc.subjectCode)}
              className={`p-4 rounded-xl bg-[#0f0c0a] border transition-all cursor-pointer space-y-3 ${
                selectedSubject === gc.subjectCode ? 'border-[#c9a45c] shadow-[0_0_15px_rgba(201,164,92,0.2)]' : 'border-[#28211a] hover:border-[#c9a45c]/40'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded text-xs bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30 font-bold">
                  {gc.subjectCode}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getGradeBadgeClass(gc.predictedGrade)}`}>
                  GRADE {gc.predictedGrade}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#f5ebe0] truncate">{gc.subjectName}</h4>
                <p className="text-xs text-[#9a9082] mt-0.5">{gc.credits} Credits • Obtained: {gc.obtainedScore}%</p>
              </div>

              <div className="pt-2 border-t border-[#28211a] flex justify-between items-center text-xs">
                <span className="text-[#9a9082]">Target Marks (Next Exam):</span>
                <span className="text-[#c9a45c] font-bold">{gc.targetMarksNextExam} Required</span>
              </div>
            </div>
          ))}
        </div>
      </ParchmentCard>

      {/* Target Marks Goal Calculator / Simulator */}
      <ParchmentCard className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#f5ebe0] font-cinzel border-b border-[#28211a] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#c9a45c]" />
            <span>TARGET MARKS EXAM SIMULATOR</span>
          </div>
          <span className="text-xs text-[#c9a45c] font-bold">Grade Threshold Calculator</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-xs">
          <div>
            <label className="text-[#9a9082] font-medium block mb-1">Select Course Module</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#c9a45c] font-bold focus:outline-none"
            >
              {gradeCards.map(g => (
                <option key={g.subjectCode} value={g.subjectCode}>
                  {g.subjectCode} - {g.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[#9a9082] font-medium block mb-1">Simulated Exam Score (%): <strong className="text-[#c9a45c]">{simulatedExamScore}%</strong></label>
            <input
              type="range"
              min="50"
              max="100"
              value={simulatedExamScore}
              onChange={(e) => setSimulatedExamScore(parseInt(e.target.value))}
              className="w-full h-2 bg-[#1b1612] rounded-lg appearance-none cursor-pointer accent-[#c9a45c] border border-[#28211a]"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-[#0f0c0a] border border-[#c9a45c]/40 text-center space-y-1">
            <span className="text-[10px] text-[#9a9082] font-bold block uppercase">PREDICTED RESULTING GRADE</span>
            <span className="text-xl font-black text-[#c9a45c] font-cinzel block">
              {sgpaData?.scenario?.subjectGrades?.[selectedSubject]?.grade 
                ? `GRADE ${sgpaData.scenario.subjectGrades[selectedSubject].grade}`
                : (simulatedExamScore >= 90 ? 'GRADE O' : simulatedExamScore >= 80 ? 'GRADE A+' : simulatedExamScore >= 70 ? 'GRADE A' : 'GRADE B+')}
            </span>
          </div>
        </div>

        {/* Target Marks Required Matrix for Grade O */}
        <div className="pt-3 border-t border-[#28211a] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#1b1612] border border-[#c9a45c]/40 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-[#9a9082] font-bold block">TARGET GRADE O</span>
              <span className="text-xs font-bold text-emerald-400">≥ 90% Score</span>
            </div>
            <span className="px-2 py-1 rounded bg-[#0f0c0a] text-[#c9a45c] font-bold border border-[#28211a]">Required: 90+</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-[#9a9082] font-bold block">TARGET GRADE A+</span>
              <span className="text-xs font-bold text-[#c9a45c]">80% – 89% Score</span>
            </div>
            <span className="px-2 py-1 rounded bg-[#1b1612] text-[#f5ebe0] font-bold border border-[#28211a]">Required: 80+</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-[#9a9082] font-bold block">TARGET GRADE A</span>
              <span className="text-xs font-bold text-[#d4af37]">70% – 79% Score</span>
            </div>
            <span className="px-2 py-1 rounded bg-[#1b1612] text-[#9a9082] font-bold border border-[#28211a]">Required: 70+</span>
          </div>
        </div>
      </ParchmentCard>
    </div>
  );
};

