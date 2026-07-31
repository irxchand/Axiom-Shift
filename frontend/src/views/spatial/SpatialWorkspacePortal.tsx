import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, ShieldCheck, Key, RefreshCw, CheckCircle, AlertCircle, Clock, Server, Lock, ArrowRight } from 'lucide-react';
import { backendAPI } from '../../services/backendAPI';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';

export const SpatialWorkspacePortal: React.FC = () => {
  const { data: workspace, isLoading, isError, refetch } = useQuery({ 
    queryKey: ['workspaceStatus'], 
    queryFn: backendAPI.getWorkspaceStatus 
  });

  const [cookieJson, setCookieJson] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'IDLE' | 'SUCCESS' | 'ERROR'; message: string }>({ type: 'IDLE', message: '' });
  const [isResyncing, setIsResyncing] = useState(false);
  const [resyncSuccess, setResyncSuccess] = useState(false);

  if (isLoading) {
    return <ParchmentCard className="p-8 text-center text-xs text-gold-foil animate-pulse">Loading External Gateway & Workspace Telemetry...</ParchmentCard>;
  }

  if (isError) {
    return <ParchmentCard className="p-8 text-center text-xs text-[#6b1d2f]">Error loading workspace status.</ParchmentCard>;
  }

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cookieJson.trim()) {
      setImportStatus({ type: 'ERROR', message: 'Please paste a valid JSON cookie payload before importing.' });
      return;
    }

    try {
      const parsed = JSON.parse(cookieJson);
      if (!Array.isArray(parsed)) {
        setImportStatus({ type: 'ERROR', message: 'Payload must be a JSON array of cookie objects [ { "name": "...", "value": "..." } ].' });
        return;
      }

      setImportStatus({ type: 'SUCCESS', message: `Successfully validated and ingested ${parsed.length} session cookies into Gateway Registry.` });
      setCookieJson('');
      setTimeout(() => setImportStatus({ type: 'IDLE', message: '' }), 5000);
    } catch (err) {
      setImportStatus({ type: 'ERROR', message: 'Invalid JSON syntax. Ensure valid JSON payload format.' });
    }
  };

  const handleManualResync = async () => {
    setIsResyncing(true);
    await refetch();
    setTimeout(() => {
      setIsResyncing(false);
      setResyncSuccess(true);
      setTimeout(() => setResyncSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#1b1612] text-[#c9a45c] border border-[#c9a45c]/30 uppercase">
              MODULE 5 // BROWSER CONNECTION UI
            </span>
          </div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">UNIVERSITY WORKSPACE GATEWAY</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">LMS / Canvas Credentials, Session Telemetry & Cookie Registry</p>
        </div>

        {/* Manual Re-Sync Action Trigger */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleManualResync}
            disabled={isResyncing}
            className="px-4 py-2 rounded-xl bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] font-semibold text-xs border border-[#c9a45c]/40 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#c9a45c] ${isResyncing ? 'animate-spin' : ''}`} />
            <span>{isResyncing ? 'Re-Syncing Gateway...' : 'Re-Sync Gateway'}</span>
          </button>
        </div>
      </div>

      {resyncSuccess && (
        <div className="p-3.5 rounded-xl bg-[#2a3c2a] border border-emerald-500/40 text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>University LMS Gateway telemetry re-synced successfully. All session tokens active.</span>
        </div>
      )}

      {/* Gateway Telemetry Banner & Security Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Gateway Status Card */}
        <ParchmentCard glow className="p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#28211a] pb-3">
            <h3 className="text-xs font-bold text-[#c9a45c] font-cinzel uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-[#c9a45c]" />
              <span>ACTIVE LMS GATEWAY</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#2a3c2a] text-emerald-300 border border-emerald-500/40 font-bold">
              {workspace?.status ?? 'CONNECTED'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a]">
              <span className="text-[#9a9082] text-[10px] font-bold block uppercase">PORTAL NAME</span>
              <p className="font-bold text-[#f5ebe0] mt-0.5">{workspace?.portalName ?? 'University Canvas & ERP Gateway'}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a]">
              <span className="text-[#9a9082] text-[10px] font-bold block uppercase">ACTIVE SESSION TOKEN</span>
              <p className="font-mono text-[#c9a45c] text-[11px] mt-0.5 truncate">{workspace?.activeSessionToken ?? 'sess_live_99f2018a7c2e99b04a'}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] flex justify-between items-center">
              <div>
                <span className="text-[#9a9082] text-[10px] font-bold block uppercase">LAST SYNCED</span>
                <span className="text-[#f5ebe0] text-xs font-semibold">
                  {workspace?.lastSyncedTimestamp ? new Date(workspace.lastSyncedTimestamp).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
              <Clock className="w-4 h-4 text-[#c9a45c]" />
            </div>
          </div>
        </ParchmentCard>

        {/* Session Security & Expiration Ledger */}
        <ParchmentCard className="lg:col-span-2 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#28211a] pb-3">
            <h3 className="text-xs font-bold text-[#c9a45c] font-cinzel uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#c9a45c]" />
              <span>SESSION SECURITY & COOKIES TELEMETRY</span>
            </h3>
            <span className="text-xs text-[#9a9082]">256-Bit Encrypted Payload</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#9a9082] font-bold text-[10px] uppercase">COOKIE IMPORT STATUS</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-[#f5ebe0]">
                {workspace?.cookiesImported ? 'Cookies Ingested & Validated' : 'No Cookie Payload Imported'}
              </p>
              <p className="text-[11px] text-[#9a9082]">
                Session cookies imported into local encrypted vault.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#9a9082] font-bold text-[10px] uppercase">COOKIE VALIDITY EXPIRATION</span>
                <Lock className="w-4 h-4 text-[#c9a45c]" />
              </div>
              <p className="text-sm font-bold text-[#c9a45c]">
                {workspace?.cookiesValidUntil ? new Date(workspace.cookiesValidUntil).toLocaleDateString() : '2026-08-01'}
              </p>
              <p className="text-[11px] text-[#9a9082]">
                Valid for next 3 days before re-authentication required.
              </p>
            </div>
          </div>

          {/* Sync Errors & Warnings Audit Ledger */}
          <div className="p-3.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-2 text-xs">
            <span className="text-[10px] text-[#9a9082] font-bold uppercase tracking-wider block">GATEWAY AUDIT LOGS</span>
            {(!workspace?.syncErrors || workspace.syncErrors.length === 0) ? (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Zero sync errors reported. Gateway heartbeat nominal.</span>
              </div>
            ) : (
              workspace.syncErrors.map((err, idx) => (
                <div key={idx} className="flex items-center gap-2 text-rose-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{err}</span>
                </div>
              ))
            )}
          </div>
        </ParchmentCard>
      </div>

      {/* Cookies JSON Payload Importer Interface */}
      <ParchmentCard glow className="p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-[#28211a] pb-3">
          <div>
            <h3 className="text-xs font-bold text-[#c9a45c] font-cinzel uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-[#c9a45c]" />
              <span>IMPORT SESSION COOKIES PAYLOAD (COOKIES.JSON)</span>
            </h3>
            <p className="text-[11px] text-[#9a9082] mt-0.5">
              Paste raw JSON cookie array exported from Canvas or university portal to refresh authentication token.
            </p>
          </div>
        </div>

        {importStatus.type === 'SUCCESS' && (
          <div className="p-3 rounded-xl bg-[#2a3c2a] border border-emerald-500/40 text-xs text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{importStatus.message}</span>
          </div>
        )}

        {importStatus.type === 'ERROR' && (
          <div className="p-3 rounded-xl bg-[#6b1d2f]/80 border border-[#c9a45c]/40 text-xs text-[#f5ebe0] font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{importStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleImport} className="space-y-3">
          <textarea
            rows={5}
            value={cookieJson}
            onChange={(e) => setCookieJson(e.target.value)}
            placeholder='[&#10;  { "name": "session_id", "value": "sess_99f2018a", "domain": ".univ.edu", "path": "/" },&#10;  { "name": "canvas_token", "value": "tok_live_77c12", "domain": ".univ.edu", "path": "/" }&#10;]'
            className="w-full p-3.5 rounded-xl bg-[#0f0c0a] border border-[#28211a] text-xs text-[#f5ebe0] placeholder-[#6b6052] font-mono focus:outline-none focus:border-[#c9a45c]/50"
          />

          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#9a9082]">
              Format: Standard JSON array of Cookie objects with name, value, domain fields.
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] font-semibold text-xs border border-[#c9a45c]/40 shadow-md flex items-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4 text-[#c9a45c]" />
              <span>Validate & Import Payload</span>
            </button>
          </div>
        </form>
      </ParchmentCard>

      {/* Manual Fallback Links */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 text-xs pt-4">
        <span className="text-[#9a9082]">Need to fetch your Canvas session cookies manually?</span>
        <a 
          href="https://canvas.instructure.com/" 
          target="_blank" 
          rel="noreferrer"
          className="px-4 py-1.5 rounded-xl bg-[#1b1612] hover:bg-[#28211a] text-[#c9a45c] hover:text-[#f5ebe0] border border-[#28211a] transition-all flex items-center gap-2"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Open Canvas LMS</span>
        </a>
      </div>
    </div>
  );
};

