'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { applicationsApi, resumeApi } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({total:0,applied:0,underReview:0,interview:0,offer:0,rejected:0});
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [hasResume, setHasResume] = useState(true);
  const [recentJobs] = useState([
    {title:'Senior React Developer',company:'Google',location:'Remote',badge:'95% match',logo:'G'},
    {title:'Full Stack Engineer',company:'Stripe',location:'San Francisco',badge:'87% match',logo:'S'},
    {title:'Frontend Developer',company:'Airbnb',location:'Remote',badge:'82% match',logo:'A'},
    {title:'Software Engineer',company:'Netflix',location:'Remote',badge:'79% match',logo:'N'},
  ]);

  useEffect(() => {
    Promise.all([applicationsApi.getStats(), applicationsApi.getAll({limit:5}), resumeApi.getAll()])
      .then(([s,a,r])=>{
        setStats(s.data.stats||{});
        setRecentApps(a.data.applications||[]);
        setHasResume((r.data.resumes||[]).some((x:any)=>x.is_active));
      }).catch(()=>{});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour<12?'morning':hour<18?'afternoon':'evening';

  const pipelineData = [
    {label:'Applied',count:stats.applied||0,max:20,color:'#6366f1'},
    {label:'Review',count:stats.underReview||0,max:20,color:'#f59e0b'},
    {label:'Interview',count:stats.interview||0,max:20,color:'#10b981'},
    {label:'Offer',count:stats.offer||0,max:20,color:'#06b6d4'},
  ];

  const suggestions = [
    {icon:'💡',text:'Add more skills to your profile to improve job matching accuracy by 30%'},
    {icon:'📝',text:'Your resume hasn\'t been updated in 30+ days. Consider refreshing it'},
    {icon:'🎯',text:'3 new companies are actively hiring for your target roles this week'},
  ];

  const statusBadge = (s:string) => {
    const m:any = {'Applied':'status-applied','Under Review':'status-under_review','Interview':'status-interview','Offer':'status-offer','Rejected':'status-rejected'};
    return m[s]||'status-applied';
  };

  return (
    <AppShell>
      <div className="page active" style={{display:'block'}}>
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Good {greeting}, <span className="gradient-text">friend</span> 👋</h1>
            <p className="page-subtitle">Your AI is actively scanning <strong>{247}</strong> jobs matching your profile</p>
          </div>
          <Link href="/jobs"><button className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Browse All Jobs
          </button></Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            {num:247,label:'Jobs Matched',trend:'↑ 18 today',icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,bg:'linear-gradient(135deg,#6366f1,#8b5cf6)'},
            {num:stats.total||0,label:'Applications Sent',trend:'↑ 3 this week',icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,bg:'linear-gradient(135deg,#10b981,#059669)'},
            {num:stats.interview||0,label:'Interviews',trend:'This week',icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,bg:'linear-gradient(135deg,#f59e0b,#d97706)'},
            {num:stats.offer||0,label:'Offers Received',trend:'Congrats!',icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,bg:'linear-gradient(135deg,#ef4444,#dc2626)'},
          ].map((s,i)=>(
            <div key={i} className="stat-card glass animate-in" style={{'--delay':`${0.1*(i+1)}s`} as any}>
              <div className="stat-icon" style={{background:s.bg}}>{s.icon}</div>
              <div className="stat-content">
                <span className="stat-number">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </div>
              <div className="stat-trend">{s.trend}</div>
            </div>
          ))}
        </div>

        {/* Resume CTA */}
        {!hasResume && (
          <div className="resume-upload-cta glass animate-in">
            <div className="cta-content">
              <div className="cta-icon">📄</div>
              <div><h3>Upload your resume to get started</h3><p>Our AI will parse your resume and find matching jobs automatically</p></div>
            </div>
            <Link href="/resume"><button className="btn-primary">Upload Resume →</button></Link>
          </div>
        )}

        {/* Two column layout */}
        <div className="home-grid">
          {/* Live Job Feed */}
          <div className="home-section">
            <div className="section-header">
              <h2>🔴 Live Job Feed</h2>
              <Link href="/jobs" className="see-all">See all →</Link>
            </div>
            <div className="job-feed-mini">
              {recentJobs.map((job,i)=>(
                <Link key={i} href="/jobs" style={{textDecoration:'none'}}>
                  <div className="job-mini-card">
                    <div className="job-mini-logo">{job.logo}</div>
                    <div className="job-mini-info">
                      <div className="job-mini-title">{job.title}</div>
                      <div className="job-mini-company">{job.company} · {job.location}</div>
                    </div>
                    <span className="job-mini-badge">{job.badge}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Aside */}
          <div className="home-aside">
            {/* Pipeline */}
            <div className="aside-card glass">
              <h3>Application Pipeline</h3>
              <div className="pipeline-chart">
                {pipelineData.map(p=>(
                  <div key={p.label} className="pipeline-item">
                    <span className="pipeline-label">{p.label}</span>
                    <div className="pipeline-bar-bg">
                      <div className="pipeline-bar" style={{width:`${Math.min(100,(p.count/Math.max(1,stats.total||1))*100)}%`,background:p.color}}/>
                    </div>
                    <span className="pipeline-count">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="aside-card glass ai-suggestions">
              <div className="ai-badge">✨ AI Insights</div>
              <h3>Smart Suggestions</h3>
              {suggestions.map((s,i)=>(
                <div key={i} className="suggestion-item">
                  <span className="suggestion-icon">{s.icon}</span>
                  <span className="suggestion-text">{s.text}</span>
                </div>
              ))}
            </div>

            {/* Recent applications */}
            {recentApps.length>0 && (
              <div className="aside-card glass">
                <h3>📅 Recent Applications</h3>
                {recentApps.slice(0,3).map(app=>(
                  <div key={app.id} className="upcoming-item">
                    <div className="upcoming-dot" style={{background:'var(--accent)'}}/>
                    <div className="upcoming-info">
                      <div className="upcoming-title">{app.role} @ {app.company}</div>
                      <div className="upcoming-time">{new Date(app.applied_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
                {recentApps.length===0 && <p className="empty-upcoming">No applications yet</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
