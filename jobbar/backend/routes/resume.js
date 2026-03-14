const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const { extractText, parseResumeText } = require('../services/resumeParser');
const { extractSkillsWithAI, generateOptimizedResume, generateCoverLetter } = require('../services/aiService');
const { createResumePDF } = require('../services/autoApplyService');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Multer config ─────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only PDF and DOCX files are allowed'));
    }
    cb(null, true);
  },
});

/**
 * POST /api/resume/upload
 * Upload and parse a resume file
 */
router.post('/upload', authenticate, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;

  try {
    // Extract text
    const rawText = await extractText(filePath, req.file.mimetype);

    // Basic parsing
    const parsed = parseResumeText(rawText);

    // AI-enhanced skill extraction
    let aiSkills = [];
    try {
      aiSkills = await extractSkillsWithAI(rawText);
    } catch (aiErr) {
      console.warn('[Resume] AI skill extraction failed, using basic parser:', aiErr.message);
    }

    const finalSkills = aiSkills.length > 0 ? aiSkills : (parsed.skills || []);

    // Save to database
    const { data: resumeRecord, error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: req.user.id,
        file_name: req.file.originalname,
        raw_text: rawText.substring(0, 10000),
        parsed_name: parsed.name,
        parsed_email: parsed.email,
        parsed_phone: parsed.phone,
        parsed_skills: finalSkills,
        parsed_education: parsed.education,
        parsed_experience: parsed.experience,
        is_active: true,
      })
      .select()
      .single();

    if (dbError) throw new Error(dbError.message);

    // Deactivate other resumes for this user
    await supabase
      .from('resumes')
      .update({ is_active: false })
      .eq('user_id', req.user.id)
      .neq('id', resumeRecord.id);

    // Update user profile with parsed info
    const profileUpdate = {};
    if (parsed.name) profileUpdate.full_name = parsed.name;
    if (parsed.phone) profileUpdate.phone = parsed.phone;

    if (Object.keys(profileUpdate).length > 0) {
      await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', req.user.id);
    }

    res.json({
      message: 'Resume uploaded and parsed successfully',
      resume: resumeRecord,
      parsed: {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        skills: finalSkills,
        skillCount: finalSkills.length,
        educationCount: parsed.education?.length || 0,
        experienceCount: parsed.experience?.length || 0,
      },
    });

  } catch (error) {
    // Cleanup file on error
    try { fs.unlinkSync(filePath); } catch {}
    console.error('[POST /api/resume/upload]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/resume
 * Get authenticated user's active resume
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    res.json({ resumes: data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/resume/generate
 * Generate an optimized resume and cover letter for a specific job
 */
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { jobId, jobTitle, jobDescription, company } = req.body;

    if (!jobTitle || !company) {
      return res.status(400).json({ error: 'jobTitle and company are required' });
    }

    // Get user's active resume
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('is_active', true)
      .single();

    if (resumeError || !resume) {
      return res.status(404).json({ error: 'No active resume found. Please upload your resume first.' });
    }

    const resumeData = {
      name: resume.parsed_name,
      email: resume.parsed_email,
      phone: resume.parsed_phone,
      skills: resume.parsed_skills,
      education: resume.parsed_education,
      experience: resume.parsed_experience,
    };

    // Generate both documents in parallel
    const [optimizedResume, coverLetter] = await Promise.all([
      generateOptimizedResume({ resumeData, jobTitle, jobDescription, company }),
      generateCoverLetter({ resumeData, jobTitle, jobDescription, company }),
    ]);

    res.json({
      optimizedResume,
      coverLetter,
      jobTitle,
      company,
    });
  } catch (error) {
    console.error('[POST /api/resume/generate]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/resume/export-pdf
 * Export generated resume as PDF and return download URL
 */
router.post('/export-pdf', authenticate, async (req, res) => {
  try {
    const { content, filename = 'resume' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const pdfPath = await createResumePDF(content, filename);
    const fileName = path.basename(pdfPath);

    // Move to public uploads
    const destDir = path.join(__dirname, '../uploads/generated');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const destPath = path.join(destDir, `${req.user.id}_${Date.now()}.pdf`);
    fs.copyFileSync(pdfPath, destPath);
    fs.unlinkSync(pdfPath);

    const fileUrl = `/uploads/generated/${path.basename(destPath)}`;

    res.json({ url: fileUrl, message: 'PDF generated successfully' });
  } catch (error) {
    console.error('[POST /api/resume/export-pdf]', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
