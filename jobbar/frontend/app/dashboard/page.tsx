'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && user) router.push('/dashboard'); }, [user, loading]);

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-primary)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}} className="grid-bg">
      <div style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)',top:'-200px',left:'-200px',animation:'float 8s ease-in-out infinite'}}/>
      <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)',bottom:'-150px',right:'-150px',animation:'float 10s ease-in-out infinite reverse'}}/>
      <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)',top:'40%',right:'20%',animation:'float 12s ease-in-out infinite'}}/>
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}} style={{width:'100%',maxWidth:440,margin:'0 auto',padding:'0 20px',position:'relative',zIndex:10}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:10,marginBottom:8}}>
            
            <span style={{fontFamily:'Space Grotesk,sans-serif',fontSize:28,fontWeight:700,color:'var(--text-primary)'}}>job<span style={{color:'var(--accent)'}}>.bar</span></span>
          </div>
          <p style={{color:'var(--text-secondary)',fontSize:14}}>AI-Powered Job Search & Auto-Apply Platform</p>
        </div>
        <div className="glass-card" style={{padding:32}}>
          <h2 style={{fontSize:22,fontWeight:700,marginBottom:6,textAlign:'center'}}>Welcome back</h2>
          <p style={{color:'var(--text-secondary)',fontSize:14,textAlign:'center',marginBottom:28}}>Your AI job search assistant is ready</p>
          <motion.button onClick={signInWithGoogle} whileHover={{scale:1.02}} whileTap={{scale:0.98}} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:12,padding:'13px 20px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:12,color:'var(--text-primary)',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:'Inter,sans-serif',marginBottom:24}}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </motion.button>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
            <div style={{flex:1,height:1,background:'var(--border)'}}/><span style={{color:'var(--text-muted)',fontSize:12}}>or</span><div style={{flex:1,height:1,background:'var(--border)'}}/>
          </div>
          <div style={{marginBottom:14}}><label style={{fontSize:13,color:'var(--text-secondary)',display:'block',marginBottom:6}}>Email address</label><input type="email" placeholder="you@example.com" className="input-field"/></div>
          <div style={{marginBottom:20}}><label style={{fontSize:13,color:'var(--text-secondary)',display:'block',marginBottom:6}}>Password</label><input type="password" placeholder="••••••••" className="input-field"/></div>
          <button onClick={signInWithGoogle} className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'13px 20px',fontSize:15}}>Sign In <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
          <p style={{textAlign:'center',marginTop:16,fontSize:13,color:'var(--text-muted)'}}>No account? <span onClick={signInWithGoogle} style={{color:'var(--accent)',cursor:'pointer'}}>Sign up free</span></p>
        </div>
        <p style={{textAlign:'center',marginTop:20,fontSize:12,color:'var(--text-muted)'}}>🔒 Trusted by 50,000+ job seekers · No spam · Cancel anytime</p>
      </motion.div>
    </div>
  );
}
