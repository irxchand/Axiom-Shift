import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, FileText, CheckCircle, AlertTriangle, RefreshCw, Database, Layers, HelpCircle, Search, Filter, Cpu, ArrowRight } from 'lucide-react';
import { backendAPI } from '../../services/backendAPI';
import { useMasterAgentStore } from '../../store/useMasterAgentStore';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';
import type { SourceDocumentDTO } from '../../types/dto';

export const SpatialSourceHandoffPortal: React.FC = () => {
  const storeDocuments = useMasterAgentStore((s) => s.documents) || [];
  const missingQueries = useMasterAgentStore((s) => s.missingQueries) || [];
  const agentLogs = useMasterAgentStore((s) => s.agentLogs) || [];
  const orchestrateFile = useMasterAgentStore((s) => s.orchestrateFile);
  const resolveMissingInfo = useMasterAgentStore((s) => s.resolveMissingInfo);

  const { data: apiDocuments = [], isLoading, isError, refetch } = useQuery<SourceDocumentDTO[]>({
    queryKey: ['sourceDocuments'],
    queryFn: backendAPI.getSourceDocuments
  });

  // Combine store documents and API documents without duplicates safely
  const safeStoreDocs = Array.isArray(storeDocuments) ? storeDocuments : [];
  const safeApiDocs = Array.isArray(apiDocuments) ? apiDocuments : [];

  const allDocuments = [
    ...safeStoreDocs,
    ...safeApiDocs.filter(d => d && !safeStoreDocs.some(sd => sd.id === d.id))
  ];

  const [isDragging, setIsDragging] = useState(false);
  const [targetDestination, setTargetDestination] = useState<string>('Course Library');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'INGESTED' | 'EMBEDDING' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [uploadToast, setUploadToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (isLoading) {
    return <ParchmentCard className="p-8 text-center text-xs text-gold-foil animate-pulse">Loading Source Document Telemetry & Ingestion Ledger...</ParchmentCard>;
  }

  if (isError) {
    return <ParchmentCard className="p-8 text-center text-[#6b1d2f]">Error loading source documents.</ParchmentCard>;
  }

  const handleSimulatedDrop = (e: React.DragEvent | React.ChangeEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const randomId = Math.floor(Math.random() * 1000);
    const simulatedFile = {
      name: `CS602_Lecture_Deck_${randomId}.pptx`
    };

    orchestrateFile(simulatedFile);
    setUploadToast(`Ingesting ${simulatedFile.name} into ${targetDestination}...`);
    setTimeout(() => setUploadToast(null), 4000);
  };

  const handleCustomFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      orchestrateFile(file);
      setUploadToast(`Ingesting ${file.name} into ${targetDestination}...`);
      setTimeout(() => setUploadToast(null), 4000);
    }
  };

  const filteredDocs = allDocuments.filter(doc => {
    const matchesStatus = filterStatus === 'ALL' || doc.status === filterStatus;
    const dest = doc.targetDestination || 'Course Library';
    const matchesQuery = doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) || dest.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const totalVectors = allDocuments.reduce((acc, curr) => acc + (curr.vectorsGenerated || 0), 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setUploadToast('Refreshed document ingestion ledger & AI vector telemetry.');
    setTimeout(() => {
      setIsRefreshing(false);
      setTimeout(() => setUploadToast(null), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30 uppercase">
              MODULE 6 // SOURCE HANDOFF & INGESTION UI
            </span>
          </div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">MANUSCRIPT & DOCUMENT INGESTION PORTAL</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">Course File Handoff, Document Processing & Route Parsing</p>
        </div>

        {/* Telemetry Summary Stats */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-[#f5ebe0]">
            INGESTED MANUSCRIPTS: <strong className="text-[#c9a45c] font-bold">{apiDocuments.length}</strong>
          </div>
        </div>
      </div>

      {uploadToast && (
        <div className="p-3.5 rounded-xl bg-[#2a3c2a] border border-emerald-500/40 text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{uploadToast}</span>
        </div>
      )}

      {/* Interactive Manuscript Drag and Drop Dropzone */}
      <ParchmentCard glow className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#28211a] pb-3">
          <div>
            <h3 className="text-xs font-bold text-[#c9a45c] font-cinzel uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#c9a45c]" />
              <span>DEPOSIT COURSE MANUSCRIPT OR LECTURE SLIDES</span>
            </h3>
            <p className="text-[11px] text-[#9a9082] mt-0.5">Supports PDF, PPTX, DOCX, and TXT files for Document Ingestion.</p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#9a9082] font-bold text-[10px] uppercase">TARGET DESTINATION:</span>
            <select
              value={targetDestination}
              onChange={(e) => setTargetDestination(e.target.value)}
              className="p-1.5 px-2.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-xs text-[#c9a45c] font-bold focus:outline-none"
            >
              <option value="Course Library">Course Library</option>
              <option value="Study Journal">Study Journal</option>
              <option value="Academic Calendar">Academic Calendar</option>
            </select>
          </div>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleSimulatedDrop}
          className={`p-8 rounded-xl border-2 border-dashed transition-all duration-300 text-center flex flex-col items-center justify-center space-y-3 cursor-pointer ${
            isDragging
              ? 'border-[#c9a45c] bg-[#1b1612] shadow-xl scale-102'
              : 'border-[#28211a] bg-[#0f0c0a] hover:border-[#c9a45c]/40'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#1b1612] flex items-center justify-center border border-[#c9a45c]/40 text-[#c9a45c] shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#f5ebe0]">DRAG & DROP MANUSCRIPT FILES HERE</h4>
            <p className="text-xs text-[#9a9082] mt-0.5">PDF, PPTX, DOCX // Files are parsed and linked to course modules</p>
          </div>

          <label className="px-5 py-2.5 rounded-xl bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] font-semibold text-xs border border-[#c9a45c]/40 cursor-pointer shadow-md flex items-center gap-2 transition-all">
            <Upload className="w-4 h-4 text-[#c9a45c]" />
            <span>Select File to Ingest</span>
            <input type="file" className="hidden" onChange={handleCustomFileSelected} />
          </label>
        </div>
      </ParchmentCard>

      {/* Manual Fallback Links */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 text-xs">
        <span className="text-[#9a9082]">Agent offline or external workspace inaccessible?</span>
        <a 
          href="https://notebooklm.google.com/" 
          target="_blank" 
          rel="noreferrer"
          className="px-4 py-1.5 rounded-xl bg-[#1b1612] hover:bg-[#28211a] text-[#c9a45c] hover:text-[#f5ebe0] border border-[#28211a] transition-all flex items-center gap-2"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Open Google NotebookLM Manually</span>
        </a>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {(['ALL', 'INGESTED', 'EMBEDDING', 'FAILED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/40 shadow-sm'
                  : 'bg-[#14100c] text-[#9a9082] border border-[#28211a] hover:text-[#f5ebe0]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#c9a45c] absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-xs text-[#f5ebe0] placeholder-[#9a9082] focus:outline-none"
          />
        </div>
      </div>

      {/* Source Document Ingestion Telemetry Ledger */}
      <ParchmentCard className="p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-[#28211a] pb-3">
          <h3 className="text-sm font-bold text-[#f5ebe0] font-cinzel flex items-center gap-2">
            <Database className="w-4 h-4 text-[#c9a45c]" />
            <span>INGESTED MANUSCRIPTS LEDGER</span>
          </h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-[#1b1612] hover:bg-[#28211a] text-[#c9a45c] hover:text-[#f5ebe0] border border-[#28211a] text-xs font-bold transition-all flex items-center gap-2"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#9a9082] italic">
              No source documents found matching the filter criteria.
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30 uppercase font-mono">
                      {doc.filetype}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-[#f5ebe0]">{doc.filename}</h4>
                      <p className="text-xs text-[#9a9082] mt-0.5">{doc.filesize} • Uploaded {doc.uploadedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30 font-bold">
                      → {doc.targetDestination || 'Course Library'}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      doc.status === 'INGESTED' ? 'bg-[#2a3c2a] text-emerald-300 border border-emerald-500/40' :
                      doc.status === 'EMBEDDING' || doc.status === 'EXTRACTING' ? 'bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30 animate-pulse' :
                      'bg-[#6b1d2f] text-[#f5ebe0]'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#28211a]/60 flex justify-between items-center text-xs text-[#9a9082]">
                  <span className="flex items-center gap-1.5 font-medium text-[#c9a45c]">
                    <Cpu className="w-3.5 h-3.5" />
                    <strong>Parsed & Linked to {doc.targetDestination || 'Course Library'}</strong>
                  </span>
                  <span className="text-[10px] text-[#9a9082]">100% Ingested</span>
                </div>
              </div>
            ))
          )}
        </div>
      </ParchmentCard>

      {/* MASTER AGENT ORCHESTRATOR & MISSING INFO CLARIFIER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Missing Information Clarification Agent */}
        <ParchmentCard glow className="lg:col-span-2 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#28211a] pb-3">
            <div>
              <h3 className="text-xs font-bold text-[#c9a45c] font-cinzel uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#c9a45c]" />
                <span>MASTER AGENT: MISSING INFORMATION CLARIFIER</span>
              </h3>
              <p className="text-[11px] text-[#9a9082] mt-0.5">Detects incomplete dates or parameters in uploaded manuscripts</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#6b1d2f] text-[#f5ebe0] font-bold">
              {missingQueries.filter(q => !q.resolved).length} ACTION PENDING
            </span>
          </div>

          <div className="space-y-3">
            {missingQueries.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#9a9082]">
                All ingested documents have complete parameters. Master Agent routing synchronized.
              </div>
            ) : (
              missingQueries.map((query) => (
                <div key={query.id} className="p-4 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#f5ebe0]">{query.filename}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${query.resolved ? 'bg-[#2a3c2a] text-emerald-300 border border-emerald-500/30' : 'bg-[#6b1d2f] text-[#f5ebe0]'}`}>
                      {query.resolved ? 'RESOLVED' : 'CLARIFICATION NEEDED'}
                    </span>
                  </div>

                  <p className="text-xs text-[#d8cebe] leading-relaxed">{query.question}</p>

                  {!query.resolved ? (
                    <div className="space-y-2 pt-2 border-t border-[#28211a]">
                      <span className="text-[10px] text-[#9a9082] uppercase font-bold block">Quick Action Reply:</span>
                      <div className="flex flex-wrap gap-2">
                        {query.options?.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => resolveMissingInfo(query.id, opt)}
                            className="px-3 py-1 rounded-lg bg-[#1b1612] hover:bg-[#6b1d2f] text-[#f5ebe0] text-xs font-bold border border-[#28211a] hover:border-[#c9a45c]/40 transition-colors"
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
                          placeholder="Or type custom parameter answer..."
                          className="flex-1 p-2 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-xs text-[#f5ebe0] focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            if (customAnswers[query.id]) {
                              resolveMissingInfo(query.id, customAnswers[query.id]);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-[#6b1d2f] text-[#f5ebe0] text-xs font-bold border border-[#c9a45c]/40 hover:bg-[#801c2e]"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-[#28211a] text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Resolved: {query.userAnswer} — Updated Academic Calendar & Master State.</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ParchmentCard>

        {/* Right Column: Master Agent Activity Log & File Routing Queue */}
        <ParchmentCard className="p-5 space-y-4">
          <h3 className="text-xs font-bold text-[#c9a45c] font-cinzel uppercase tracking-wider flex items-center gap-2 border-b border-[#28211a] pb-2">
            <Layers className="w-4 h-4 text-[#c9a45c]" />
            <span>MASTER AGENT ROUTING LOG</span>
          </h3>

          <div className="space-y-2 text-xs max-h-56 overflow-y-auto pr-1">
            {agentLogs.map((log, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#0f0c0a] border border-[#28211a] text-[#9a9082] text-[11px]">
                {log}
              </div>
            ))}
          </div>
        </ParchmentCard>
      </div>
    </div>
  );
};

