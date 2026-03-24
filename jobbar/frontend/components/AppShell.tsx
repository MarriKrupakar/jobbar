'use client';
import { useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import AIChat from './AIChat';
import toast from 'react-hot-toast';

const NAV = [
  { id:'home',         href:'/dashboard',    label:'Home',         badge:'Live', badgeNew:true,
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg> },
  { id:'jobs',         href:'/jobs',         label:'Job Feed',     badge:'247',  badgeNew:false,
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg> },
  { id:'applications', href:'/applications', label:'Applications',  badge:'',    badgeNew:false,
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
  { id:'resume',       href:'/resume',       label:'Resume Lab',   badge:'',    badgeNew:false,
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { id:'assistant',    href:'/assistant',    label:'AI Assistant', badge:'AI',  badgeNew:true,
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'dark'|'light'>('dark');
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/';
    }
  }, [user, loading]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2);
  const avatarUrl = user?.user_metadata?.avatar_url;

  if (loading || !user) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'var(--bg)'}}>
      <div className="loading-spinner"/>
    </div>
  );

  return (
    <div className="app" data-theme={theme}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen?'':'collapsed'}`} id="sidebar">
        <div className="sidebar-logo">
          <span className="logo-text" style={{fontFamily:'Space Grotesk,sans-serif'}}>
            job<span className="logo-accent">.bar</span>
          </span>
          <button className="sidebar-toggle" onClick={()=>setSidebarOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(item => (
            <Link key={item.id} href={item.href}
              className={`nav-item ${pathname===item.href||pathname.startsWith(item.href+'/')? 'active':''}`}>
              {item.icon}
              <span>{item.label}</span>
              {item.badge && <span className={`nav-badge ${item.badgeNew?'new':''}`}>{item.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-ai-status">
            <div className="ai-pulse"/>
            <span>AI Engine Active</span>
          </div>
          <div className="sidebar-user">
            <div className="user-avatar">
              {avatarUrl ? <img src={avatarUrl} alt="avatar"/> : initials}
            </div>
            <div className="user-info">
              <span className="user-name">{name}</span>
              <span className="user-plan">Free Forever</span>
            </div>
            <button className="btn-logout" onClick={signOut} title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{display:'none'}} className="sidebar-overlay"/>}

      {/* Main */}
      <main className={`main-content ${sidebarOpen?'':'expanded'}`}>
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="hamburger" onClick={()=>setSidebarOpen(s=>!s)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="topbar-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" placeholder="Search jobs, companies, roles..." value={searchVal}
                onChange={e=>setSearchVal(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'&&searchVal.trim()){router.push(`/jobs?q=${encodeURIComponent(searchVal)}`)}}}/>
            </div>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn" onClick={toggleTheme} title="Toggle theme">
              {theme==='dark'
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              }
            </button>
            <Link href="/dashboard">
              <div className="topbar-avatar">
                {avatarUrl ? <img src={avatarUrl} alt="avatar"/> : initials}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="pages-container">
          {children}
        </div>
      </main>

      {/* AI Floating Chat */}
      <AIChat userName={name}/>
    </div>
  );
}
