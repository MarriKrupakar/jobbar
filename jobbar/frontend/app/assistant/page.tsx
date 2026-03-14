'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AIAssistant from '@/components/AIAssistant';
import { SpinnerGap, Sparkle } from 'phosphor-react';

const TIPS = [
  { emoji: '📝', title: 'Resume Review', desc: 'Paste your resume for detailed AI feedback' },
  { emoji: '🎤', title: 'Interview Prep', desc: 'Practice common questions by role and company' },
  { emoji: '💰', title: 'Salary Negotiation', desc: 'Get scripts and strategies for negotiating offers' },
  { emoji: '🔍', title: 'Job Search Strategy', desc: 'Personalized tips based on your experience level' },
];

export default function AssistantPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading]);

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
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display text-3xl font-bold text-white">AI Career Coach</h1>
              <span className="badge bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs">
                <Sparkle size={10} weight="fill" /> GPT-4o
              </span>
            </div>
            <p className="text-zinc-400">Your personal AI assistant for job search, resumes, and interviews.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <AIAssistant />
            </motion.div>

            {/* Sidebar tips */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="font-display font-bold text-sm text-zinc-400 uppercase tracking-wider">
                What I can help with
              </h2>
              {TIPS.map(tip => (
                <div key={tip.title} className="card p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{tip.emoji}</span>
                    <div>
                      <p className="font-semibold text-zinc-200 text-sm">{tip.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="card p-4 bg-orange-500/5 border-orange-500/20">
                <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">Pro Tip</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Paste the job description along with your question for highly personalized advice tailored to that specific role.
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}
