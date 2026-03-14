'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  BriefcaseIcon,
  SparklesIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: DocumentTextIcon,
    title: 'AI Resume Parsing',
    desc: 'Upload your resume and let AI extract your skills, experience, and education automatically.',
    color: 'from-orange-500 to-amber-400',
  },
  {
    icon: BriefcaseIcon,
    title: 'Real Job Search',
    desc: 'Search thousands of live job listings via Adzuna API, ranked by your skill match.',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    icon: SparklesIcon,
    title: 'AI Resume Generator',
    desc: 'Generate a tailored resume and cover letter for each job with GPT-4o.',
    color: 'from-purple-500 to-violet-400',
  },
  {
    icon: RocketLaunchIcon,
    title: 'Auto Apply',
    desc: 'Our Playwright bot fills and submits job applications for you automatically.',
    color: 'from-rose-500 to-pink-400',
  },
  {
    icon: ChartBarIcon,
    title: 'Application Tracker',
    desc: 'Track every application from Applied → Interview → Offer in one dashboard.',
    color: 'from-green-500 to-emerald-400',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'AI Career Coach',
    desc: 'Chat with your personal AI assistant for job search tips and interview prep.',
    color: 'from-yellow-500 to-orange-400',
  },
];

const stats = [
  { value: '50K+', label: 'Jobs Indexed Daily' },
  { value: '3x', label: 'Faster Applications' },
  { value: '94%', label: 'Skill Match Accuracy' },
  { value: '24/7', label: 'AI Assistance' },
];

export default function LandingPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-orange-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-400 rounded-lg flex items-center justify-center text-sm font-bold font-display">
            J
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Job<span className="text-orange-400">.Bar</span>
          </span>
        </div>
        <button
          onClick={signInWithGoogle}
          className="btn-primary text-sm"
        >
          Get Started Free
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-6">
            <SparklesIcon className="w-4 h-4" />
            Powered by GPT-4o
          </span>

          <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            Land your dream job<br />
            <span className="gradient-text">on autopilot</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your resume, search real job listings, generate AI-tailored applications,
            and auto-apply — all from one powerful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={signInWithGoogle}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-zinc-900 rounded-2xl font-semibold text-base shadow-xl hover:shadow-white/10 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </motion.button>

            <motion.a
              href="#features"
              whileHover={{ scale: 1.03 }}
              className="flex items-center justify-center px-8 py-4 border border-zinc-700 text-zinc-300 rounded-2xl font-semibold text-base hover:bg-zinc-800 transition-all"
            >
              See how it works
            </motion.a>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl font-bold text-orange-400">{stat.value}</div>
              <div className="text-zinc-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything you need to{' '}
            <span className="gradient-text">get hired faster</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            A complete AI-powered job search platform built for modern job seekers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-all group overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feat.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
              <div className={`w-12 h-12 bg-gradient-to-br ${feat.color} rounded-xl flex items-center justify-center mb-4`}>
                <feat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2 text-white">{feat.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-12 bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-3xl"
        >
          <h2 className="font-display text-4xl font-bold mb-4">
            Ready to supercharge your job search?
          </h2>
          <p className="text-zinc-400 mb-8">
            Join thousands of job seekers who land interviews 3x faster with Job.Bar.
          </p>
          <button
            onClick={signInWithGoogle}
            className="btn-primary text-base px-10 py-4 rounded-2xl"
          >
            Start for free — no credit card required
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800 px-6 py-8 text-center text-zinc-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-amber-400 rounded flex items-center justify-center text-xs font-bold font-display">J</div>
          <span className="font-display font-bold text-zinc-300">Job.Bar</span>
        </div>
        <p>© {new Date().getFullYear()} Job.Bar. Built with Next.js, Supabase & OpenAI.</p>
      </footer>
    </div>
  );
}
