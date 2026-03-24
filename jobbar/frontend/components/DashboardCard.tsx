'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import clsx from 'clsx';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: 'orange' | 'blue' | 'purple' | 'green' | 'red' | 'yellow';
  delay?: number;
}

const colorMap = {
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  green:  'bg-green-500/10 text-green-400 border-green-500/20',
  red:    'bg-red-500/10 text-red-400 border-red-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  color = 'orange',
  delay = 0,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
        <div className={clsx('w-10 h-10 rounded-xl border flex items-center justify-center', colorMap[color])}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="font-display text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {value}
        </span>
      </div>
      {subtitle && (
        <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
}
