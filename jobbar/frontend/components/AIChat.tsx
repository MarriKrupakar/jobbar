'use client';
import { useState, useRef, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Msg { role:'user'|'assistant'; content:string; }

export default function AIChat({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role:'assistant', content:`Hi ${userName}! I'm your AI career assistant. Ask me anything about jobs, resumes, or interviews! 🎯` }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [msgs]);

  const send = async (text: string) => {
    if (!text.trim() || thinking) return;
    const newMsgs: Msg[] = [...msgs, {role:'user',content:text.trim()}];
    setMsgs(newMsgs); setInput(''); setThinking(true);
    try {
      const res = await usersApi.chat(newMsgs.map(m=>({role:m.role,content:m.content})));
      setMsgs([...newMsgs, {role:'assistant',content:res.data.reply}]);
    } catch { toast.error('AI error'); setMsgs(msgs); } finally { setThinking(false); }
  };

  return (
    <>
      {open && (
        <div className="ai-chat-panel glass">
          <div className="ai-chat-header">
            <div className="ai-chat-info">
              <div className="ai-pulse-small"/>
              <div>
                <span className="ai-chat-name">job.ai</span>
                <span className="ai-chat-status">Always active</span>
              </div>
            </div>
            <button onClick={()=>setOpen(false)} style={{background:'none',border:'none',color:'var(--text2)',fontSize:18,cursor:'pointer',lineHeight:1}}>✕</button>
          </div>
          <div className="ai-chat-messages">
            {msgs.map((m,i)=>(
              <div key={i} className={m.role==='user'?'user-message':'ai-message'}>
                {m.role==='assistant' && <div className="ai-msg-avatar">🤖</div>}
                <div className="ai-msg-content">{m.content}</div>
                {m.role==='user' && <div className="ai-msg-avatar" style={{background:'rgba(255,255,255,.1)'}}>👤</div>}
              </div>
            ))}
            {thinking && (
              <div className="ai-message">
                <div className="ai-msg-avatar">🤖</div>
                <div className="ai-typing"><span/><span/><span/></div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
          <div className="ai-chat-input">
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(input);}}}
              placeholder="Ask me anything..." disabled={thinking}/>
            <button onClick={()=>send(input)} disabled={!input.trim()||thinking}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
            </button>
          </div>
        </div>
      )}
      <div className="ai-assistant" onClick={()=>setOpen(o=>!o)}>
        <div className="ai-assistant-icon">
          <div className="ai-pulse-ring"/>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </div>
      </div>
    </>
  );
}
