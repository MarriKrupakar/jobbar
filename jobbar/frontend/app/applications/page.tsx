'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { applicationsApi } from '@/lib/api';
import { Application } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

const STATUSES = ['Applied','Under Review','Interview','Offer','Rejected'] as const;
const badgeClass: Record<string,string> = {'Applied':'badge-applied','Under Review':'badge-review','Interview':'badge-interview','Offer':'badge-offer','Rejected':'badge-rejected'};
const pipelineColors: Record<string,string> = {'Applied':'rgba(99,102,241,0.8)','Under Review':'rgba(245,158,11,0.8)','Interview':'rgba(16,185,129,0.8)','Offer':'rgba(6,182,212,0.8)','Rejected':'rgba(239,68,68,0.8)'};

export default function ApplicationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<string|null>(null);

  useEffect(() => { if (!loading && !user) router.push('/'); }, [user, loading]);

  const fetchApps = async () => {
    setFetching(true);
    try {
      const res = await applicationsApi.getAll({ status: filter==='All'?undefined:filter, limit:50 });
      setApps(res.data.applications||[]);
    } catch {} finally { setFetching(false); }
  };

  useEffect(() => { if (user) fetchApps(); }, [user, filter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await applicationsApi.updateStatus(id, status);
      toast.success(`Status → ${status}`);
      fetchApps();
    } catch { toast.error('Failed to update'); } finally { setUpdatingId(null); }
  };

  const deleteApp = async (id: string) => {
    if (!confirm('Delete this application?')) return;
    try { await applicationsApi.delete(id); toast.success('Deleted'); fetchApps(); } catch { toast.error('Failed'); }
  };

  const counts: Record<string,number> = { All: apps.length };
  STATUSES.forEach(s => { counts[s] = apps.filter(a=>a.status===s).length; });

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'var(--bg-primary)'}}><div style={{width:40,height:40,border:'3px solid var(--accent)',borderTopColor:'transparent',borderRadius:'50%'}} className="animate-spin"/></div>;

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg-primary)'}}>
      <Navbar/>
      <main style={{flex:1,marginLeft:0,paddingTop:60}} className="main-pad">
        <style>{`@media(min-width:769px){.main-pad{margin-left:240px!important;padding-top:0!important}}`}</style>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 24px'}}>

          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
            <h1 style={{fontSize:28,fontWeight:700,marginBottom:4}}>Applications</h1>
            <p style={{color:'var(--text-secondary)',fontSize:14}}>Track every application in one place</p>
          </motion.div>

          {/* Pipeline stats */}
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:20}}>
            {(['All',...STATUSES]).map(s => (
              <button key={s} onClick={()=>setFilter(s)}
                style={{padding:'8px 16px',borderRadius:20,border:'1px solid',fontSize:13,fontWeight:500,cursor:'pointer',transition:'all 0.2s',
                  borderColor: filter===s ? 'var(--accent)' : 'var(--border)',
                  background: filter===s ? 'var(--accent-dim)' : 'transparent',
                  color: filter===s ? '#818cf8' : 'var(--text-secondary)'}}>
                {s} {counts[s]>0 && <span style={{opacity:0.7}}>({counts[s]})</span>}
              </button>
            ))}
          </div>

          {/* Table */}
          {fetching ? (
            <div style={{textAlign:'center',padding:'60px 0'}}><div style={{width:40,height:40,border:'3px solid var(--accent)',borderTopColor:'transparent',borderRadius:'50%',margin:'0 auto'}} className="animate-spin"/></div>
          ) : apps.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 0'}} className="glass-card">
              <div style={{fontSize:48,marginBottom:12}}>📋</div>
              <p style={{fontWeight:600,marginBottom:6}}>No applications yet</p>
              <p style={{color:'var(--text-secondary)',fontSize:14}}>Apply to jobs and they&apos;ll show up here</p>
            </div>
          ) : (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass-card" style={{overflow:'hidden'}}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead>
                    <tr style={{borderBottom:'1px solid var(--border)'}}>
                      {['Company','Role','Location','Applied','Status','Actions'].map(h=>(
                        <th key={h} style={{padding:'12px 16px',textAlign:'left',color:'var(--text-muted)',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',whiteSpace:'nowrap'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((app,i) => (
                      <motion.tr key={app.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.03}}
                        style={{borderBottom:'1px solid var(--border)',transition:'background 0.15s'}}
                        onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.02)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                        <td style={{padding:'12px 16px',fontWeight:600,whiteSpace:'nowrap'}}>{app.company}</td>
                        <td style={{padding:'12px 16px',color:'var(--text-secondary)',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{app.role}</td>
                        <td style={{padding:'12px 16px',color:'var(--text-muted)',fontSize:12,whiteSpace:'nowrap'}}>{app.location||'—'}</td>
                        <td style={{padding:'12px 16px',color:'var(--text-muted)',fontSize:12,whiteSpace:'nowrap'}}>{new Date(app.applied_at).toLocaleDateString()}</td>
                        <td style={{padding:'12px 16px'}}>
                          <select value={app.status} disabled={updatingId===app.id}
                            onChange={e=>updateStatus(app.id,e.target.value)}
                            style={{background:'transparent',border:'none',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'Inter,sans-serif',outline:'none',padding:'3px 8px',borderRadius:20,color:'inherit'}}
                            className={`badge ${badgeClass[app.status]||'badge-applied'}`}>
                            {STATUSES.map(s=><option key={s} value={s} style={{background:'#16161f',color:'var(--text-primary)'}}>{s}</option>)}
                          </select>
                        </td>
                        <td style={{padding:'12px 16px'}}>
                          <div style={{display:'flex',gap:6,alignItems:'center'}}>
                            {app.apply_url && (
                              <a href={app.apply_url} target="_blank" rel="noopener noreferrer"
                                style={{padding:'4px 8px',borderRadius:6,background:'rgba(255,255,255,0.06)',color:'var(--text-secondary)',textDecoration:'none',fontSize:12,display:'inline-flex',alignItems:'center',gap:4,transition:'all 0.2s'}}
                                onMouseEnter={e=>(e.currentTarget.style.color='var(--text-primary)')}
                                onMouseLeave={e=>(e.currentTarget.style.color='var(--text-secondary)')}>
                                ↗
                              </a>
                            )}
                            <button onClick={()=>deleteApp(app.id)}
                              style={{padding:'4px 8px',borderRadius:6,background:'transparent',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:12,transition:'all 0.2s'}}
                              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.15)';(e.currentTarget as HTMLElement).style.color='var(--danger)'}}
                              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';(e.currentTarget as HTMLElement).style.color='var(--text-muted)'}}>
                              🗑
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
