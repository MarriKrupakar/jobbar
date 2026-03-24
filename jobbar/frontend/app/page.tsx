'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

export default function LandingPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [tab, setTab] = useState<'login'|'signup'>('login');

  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/dashboard';
    }
  }, [user, loading]);

  if (loading) return (
    <div className="auth-screen" data-theme="dark">
      <div className="auth-bg">
        <div className="auth-orb orb-1"/><div className="auth-orb orb-2"/><div className="auth-orb orb-3"/>
        <div className="grid-overlay"/>
      </div>
      <div style={{position:'relative',zIndex:10,textAlign:'center'}}>
        <div className="loading-spinner" style={{margin:'0 auto'}}/>
      </div>
    </div>
  );

  return (
    <div className="auth-screen" data-theme="dark">
      <div className="auth-bg">
        <div className="auth-orb orb-1"/><div className="auth-orb orb-2"/><div className="auth-orb orb-3"/>
        <div className="grid-overlay"/>
      </div>
      <div className="auth-container">
        <div className="auth-logo">
          <span className="logo-text">job<span className="logo-accent">.bar</span></span>
        </div>
        <div className="auth-card glass">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab==='login'?'active':''}`} onClick={()=>setTab('login')}>Sign In</button>
            <button className={`auth-tab ${tab==='signup'?'active':''}`} onClick={()=>setTab('signup')}>Sign Up</button>
          </div>
          {tab === 'login' ? (
            <>
              <h2 className="auth-title">Welcome back</h2>
              <p className="auth-subtitle">Your AI job search assistant is ready</p>
              <button className="btn-google" onClick={signInWithGoogle}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
              <div className="auth-divider"><span>or</span></div>
              <div className="form-group"><label>Email address</label><input type="email" className="form-input" placeholder="you@example.com"/></div>
              <div className="form-group"><label>Password</label><input type="password" className="form-input" placeholder="••••••••"/></div>
              <button className="btn-primary btn-full" onClick={signInWithGoogle}>
                <span>Sign In</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <p className="auth-footer">No account? <a href="#" onClick={e=>{e.preventDefault();setTab('signup')}}>Sign up free</a></p>
            </>
          ) : (
            <>
              <h2 className="auth-title">Get started free</h2>
              <p className="auth-subtitle">AI that finds and applies to jobs for you</p>
              <button className="btn-google" onClick={signInWithGoogle}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign up with Google
              </button>
              <div className="auth-divider"><span>or</span></div>
              <div className="form-group"><label>Full name</label><input type="text" className="form-input" placeholder="John Doe"/></div>
              <div className="form-group"><label>Email address</label><input type="email" className="form-input" placeholder="you@example.com"/></div>
              <div className="form-group"><label>Password</label><input type="password" className="form-input" placeholder="Create a strong password"/></div>
              <button className="btn-primary btn-full" onClick={signInWithGoogle}>
                <span>Create Account</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <p className="auth-footer">Have an account? <a href="#" onClick={e=>{e.preventDefault();setTab('login')}}>Sign in</a></p>
            </>
          )}
        </div>
        <p className="auth-trust">🔒 Trusted by 50,000+ job seekers · No spam · Cancel anytime</p>
      </div>
    </div>
  );
}
