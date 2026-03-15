'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Already logged in and on login page → go to dashboard
      if (session?.user && window.location.pathname === '/') {
        window.location.href = '/dashboard';
      }
    });

    // Listen for auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth]', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN' && session?.user) {
        // Use hard redirect — guaranteed to work
        window.location.href = '/dashboard';
      }

      if (event === 'SIGNED_OUT') {
        window.location.href = '/';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
