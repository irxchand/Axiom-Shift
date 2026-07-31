import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Send, CheckCircle, Orbit, Cpu, Paperclip } from 'lucide-react';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';
import { backendAPI } from '../../services/backendAPI';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AGENT';
  content: string;
}

export const SpatialInitializationPortal: React.FC = () => {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-0',
      sender: 'AGENT',
      content: 'Welcome to the Axiom Shift Academic Engine. I am the Initialization Agent. To bootstrap your universe, please provide your name, your current Semester Name (e.g., "Fall 2026"), and your Timezone, or upload your academic timetable or syllabus for me to extract this automatically.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  // Poll for agent run status
  useEffect(() => {
    if (!activeRunId) return;

    const intervalId = setInterval(async () => {
      try {
        const run = await backendAPI.getAgentRun(activeRunId);
        if (run.status === 'SUCCESS' || run.status === 'REPAIRED') {
          const agentData = run.structuredData;
          if (agentData) {
            setMessages(prev => [...prev, {
              id: `msg-${Date.now()}`,
              sender: 'AGENT',
              content: agentData.messageToUser || 'Processing complete.'
            }]);

            if (agentData.payload?.onboardingStatus === 'COMPLETED' && agentData.payload?.collectedData) {
              await initializeSemesterAndProceed(agentData.payload.collectedData);
            }

            if (agentData.routing?.action === 'ROUTE_TO_AGENT' && agentData.routing?.nextRunId) {
              // Handoff to the next agent seamlessly
              setActiveRunId(agentData.routing.nextRunId);
              return; // Keep isProcessing true
            }
          }
          
          setIsProcessing(false);
          setActiveRunId(null);
        } else if (run.status === 'FAILED') {
          setIsProcessing(false);
          setActiveRunId(null);
          setMessages(prev => [...prev, {
            id: `msg-${Date.now()}`,
            sender: 'AGENT',
            content: `Initialization failed: ${run.rawResponse}`
          }]);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [activeRunId, queryClient]);

  const initializeSemesterAndProceed = async (data: { semesterName: string, timezone: string }) => {
    try {
      setMessages(prev => [...prev, {
        id: `sys-${Date.now()}`,
        sender: 'AGENT',
        content: `Initializing Academic Engine with Semester: ${data.semesterName} (${data.timezone})...`
      }]);
      await backendAPI.initializeSemester({ name: data.semesterName, timezone: data.timezone });
      
      // Invalidate system state to force app to render SpatialLayout
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['systemState'] });
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'USER',
      content: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const result = await backendAPI.triggerAgentChat('initialization-agent', input);
      setActiveRunId(result.runId);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        sender: 'USER',
        content: `Uploaded document: ${file.name}`
      }]);
      setIsProcessing(true);
      setTimeout(async () => {
        try {
          const result = await backendAPI.triggerAgentChat('initialization-agent', `I have uploaded a document: ${file.name}. Please extract my semester details.`);
          setActiveRunId(result.runId);
        } catch (err) {
          console.error(err);
          setIsProcessing(false);
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-[#d8cebe] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-fadeIn">
        <ParchmentCard glow className="p-8 space-y-6 border border-[#c9a45c]/40">
          <div className="text-center space-y-2">
            <Orbit className="w-12 h-12 text-[#c9a45c] mx-auto animate-[spin_20s_linear_infinite]" />
            <h1 className="text-2xl font-cinzel font-bold text-gold-foil tracking-widest uppercase">
              Academic Engine Boot Sequence
            </h1>
            <p className="text-xs text-[#9a9082] uppercase tracking-wider">
              Awaiting Configuration Vectors
            </p>
          </div>

          <div className="h-80 overflow-y-auto space-y-4 p-4 bg-[#0a0807] rounded-xl border border-[#28211a] shadow-inner">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                  msg.sender === 'USER' 
                    ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/30' 
                    : 'bg-[#1b1612] text-[#d8cebe] border border-[#28211a]'
                }`}>
                  {msg.sender === 'AGENT' && (
                    <div className="flex items-center gap-1.5 mb-1.5 text-[#c9a45c]">
                      <Cpu className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Initialization Agent</span>
                    </div>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="text-xs text-[#c9a45c] font-medium animate-pulse flex items-center gap-2">
                <Orbit className="w-4 h-4 animate-spin" />
                Processing semantic vectors...
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-3">
            <label className="flex items-center justify-center p-2.5 rounded-xl bg-[#14100c] border border-[#28211a] hover:border-[#c9a45c]/50 text-[#c9a45c] transition-colors cursor-pointer" title="Upload Timetable or Syllabus">
              <Paperclip className="w-5 h-5" />
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={isProcessing} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
            </label>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isProcessing}
              placeholder="Provide semester details or upload timetable..."
              className="flex-1 bg-[#14100c] border border-[#28211a] rounded-xl px-4 py-2.5 text-sm text-[#f5ebe0] placeholder-[#9a9082] focus:outline-none focus:border-[#c9a45c]/50 transition-colors"
            />
            <button
              type="submit"
              disabled={isProcessing}
              className="bg-[#6b1d2f] hover:bg-[#801c2e] disabled:opacity-50 text-[#f5ebe0] px-5 py-2.5 rounded-xl border border-[#c9a45c]/40 flex items-center gap-2 transition-colors font-bold text-sm shadow-md"
            >
              <Send className="w-4 h-4 text-[#c9a45c]" />
              Transmit
            </button>
          </form>
        </ParchmentCard>
      </div>
    </div>
  );
};
