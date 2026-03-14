const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { searchJobs, rankJobsBySkills } = require('../services/jobSearchService');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/jobs
 * Search jobs with optional skill-based ranking
 *
 * Query params:
 *   keywords   - job title / keywords
 *   location   - city or "remote"
 *   page       - page number (default 1)
 *   skills     - comma-separated skills for ranking (optional)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      keywords = '',
      location = '',
      page = 1,
      skills = '',
      resultsPerPage = 20,
    } = req.query;

    const userSkills = skills
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const result = await searchJobs({
      keywords,
      location,
      page: parseInt(page),
      resultsPerPage: parseInt(resultsPerPage),
    });

    // Rank by user skills if provided
    if (userSkills.length > 0) {
      result.jobs = rankJobsBySkills(result.jobs, userSkills);
    }

    // Cache jobs in DB for reference
    if (result.jobs.length > 0) {
      const toUpsert = result.jobs.map(job => ({
        external_id: job.externalId,
        source: job.source,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description?.substring(0, 5000),
        salary_min: job.salaryMin,
        salary_max: job.salaryMax,
        apply_url: job.applyUrl,
        is_remote: job.isRemote,
        posted_at: job.postedAt,
      }));

      await supabase
        .from('job_listings')
        .upsert(toUpsert, { onConflict: 'external_id', ignoreDuplicates: true })
        .select();
    }

    res.json(result);
  } catch (error) {
    console.error('[GET /api/jobs]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jobs/search-with-profile
 * Search jobs using the authenticated user's parsed skills from their resume
 */
router.get('/search-with-profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { location = '', page = 1 } = req.query;

    // Get user's active resume skills
    const { data: resume } = await supabase
      .from('resumes')
      .select('parsed_skills, parsed_experience')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    const skills = resume?.parsed_skills || [];
    const keywords = skills.slice(0, 3).join(' ');

    const result = await searchJobs({ keywords, location, page: parseInt(page) });
    result.jobs = rankJobsBySkills(result.jobs, skills);

    res.json({ ...result, usedSkills: skills });
  } catch (error) {
    console.error('[GET /api/jobs/search-with-profile]', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
