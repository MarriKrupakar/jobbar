'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ApplicationTable from '@/components/ApplicationTable';
import { applicationsApi } from '@/lib/api';
import { Application } from '@/lib/supabaseClient';
import { SpinnerGap, FunnelSimple } from 'phosphor-react';

const STATUSES = ['All', 'Applied', 'Under Review', 'Interview', 'Offer', 'Rejected'];

const statusCounts = (apps: Application[]) => ({
  All: apps.length,
  Applied: apps.filter(a => a.status === 'Applied').length,
  'Under Review': apps.filter(a => a.status === 'Under Review').length,
  Interview: apps.filter(a => a.status === 'Interview').length,
  Offer: apps.filter(a => a.status === 'Offer').length,
  Rejected: apps.filter(a => a.status === 'Rejected').length,
});

export default function ApplicationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading]);

  const fetchApps = async () => {
    setFetching(true);
    try {
      const res = await applicationsApi.getAll({
        status: filter === 'All' ? undefined : filter,
        page,
        limit: 50,
      });
      setApps(res.data.applications || []);
      setTotal(res.data.total || 0);
    } catch {}
    finally { setFetching(false); }
  };

  useEffect(() => {
    if (user) fetchApps();
  }, [user, filter, page]);

  const counts = statusCounts(apps);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <SpinnerGap size={32} className="text-orange-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Navbar />
      <main className="flex-1 md:ml-60 p-6 md:p-8 mt-14 md:mt-0">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-white">Applications</h1>
            <p className="text-zinc-400 mt-1">Track and manage all your job applications.</p>
          </motion.div>

          {/* Filter tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 flex-wrap"
          >
            <FunnelSimple size={16} className="text-zinc-500" />
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => { setFilter(s); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  filter === s
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
                }`}
              >
                {s}
                {counts[s as keyof typeof counts] > 0 && (
                  <span className="ml-1 opacity-70">({counts[s as keyof typeof counts]})</span>
                )}
              </button>
            ))}
          </motion.div>

          {/* Table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            {fetching ? (
              <div className="flex justify-center py-16">
                <SpinnerGap size={32} className="text-orange-500 animate-spin" />
              </div>
            ) : (
              <ApplicationTable applications={apps} onRefresh={fetchApps} />
            )}
          </motion.div>

          {/* Pagination (simple) */}
          {total > 50 && (
            <div className="text-center text-sm text-zinc-400">
              Showing {apps.length} of {total} applications
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
