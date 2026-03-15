'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { jobsApi, resumeApi, applicationsApi } from '@/lib/api';
import { Job } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function JobsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [applying, setApplying] = useState<string|null>(null);

  useEffect(() => { if (!loading && !user) router.push('/'); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    resumeApi.getAll().then(r => {
      const active = r.data.resumes?.find((x:any)=>x.is_active);
      if (active?.parsed_skills) setUserSkills(active.parsed_skills);
    }).catch(()=>{});
  }, [user]);

  const search = async () => {
    if (!keywords.trim() && !location.trim()) { toast.error('Enter keywords or location'); return; }
    setSearching(true); setHasSearched(true);
    try {
      const res = await jobsApi.search({ keywords, location, page:1, skills:userSkills.slice(0,10).join(',') });
      setJobs(res.data.jobs); setTotal(res.data.total);
    } catch(e:any) { toast.error(e.response?.data?.error||'Search failed'); }
    finally { setSearching(false); }
  };

  const handleAutoApply = async (job: Job) => {
    if (!job.applyUrl) { toast.error('No apply URL'); return; }
    setApplying(job.externalId);
    try {
      await applicationsApi.autoApply(job);
      toast.success('Auto-apply initiated!');
    } catch(e:any) { toast.error(e.response?.data?.error||'Auto-apply failed'); }
    finally { setApplying(null); }
  };

  const logApplied = async (job: Job) => {
    try {
      await applicationsApi.create({ company:job.company, role:job.title, location:job.location, applyUrl:job.applyUrl||'' });
      toast.success('Application logged!');
    } catch { toast.error('Failed to log'); }
  };

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'var(--bg-primary)'}}><div style={{width:40,height:40,border:'3px solid var(--accent)',borderTopColor:'transparent',borderRadius:'50%'}} className="animate-spin"/></div>;

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg-primary)'}}>
      <Navbar/>
      <main style={{flex:1,marginLeft:0,paddingTop:60}} className="main-pad">
        <style>{`@media(min-width:769px){.main-pad{margin-left:240px!important;padding-top:0!important}}`}</style>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 24px'}}>

          {/* Header */}
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
            <h1 style={{fontSize:28,fontWeight:700,marginBottom:4}}>Job Feed</h1>
            <p style={{color:'var(--text-secondary)',fontSize:14}}>Real-time jobs matched to your profile · Updated every hour</p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
            className="glass-card" style={{padding:20,marginBottom:20}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}} className="search-grid">
              <style>{`@media(max-width:600px){.search-grid{grid-template-columns:1fr!important}}`}</style>
              <div style={{position:'relative'}}>
                <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)',fontSize:14}}>🔍</span>
                <input value={keywords} onChange={e=>setKeywords(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()}
                  placeholder="Job title, skills, company..." className="input-field" style={{paddingLeft:36}}/>
              </div>
              <div style={{position:'relative'}}>
                <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)',fontSize:14}}>📍</span>
                <input value={location} onChange={e=>setLocation(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()}
                  placeholder="City or Remote" className="input-field" style={{paddingLeft:36}}/>
              </div>
            </div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <button onClick={search} disabled={searching} className="btn-primary">
                {searching ? '⏳' : '🔍'} {searching ? 'Searching...' : 'Search Jobs'}
              </button>
              {userSkills.length > 0 && (
                <button onClick={()=>{setKeywords(userSkills.slice(0,3).join(' '));setTimeout(search,100);}} disabled={searching} className="btn-secondary">
                  ⚡ Match My Skills
                </button>
              )}
            </div>
            {userSkills.length > 0 && (
              <div style={{marginTop:12,display:'flex',flexWrap:'wrap',gap:6,alignItems:'center'}}>
                <span style={{fontSize:12,color:'var(--text-muted)'}}>Your skills:</span>
                {userSkills.slice(0,8).map(s=>(
                  <span key={s} style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'rgba(255,255,255,0.06)',color:'var(--text-secondary)'}}>{s}</span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Results */}
          {searching && jobs.length === 0 && (
            <div style={{textAlign:'center',padding:'60px 0'}}>
              <div style={{fontSize:40,marginBottom:12,animation:'spin 1s linear infinite',display:'inline-block'}}>⏳</div>
              <p style={{color:'var(--text-secondary)'}}>Searching live job listings...</p>
            </div>
          )}

          {hasSearched && !searching && jobs.length === 0 && (
            <div style={{textAlign:'center',padding:'60px 0'}}>
              <div style={{fontSize:48,marginBottom:12}}>🔍</div>
              <p style={{fontWeight:600,marginBottom:6}}>No jobs found</p>
              <p style={{color:'var(--text-secondary)',fontSize:14}}>Try different keywords or location</p>
            </div>
          )}

          {jobs.length > 0 && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}>
              <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:16}}>
                <strong style={{color:'var(--text-primary)'}}>{jobs.length}</strong> of <strong style={{color:'var(--text-primary)'}}>{total.toLocaleString()}</strong> jobs
              </p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:14}} className="jobs-grid-resp">
                <style>{`@media(max-width:600px){.jobs-grid-resp{grid-template-columns:1fr!important}}`}</style>
                {jobs.map((job,i) => (
                  <motion.div key={job.externalId||i} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                    className="glass-card" style={{padding:20,transition:'all 0.2s'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(99,102,241,0.3)'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:8}}>
                      <div>
                        <h3 style={{fontSize:14,fontWeight:600,marginBottom:3,lineHeight:1.3}}>{job.title}</h3>
                        <p style={{fontSize:13,color:'var(--text-secondary)',fontWeight:500}}>🏢 {job.company}</p>
                      </div>
                      {(job.matchScore||0)>0 && (
                        <span style={{fontSize:11,fontWeight:700,padding:'3px 8px',borderRadius:20,background:'var(--accent-dim)',color:'#818cf8',whiteSpace:'nowrap'}}>⭐ {job.matchScore}</span>
                      )}
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:10,fontSize:12,color:'var(--text-muted)'}}>
                      <span>📍 {job.location}</span>
                      {job.isRemote && <span style={{color:'var(--success)'}}>🌐 Remote</span>}
                      {job.salaryMin && <span>💰 ${Math.round(job.salaryMin/1000)}k{job.salaryMax?`–$${Math.round(job.salaryMax/1000)}k`:''}</span>}
                    </div>
                    <p style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.5,marginBottom:14,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                      {job.description?.substring(0,140)}...
                    </p>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                      <button onClick={()=>handleAutoApply(job)} disabled={applying===job.externalId} className="btn-primary" style={{padding:'7px 12px',fontSize:12}}>
                        {applying===job.externalId?'⏳ Applying...':'⚡ Auto Apply'}
                      </button>
                      <button onClick={()=>logApplied(job)} className="btn-secondary" style={{padding:'7px 12px',fontSize:12}}>Log Applied</button>
                      {job.applyUrl && (
                        <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{padding:'7px 12px',fontSize:12,textDecoration:'none'}}>View ↗</a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
