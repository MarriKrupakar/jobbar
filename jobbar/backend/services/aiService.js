const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// gemini-1.5-flash: free tier — 15 req/min, 1M tokens/day, 1500 req/day
function getModel() {
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

/**
 * Generate an optimized resume tailored to a specific job
 */
async function generateOptimizedResume({ resumeData, jobTitle, jobDescription, company }) {
  const model = getModel();

  const prompt = `
You are a professional resume writer. Generate an optimized, ATS-friendly resume in plain text format.

CANDIDATE INFORMATION:
Name: ${resumeData.name || 'Candidate'}
Email: ${resumeData.email || ''}
Phone: ${resumeData.phone || ''}
Skills: ${(resumeData.skills || []).join(', ')}
Education: ${JSON.stringify(resumeData.education || [])}
Experience: ${JSON.stringify(resumeData.experience || [])}

TARGET JOB:
Title: ${jobTitle}
Company: ${company}
Job Description: ${(jobDescription || '').substring(0, 1500)}

INSTRUCTIONS:
- Optimize keywords for the specific job
- Highlight most relevant skills and experience
- Use clear sections: Summary, Skills, Experience, Education
- Keep it concise (1 page equivalent)
- Make it ATS-friendly with standard section headers
- Quantify achievements where possible

Return ONLY the resume content, no extra commentary.
  `.trim();

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Generate a personalized cover letter
 */
async function generateCoverLetter({ resumeData, jobTitle, jobDescription, company }) {
  const model = getModel();

  const prompt = `
You are an expert career coach. Write a compelling, personalized cover letter.

CANDIDATE:
Name: ${resumeData.name || 'Candidate'}
Skills: ${(resumeData.skills || []).slice(0, 10).join(', ')}
Experience summary: ${resumeData.experience?.[0]?.raw?.substring(0, 500) || 'Not provided'}

TARGET ROLE:
Title: ${jobTitle}
Company: ${company}
Job Description: ${(jobDescription || '').substring(0, 1500)}

INSTRUCTIONS:
- Write a 3-paragraph cover letter (opening, body, closing)
- Show genuine enthusiasm for the specific company and role
- Connect candidate skills to job requirements
- Be specific, not generic
- Professional but personable tone
- End with a clear call to action
- Keep it under 300 words

Return ONLY the cover letter text.
  `.trim();

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * AI Chat assistant for job search and career guidance
 */
async function chatAssistant({ messages, userContext }) {
  const model = getModel();

  const systemContext = `
You are Job.Bar AI — a friendly, expert career assistant.
You help users with:
- Job search strategy and tips
- Resume improvement advice
- Cover letter writing
- Interview preparation (common questions, STAR method, salary negotiation)
- Career advice and growth strategies
- LinkedIn optimization

${userContext ? `User context:
Name: ${userContext.name || 'User'}
Skills: ${(userContext.skills || []).join(', ')}` : ''}

Keep responses concise, actionable, and encouraging. Use bullet points for lists.
When giving advice, be specific and practical, not generic.
  `.trim();

  // Build Gemini conversation history (all but the last message)
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  const chat = model.startChat({
    history,
    generationConfig: { maxOutputTokens: 800 },
    systemInstruction: systemContext,
  });

  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}

/**
 * Extract and enhance skills from resume text using AI
 */
async function extractSkillsWithAI(resumeText) {
  const model = getModel();

  const prompt = `
Extract all technical and professional skills from this resume text.
Return ONLY a JSON array of strings. No explanation, no markdown, no code blocks.
Include: programming languages, frameworks, tools, soft skills, certifications.
Example: ["Python", "React", "AWS", "Project Management", "SQL"]

Resume text:
${resumeText.substring(0, 3000)}
  `.trim();

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  try {
    const json = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(json);
  } catch {
    return raw.replace(/[\[\]"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
  }
}

module.exports = {
  generateOptimizedResume,
  generateCoverLetter,
  chatAssistant,
  extractSkillsWithAI,
};
