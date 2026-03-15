'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null, user: null, loading: true,
  signInWithGoogle: async () => {}, signOut: async () => {},
});

export function useAuth() { return useContext(AuthContext); }

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Separate effect for routing — only runs when user/loading changes
  useEffect(() => {
    if (loading) return; // Wait until we know auth state

    const isAuthPage = pathname === '/' || pathname === '/login';
    const isDashboardPage = pathname.startsWith('/dashboard') ||
      pathname.startsWith('/jobs') ||
      pathname.startsWith('/resume') ||
      pathname.startsWith('/applications') ||
      pathname.startsWith('/assistant');

    if (user && isAuthPage) {
      // Logged in but on login page → go to dashboard
      router.push('/dashboard');
    } else if (!user && isDashboardPage) {
      // Not logged in but on protected page → go to login
      router.push('/');
    }
  }, [user, loading, pathname]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
