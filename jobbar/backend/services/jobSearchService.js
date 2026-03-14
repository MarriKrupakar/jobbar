const axios = require('axios');

// Jooble API — completely free, just email api@jooble.org for a key
// Returns up to 20 jobs per request, no daily hard limit for reasonable use
const JOOBLE_BASE = 'https://jooble.org/api';
const JOOBLE_KEY = process.env.JOOBLE_API_KEY;

/**
 * Search real jobs from Jooble API (free)
 * @param {Object} params - { keywords, location, page, resultsPerPage }
 */
async function searchJobs({ keywords = '', location = '', page = 1, resultsPerPage = 20 } = {}) {
  if (!JOOBLE_KEY) {
    throw new Error(
      'Jooble API key not configured. Get a free key by emailing api@jooble.org, then set JOOBLE_API_KEY in .env'
    );
  }

  const body = {
    keywords,
    location: location && location.toLowerCase() !== 'remote' ? location : '',
    page,
    resultsOnPage: resultsPerPage,
  };

  // Append "remote" to keywords when user searches remote
  if (location && location.toLowerCase() === 'remote') {
    body.keywords = `${keywords} remote`.trim();
    body.location = '';
  }

  try {
    const response = await axios.post(
      `${JOOBLE_BASE}/${JOOBLE_KEY}`,
      body,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 12000,
      }
    );

    const jobs = (response.data.jobs || []).map(normalizeJoobleJob);
    return {
      jobs,
      total: response.data.totalCount || jobs.length,
      page,
      resultsPerPage,
    };
  } catch (error) {
    const status = error.response?.status;
    const msg = error.response?.data?.message || error.message;
    console.error('[JobSearch] Jooble error:', status, msg);
    throw new Error(`Job search failed: ${msg}`);
  }
}

/**
 * Normalize Jooble job object to our standard format
 */
function normalizeJoobleJob(raw) {
  // Jooble salary comes as a string like "$80,000 - $100,000"
  let salaryMin = null;
  let salaryMax = null;
  if (raw.salary) {
    const nums = raw.salary.replace(/[^0-9,]/g, '').split(',').map(n => parseInt(n.replace(/,/g, '')));
    if (nums.length >= 2) { salaryMin = nums[0]; salaryMax = nums[1]; }
    else if (nums.length === 1 && nums[0]) { salaryMin = nums[0]; }
  }

  return {
    externalId: raw.id || String(Math.random()),
    source: 'jooble',
    title: raw.title || 'Unknown Role',
    company: raw.company || 'Unknown Company',
    location: raw.location || 'Unknown Location',
    description: raw.snippet || '',
    salaryMin,
    salaryMax,
    salaryCurrency: 'USD',
    applyUrl: raw.link || null,
    isRemote: /remote/i.test((raw.title || '') + ' ' + (raw.type || '') + ' ' + (raw.location || '')),
    postedAt: raw.updated || null,
    jobType: raw.type || null,
  };
}

/**
 * Score/rank jobs based on user skills
 * @param {Array} jobs
 * @param {Array} userSkills - array of skill strings
 * @returns {Array} sorted jobs with matchScore
 */
function rankJobsBySkills(jobs, userSkills = []) {
  if (!userSkills.length) return jobs;

  const normalizedSkills = userSkills.map(s => s.toLowerCase().trim());

  return jobs
    .map(job => {
      const haystack = `${job.title} ${job.description}`.toLowerCase();
      let score = 0;

      for (const skill of normalizedSkills) {
        if (haystack.includes(skill)) {
          score += 1;
          // Bonus if skill appears in title
          if (job.title.toLowerCase().includes(skill)) {
            score += 2;
          }
        }
      }

      return { ...job, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { searchJobs, rankJobsBySkills };
