'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ResumeUploader from '@/components/ResumeUploader';
import { resumeApi } from '@/lib/api';
import { Resume } from '@/lib/supabaseClient';
import { SpinnerGap, FileText, CheckCircle, Clock } from 'phosphor-react';
import { format } from 'date-fns';

export default function ResumePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading]);

  const fetchResumes = async () => {
    try {
      const res = await resumeApi.getAll();
      setResumes(res.data.resumes || []);
    } catch {}
    finally { setFetching(false); }
  };

  useEffect(() => {
    if (user) fetchResumes();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <SpinnerGap size={32} className="text-orange-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Navbar />
      <main className="flex-1 md:ml-60 p-6 md:p-8 mt-14 md:mt-0">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-white">Resume</h1>
            <p className="text-zinc-400 mt-1">Upload your resume and let AI extract your skills and experience.</p>
          </motion.div>

          {/* Uploader */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h2 className="font-display font-bold text-lg text-white mb-4">Upload New Resume</h2>
            <ResumeUploader onUploadSuccess={() => fetchResumes()} />
          </motion.div>

          {/* Resume history */}
          {!fetching && resumes.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h2 className="font-display font-bold text-lg text-white mb-4">Resume History</h2>
              <div className="space-y-3">
                {resumes.map(r => (
                  <div
                    key={r.id}
                    className={`card p-5 flex items-start gap-4 ${r.is_active ? 'border-orange-500/30 bg-orange-500/5' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.is_active ? 'bg-orange-500/20' : 'bg-zinc-800'}`}>
                      <FileText size={20} weight="fill" className={r.is_active ? 'text-orange-400' : 'text-zinc-500'} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-zinc-200 text-sm">{r.file_name}</p>
                        {r.is_active && (
                          <span className="badge bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs">
                            <CheckCircle size={10} weight="fill" /> Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                        <Clock size={12} />
                        {format(new Date(r.created_at), 'MMM d, yyyy')}
                      </div>

                      {r.parsed_skills && r.parsed_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {r.parsed_skills.slice(0, 10).map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                          {r.parsed_skills.length > 10 && (
                            <span className="text-xs text-zinc-500">+{r.parsed_skills.length - 10} more</span>
                          )}
                        </div>
                      )}

                      <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                        {r.parsed_name && <span>Name: <span className="text-zinc-300">{r.parsed_name}</span></span>}
                        {r.parsed_email && <span>Email: <span className="text-zinc-300">{r.parsed_email}</span></span>}
                      </div>
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
