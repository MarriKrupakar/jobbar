const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { chatAssistant } = require('../services/aiService');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/users/profile
 * Get authenticated user's profile
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw new Error(error.message);

    res.json({ profile: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { full_name, phone, location, linkedin_url, github_url, portfolio_url } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name, phone, location, linkedin_url, github_url, portfolio_url })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    res.json({ profile: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/users/chat
 * AI assistant chat endpoint
 */
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Get user context for personalized responses
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', req.user.id)
      .single();

    const { data: resume } = await supabase
      .from('resumes')
      .select('parsed_skills')
      .eq('user_id', req.user.id)
      .eq('is_active', true)
      .single();

    const userContext = {
      name: profile?.full_name,
      skills: resume?.parsed_skills || [],
    };

    // Only keep last 20 messages to avoid token limit
    const recentMessages = messages.slice(-20);

    const reply = await chatAssistant({ messages: recentMessages, userContext });

    // Save to chat history
    const messagesToSave = [
      ...messages.slice(-1).map(m => ({
        user_id: req.user.id,
        role: m.role,
        content: m.content,
      })),
      {
        user_id: req.user.id,
        role: 'assistant',
        content: reply,
      },
    ];

    await supabase.from('chat_messages').insert(messagesToSave);

    res.json({ reply });
  } catch (error) {
    console.error('[POST /api/users/chat]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users/chat/history
 * Get chat history for the user
 */
router.get('/chat/history', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw new Error(error.message);

    res.json({ messages: data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
