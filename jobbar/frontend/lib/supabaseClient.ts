import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (for use in React components)
export const supabase = createClientComponentClient();

// Server-side / utility client
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  created_at: string;
};

export type Resume = {
  id: string;
  user_id: string;
  file_name: string;
  parsed_name: string | null;
  parsed_email: string | null;
  parsed_phone: string | null;
  parsed_skills: string[];
  parsed_education: any[];
  parsed_experience: any[];
  is_active: boolean;
  created_at: string;
};

export type Application = {
  id: string;
  user_id: string;
  company: string;
  role: string;
  location: string | null;
  apply_url: string | null;
  status: 'Applied' | 'Under Review' | 'Interview' | 'Offer' | 'Rejected';
  generated_resume: string | null;
  cover_letter: string | null;
  auto_applied: boolean;
  applied_at: string;
  updated_at: string;
};

export type Job = {
  externalId: string;
  source: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  applyUrl: string | null;
  isRemote: boolean;
  postedAt: string | null;
  jobType: string | null;
  matchScore?: number;
};
