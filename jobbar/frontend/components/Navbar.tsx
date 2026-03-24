'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';

const navItems = [
  { href: '/dashboard',    label: 'Home',         icon: '⊞', badge: 'Live' },
  { href: '/jobs',         label: 'Job Feed',     icon: '💼', badge: '247' },
  { href: '/applications', label: 'Applications', icon: '✓',  badge: '12'  },
  { href: '/resume',       label: 'Resume Lab',   icon: '📄', badge: null  },
  { href: '/assistant',    label: 'AI Assistant', icon: '🤖', badge: 'AI'  },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2);

  const SidebarContent = () => (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      {/* Logo */}
      <div style={{padding:'24px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          
          <span style={{fontFamily:'Space Grotesk,sans-serif',fontSize:20,fontWeight:700}}>job<span style={{color:'var(--accent)'}}>.bar</span></span>
        </div>
        <button onClick={()=>setOpen(false)} style={{display:'block',background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:18,lineHeight:1}}>✕</button>
      </div>

      {/* Nav */}
      <nav style={{flex:1,padding:'12px 10px',overflowY:'auto'}}>
        {navItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={()=>setOpen(false)}
              style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderRadius:10,marginBottom:2,textDecoration:'none',
                color: active ? '#818cf8' : 'var(--text-secondary)',
                background: active ? 'var(--accent-dim)' : 'transparent',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                transition:'all 0.2s',fontSize:14,fontWeight:active?600:400}}>
              <span style={{fontSize:16}}>{item.icon}</span>
              <span style={{flex:1}}>{item.label}</span>
              {item.badge && (
                <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,
                  background: item.badge==='Live'||item.badge==='AI' ? 'var(--accent-dim)' : 'rgba(255,255,255,0.08)',
                  color: item.badge==='Live'||item.badge==='AI' ? '#818cf8' : 'var(--text-muted)'}}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{padding:'12px 10px',borderTop:'1px solid var(--border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',marginBottom:6}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'var(--success)',animation:'pulse 2s ease infinite'}}/>
          <span style={{fontSize:12,color:'var(--text-muted)'}}>AI Engine Active</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)'}}>
          <div style={{width:32,height:32,borderRadius:'50%',background:'var(--gradient)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'white',flexShrink:0}}>
            {user?.user_metadata?.avatar_url
              ? <img src={user.user_metadata.avatar_url} style={{width:32,height:32,borderRadius:'50%'}} alt="avatar"/>
              : initials}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:13,fontWeight:600,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</p>
            <p style={{fontSize:11,color:'var(--success)',fontWeight:600}}>Free Forever</p>
          </div>
          <button onClick={signOut} title="Logout"
            style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',padding:4,borderRadius:6,display:'flex',alignItems:'center',transition:'color 0.2s'}}
            onMouseEnter={e=>(e.currentTarget.style.color='var(--danger)')}
            onMouseLeave={e=>(e.currentTarget.style.color='var(--text-muted)')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{width:240,minHeight:'100vh',background:'rgba(10,10,15,0.95)',borderRight:'1px solid var(--border)',position:'fixed',left:0,top:0,zIndex:30,display:'none'}} className="md-sidebar">
        <style>{`.md-sidebar{display:flex!important;flex-direction:column} @media(max-width:768px){.md-sidebar{display:none!important}}`}</style>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div style={{position:'fixed',top:0,left:0,right:0,zIndex:30,background:'rgba(10,10,15,0.95)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px'}} className="mobile-bar">
        <style>{`@media(min-width:769px){.mobile-bar{display:none!important}}`}</style>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          
          <span style={{fontFamily:'Space Grotesk,sans-serif',fontSize:18,fontWeight:700}}>job<span style={{color:'var(--accent)'}}>.bar</span></span>
        </div>
        <button onClick={()=>setOpen(true)} style={{background:'none',border:'none',color:'var(--text-primary)',cursor:'pointer',fontSize:20,lineHeight:1}}>☰</button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setOpen(false)}
              style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:40}}/>
            <motion.aside initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{type:'spring',damping:25,stiffness:200}}
              style={{position:'fixed',left:0,top:0,bottom:0,width:260,background:'rgba(10,10,15,0.98)',borderRight:'1px solid var(--border)',zIndex:50,display:'flex',flexDirection:'column'}}>
              <SidebarContent/>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
