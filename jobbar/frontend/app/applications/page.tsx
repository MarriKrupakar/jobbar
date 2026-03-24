'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { applicationsApi } from '@/lib/api';
import { Application } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

const STATUSES = ['Applied','Under Review','Interview','Offer','Rejected'] as const;

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'table'|'kanban'>('table');

  const fetchApps = async () => {
    setLoading(true);
    try{const r=await applicationsApi.getAll({limit:100});setApps(r.data.applications||[]);}
    catch{}finally{setLoading(false);}
  };

  useEffect(()=>{fetchApps();},[]);

  const updateStatus = async (id:string,status:string) => {
    try{await applicationsApi.updateStatus(id,status);toast.success(`Updated → ${status}`);fetchApps();}
    catch{toast.error('Failed');}
  };

  const deleteApp = async (id:string) => {
    if(!confirm('Delete this application?'))return;
    try{await applicationsApi.delete(id);toast.success('Deleted');fetchApps();}
    catch{toast.error('Failed');}
  };

  const exportCSV = () => {
    const rows = [['Company','Role','Status','Location','Date'],...apps.map(a=>[a.company,a.role,a.status,a.location||'',new Date(a.applied_at).toLocaleDateString()])];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');a.href=url;a.download='applications.csv';a.click();
  };

  const filtered = filter==='all' ? apps : apps.filter(a=>a.status.toLowerCase().replace(' ','_')===filter||a.status.toLowerCase()===filter);
  const counts:any = {all:apps.length,applied:apps.filter(a=>a.status==='Applied').length,'under_review':apps.filter(a=>a.status==='Under Review').length,viewed:apps.filter(a=>a.status==='Under Review').length,shortlisted:0,interview:apps.filter(a=>a.status==='Interview').length,offer:apps.filter(a=>a.status==='Offer').length};
  
  const statusClass = (s:string) => ({
    'Applied':'status-applied','Under Review':'status-under_review',
    'Interview':'status-interview','Offer':'status-offer','Rejected':'status-rejected'
  }[s]||'status-applied');

  const kanbanCols = STATUSES.map(s=>({label:s,items:apps.filter(a=>a.status===s)}));

  return (
    <AppShell>
      <div className="page active">
        <div className="page-header">
          <div><h1 className="page-title">Applications</h1><p className="page-subtitle">Track every application in one place</p></div>
          <button className="btn-primary" onClick={()=>toast('Use Auto Apply on job cards to add applications!')}>+ Add Application</button>
        </div>

        {/* Pipeline stats */}
        <div className="app-pipeline-stats">
          {[
            {key:'all',label:'Total',cls:''},
            {key:'applied',label:'Applied',cls:'applied'},
            {key:'viewed',label:'Reviewed',cls:'viewed'},
            {key:'shortlisted',label:'Shortlisted',cls:'shortlisted'},
            {key:'interview',label:'Interview',cls:'interview'},
            {key:'offer',label:'Offer',cls:'offer'},
          ].map(p=>(
            <div key={p.key} className={`pipeline-stat ${p.cls} ${filter===p.key?'active':''}`} onClick={()=>setFilter(p.key)}>
              <span className="ps-num">{counts[p.key]||0}</span>
              <span className="ps-label">{p.label}</span>
            </div>
          ))}
        </div>

        {/* View toggle */}
        <div className="view-toggle">
          <button className={`view-btn ${view==='table'?'active':''}`} onClick={()=>setView('table')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Table
          </button>
          <button className={`view-btn ${view==='kanban'?'active':''}`} onClick={()=>setView('kanban')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="18"/><rect x="14" y="3" width="7" height="18"/></svg>
            Kanban
          </button>
        </div>

        {/* Export bar */}
        <div className="export-bar">
          <button className="btn-secondary" onClick={exportCSV}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>

        {loading && <div className="loading-state"><div className="loading-spinner"/><p>Loading applications...</p></div>}

        {!loading && filtered.length===0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No applications yet</h3>
            <p>Apply to jobs and they'll show up here</p>
          </div>
        )}

        {/* Table View */}
        {!loading && filtered.length>0 && view==='table' && (
          <div className="table-wrapper glass">
            <table className="applications-table">
              <thead><tr><th>Company</th><th>Role</th><th>Status</th><th>Applied Date</th><th>Link</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(app=>(
                  <tr key={app.id}>
                    <td style={{fontWeight:600}}>{app.company}</td>
                    <td style={{color:'var(--text2)',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{app.role}</td>
                    <td>
                      <select value={app.status} onChange={e=>updateStatus(app.id,e.target.value)}
                        className={`status-badge status-select ${statusClass(app.status)}`}>
                        {STATUSES.map(s=><option key={s} value={s} style={{background:'var(--bg2)',color:'var(--text)'}}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{color:'var(--text2)',fontSize:12}}>{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td>{app.apply_url&&<a href={app.apply_url} target="_blank" rel="noopener noreferrer" style={{color:'var(--accent)',fontSize:13}}>View ↗</a>}</td>
                    <td>
                      <button onClick={()=>deleteApp(app.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text2)',fontSize:16,padding:'2px 6px'}}
                        onMouseEnter={e=>(e.currentTarget.style.color='var(--danger)')}
                        onMouseLeave={e=>(e.currentTarget.style.color='var(--text2)')}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Kanban View */}
        {!loading && view==='kanban' && (
          <div className="kanban-board">
            {kanbanCols.map(col=>(
              <div key={col.label} className="kanban-col">
                <div className="kanban-col-header">
                  <span className={`status-badge ${statusClass(col.label)}`}>{col.label}</span>
                  <span style={{marginLeft:'auto',color:'var(--text2)',fontSize:12}}>{col.items.length}</span>
                </div>
                {col.items.map(app=>(
                  <div key={app.id} className="kanban-card">
                    <div style={{fontWeight:600,marginBottom:4}}>{app.company}</div>
                    <div style={{color:'var(--text2)',fontSize:11,marginBottom:6}}>{app.role}</div>
                    <div style={{fontSize:11,color:'var(--text3)'}}>{new Date(app.applied_at).toLocaleDateString()}</div>
                  </div>
                ))}
                {col.items.length===0 && <div style={{textAlign:'center',padding:'20px 0',color:'var(--text3)',fontSize:12}}>Empty</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
