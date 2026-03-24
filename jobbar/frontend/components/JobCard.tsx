'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Job } from '@/lib/supabaseClient';
import { resumeApi, applicationsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  MapPin,
  Buildings,
  Money,
  Clock,
  ArrowSquareOut,
  Sparkle,
  Rocket,
  Star,
} from 'phosphor-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  index?: number;
}

export default function JobCard({ job, index = 0 }: JobCardProps) {
  const [generating, setGenerating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [generated, setGenerated] = useState<{ resume: string; coverLetter: string } | null>(null);
  const [showDocs, setShowDocs] = useState(false);

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (job.salaryMin && job.salaryMax) return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
    if (job.salaryMax) return `Up to ${fmt(job.salaryMax)}`;
    return `From ${fmt(job.salaryMin!)}`;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await resumeApi.generate({
        jobTitle: job.title,
        jobDescription: job.description,
        company: job.company,
      });
      setGenerated({
        resume: res.data.optimizedResume,
        coverLetter: res.data.coverLetter,
      });
      setShowDocs(true);
      toast.success('Resume & cover letter generated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = async () => {
    if (!job.applyUrl) {
      toast.error('No apply URL available for this job');
      return;
    }
    setApplying(true);
    try {
      const res = await applicationsApi.autoApply(job);
      toast.success(res.data.message || 'Auto-apply initiated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Auto-apply failed');
    } finally {
      setApplying(false);
    }
  };

  const handleManualApply = async () => {
    try {
      await applicationsApi.create({
        company: job.company,
        role: job.title,
        location: job.location,
        applyUrl: job.applyUrl || '',
        generatedResume: generated?.resume,
        coverLetter: generated?.coverLetter,
      });
      toast.success('Application logged!');
    } catch {
      toast.error('Failed to log application');
    }
  };

  const salary = formatSalary();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="card p-5 hover:shadow-xl hover:shadow-black/5 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-base leading-snug group-hover:text-orange-500 transition-colors line-clamp-2">
            {job.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-zinc-500 dark:text-zinc-400 text-sm">
            <Buildings size={14} weight="fill" />
            <span className="font-medium">{job.company}</span>
          </div>
        </div>

        {typeof job.matchScore === 'number' && job.matchScore > 0 && (
          <div className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold border border-orange-500/20">
            <Star size={12} weight="fill" />
            {job.matchScore}
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <MapPin size={12} />
          {job.location}
          {job.isRemote && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 font-medium">Remote</span>
          )}
        </span>

        {salary && (
          <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <Money size={12} />
            {salary}
          </span>
        )}

        {job.postedAt && (
          <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <Clock size={12} />
            {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
        {job.description?.substring(0, 180)}...
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-xs font-semibold rounded-lg border border-orange-500/20 transition-all disabled:opacity-50"
        >
          <Sparkle size={14} weight="fill" />
          {generating ? 'Generating...' : 'AI Resume'}
        </button>

        <button
          onClick={handleApply}
          disabled={applying}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-xs font-semibold rounded-lg border border-blue-500/20 transition-all disabled:opacity-50"
        >
          <Rocket size={14} weight="fill" />
          {applying ? 'Applying...' : 'Auto Apply'}
        </button>

        <button
          onClick={handleManualApply}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-semibold rounded-lg transition-all"
        >
          Log Applied
        </button>

        {job.applyUrl && (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-semibold rounded-lg transition-all ml-auto"
          >
            View <ArrowSquareOut size={12} />
          </a>
        )}
      </div>

      {/* Generated docs preview */}
      {showDocs && generated && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-3"
        >
          <div>
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Generated Resume</h4>
            <pre className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono">
              {generated.resume}
            </pre>
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Cover Letter</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 max-h-40 overflow-y-auto leading-relaxed">
              {generated.coverLetter}
            </p>
          </div>
          <button
            onClick={() => setShowDocs(false)}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            Collapse
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
