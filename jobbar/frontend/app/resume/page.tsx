'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { resumeApi } from '@/lib/api';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export default function ResumePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [parsed, setParsed] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => { if (!loading && !user) router.push('/'); }, [user, loading]);

  const fetchResumes = async () => {
    try { const r = await resumeApi.getAll(); setResumes(r.data.resumes||[]); } catch {}
  };

  useEffect(() => { if (user) fetchResumes(); }, [user]);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]; if (!file) return;
    setUploading(true); setParsed(null); setProgress(0);
    const interval = setInterval(() => setProgress(p => Math.min(p+8, 85)), 200);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await resumeApi.upload(formData);
      clearInterval(interval); setProgress(100);
      setParsed(res.data.parsed);
      toast.success('Resume parsed successfully!');
      fetchResumes();
    } catch(e:any) {
      clearInterval(interval);
      toast.error(e.response?.data?.error||'Upload failed');
    } finally { setUploading(false); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept:{'application/pdf':['.pdf'],'application/vnd.openxmlformats-officedocument.wordprocessingml.document':['.docx']},
    maxSize:5*1024*1024, multiple:false, disabled:uploading,
  });

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'var(--bg-primary)'}}><div style={{width:40,height:40,border:'3px solid var(--accent)',borderTopColor:'transparent',borderRadius:'50%'}} className="animate-spin"/></div>;

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg-primary)'}}>
      <Navbar/>
      <main style={{flex:1,marginLeft:0,paddingTop:60}} className="main-pad">
        <style>{`@media(min-width:769px){.main-pad{margin-left:240px!important;padding-top:0!important}}`}</style>
        <div style={{maxWidth:900,margin:'0 auto',padding:'32px 24px'}}>
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} style={{marginBottom:28}}>
            <h1 style={{fontSize:28,fontWeight:700,marginBottom:4}}>Resume Lab</h1>
            <p style={{color:'var(--text-secondary)',fontSize:14}}>Upload, analyze, and AI-tailor your resume for any job</p>
          </motion.div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}} className="resume-grid">
            <style>{`@media(max-width:768px){.resume-grid{grid-template-columns:1fr!important}}`}</style>

            {/* Upload Zone */}
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="glass-card" style={{padding:24}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>📤 Upload Resume</h2>
              <div {...getRootProps()} style={{
                border:`2px dashed ${isDragActive?'var(--accent)':'var(--border)'}`,
                borderRadius:12, padding:'40px 20px', textAlign:'center', cursor:'pointer', transition:'all 0.2s',
                background: isDragActive?'var(--accent-dim)':'rgba(255,255,255,0.02)',
              }}>
                <input {...getInputProps()}/>
                {uploading ? (
                  <div>
                    <div style={{fontSize:36,marginBottom:12,animation:'spin 1s linear infinite',display:'inline-block'}}>⏳</div>
                    <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:12}}>Parsing with AI...</p>
                    <div style={{height:4,background:'rgba(255,255,255,0.1)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{height:'100%',background:'var(--gradient)',borderRadius:2,transition:'width 0.3s',width:`${progress}%`}}/>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{fontSize:40,marginBottom:12}}>📄</div>
                    <p style={{fontWeight:600,marginBottom:4,fontSize:14}}>
                      {isDragActive ? 'Drop it here!' : 'Drag & drop or click to upload'}
                    </p>
                    <p style={{color:'var(--text-muted)',fontSize:12}}>PDF, DOCX · Max 5MB</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Parsed Data */}
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="glass-card" style={{padding:24}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>🤖 AI Parsed Data</h2>
              {parsed ? (
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
                    {[{l:'Skills',v:parsed.skillCount},{l:'Education',v:parsed.educationCount},{l:'Experience',v:parsed.experienceCount}].map(s=>(
                      <div key={s.l} style={{textAlign:'center',padding:12,background:'rgba(99,102,241,0.1)',borderRadius:10,border:'1px solid rgba(99,102,241,0.2)'}}>
                        <div style={{fontSize:24,fontWeight:700,color:'var(--accent)',fontFamily:'Space Grotesk,sans-serif'}}>{s.v}</div>
                        <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  {parsed.name && <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:4}}>👤 <strong style={{color:'var(--text-primary)'}}>{parsed.name}</strong></p>}
                  {parsed.email && <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:4}}>✉️ {parsed.email}</p>}
                  {parsed.skills?.length > 0 && (
                    <div style={{marginTop:12}}>
                      <p style={{fontSize:11,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}}>Extracted Skills</p>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {parsed.skills.slice(0,15).map((s:string)=>(
                          <span key={s} style={{fontSize:11,padding:'3px 8px',borderRadius:20,background:'var(--accent-dim)',color:'#818cf8',border:'1px solid rgba(99,102,241,0.3)'}}>{s}</span>
                        ))}
                        {parsed.skills.length>15 && <span style={{fontSize:11,color:'var(--text-muted)'}}>+{parsed.skills.length-15} more</span>}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{textAlign:'center',padding:'40px 0',color:'var(--text-muted)'}}>
                  <div style={{fontSize:40,marginBottom:12}}>🤖</div>
                  <p style={{fontSize:14}}>Upload your resume to see AI extracted data</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* History */}
          {resumes.length > 0 && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:14}}>Resume History</h2>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {resumes.map(r=>(
                  <div key={r.id} className="glass-card" style={{padding:16,display:'flex',alignItems:'center',gap:14,
                    borderColor: r.is_active?'rgba(99,102,241,0.3)':'var(--border)',
                    background: r.is_active?'rgba(99,102,241,0.05)':'rgba(22,22,35,0.8)'}}>
                    <div style={{width:40,height:40,borderRadius:10,background:r.is_active?'var(--accent-dim)':'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📄</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                        <p style={{fontSize:14,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.file_name}</p>
                        {r.is_active && <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:'var(--accent-dim)',color:'#818cf8',border:'1px solid rgba(99,102,241,0.3)'}}>✓ Active</span>}
                      </div>
                      <p style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>🕐 {new Date(r.created_at).toLocaleDateString()}</p>
                      {r.parsed_skills?.length>0 && (
                        <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:8}}>
                          {r.parsed_skills.slice(0,8).map((s:string)=>(
                            <span key={s} style={{fontSize:10,padding:'2px 6px',borderRadius:20,background:'rgba(255,255,255,0.06)',color:'var(--text-secondary)'}}>{s}</span>
                          ))}
                          {r.parsed_skills.length>8 && <span style={{fontSize:10,color:'var(--text-muted)'}}>+{r.parsed_skills.length-8}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
