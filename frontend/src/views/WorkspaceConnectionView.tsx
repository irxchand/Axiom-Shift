import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, RefreshCw, Key, ShieldCheck, CheckCircle2, AlertCircle, FileCode, Upload } from 'lucide-react';
import { mockBackendAPI } from '../services/api';

export const WorkspaceConnectionView: React.FC = () => {
  const { data: workspace } = useQuery({ queryKey: ['workspaceStatus'], queryFn: mockBackendAPI.getWorkspaceStatus });
  const [cookieJson, setCookieJson] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (cookieJson.trim()) {
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              MODULE 5
            </span>
            <h1 className="text-xl font-extrabold text-white font-mono-tech tracking-tight">WORKSPACE CONNECTION UI</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono-tech">
            LMS Portal Gateway // Cookies.json Import & Backend Telemetry Sync
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono-tech">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> GATEWAY {workspace?.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portal Status Card */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono-tech flex items-center gap-2">
              <Link className="w-4 h-4 text-cyan-400" />
              <span>ACTIVE PORTAL INTEGRATION</span>
            </h3>
          </div>

          <div className="space-y-3 font-mono-tech text-xs">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px]">PORTAL NAME</span>
              <p className="text-sm font-bold text-cyan-300">{workspace?.portalName}</p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px]">LAST BACKEND SYNC</span>
              <p className="text-xs text-slate-200">{workspace?.lastSyncedTimestamp}</p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px]">SESSION TOKEN STATUS</span>
              <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE ({workspace?.activeSessionToken})
              </p>
            </div>
          </div>
        </div>

        {/* Cookies.json Importer */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white font-mono-tech flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>IMPORT SESSION COOKIES.JSON</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono-tech">RAW JSON DTO PAYLOAD</span>
          </div>

          {importSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono-tech text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>COOKIES.JSON PAYLOAD TRANSMITTED TO BACKEND GATEWAY SUCCESSFULLY.</span>
            </div>
          )}

          <form onSubmit={handleImport} className="space-y-3">
            <textarea
              rows={6}
              value={cookieJson}
              onChange={(e) => setCookieJson(e.target.value)}
              placeholder='[ { "name": "canvas_session", "value": "...", "domain": ".university.edu" } ]'
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono-tech text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />

            <div className="flex justify-between items-center pt-2">
              <p className="text-[11px] text-slate-500 font-mono-tech">
                * Note: Frontend only forwards payload DTO to server. No client browser automation performed.
              </p>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono-tech text-xs transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>INJECT COOKIES TO BACKEND</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
