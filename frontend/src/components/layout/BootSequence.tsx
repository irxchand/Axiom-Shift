import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, CheckCircle2, Terminal } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const BootSequence: React.FC = () => {
  const { hasBooted, setHasBooted } = useUIStore();
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const bootMessages = [
    'INIT HARDWARE ABSTRACTION LAYER...',
    'ESTABLISHING SECURE BACKEND DTO STREAM...',
    'LOADING THREE.JS HOLOGRAPHIC 3D RENDER ENGINE...',
    'INGESTING SYLLABUS VECTOR GRAPH INDEX...',
    'CALCULATING BEHAVIORAL RISK TELEMETRY (BACKEND DTO)...',
    'JARVIS AI ASSISTANT ONLINE. ALL SYSTEMS OPTIMAL.'
  ];

  useEffect(() => {
    if (hasBooted) return;

    setProgress(0);
    setLogs([]);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setHasBooted(true), 600);
          return 100;
        }

        const next = prev + Math.floor(Math.random() * 15) + 5;
        const msgIdx = Math.min(Math.floor((next / 100) * bootMessages.length), bootMessages.length - 1);
        
        setLogs((current) => {
          if (!current.includes(bootMessages[msgIdx])) {
            return [...current, bootMessages[msgIdx]];
          }
          return current;
        });

        return Math.min(next, 100);
      });
    }, 150);

    return () => clearInterval(interval);
  }, [hasBooted, setHasBooted]);

  if (hasBooted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-6 select-none">
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-40" />

      <div className="w-full max-w-lg glass-panel-glow p-8 rounded-2xl border border-cyan-500/50 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Header HUD */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white font-mono-tech tracking-wider">JARVIS OS v4.2</h1>
              <p className="text-xs text-cyan-400 font-mono-tech">SEMESTER OPERATIONS COMMAND CENTER</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-mono-tech rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
            BOOT SEQUENCE
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono-tech">
            <span className="text-slate-400 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> SYSTEM DIAGNOSTICS
            </span>
            <span className="text-cyan-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-200 shadow-[0_0_12px_#06b6d4]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Log Telemetry Feed */}
        <div className="h-36 bg-slate-950/90 rounded-lg border border-slate-800 p-3 font-mono-tech text-[11px] overflow-y-auto space-y-1.5 shadow-inner">
          {logs.map((log, index) => (
            <div key={index} className="flex items-center space-x-2 text-cyan-300 animate-fadeIn">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{log}</span>
            </div>
          ))}
          {progress < 100 && (
            <div className="flex items-center space-x-2 text-cyan-400/60 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>COMPUTING TELEMETRY MATRIX...</span>
            </div>
          )}
        </div>

        {/* Action button if auto-boot finished */}
        {progress >= 100 && (
          <button
            onClick={() => setHasBooted(true)}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono-tech text-xs tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ENTER COMMAND CENTER // INITIALIZE HUD</span>
          </button>
        )}
      </div>
    </div>
  );
};
