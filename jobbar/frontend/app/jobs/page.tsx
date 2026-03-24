'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { jobsApi, resumeApi, applicationsApi } from '@/lib/api';
import { Job } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

export default function JobsPage() {
  const searchParams = useSearchParams();
  const [keywords, setKeywords] = useState(searchParams.get('q')||'');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [applying, setApplying] = useState<string|null>(null);

  useEffect(()=>{
    resumeApi.getAll().then(r=>{
      const a=r.data.resumes?.find((x:any)=>x.is_active);
      if(a?.parsed_skills) setUserSkills(a.parsed_skills);
    }).catch(()=>{});
    if(searchParams.get('q')) search(searchParams.get('q')||'');
  },[]);

  const search = async (kw=keywords) => {
    if(!kw.trim()&&!location.trim()){toast.error('Enter keywords or location');return;}
    setLoading(true);setSearched(true);
    try{
      const r=await jobsApi.search({keywords:kw,location,page:1,skills:userSkills.slice(0,10).join(',')});
      setJobs(r.data.jobs||[]);setTotal(r.data.total||0);
    }catch(e:any){toast.error(e.response?.data?.error||'Search failed');}
    finally{setLoading(false);}
  };

  const autoApply = async (job:Job) => {
    if(!job.applyUrl){toast.error('No apply URL');return;}
    setApplying(job.externalId);
    try{await applicationsApi.autoApply(job);toast.success('Auto-apply initiated! ⚡');}
    catch(e:any){toast.error(e.response?.data?.error||'Failed');}
    finally{setApplying(null);}
  };

  const logApply = async (job:Job) => {
    try{
      await applicationsApi.create({company:job.company,role:job.title,location:job.location,applyUrl:job.applyUrl||''});
      toast.success('Application logged! ✓');
    }catch{toast.error('Failed to log');}
  };

  const firstLetter = (s:string) => s?.charAt(0)?.toUpperCase()||'J';

  return (
    <AppShell>
      <div className="page active">
        <div className="page-header">
          <div>
            <h1 className="page-title">Job Feed</h1>
            <p className="page-subtitle">Real-time jobs matched to your profile · Updated every hour</p>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn-secondary" onClick={()=>search()}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar glass">
          <div className="filter-group" style={{flex:2,minWidth:180}}>
            <label>Keywords</label>
            <input value={keywords} onChange={e=>setKeywords(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&search()}
              placeholder="Job title, skills, company..." className="form-input" style={{padding:'8px 10px'}}/>
          </div>
          <div className="filter-group" style={{flex:1}}>
            <label>Location</label>
            <input value={location} onChange={e=>setLocation(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&search()}
              placeholder="City or Remote" className="form-input" style={{padding:'8px 10px'}}/>
          </div>
          <div className="filter-group">
            <label>Work Mode</label>
            <select className="filter-select" onChange={e=>setLocation(e.target.value==='remote'?'remote':location)}>
              <option value="">Any Mode</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
          <button className="btn-primary" onClick={()=>search()} style={{alignSelf:'flex-end'}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search
          </button>
          {userSkills.length>0 && (
            <button className="btn-secondary" onClick={()=>{setKeywords(userSkills.slice(0,3).join(' '));search(userSkills.slice(0,3).join(' '));}} style={{alignSelf:'flex-end',borderColor:'var(--accent)',color:'#818cf8'}}>
              ⚡ Match Skills
            </button>
          )}
        </div>

        {/* Results header */}
        {searched && !loading && (
          <div className="results-header">
            <span className="results-count">{jobs.length} of {total.toLocaleString()} jobs found</span>
            <div className="sort-group">
              <label>Sort by:</label>
              <select className="filter-select sm"><option>Best Match</option><option>Most Recent</option><option>Highest Salary</option></select>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"/>
            <p>Searching live job listings...</p>
          </div>
        )}

        {/* Empty */}
        {searched && !loading && jobs.length===0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No jobs found</h3>
            <p>Try different keywords or upload your resume for better matches</p>
          </div>
        )}

        {/* Not searched yet */}
        {!searched && !loading && (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>Search for jobs</h3>
            <p>Enter keywords and location above, or click ⚡ Match Skills to use your resume</p>
          </div>
        )}

        {/* Jobs grid */}
        {jobs.length>0 && (
          <div className="jobs-grid">
            {jobs.map((job,i)=>(
              <div key={job.externalId||i} className="job-card">
                <div className="job-card-header">
                  <div style={{display:'flex',gap:10,alignItems:'flex-start',flex:1}}>
                    <div className="job-company-logo">{firstLetter(job.company)}</div>
                    <div>
                      <div className="job-title">{job.title}</div>
                      <div className="job-company">{job.company}</div>
                    </div>
                  </div>
                  {(job.matchScore||0)>0 && <span className="job-match">⭐ {job.matchScore}</span>}
                </div>
                <div className="job-meta">
                  <span className="job-meta-item">📍 {job.location}</span>
                  {job.isRemote && <span className="job-tag tag-remote">Remote</span>}
                  {job.salaryMin && <span className="job-meta-item">💰 ${Math.round(job.salaryMin/1000)}k{job.salaryMax?`–$${Math.round(job.salaryMax/1000)}k`:''}</span>}
                  {job.jobType && <span className="job-tag tag-type">{job.jobType}</span>}
                </div>
                <p className="job-desc">{job.description?.substring(0,140)}...</p>
                <div className="job-actions">
                  <button className="btn-apply primary" onClick={()=>autoApply(job)} disabled={applying===job.externalId}>
                    {applying===job.externalId?'⏳ Applying...':'⚡ Auto Apply'}
                  </button>
                  <button className="btn-apply secondary" onClick={()=>logApply(job)}>Log Applied</button>
                  {job.applyUrl && <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="btn-apply ghost">View ↗</a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
