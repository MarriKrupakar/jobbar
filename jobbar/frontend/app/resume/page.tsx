'use client';
import { useEffect, useState, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import { resumeApi } from '@/lib/api';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export default function ResumePage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsed, setParsed] = useState<any>(null);
  const [filename, setFilename] = useState('');

  const fetchResumes = async () => {
    try{const r=await resumeApi.getAll();setResumes(r.data.resumes||[]);}catch{}
  };
  useEffect(()=>{fetchResumes();},[]);

  const onDrop = useCallback(async (files:File[]) => {
    const file=files[0];if(!file)return;
    setFilename(file.name);setUploading(true);setParsed(null);setProgress(0);
    const interval=setInterval(()=>setProgress(p=>Math.min(p+6,85)),200);
    const fd=new FormData();fd.append('resume',file);
    try{
      const r=await resumeApi.upload(fd);
      clearInterval(interval);setProgress(100);
      setParsed(r.data.parsed);
      toast.success('Resume parsed successfully! ✓');
      fetchResumes();
    }catch(e:any){
      clearInterval(interval);
      toast.error(e.response?.data?.error||'Upload failed');
    }finally{setUploading(false);}
  },[]);

  const {getRootProps,getInputProps,isDragActive}=useDropzone({
    onDrop,accept:{'application/pdf':['.pdf'],'application/vnd.openxmlformats-officedocument.wordprocessingml.document':['.docx']},
    maxSize:5*1024*1024,multiple:false,disabled:uploading,
  });

  return (
    <AppShell>
      <div className="page active">
        <div className="page-header">
          <div><h1 className="page-title">Resume Lab</h1><p className="page-subtitle">Upload, analyze, and AI-tailor your resume for any job</p></div>
        </div>

        <div className="resume-lab-grid">
          {/* Upload */}
          <div className="upload-zone-card glass">
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>📤 Upload Resume</h2>
            <div {...getRootProps()} className={`upload-zone ${isDragActive?'drag-over':''}`}>
              <input {...getInputProps()}/>
              {uploading ? (
                <div>
                  <div className="loading-spinner" style={{margin:'0 auto 12px'}}/>
                  <p className="upload-text">Parsing with AI...</p>
                  <div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`}}/></div>
                  {filename && <div className="upload-file-info"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg><span style={{fontSize:13}}>{filename}</span></div>}
                </div>
              ) : (
                <>
                  <div className="upload-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
                  <p className="upload-text">{isDragActive?'Drop it here!':'Drag & drop or click to upload'}</p>
                  <p className="upload-subtext">PDF, DOCX · Max 5MB</p>
                </>
              )}
            </div>
          </div>

          {/* Parsed */}
          <div className="parsed-data-card glass">
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>🤖 AI Parsed Data</h2>
            {parsed ? (
              <>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
                  {[{l:'Skills',v:parsed.skillCount},{l:'Education',v:parsed.educationCount},{l:'Experience',v:parsed.experienceCount}].map(s=>(
                    <div key={s.l} className="parsed-stat-box">
                      <span className="parsed-stat-num">{s.v}</span>
                      <div className="parsed-stat-label">{s.l}</div>
                    </div>
                  ))}
                </div>
                {parsed.name&&<p style={{fontSize:13,color:'var(--text2)',marginBottom:4}}>👤 <strong style={{color:'var(--text)'}}>{parsed.name}</strong></p>}
                {parsed.email&&<p style={{fontSize:13,color:'var(--text2)',marginBottom:4}}>✉️ {parsed.email}</p>}
                {parsed.phone&&<p style={{fontSize:13,color:'var(--text2)',marginBottom:12}}>📱 {parsed.phone}</p>}
                {parsed.skills?.length>0&&(
                  <div>
                    <p style={{fontSize:11,fontWeight:600,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8}}>Extracted Skills</p>
                    <div>{parsed.skills.slice(0,18).map((s:string)=><span key={s} className="parsed-skill-tag">{s}</span>)}
                    {parsed.skills.length>18&&<span style={{fontSize:12,color:'var(--text3)',marginLeft:4}}>+{parsed.skills.length-18} more</span>}</div>
                  </div>
                )}
              </>
            ) : (
              <div style={{textAlign:'center',padding:'40px 0',color:'var(--text3)'}}>
                <div style={{fontSize:40,marginBottom:12}}>🤖</div>
                <p>Upload your resume to see AI extracted data</p>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        {resumes.length>0&&(
          <div className="section-card glass">
            <div className="section-header">
              <h2 style={{fontSize:16,fontWeight:700}}>📄 Resume History</h2>
              <span style={{fontSize:13,color:'var(--text2)'}}>{resumes.length} resume{resumes.length!==1?'s':''}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:12}}>
              {resumes.map(r=>(
                <div key={r.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'rgba(255,255,255,.04)',border:`1px solid ${r.is_active?'rgba(99,102,241,.4)':'var(--border)'}`,borderRadius:12,transition:'all .2s'}}>
                  <div style={{width:40,height:40,borderRadius:10,background:r.is_active?'var(--accent-dim)':'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📄</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                      <span style={{fontSize:14,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.file_name}</span>
                      {r.is_active&&<span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:'var(--accent-dim)',color:'#818cf8',border:'1px solid rgba(99,102,241,.3)'}}>✓ Active</span>}
                    </div>
                    <div style={{fontSize:12,color:'var(--text3)'}}>🕐 {new Date(r.created_at).toLocaleDateString()}</div>
                    {r.parsed_skills?.length>0&&(
                      <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:6}}>
                        {r.parsed_skills.slice(0,8).map((s:string)=><span key={s} style={{fontSize:10,padding:'2px 6px',borderRadius:20,background:'rgba(255,255,255,.06)',color:'var(--text2)'}}>{s}</span>)}
                        {r.parsed_skills.length>8&&<span style={{fontSize:10,color:'var(--text3)'}}>+{r.parsed_skills.length-8}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
