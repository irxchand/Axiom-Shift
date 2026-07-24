import React, { useState } from 'react';
import { useMasterAgentStore } from '../../store/useMasterAgentStore';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';

export const SpatialSourceHandoffPortal: React.FC = () => {
  const { documents, missingQueries, agentLogs, orchestrateFile, resolveMissingInfo } = useMasterAgentStore();
  const [isDragging, setIsDragging] = useState(false);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  const handleSimulatedDrop = (e: React.DragEvent | React.ChangeEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const simulatedFile = {
      name: `CS605_Exam_Schedule_${Math.floor(Math.random() * 100)}.pdf`
    };

    orchestrateFile(simulatedFile);
  };

  const handleCustomFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      orchestrateFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">MANUSCRIPT INGESTION</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">MASTER AGENT ORCHESTRATION & FILE ROUTING</p>
        </div>
      </div>

      {/* File Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleSimulatedDrop}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all duration-300 text-center flex flex-col items-center justify-center space-y-3 cursor-pointer ${
          isDragging
            ? 'border-[#c9a45c] bg-[#1b1612] shadow-xl scale-102'
            : 'border-[#28211a] modern-card hover:border-[#c9a45c]/40'
        }`}
      >
        <div>
          <h3 className="text-sm font-bold text-[#f5ebe0]">DEPOSIT MANUSCRIPT OR LECTURE FILES</h3>
          <p className="text-xs text-[#9a9082] mt-0.5">PDF, DOCX, PPTX // Master Agent File Routing & Analysis</p>
        </div>
        <label className="px-4 py-2 rounded-xl bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] font-semibold text-xs border border-[#c9a45c]/40 cursor-pointer shadow-md">
          Select Files for Master Agent
          <input type="file" className="hidden" onChange={handleCustomFileSelected} />
        </label>
      </div>

      {/* MASTER AGENT ORCHESTRATOR CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Missing Information Clarification Agent */}
        <ParchmentCard glow className="lg:col-span-2 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#28211a] pb-3">
            <div>
              <h3 className="text-xs font-semibold text-[#c9a45c] uppercase tracking-wider">
                MASTER AGENT: MISSING INFORMATION CLARIFIER
              </h3>
              <p className="text-[11px] text-[#9a9082] mt-0.5">Agent detects incomplete information & requests clarification</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#6b1d2f] text-[#f5ebe0] font-semibold">
              {missingQueries.filter(q => !q.resolved).length} ACTION PENDING
            </span>
          </div>

          <div className="space-y-3">
            {missingQueries.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#9a9082]">
                All ingested documents have complete information. Master Agent routing synchronized.
              </div>
            ) : (
              missingQueries.map((query) => (
                <div key={query.id} className="p-4 rounded-xl inset-section space-y-3 border border-[#28211a]">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#f5ebe0]">{query.filename}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${query.resolved ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-[#6b1d2f] text-[#f5ebe0]'}`}>
                      {query.resolved ? 'RESOLVED' : 'CLARIFICATION NEEDED'}
                    </span>
                  </div>

                  <p className="text-xs text-[#d8cebe] leading-relaxed">{query.question}</p>

                  {!query.resolved ? (
                    <div className="space-y-2 pt-2 border-t border-[#28211a]">
                      <span className="text-[10px] text-[#9a9082] uppercase font-semibold">Quick Reply Options:</span>
                      <div className="flex flex-wrap gap-2">
                        {query.options?.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => resolveMissingInfo(query.id, opt)}
                            className="px-3 py-1 rounded-lg bg-[#1b1612] hover:bg-[#6b1d2f] text-[#f5ebe0] text-xs font-semibold border border-[#28211a] hover:border-[#c9a45c]/40 transition-colors"
                          >
                            Set {opt}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="text"
                          value={customAnswers[query.id] || ''}
                          onChange={(e) => setCustomAnswers({ ...customAnswers, [query.id]: e.target.value })}
                          placeholder="Or type custom date/answer..."
                          className="flex-1 p-1.5 rounded-lg bg-[#0f0c0a] border border-[#28211a] text-xs text-[#f5ebe0] focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            if (customAnswers[query.id]) {
                              resolveMissingInfo(query.id, customAnswers[query.id]);
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-[#6b1d2f] text-[#f5ebe0] text-xs font-semibold border border-[#c9a45c]/40"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-[#28211a] text-xs text-emerald-400 font-semibold">
                      Resolved: {query.userAnswer} — Automatically updated Academic Calendar & Master State.
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ParchmentCard>

        {/* Right Column: Master Agent Activity Log & File Routing Queue */}
        <ParchmentCard className="p-5 space-y-4">
          <h3 className="text-xs font-semibold text-[#c9a45c] uppercase tracking-wider">
            MASTER AGENT ROUTING LOG
          </h3>
          <div className="space-y-2 text-xs max-h-56 overflow-y-auto">
            {agentLogs.map((log, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#0f0c0a] border border-[#28211a] text-[#9a9082]">
                {log}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#28211a] space-y-2">
            <h4 className="text-xs font-semibold text-[#f5ebe0] uppercase tracking-wider">
              WHAT FILE GOES WHERE
            </h4>
            <div className="space-y-2 text-xs">
              {documents.map((doc) => (
                <div key={doc.id} className="p-2.5 rounded-lg inset-section flex justify-between items-center border border-[#28211a]">
                  <span className="truncate max-w-[140px] text-[#f5ebe0] font-medium">{doc.filename}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#6b1d2f] text-[#f5ebe0] font-semibold">
                    {doc.targetDestination || 'Course Library'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ParchmentCard>
      </div>
    </div>
  );
};
