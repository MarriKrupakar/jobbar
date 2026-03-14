'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';
import {
  SquaresFour,
  Briefcase,
  FileText,
  ListChecks,
  ChatCircleDots,
  SignOut,
  Sun,
  Moon,
  List,
  X,
  User,
} from 'phosphor-react';
import clsx from 'clsx';

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',    icon: SquaresFour },
  { href: '/jobs',          label: 'Find Jobs',     icon: Briefcase },
  { href: '/resume',        label: 'Resume',        icon: FileText },
  { href: '/applications',  label: 'Applications',  icon: ListChecks },
  { href: '/assistant',     label: 'AI Assistant',  icon: ChatCircleDots },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(true);

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDark(d => !d);
  };

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const active = pathname === item.href;
    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={clsx(
          'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          active
            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
        )}
      >
        <item.icon size={18} weight={active ? 'fill' : 'regular'} />
        {item.label}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-400 rounded-lg flex items-center justify-center font-display font-bold text-white text-sm">
            J
          </div>
          <span className="font-display text-lg font-bold text-white">
            Job<span className="text-orange-400">.Bar</span>
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-zinc-800 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800/50">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <User size={16} className="text-orange-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <SignOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-zinc-950 border-r border-zinc-800 fixed left-0 top-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-amber-400 rounded-lg flex items-center justify-center font-display font-bold text-white text-xs">J</div>
          <span className="font-display font-bold text-white">Job<span className="text-orange-400">.Bar</span></span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 text-zinc-400 hover:text-white">
          <List size={22} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-zinc-950 border-r border-zinc-800 z-50 md:hidden"
            >
              <div className="absolute top-4 right-4">
                <button onClick={() => setMobileOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
