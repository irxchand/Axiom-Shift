import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { mockBackendAPI } from '../../services/api';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';

export const SpatialWorkspacePortal: React.FC = () => {
  const { data: workspace } = useQuery({ queryKey: ['workspaceStatus'], queryFn: mockBackendAPI.getWorkspaceStatus });
  const [cookieJson, setCookieJson] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (cookieJson.trim()) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl modern-card border border-[#28211a] shadow-xl">
        <div>
          <h1 className="text-xl font-cinzel font-bold text-gold-foil tracking-wider">ARCHIVE PARAMETERS</h1>
          <p className="text-xs text-[#9a9082] uppercase tracking-wider font-medium mt-0.5">University LMS Credentials & System Registry</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ParchmentCard className="p-5 space-y-3">
          <h3 className="text-xs font-semibold text-[#c9a45c] uppercase tracking-wider">
            ACTIVE LMS GATEWAY
          </h3>
          <div className="p-3 inset-section border border-[#28211a] space-y-1 text-xs">
            <span className="text-[#9a9082] text-[10px]">PORTAL NAME</span>
            <p className="font-semibold text-[#f5ebe0]">{workspace?.portalName}</p>
          </div>
          <div className="p-3 inset-section border border-[#28211a] space-y-1 text-xs">
            <span className="text-[#9a9082] text-[10px]">AUTHENTICATION</span>
            <p className="font-semibold text-emerald-400 font-sans">
              {workspace?.status}
            </p>
          </div>
        </ParchmentCard>

        <ParchmentCard glow className="lg:col-span-2 p-5 space-y-3">
          <h3 className="text-xs font-semibold text-[#c9a45c] uppercase tracking-wider">
            IMPORT SESSION COOKIES
          </h3>

          {success && (
            <div className="p-3 rounded-xl bg-[#2a3c2a] border border-emerald-500/40 text-xs text-[#f5ebe0] font-semibold">
              Cookie payload imported successfully.
            </div>
          )}

          <form onSubmit={handleImport} className="space-y-3">
            <textarea
              rows={4}
              value={cookieJson}
              onChange={(e) => setCookieJson(e.target.value)}
              placeholder='[ { "name": "session_id", "value": "...", "domain": ".univ.edu" } ]'
              className="w-full p-3.5 rounded-xl inset-section border border-[#28211a] text-xs text-[#f5ebe0] placeholder-[#9a9082] focus:outline-none"
            />
            <div className="flex justify-end">
              <button type="submit" className="px-5 py-2 rounded-xl bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] font-semibold text-xs border border-[#c9a45c]/40 shadow-md flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#c9a45c]" /> Import Payload
              </button>
            </div>
          </form>
        </ParchmentCard>
      </div>
    </div>
  );
};
