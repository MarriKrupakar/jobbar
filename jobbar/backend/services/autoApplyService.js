const { autoApply } = require('../automation/applyBot');
const { generateOptimizedResume } = require('./aiService');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Orchestrate the full auto-application flow:
 * 1. Generate optimized resume PDF
 * 2. Run Playwright bot to fill/submit application
 */
async function runAutoApply({ userProfile, resumeData, job }) {
  // Step 1: Generate optimized resume text
  const optimizedResumeText = await generateOptimizedResume({
    resumeData,
    jobTitle: job.title,
    jobDescription: job.description,
    company: job.company,
  });

  // Step 2: Convert to PDF
  const resumePdfPath = await createResumePDF(optimizedResumeText, userProfile?.full_name || 'resume');

  // Step 3: Run the bot
  const result = await autoApply({
    applyUrl: job.applyUrl,
    userProfile,
    resumePath: resumePdfPath,
  });

  // Cleanup temp PDF
  try { fs.unlinkSync(resumePdfPath); } catch {}

  return {
    ...result,
    optimizedResumeText,
  };
}

/**
 * Create a PDF from resume text content
 */
function createResumePDF(content, candidateName) {
  return new Promise((resolve, reject) => {
    const tmpDir = os.tmpdir();
    const filePath = path.join(tmpDir, `resume_${Date.now()}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(candidateName || 'Resume', { align: 'center' });

    doc.moveDown();

    doc
      .font('Helvetica')
      .fontSize(11)
      .text(content, {
        align: 'left',
        lineGap: 2,
      });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = { runAutoApply, createResumePDF };
