const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

/**
 * Extract raw text from a PDF or DOCX file
 */
async function extractText(filePath, mimeType) {
  if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filePath.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}

/**
 * Parse structured information from raw resume text
 */
function parseResumeText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const parsed = {
    name: null,
    email: null,
    phone: null,
    skills: [],
    education: [],
    experience: [],
  };

  // ── Email ──────────────────────────────────────────────────────────────────
  const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) parsed.email = emailMatch[0].toLowerCase();

  // ── Phone ──────────────────────────────────────────────────────────────────
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,15}\d)/);
  if (phoneMatch) parsed.phone = phoneMatch[0].replace(/\s+/g, ' ').trim();

  // ── Name: heuristic — first non-empty line that isn't email/phone ──────────
  for (const line of lines.slice(0, 5)) {
    if (!line.includes('@') && !/\d{4,}/.test(line) && line.split(' ').length <= 5 && line.length > 2) {
      parsed.name = line;
      break;
    }
  }

  // ── Skills ─────────────────────────────────────────────────────────────────
  const skillsSection = extractSection(text, ['skills', 'technical skills', 'core competencies', 'technologies']);
  if (skillsSection) {
    parsed.skills = skillsSection
      .split(/[,|•\n\r\t\/]+/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 50);
  }

  // ── Education ──────────────────────────────────────────────────────────────
  const eduSection = extractSection(text, ['education', 'academic background', 'qualifications']);
  if (eduSection) {
    const eduBlocks = eduSection.split(/\n{2,}/);
    parsed.education = eduBlocks.slice(0, 3).map(block => ({
      raw: block.trim().substring(0, 200),
    })).filter(b => b.raw.length > 5);
  }

  // ── Experience ─────────────────────────────────────────────────────────────
  const expSection = extractSection(text, ['experience', 'work experience', 'employment', 'work history']);
  if (expSection) {
    const expBlocks = expSection.split(/\n{2,}/);
    parsed.experience = expBlocks.slice(0, 5).map(block => ({
      raw: block.trim().substring(0, 400),
    })).filter(b => b.raw.length > 10);
  }

  return parsed;
}

/**
 * Extract a section from resume text by heading keywords
 */
function extractSection(text, headings) {
  const allHeadings = [
    'skills', 'technical skills', 'core competencies', 'technologies',
    'education', 'academic', 'qualifications',
    'experience', 'work experience', 'employment', 'work history',
    'projects', 'certifications', 'awards', 'summary', 'objective',
    'languages', 'interests', 'publications', 'references',
  ];

  const lower = text.toLowerCase();

  for (const heading of headings) {
    const idx = lower.indexOf(heading);
    if (idx === -1) continue;

    // Find where this section ends (next major heading)
    let end = text.length;
    for (const nextHeading of allHeadings) {
      if (headings.includes(nextHeading)) continue;
      const nextIdx = lower.indexOf(nextHeading, idx + heading.length + 1);
      if (nextIdx !== -1 && nextIdx < end) {
        end = nextIdx;
      }
    }

    return text.substring(idx + heading.length, end).trim();
  }

  return null;
}

module.exports = { extractText, parseResumeText };
