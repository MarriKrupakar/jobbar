import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Single instance - prevents "Multiple GoTrueClient instances" error
let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'jobbar-auth',
      }
    });
  }
  return _supabase;
}

export const supabase = getSupabase();

export type Application = {
  id: string; user_id: string; company: string; role: string;
  location: string | null; apply_url: string | null;
  status: 'Applied' | 'Under Review' | 'Interview' | 'Offer' | 'Rejected';
  generated_resume: string | null; cover_letter: string | null;
  auto_applied: boolean; applied_at: string; updated_at: string;
};
export type Job = {
  externalId: string; source: string; title: string; company: string;
  location: string; description: string; salaryMin: number | null;
  salaryMax: number | null; salaryCurrency: string; applyUrl: string | null;
  isRemote: boolean; postedAt: string | null; jobType: string | null; matchScore?: number;
};
export type Resume = {
  id: string; user_id: string; file_name: string;
  parsed_name: string | null; parsed_email: string | null;
  parsed_phone: string | null; parsed_skills: string[];
  parsed_education: any[]; parsed_experience: any[];
  is_active: boolean; created_at: string;
};
