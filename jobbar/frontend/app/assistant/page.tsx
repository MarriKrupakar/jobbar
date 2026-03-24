'use client';
import { useState, useRef, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { usersApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Msg { role:'user'|'assistant'; content:string; }

const SUGGESTIONS = [
  'How do I improve my resume for a senior role?',
  'What are the top interview questions for React developers?',
  'Help me negotiate a higher salary offer',
  'What skills are most in demand in 2025?',
  'How do I write a compelling cover letter?',
];

export default function AssistantPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {role:'assistant',content:"Hi! I'm your job.bar AI career coach. I can help with resumes, interviews, salary negotiation, and job search strategy. What can I help you with today? 🎯"}
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[msgs]);

  const send = async (text:string) => {
    if(!text.trim()||thinking)return;
    const newMsgs:Msg[]=[...msgs,{role:'user',content:text.trim()}];
    setMsgs(newMsgs);setInput('');setThinking(true);
    try{
      const r=await usersApi.chat(newMsgs.map(m=>({role:m.role,content:m.content})));
      setMsgs([...newMsgs,{role:'assistant',content:r.data.reply}]);
    }catch(e:any){toast.error('AI error');setMsgs(msgs);}
    finally{setThinking(false);}
  };

  return (
    <AppShell>
      <div className="page active">
        <div className="page-header">
          <div>
            <h1 className="page-title">AI Career Coach</h1>
            <p className="page-subtitle">Powered by Gemini · Personalized guidance for your job search</p>
          </div>
          <button className="btn-secondary" onClick={()=>setMsgs([{role:'assistant',content:"Chat reset! How can I help you today? 🎯"}])}>Clear Chat</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:20}} className="assistant-grid">
          <style>{`@media(max-width:900px){.assistant-grid{grid-template-columns:1fr!important}}`}</style>

          {/* Chat */}
          <div className="glass" style={{display:'flex',flexDirection:'column',height:600,overflow:'hidden',borderRadius:16}}>
            {/* Header */}
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 18px',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:36,height:36,borderRadius:10,background:'var(--grad)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🤖</div>
              <div>
                <div style={{fontSize:14,fontWeight:600}}>job.ai</div>
                <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--text2)'}}>
                  <div className="ai-pulse"/><span>Always active</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{flex:1,overflowY:'auto',padding:18,display:'flex',flexDirection:'column',gap:14,background:'var(--bg2)'}}>
              {msgs.map((m,i)=>(
                <div key={i} style={{display:'flex',gap:8,flexDirection:m.role==='user'?'row-reverse':'row',alignItems:'flex-start'}}>
                  <div style={{width:28,height:28,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,background:m.role==='assistant'?'var(--grad)':'rgba(255,255,255,.1)'}}>
                    {m.role==='assistant'?'🤖':'👤'}
                  </div>
                  <div style={{maxWidth:'82%',padding:'10px 14px',borderRadius:m.role==='user'?'12px 4px 12px 12px':'4px 12px 12px 12px',fontSize:13,lineHeight:1.6,
                    background:m.role==='user'?'var(--grad)':'rgba(255,255,255,.06)',color:'var(--text)'}}>
                    {m.content.split('\n').map((l,j)=><span key={j}>{l}{j<m.content.split('\n').length-1&&<br/>}</span>)}
                  </div>
                </div>
              ))}
              {thinking&&(
                <div style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:'var(--grad)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>🤖</div>
                  <div className="ai-typing"><span/><span/><span/></div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Suggestions */}
            {msgs.length<=2&&(
              <div style={{padding:'8px 14px',display:'flex',flexWrap:'wrap',gap:6,background:'var(--bg2)',borderTop:'1px solid var(--border)'}}>
                {SUGGESTIONS.slice(0,3).map(s=>(
                  <button key={s} onClick={()=>send(s)} disabled={thinking}
                    style={{fontSize:11,padding:'5px 10px',borderRadius:20,background:'var(--accent-dim)',border:'1px solid rgba(99,102,241,.3)',color:'#818cf8',cursor:'pointer',textAlign:'left',fontFamily:'Inter,sans-serif'}}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{padding:'12px 14px',borderTop:'1px solid var(--border)',display:'flex',gap:10,alignItems:'center'}}>
              <input value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(input);}}}
                placeholder="Ask about interviews, resumes, salary..." disabled={thinking}
                className="form-input" style={{flex:1,padding:'10px 14px'}}/>
              <button onClick={()=>send(input)} disabled={!input.trim()||thinking}
                style={{width:40,height:40,borderRadius:10,background:input.trim()&&!thinking?'var(--grad)':'rgba(255,255,255,.08)',border:'none',cursor:input.trim()&&!thinking?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .2s'}}>
                {thinking
                  ? <div style={{width:16,height:16,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Sidebar tips */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="glass" style={{padding:18}}>
              <h3 style={{fontSize:14,fontWeight:700,marginBottom:14}}>💡 What I can help with</h3>
              {[
                {e:'📝',t:'Resume Review',d:'Get detailed feedback on your resume'},
                {e:'🎤',t:'Interview Prep',d:'Practice common questions by role'},
                {e:'💰',t:'Salary Tips',d:'Negotiation scripts and strategies'},
                {e:'🔍',t:'Job Strategy',d:'Personalized search tips'},
                {e:'✉️',t:'Cover Letters',d:'Compelling personalized letters'},
              ].map(tip=>(
                <div key={tip.t} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:18}}>{tip.e}</span>
                  <div><div style={{fontSize:13,fontWeight:600}}>{tip.t}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{tip.d}</div></div>
                </div>
              ))}
            </div>
            <div className="glass" style={{padding:18,background:'rgba(99,102,241,.05)',borderColor:'rgba(99,102,241,.2)'}}>
              <div className="ai-badge" style={{marginBottom:8}}>✨ Pro Tip</div>
              <p style={{fontSize:12,color:'var(--text2)',lineHeight:1.6}}>
                Paste the job description along with your question for highly personalized advice tailored to that specific role.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
