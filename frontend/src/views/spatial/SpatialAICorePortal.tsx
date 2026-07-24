import React, { useState } from 'react';
import { Send, Check, X } from 'lucide-react';
import { SpatialGlassCard as ParchmentCard } from '../../components/spatial/SpatialGlassCard';
import { JarvisAICore3D } from '../../components/3d/JarvisAICore3D';
import type { AIChatMessageDTO } from '../../types/dto';

export const SpatialAICorePortal: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessageDTO[]>([
    {
      id: 'msg-1',
      sender: 'JARVIS_AI',
      timestamp: '11:30 AM',
      content: 'Greetings, Alex. The Academic Engine contains full telemetry for your CS602 midterm. I have generated a recommended study block for tonight. Shall I add this entry to your Study Journal?',
      toolExecutions: [
        { toolName: 'inspect_archive_ledger', status: 'SUCCESS', outputSnippet: 'Found 1 timetable conflict on Thursday' }
      ],
      proposedActionCard: {
        id: 'act-101',
        actionType: 'SCHEDULE_STUDY',
        title: 'Study Journal Entry: Distributed Systems & Raft Protocol',
        details: 'Record 60-minute manuscript review on Wednesday at 18:00.',
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

    setTimeout(() => {
      const librarianReply: AIChatMessageDTO = {
        id: `msg-${Date.now() + 1}`,
        sender: 'JARVIS_AI',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `Query processed and recorded. Updating study journal entry for Database Systems. High priority study block scheduled for 19:00 today.`,
        toolExecutions: [
          { toolName: 'inscribe_journal_entry', status: 'SUCCESS', outputSnippet: 'Record #st-4 created' }
        ]
      };
      setMessages(prev => [...prev, librarianReply]);
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
    <div className="space-y-6 animate-fadeIn pb-24 text-[#d8cebe] font-sans">
      {/* 3D Armillary Sphere & Core */}
      <ParchmentCard glow className="p-6 text-center space-y-2">
        <JarvisAICore3D />
        <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#6b1d2f] text-[#f5ebe0] font-sans text-xs font-semibold shadow-md border border-[#c9a45c]/40">
          ACADEMIC LIBRARIAN AI ASSISTANT
        </div>
      </ParchmentCard>

      {/* Messages Feed */}
      <ParchmentCard className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-[#9a9082] font-medium mb-1">
              {msg.sender === 'USER' ? 'ALEX VANCE' : 'ACADEMIC LIBRARIAN AI'} • {msg.timestamp}
            </span>

            <div className={`max-w-xl p-4 rounded-xl text-xs space-y-2.5 ${
              msg.sender === 'USER'
                ? 'bg-[#6b1d2f] text-[#f5ebe0] border border-[#c9a45c]/40'
                : 'inset-section text-[#d8cebe] border border-[#28211a]'
            }`}>
              <p className="leading-relaxed">{msg.content}</p>

              {msg.toolExecutions && msg.toolExecutions.length > 0 && (
                <div className="pt-2 border-t border-[#28211a] space-y-1">
                  <span className="text-[10px] font-semibold text-[#c9a45c]">
                    SYSTEM EXECUTION LOG
                  </span>
                  {msg.toolExecutions.map((t, idx) => (
                    <div key={idx} className="p-2 rounded bg-[#0f0c0a] text-[10px] text-[#d8cebe] flex justify-between border border-[#28211a]">
                      <span>`{t.toolName}`</span>
                      <span className="text-[#c9a45c] font-semibold">{t.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {msg.proposedActionCard && (
                <div className="p-3 rounded-xl bg-[#0f0c0a] border border-[#28211a] space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#c9a45c] font-semibold">ACTION RECOMMENDATION</span>
                    <span className="text-[#9a9082]">{msg.proposedActionCard.status}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#f5ebe0]">{msg.proposedActionCard.title}</p>
                  <p className="text-[11px] text-[#9a9082]">{msg.proposedActionCard.details}</p>

                  {msg.proposedActionCard.status === 'PENDING' && (
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => handleAction(msg.id, true)}
                        className="px-3 py-1 rounded bg-[#6b1d2f] text-[#f5ebe0] text-xs font-semibold border border-[#c9a45c]/40 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-[#c9a45c]" /> Accept
                      </button>
                      <button
                        onClick={() => handleAction(msg.id, false)}
                        className="px-3 py-1 rounded bg-[#1b1612] text-[#9a9082] text-xs border border-[#28211a] flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="text-xs text-[#c9a45c] font-medium animate-pulse">
            Librarian AI is processing response...
          </div>
        )}
      </ParchmentCard>

      {/* Command Input Form */}
      <form onSubmit={handleSend} className="flex items-center space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Academic Librarian AI for recommendations, summaries, or scheduling..."
          className="flex-1 modern-card px-4 py-2.5 rounded-xl border border-[#28211a] text-xs text-[#f5ebe0] placeholder-[#9a9082] focus:outline-none shadow-sm"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#6b1d2f] hover:bg-[#801c2e] text-[#f5ebe0] font-semibold text-xs border border-[#c9a45c]/40 transition-all shadow-sm flex items-center gap-2"
        >
          <Send className="w-4 h-4 text-[#c9a45c]" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
