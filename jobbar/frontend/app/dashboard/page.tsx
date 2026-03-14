'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import DashboardCard from '@/components/DashboardCard';
import { applicationsApi, resumeApi } from '@/lib/api';
import Link from 'next/link';
import {
  Briefcase,
  ClipboardText,
  Trophy,
  Target,
  SpinnerGap,
  ArrowRight,
  FileText,
} from 'phosphor-react';

interface Stats {
  total: number;
  applied: number;
  underReview: number;
  interview: number;
  offer: number;
  rejected: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [hasResume, setHasResume] = useState<boolean | null>(null);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      applicationsApi.getStats(),
      applicationsApi.getAll({ limit: 5 }),
      resumeApi.getAll(),
    ]).then(([statsRes, appsRes, resumeRes]) => {
      setStats(statsRes.data.stats);
      setRecentApps(appsRes.data.applications || []);
      setHasResume((resumeRes.data.resumes || []).some((r: any) => r.is_active));
    }).catch(console.error)
      .finally(() => setDataLoading(false));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <SpinnerGap size={32} className="text-orange-500 animate-spin" />
      </div>
    );
  }

  const name = user.user_metadata?.full_name?.split(' ')[0] || 'there';

  const statusStyle: Record<string, string> = {
    'Applied':      'status-applied',
    'Under Review': 'status-under-review',
    'Interview':    'status-interview',
    'Offer':        'status-offer',
    'Rejected':     'status-rejected',
  };

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Navbar />

      <main className="flex-1 md:ml-60 p-6 md:p-8 mt-14 md:mt-0">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-white">
              Good {getGreeting()}, {name}! 👋
            </h1>
            <p className="text-zinc-400 mt-1">Here's your job search overview.</p>
          </motion.div>

          {/* Resume upload CTA */}
          {hasResume === false && !dataLoading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <FileText size={20} weight="fill" className="text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-200">Upload your resume to get started</p>
                  <p className="text-xs text-orange-300/70">Required for AI-powered job matching and auto-apply.</p>
                </div>
              </div>
              <Link href="/resume" className="btn-primary text-sm whitespace-nowrap flex items-center gap-1.5">
                Upload Now <ArrowRight size={14} />
              </Link>
            </motion.div>
          )}

          {/* Stats */}
          {dataLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-6 h-28 skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard
                title="Total Applications"
                value={stats?.total ?? 0}
                icon={<ClipboardText size={18} weight="fill" />}
                color="orange"
                delay={0}
              />
              <DashboardCard
                title="Interviews"
                value={stats?.interview ?? 0}
                subtitle="Active conversations"
                icon={<Trophy size={18} weight="fill" />}
                color="purple"
                delay={0.05}
              />
              <DashboardCard
                title="Offers"
                value={stats?.offer ?? 0}
                icon={<Target size={18} weight="fill" />}
                color="green"
                delay={0.1}
              />
              <DashboardCard
                title="Under Review"
                value={stats?.underReview ?? 0}
                icon={<Briefcase size={18} weight="fill" />}
                color="blue"
                delay={0.15}
              />
            </div>
          )}

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className="font-display font-bold text-lg text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Search Jobs',        href: '/jobs',         emoji: '🔍', desc: 'Find matching roles' },
                { label: 'Upload Resume',       href: '/resume',       emoji: '📄', desc: 'Parse with AI' },
                { label: 'My Applications',     href: '/applications', emoji: '📊', desc: 'Track status' },
                { label: 'AI Career Coach',     href: '/assistant',    emoji: '🤖', desc: 'Get guidance' },
              ].map((action, i) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="card p-4 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group"
                >
                  <div className="text-2xl mb-2">{action.emoji}</div>
                  <p className="text-sm font-semibold text-zinc-200 group-hover:text-orange-400 transition-colors">{action.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{action.desc}</p>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent applications */}
          {recentApps.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg text-white">Recent Applications</h2>
                <Link href="/applications" className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1">
                  View all <ArrowRight size={13} />
                </Link>
              </div>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800/50 border-b border-zinc-800">
                    <tr>
                      {['Company', 'Role', 'Status', 'Date'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {recentApps.map(app => (
                      <tr key={app.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-zinc-200">{app.company}</td>
                        <td className="px-4 py-3 text-zinc-400 max-w-[180px] truncate">{app.role}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${statusStyle[app.status]}`}>{app.status}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">
                          {new Date(app.applied_at).toLocaleDateString()}
                        </td>
                      </tr>
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
