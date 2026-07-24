import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UploadCloud, FileText, CheckCircle2, RefreshCw, AlertCircle, Cpu, Database, Layers } from 'lucide-react';
import { mockBackendAPI } from '../services/api';
import type { SourceDocumentDTO } from '../types/dto';

export const SourceHandoffView: React.FC = () => {
  const { data: initialDocs = [] } = useQuery({ queryKey: ['sourceDocuments'], queryFn: mockBackendAPI.getSourceDocuments });
  const [docs, setDocs] = useState<SourceDocumentDTO[]>(initialDocs);
  const [isDragging, setIsDragging] = useState(false);

  const handleSimulatedDrop = (e: React.DragEvent | React.ChangeEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const newDoc: SourceDocumentDTO = {
      id: `doc-${Date.now()}`,
      filename: 'CS601_Lecture_14_Transformers.pdf',
      filesize: '5.8 MB',
      filetype: 'PDF',
      uploadProgress: 100,
      status: 'EMBEDDING',
      uploadedAt: 'Just now',
      vectorsGenerated: 210
    };

    setDocs(prev => [newDoc, ...prev]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              MODULE 6
            </span>
            <h1 className="text-xl font-extrabold text-white font-mono-tech tracking-tight">SOURCE HANDOFF SYSTEM</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono-tech">
            Document Ingestion Station // Syllabus Vector Embedding Pipeline
          </p>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleSimulatedDrop}
        className={`p-10 rounded-2xl border-2 border-dashed transition-all duration-300 text-center flex flex-col items-center justify-center space-y-3 cursor-pointer ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
            : 'border-cyan-500/30 bg-slate-900/60 hover:border-cyan-400/60 hover:bg-slate-900/80'
        }`}
      >
        <div className="p-4 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
          <UploadCloud className="w-8 h-8 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white font-mono-tech">DRAG & DROP SYLLABUS OR LECTURE NOTES</h3>
          <p className="text-xs text-slate-400 font-mono-tech mt-1">Supports PDF, DOCX, PPTX // Automatic Vectorization & Ingestion</p>
        </div>
        <label className="px-4 py-2 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-mono-tech font-bold hover:bg-cyan-900 transition-colors">
          Browse Files
          <input type="file" className="hidden" onChange={handleSimulatedDrop} />
        </label>
      </div>

      {/* Document Queue & Vector Ingestion List */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white font-mono-tech flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>INGESTION PIPELINE QUEUE</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono-tech">
            TOTAL VECTORS INGESTED: <strong className="text-cyan-300">1,450</strong>
          </span>
        </div>

        <div className="space-y-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono-tech"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <p className="text-slate-200 font-bold">{doc.filename}</p>
                  <p className="text-[10px] text-slate-500">{doc.filesize} • Uploaded {doc.uploadedAt}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">VECTORS GENERATED</span>
                  <span className="text-cyan-400 font-bold">{doc.vectorsGenerated}</span>
                </div>

                <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  doc.status === 'INGESTED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                  doc.status === 'EMBEDDING' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40 animate-pulse' :
                  'bg-amber-950 text-amber-400 border border-amber-500/30'
                }`}>
                  {doc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
