'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { resumeApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  CloudArrowUp,
  FilePdf,
  FileDoc,
  CheckCircle,
  WarningCircle,
  Spinner,
} from 'phosphor-react';

interface ParsedResume {
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  skillCount: number;
  educationCount: number;
  experienceCount: number;
}

interface ResumeUploaderProps {
  onUploadSuccess?: (parsed: ParsedResume) => void;
}

export default function ResumeUploader({ onUploadSuccess }: ResumeUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setUploading(true);
    setError(null);
    setParsed(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await resumeApi.upload(formData);
      const data = res.data;
      setParsed(data.parsed);
      toast.success('Resume uploaded and parsed successfully!');
      onUploadSuccess?.(data.parsed);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Upload failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: uploading,
  });

  const reset = () => {
    setUploadedFile(null);
    setParsed(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
          ${isDragActive
            ? 'border-orange-500 bg-orange-500/5'
            : uploading
              ? 'border-zinc-600 bg-zinc-800/30 cursor-not-allowed'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-orange-400 dark:hover:border-orange-500/50 hover:bg-orange-500/5'
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center"
              >
                <Spinner size={28} className="text-orange-500 animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  isDragActive ? 'bg-orange-500/20' : 'bg-zinc-100 dark:bg-zinc-800'
                }`}
              >
                <CloudArrowUp size={28} className={isDragActive ? 'text-orange-500' : 'text-zinc-400'} />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            {uploading ? (
              <p className="text-sm font-medium text-zinc-400">Parsing your resume with AI...</p>
            ) : isDragActive ? (
              <p className="text-sm font-medium text-orange-500">Drop it here!</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Drag & drop your resume here
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  or click to browse — PDF or DOCX, max 5MB
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-1">
              <FilePdf size={14} className="text-red-400" />
              PDF
            </div>
            <div className="w-px h-3 bg-zinc-600" />
            <div className="flex items-center gap-1">
              <FileDoc size={14} className="text-blue-400" />
              DOCX
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <WarningCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-400">Upload Failed</p>
              <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
            </div>
            <button onClick={reset} className="ml-auto text-xs text-red-400 hover:text-red-300">Try again</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success / parsed data */}
      <AnimatePresence>
        {parsed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-5 bg-green-500/5 border border-green-500/20 rounded-2xl space-y-4"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={20} weight="fill" className="text-green-500" />
              <span className="font-semibold text-green-600 dark:text-green-400 text-sm">
                Resume parsed successfully!
              </span>
              <button onClick={reset} className="ml-auto text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                Upload new
              </button>
            </div>

            {/* Parsed info */}
            <div className="grid grid-cols-2 gap-3">
              {parsed.name && (
                <div className="col-span-2">
                  <p className="text-xs text-zinc-400 mb-0.5">Detected Name</p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{parsed.name}</p>
                </div>
              )}
              {parsed.email && (
                <div>
                  <p className="text-xs text-zinc-400 mb-0.5">Email</p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{parsed.email}</p>
                </div>
              )}
              {parsed.phone && (
                <div>
                  <p className="text-xs text-zinc-400 mb-0.5">Phone</p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{parsed.phone}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Skills', value: parsed.skillCount },
                { label: 'Education', value: parsed.educationCount },
                { label: 'Experience', value: parsed.experienceCount },
              ].map(stat => (
                <div key={stat.label} className="text-center p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                  <p className="font-display text-xl font-bold text-orange-500">{stat.value}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Skills */}
            {parsed.skills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Extracted Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.skills.slice(0, 20).map(skill => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-xs rounded-full border border-orange-500/20 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {parsed.skills.length > 20 && (
                    <span className="text-xs text-zinc-400">+{parsed.skills.length - 20} more</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
