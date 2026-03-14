'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import JobCard from '@/components/JobCard';
import { jobsApi, resumeApi } from '@/lib/api';
import { Job } from '@/lib/supabaseClient';
import { MagnifyingGlass, MapPin, SpinnerGap, Funnel, Lightning } from 'phosphor-react';
import toast from 'react-hot-toast';

export default function JobsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searching, setSearching] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading]);

  // Load user skills on mount
  useEffect(() => {
    if (!user) return;
    resumeApi.getAll().then(res => {
      const active = res.data.resumes?.find((r: any) => r.is_active);
      if (active?.parsed_skills) setUserSkills(active.parsed_skills);
    }).catch(() => {});
  }, [user]);

  const search = async (p = 1) => {
    if (!keywords.trim() && !location.trim()) {
      toast.error('Enter keywords or location to search');
      return;
    }
    setSearching(true);
    setHasSearched(true);
    try {
      const res = await jobsApi.search({
        keywords,
        location,
        page: p,
        skills: userSkills.slice(0, 10).join(','),
      });
      if (p === 1) {
        setJobs(res.data.jobs);
      } else {
        setJobs(prev => [...prev, ...res.data.jobs]);
      }
      setTotal(res.data.total);
      setPage(p);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const searchWithProfile = async () => {
    setSearching(true);
    setHasSearched(true);
    try {
      const res = await jobsApi.searchWithProfile({ location, page: 1 });
      setJobs(res.data.jobs);
      setTotal(res.data.total);
      setPage(1);
      if (res.data.usedSkills?.length) {
        toast.success(`Searching with ${res.data.usedSkills.length} skills from your resume`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <SpinnerGap size={32} className="text-orange-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Navbar />
      <main className="flex-1 md:ml-60 p-6 md:p-8 mt-14 md:mt-0">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-white">Find Jobs</h1>
            <p className="text-zinc-400 mt-1">Search real job listings ranked by your skill match.</p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-5 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && search(1)}
                  placeholder="Job title, skills, company..."
                  className="input-field pl-10"
                />
              </div>
              <div className="relative">
                <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && search(1)}
                  placeholder="City, state, or Remote"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => search(1)}
                disabled={searching}
                className="btn-primary flex items-center gap-2"
              >
                {searching
                  ? <SpinnerGap size={16} className="animate-spin" />
                  : <MagnifyingGlass size={16} />
                }
                Search Jobs
              </button>

              {userSkills.length > 0 && (
                <button
                  onClick={searchWithProfile}
                  disabled={searching}
                  className="flex items-center gap-2 px-4 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                >
                  <Lightning size={16} weight="fill" />
                  Match My Skills
                </button>
              )}
            </div>

            {/* User skills preview */}
            {userSkills.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-2">Your skills used for ranking:</p>
                <div className="flex flex-wrap gap-1.5">
                  {userSkills.slice(0, 8).map(s => (
                    <span key={s} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-xs rounded-full">{s}</span>
                  ))}
                  {userSkills.length > 8 && (
                    <span className="text-xs text-zinc-500">+{userSkills.length - 8} more</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Results */}
          {searching && jobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <SpinnerGap size={36} className="text-orange-500 animate-spin" />
              <p className="text-zinc-400 text-sm">Searching live job listings...</p>
            </div>
          )}

          {hasSearched && !searching && jobs.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🔍</div>
              <p className="font-display font-semibold text-zinc-300">No jobs found</p>
              <p className="text-zinc-500 text-sm mt-1">Try different keywords or location</p>
            </div>
          )}

          {jobs.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-zinc-400">
                  <span className="font-semibold text-zinc-200">{jobs.length}</span> of{' '}
                  <span className="font-semibold text-zinc-200">{total.toLocaleString()}</span> jobs
                </p>
                {userSkills.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-orange-400">
                    <Funnel size={12} weight="fill" />
                    Ranked by skill match
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job, i) => (
                  <JobCard key={job.externalId || i} job={job} index={i} />
                ))}
              </div>

              {/* Load more */}
              {jobs.length < total && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => search(page + 1)}
                    disabled={searching}
                    className="btn-secondary flex items-center gap-2 mx-auto"
                  >
                    {searching ? <SpinnerGap size={16} className="animate-spin" /> : null}
                    Load More Jobs
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
