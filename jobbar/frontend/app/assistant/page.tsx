'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { usersApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Message { role:'user'|'assistant'; content:string; }

const SUGGESTIONS = [
  'How do I improve my resume for tech roles?',
  'What are common interview questions for React developers?',
  'Help me negotiate a higher salary',
  'What skills should I learn for data science?',
];

export default function AssistantPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role:'assistant', content:"👋 Hi! I'm your job.bar AI — your personal career assistant powered by Gemini. I can help with resumes, interviews, salary negotiation, and job search strategy. What would you like to work on?" }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (!loading && !user) router.push('/'); }, [user, loading]);
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages]);

  const send = async (content: string) => {
    if (!content.trim() || thinking) return;
    const newMsgs: Message[] = [...messages, {role:'user',content:content.trim()}];
    setMessages(newMsgs); setInput(''); setThinking(true);
    try {
      const res = await usersApi.chat(newMsgs.map(m=>({role:m.role,content:m.content})));
      setMessages([...newMsgs, {role:'assistant',content:res.data.reply}]);
    } catch(e:any) {
      toast.error(e.response?.data?.error||'AI error');
      setMessages(messages);
    } finally { setThinking(false); }
  };

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'var(--bg-primary)'}}><div style={{width:40,height:40,border:'3px solid var(--accent)',borderTopColor:'transparent',borderRadius:'50%'}} className="animate-spin"/></div>;

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg-primary)'}}>
      <Navbar/>
      <main style={{flex:1,marginLeft:0,paddingTop:60,display:'flex',flexDirection:'column'}} className="main-pad">
        <style>{`@media(min-width:769px){.main-pad{margin-left:240px!important;padding-top:0!important}}`}</style>
        <div style={{maxWidth:900,margin:'0 auto',padding:'32px 24px',width:'100%',flex:1,display:'flex',flexDirection:'column'}}>

          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} style={{marginBottom:20}}>
            <h1 style={{fontSize:28,fontWeight:700,marginBottom:4}}>AI Career Coach</h1>
            <p style={{color:'var(--text-secondary)',fontSize:14}}>Powered by Gemini · Always active</p>
          </motion.div>

          {/* Chat container */}
          <div className="glass-card" style={{flex:1,display:'flex',flexDirection:'column',minHeight:500,overflow:'hidden'}}>

            {/* Header */}
            <div style={{padding:'14px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:'var(--gradient)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🤖</div>
              <div>
                <p style={{fontSize:14,fontWeight:600}}>job.ai</p>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:'var(--success)',animation:'pulse 2s ease infinite'}}/>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>Always active</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{flex:1,overflowY:'auto',padding:'20px',display:'flex',flexDirection:'column',gap:14}}>
              <AnimatePresence initial={false}>
                {messages.map((msg,i) => (
                  <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3}}
                    style={{display:'flex',gap:10,flexDirection:msg.role==='user'?'row-reverse':'row',alignItems:'flex-start'}}>
                    <div style={{width:30,height:30,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,
                      background:msg.role==='assistant'?'var(--gradient)':'rgba(255,255,255,0.1)',color:'white'}}>
                      {msg.role==='assistant'?'🤖':'👤'}
                    </div>
                    <div style={{maxWidth:'80%',padding:'12px 16px',borderRadius:msg.role==='user'?'16px 4px 16px 16px':'4px 16px 16px 16px',fontSize:14,lineHeight:1.6,
                      background:msg.role==='user'?'var(--gradient)':'rgba(255,255,255,0.06)',
                      color:'var(--text-primary)'}}>
                      {msg.content.split('\n').map((line,j)=><span key={j}>{line}{j<msg.content.split('\n').length-1&&<br/>}</span>)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {thinking && (
                <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                  <div style={{width:30,height:30,borderRadius:'50%',background:'var(--gradient)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>🤖</div>
                  <div style={{padding:'14px 16px',background:'rgba(255,255,255,0.06)',borderRadius:'4px 16px 16px 16px',display:'flex',gap:4,alignItems:'center'}}>
                    {[0,0.15,0.3].map(d=>(
                      <motion.div key={d} style={{width:7,height:7,borderRadius:'50%',background:'var(--text-muted)'}}
                        animate={{y:[0,-5,0]}} transition={{repeat:Infinity,duration:0.8,delay:d}}/>
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div style={{padding:'0 20px 12px',display:'flex',flexWrap:'wrap',gap:6}}>
                {SUGGESTIONS.slice(0,3).map(s=>(
                  <button key={s} onClick={()=>send(s)} disabled={thinking}
                    style={{fontSize:12,padding:'6px 12px',borderRadius:20,background:'var(--accent-dim)',border:'1px solid rgba(99,102,241,0.3)',color:'#818cf8',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
                    onMouseEnter={e=>(e.currentTarget.style.background='rgba(99,102,241,0.25)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='var(--accent-dim)')}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{padding:'12px 16px',borderTop:'1px solid var(--border)',display:'flex',gap:10,alignItems:'flex-end'}}>
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(input);}}}
                placeholder="Ask about interviews, resumes, salary..." disabled={thinking}
                style={{flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid var(--border)',borderRadius:12,padding:'10px 14px',color:'var(--text-primary)',fontSize:14,fontFamily:'Inter,sans-serif',resize:'none',outline:'none',minHeight:42,maxHeight:120,lineHeight:1.5,transition:'border-color 0.2s'}}
                onFocus={e=>(e.currentTarget.style.borderColor='var(--accent)')}
                onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}
                rows={1}/>
              <button onClick={()=>send(input)} disabled={!input.trim()||thinking}
                style={{width:42,height:42,borderRadius:12,background:input.trim()&&!thinking?'var(--gradient)':'rgba(255,255,255,0.08)',border:'none',cursor:input.trim()&&!thinking?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',flexShrink:0}}>
                {thinking
                  ? <div style={{width:16,height:16,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%'}} className="animate-spin"/>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
                }
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
