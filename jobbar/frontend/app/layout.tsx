import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'job.bar — AI-Powered Job Search',
  description: 'Upload your resume, find matching jobs, and auto-apply with AI.',
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💼</text></svg>" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style:{background:'var(--bg2)',color:'var(--text)',border:'1px solid var(--border)',borderRadius:12,fontFamily:'Inter,sans-serif',fontSize:14},
          success:{iconTheme:{primary:'#10b981',secondary:'#fff'}},
          error:{iconTheme:{primary:'#ef4444',secondary:'#fff'}},
        }}/>
      </body>
    </html>
  );
}
