import React, { useState } from 'react';
import { Bot, Send, Terminal, ShieldCheck, Check, X, Cpu, Sparkles, Activity } from 'lucide-react';
import type { AIChatMessageDTO } from '../types/dto';

export const AIChatCommandCenterView: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessageDTO[]>([
    {
      id: 'msg-1',
      sender: 'JARVIS_AI',
      timestamp: '11:30 AM',
      content: 'JARVIS Operating System online. I have analyzed your CS602 Midterm schedule and detected an overlap with your Raft Consensus project lab. Would you like me to formulate an optimized 45-minute study block strategy?',
      toolExecutions: [
        { toolName: 'scan_timetable_conflicts', status: 'SUCCESS', outputSnippet: 'Found 1 conflict on Thursday 14:00' },
        { toolName: 'evaluate_academic_risk_dto', status: 'SUCCESS', outputSnippet: 'CS602 Risk score: 18.5 (SAFE)' }
      ],
      proposedActionCard: {
        id: 'act-101',
        actionType: 'SCHEDULE_STUDY',
        title: 'Schedule Focus Block: Raft Log Replication',
        details: 'Block 60 minutes on Wednesday 18:00 - 19:00 for CS602 Lab #4.',
        status: 'PENDING'
      }
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: AIChatMessageDTO = {
      id: `msg-${Date.now()}`,
      sender: 'USER',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate SSE streaming response from JARVIS AI
    setTimeout(() => {
      const jarvisReply: AIChatMessageDTO = {
        id: `msg-${Date.now() + 1}`,
        sender: 'JARVIS_AI',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `Telemetry processed. I have updated your daily study plan DTO and prioritized the Quantum Computing Bloch Sphere transformations. High priority alert set for 19:00 today.`,
        toolExecutions: [
          { toolName: 'update_study_planner_dto', status: 'SUCCESS', outputSnippet: 'Inserted Task #st-4' }
        ]
      };
      setMessages(prev => [...prev, jarvisReply]);
      setIsTyping(false);
    }, 1200);
  };

  const handleAction = (msgId: string, accepted: boolean) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId && m.proposedActionCard) {
        return {
          ...m,
          proposedActionCard: {
            ...m.proposedActionCard,
            status: accepted ? 'ACCEPTED' : 'REJECTED'
          }
        };
      }
      return m;
    }));
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col glass-panel rounded-2xl border border-cyan-500/30 overflow-hidden animate-fadeIn">
      {/* Header Bar */}
      <div className="p-4 border-b border-cyan-500/30 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/40">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono-tech">JARVIS AI OPERATIONS CONSOLE</h2>
            <p className="text-[10px] text-cyan-400 font-mono-tech">SUB-AGENT SWARM: ACTIVE // SSE STREAMING READY</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono-tech text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 status-pulse-green" />
          <span>MODEL: GEMINI AGENTIC STACK</span>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-2 text-[10px] font-mono-tech text-slate-500 mb-1">
              <span>{msg.sender === 'USER' ? 'USER' : 'JARVIS AI OS'}</span>
              <span>• {msg.timestamp}</span>
            </div>

            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs font-mono-tech space-y-3 ${
                msg.sender === 'USER'
                  ? 'bg-cyan-950/80 text-cyan-100 border border-cyan-500/40'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-800'
              }`}
            >
              <p className="leading-relaxed">{msg.content}</p>

              {/* Tool Execution Timeline */}
              {msg.toolExecutions && msg.toolExecutions.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-cyan-400" /> SUB-AGENT EXECUTION LOGS
                  </span>
                  {msg.toolExecutions.map((t, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-cyan-300 flex justify-between">
                      <span>Executing `{t.toolName}`</span>
                      <span className="text-emerald-400 font-bold">{t.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Confirmation Card */}
              {msg.proposedActionCard && (
                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-cyan-400 font-bold">PROPOSED AGENT INTERVENTION</span>
                    <span className="text-slate-500">{msg.proposedActionCard.status}</span>
                  </div>
                  <p className="text-xs font-bold text-white">{msg.proposedActionCard.title}</p>
                  <p className="text-[11px] text-slate-400">{msg.proposedActionCard.details}</p>

                  {msg.proposedActionCard.status === 'PENDING' && (
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => handleAction(msg.id, true)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept Strategy
                      </button>
                      <button
                        onClick={() => handleAction(msg.id, false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700 flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Dismiss
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-xs font-mono-tech text-cyan-400 animate-pulse p-2">
            <Cpu className="w-4 h-4 animate-spin" />
            <span>JARVIS AGENT IS COMPUTING TELEMETRY STREAM...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-cyan-500/30 bg-slate-900/90 flex items-center space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Issue a command to JARVIS AI..."
          className="flex-1 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-mono-tech text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono-tech text-xs transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Execute</span>
        </button>
      </form>
    </div>
  );
};
