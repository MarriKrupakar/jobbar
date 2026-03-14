const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { runAutoApply } = require('../services/autoApplyService');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/applications
 * Get all applications for authenticated user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('applications')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('applied_at', { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    res.json({
      applications: data || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('[GET /api/applications]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/applications
 * Manually log a job application
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { company, role, location, applyUrl, generatedResume, coverLetter, jobListingId } = req.body;

    if (!company || !role) {
      return res.status(400).json({ error: 'company and role are required' });
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: req.user.id,
        company,
        role,
        location,
        apply_url: applyUrl,
        generated_resume: generatedResume,
        cover_letter: coverLetter,
        job_listing_id: jobListingId,
        status: 'Applied',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    res.status(201).json({ application: data });
  } catch (error) {
    console.error('[POST /api/applications]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/applications/:id/status
 * Update application status
 */
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Applied', 'Under Review', 'Interview', 'Offer', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .eq('user_id', req.user.id) // Ensure ownership
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) return res.status(404).json({ error: 'Application not found' });

    res.json({ application: data });
  } catch (error) {
    console.error('[PATCH /api/applications/:id/status]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/applications/:id
 * Delete an application
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw new Error(error.message);

    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/applications/auto-apply
 * Run the Playwright bot to automatically apply for a job
 */
router.post('/auto-apply', authenticate, async (req, res) => {
  try {
    const { job } = req.body;

    if (!job?.applyUrl) {
      return res.status(400).json({ error: 'job.applyUrl is required' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    // Get active resume data
    const { data: resume } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('is_active', true)
      .single();

    if (!resume) {
      return res.status(400).json({ error: 'Please upload your resume before auto-applying' });
    }

    const resumeData = {
      name: resume.parsed_name,
      email: resume.parsed_email,
      phone: resume.parsed_phone,
      skills: resume.parsed_skills,
      education: resume.parsed_education,
      experience: resume.parsed_experience,
    };

    // Run auto-apply bot
    const result = await runAutoApply({ userProfile: profile, resumeData, job });

    // Save application record
    const { data: application } = await supabase
      .from('applications')
      .insert({
        user_id: req.user.id,
        company: job.company,
        role: job.title,
        location: job.location,
        apply_url: job.applyUrl,
        status: result.success ? 'Applied' : 'Applied',
        auto_applied: true,
        auto_apply_notes: result.notes,
        generated_resume: result.optimizedResumeText,
      })
      .select()
      .single();

    res.json({
      success: result.success,
      message: result.message,
      application,
      notes: result.notes,
    });
  } catch (error) {
    console.error('[POST /api/applications/auto-apply]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/applications/stats
 * Get application statistics for dashboard
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('status')
      .eq('user_id', req.user.id);

    if (error) throw new Error(error.message);

    const stats = {
      total: data.length,
      applied: 0,
      underReview: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };

    data.forEach(app => {
      switch (app.status) {
        case 'Applied': stats.applied++; break;
        case 'Under Review': stats.underReview++; break;
        case 'Interview': stats.interview++; break;
        case 'Offer': stats.offer++; break;
        case 'Rejected': stats.rejected++; break;
      }
    });

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
