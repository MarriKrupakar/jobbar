'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { PaperPlaneTilt, Spinner, Robot, User, ArrowClockwise } from 'phosphor-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  'How do I improve my resume for tech roles?',
  'What are the best ways to prepare for a technical interview?',
  'Help me write a strong LinkedIn summary',
  'How should I negotiate my salary?',
  'What skills should I learn for a data science role?',
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your Job.Bar AI career coach. I can help you with resume tips, interview prep, salary negotiation, and job search strategy. What would you like to work on today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: content.trim() },
    ];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await usersApi.chat(newMessages.map(m => ({ role: m.role, content: m.content })));
      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'AI assistant error');
      // Remove the user message on error
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat reset! How can I help you with your job search today?",
    }]);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-400 rounded-xl flex items-center justify-center">
            <Robot size={18} weight="fill" className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">Job.Bar AI</p>
            <p className="text-xs text-zinc-400">Career Coach · Powered by GPT-4o</p>
          </div>
        </div>
        <button
          onClick={resetChat}
          title="Reset chat"
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
        >
          <ArrowClockwise size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-orange-500 to-amber-400'
                  : 'bg-zinc-200 dark:bg-zinc-700'
              }`}>
                {msg.role === 'assistant'
                  ? <Robot size={14} weight="fill" />
                  : <User size={14} className="text-zinc-600 dark:text-zinc-300" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-orange-500 text-white rounded-tr-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm'
              }`}>
                {msg.content.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
              <Robot size={14} weight="fill" className="text-white" />
            </div>
            <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 0.15, 0.3].map(delay => (
                  <motion.span
                    key={delay}
                    className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts (only when few messages) */}
      {messages.length <= 2 && (
        <div className="px-5 pb-3">
          <p className="text-xs text-zinc-400 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.slice(0, 3).map(p => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                disabled={loading}
                className="text-xs px-3 py-1.5 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20 hover:bg-orange-500/20 transition-all disabled:opacity-50 text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 items-end bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-2 focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about interviews, resumes, salary..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent resize-none text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none px-2 py-1.5 max-h-28 disabled:opacity-50"
            style={{ minHeight: '36px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-9 h-9 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 rounded-xl flex items-center justify-center transition-all"
          >
            {loading
              ? <Spinner size={16} className="text-white animate-spin" />
              : <PaperPlaneTilt size={16} weight="fill" className="text-white" />
            }
          </button>
        </div>
        <p className="text-xs text-zinc-400 mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
