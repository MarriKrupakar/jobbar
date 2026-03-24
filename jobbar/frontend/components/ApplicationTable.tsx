'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Application } from '@/lib/supabaseClient';
import { applicationsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  ArrowSquareOut,
  DotsThreeVertical,
  Trash,
  CaretDown,
} from 'phosphor-react';
import clsx from 'clsx';

const STATUS_OPTIONS = ['Applied', 'Under Review', 'Interview', 'Offer', 'Rejected'] as const;

const statusStyle: Record<string, string> = {
  'Applied':      'status-applied',
  'Under Review': 'status-under-review',
  'Interview':    'status-interview',
  'Offer':        'status-offer',
  'Rejected':     'status-rejected',
};

interface Props {
  applications: Application[];
  onRefresh: () => void;
}

export default function ApplicationTable({ applications, onRefresh }: Props) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await applicationsApi.updateStatus(id, status);
      toast.success(`Status updated to ${status}`);
      onRefresh();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application?')) return;
    setDeletingId(id);
    try {
      await applicationsApi.delete(id);
      toast.success('Application deleted');
      onRefresh();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
      setOpenMenuId(null);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <p className="font-display font-semibold text-zinc-600 dark:text-zinc-300 mb-1">No applications yet</p>
        <p className="text-sm text-zinc-400">Apply to jobs and they'll show up here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            {['Company', 'Role', 'Location', 'Applied', 'Status', 'Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {applications.map((app, i) => (
            <motion.tr
              key={app.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              {/* Company */}
              <td className="px-4 py-3">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                  {app.company}
                </span>
              </td>

              {/* Role */}
              <td className="px-4 py-3">
                <span className="text-zinc-600 dark:text-zinc-300 whitespace-nowrap max-w-[200px] truncate block">
                  {app.role}
                </span>
              </td>

              {/* Location */}
              <td className="px-4 py-3">
                <span className="text-zinc-500 whitespace-nowrap text-xs">{app.location || '—'}</span>
              </td>

              {/* Applied date */}
              <td className="px-4 py-3">
                <span className="text-zinc-500 text-xs whitespace-nowrap">
                  {format(new Date(app.applied_at), 'MMM d, yyyy')}
                </span>
              </td>

              {/* Status dropdown */}
              <td className="px-4 py-3">
                <div className="relative inline-block">
                  <select
                    value={app.status}
                    disabled={updatingId === app.id}
                    onChange={e => handleStatusChange(app.id, e.target.value)}
                    className={clsx(
                      'badge border cursor-pointer appearance-none pr-6 pl-2.5 py-1',
                      statusStyle[app.status],
                      'focus:outline-none disabled:opacity-50'
                    )}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                        {s}
                      </option>
                    ))}
                  </select>
                  <CaretDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                </div>
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  {app.apply_url && (
                    <a
                      href={app.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                      title="View job"
                    >
                      <ArrowSquareOut size={15} />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(app.id)}
                    disabled={deletingId === app.id}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-40"
                    title="Delete"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
