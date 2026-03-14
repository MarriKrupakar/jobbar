import axios from 'axios';
import { supabase } from './supabaseClient';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ─── Jobs ────────────────────────────────────────────────────────────────────
export const jobsApi = {
  search: (params: { keywords?: string; location?: string; page?: number; skills?: string }) =>
    api.get('/api/jobs', { params }),

  searchWithProfile: (params: { location?: string; page?: number }) =>
    api.get('/api/jobs/search-with-profile', { params }),
};

// ─── Resume ──────────────────────────────────────────────────────────────────
export const resumeApi = {
  upload: (formData: FormData) =>
    api.post('/api/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }),

  getAll: () => api.get('/api/resume'),

  generate: (payload: {
    jobTitle: string;
    jobDescription: string;
    company: string;
    jobId?: string;
  }) => api.post('/api/resume/generate', payload),

  exportPdf: (payload: { content: string; filename?: string }) =>
    api.post('/api/resume/export-pdf', payload),
};

// ─── Applications ─────────────────────────────────────────────────────────────
export const applicationsApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/api/applications', { params }),

  create: (payload: {
    company: string;
    role: string;
    location?: string;
    applyUrl?: string;
    generatedResume?: string;
    coverLetter?: string;
    jobListingId?: string;
  }) => api.post('/api/applications', payload),

  updateStatus: (id: string, status: string) =>
    api.patch(`/api/applications/${id}/status`, { status }),

  delete: (id: string) => api.delete(`/api/applications/${id}`),

  autoApply: (job: any) => api.post('/api/applications/auto-apply', { job }, { timeout: 120000 }),

  getStats: () => api.get('/api/applications/stats'),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersApi = {
  getProfile: () => api.get('/api/users/profile'),

  updateProfile: (payload: {
    full_name?: string;
    phone?: string;
    location?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
  }) => api.put('/api/users/profile', payload),

  chat: (messages: Array<{ role: string; content: string }>) =>
    api.post('/api/users/chat', { messages }, { timeout: 30000 }),

  getChatHistory: () => api.get('/api/users/chat/history'),
};

export default api;
