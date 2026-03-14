const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Automated job application bot using Playwright
 * Attempts to fill and submit a job application form
 *
 * @param {Object} params
 * @param {string} params.applyUrl - The job application URL
 * @param {Object} params.userProfile - User's profile data
 * @param {string} params.resumePath - Local path to resume PDF
 * @returns {Object} { success, notes, screenshots }
 */
async function autoApply({ applyUrl, userProfile, resumePath }) {
  const logs = [];
  const screenshots = [];
  let browser = null;

  const log = (msg) => {
    logs.push(msg);
    console.log(`[ApplyBot] ${msg}`);
  };

  try {
    log(`Starting application for: ${applyUrl}`);

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();

    // ── Navigate to job page ─────────────────────────────────────────────────
    log('Navigating to job page...');
    await page.goto(applyUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const title = await page.title();
    log(`Page loaded: ${title}`);

    // ── Take initial screenshot ──────────────────────────────────────────────
    const screenshotDir = path.join(__dirname, '../uploads/screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = path.join(screenshotDir, `apply_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    screenshots.push(screenshotPath);

    // ── Detect and fill common form fields ──────────────────────────────────
    const profile = userProfile || {};
    const { full_name, email, phone } = profile;

    const nameFirst = full_name?.split(' ')[0] || '';
    const nameLast = full_name?.split(' ').slice(1).join(' ') || '';

    // Common field selectors
    const fieldMappings = [
      // First name
      { selectors: ['input[name*="first_name"]', 'input[name*="firstName"]', 'input[id*="first_name"]', 'input[placeholder*="First name"]', 'input[aria-label*="First name" i]'], value: nameFirst },
      // Last name
      { selectors: ['input[name*="last_name"]', 'input[name*="lastName"]', 'input[id*="last_name"]', 'input[placeholder*="Last name"]', 'input[aria-label*="Last name" i]'], value: nameLast },
      // Full name
      { selectors: ['input[name*="full_name"]', 'input[name*="fullName"]', 'input[name="name"]', 'input[placeholder*="Full name" i]', 'input[aria-label*="Full name" i]'], value: full_name },
      // Email
      { selectors: ['input[type="email"]', 'input[name*="email"]', 'input[id*="email"]', 'input[placeholder*="email" i]'], value: email },
      // Phone
      { selectors: ['input[type="tel"]', 'input[name*="phone"]', 'input[id*="phone"]', 'input[placeholder*="phone" i]'], value: phone },
    ];

    let fieldsFound = 0;
    for (const mapping of fieldMappings) {
      if (!mapping.value) continue;
      for (const selector of mapping.selectors) {
        try {
          const el = page.locator(selector).first();
          const count = await el.count();
          if (count > 0) {
            await el.fill(mapping.value);
            fieldsFound++;
            log(`Filled field (${selector}) with value`);
            break;
          }
        } catch {}
      }
    }

    log(`Filled ${fieldsFound} form fields`);

    // ── Upload resume if input found ─────────────────────────────────────────
    if (resumePath && fs.existsSync(resumePath)) {
      const fileInputSelectors = [
        'input[type="file"]',
        'input[name*="resume"]',
        'input[name*="cv"]',
        'input[accept*="pdf"]',
        'input[accept*=".pdf"]',
      ];

      for (const selector of fileInputSelectors) {
        try {
          const fileInput = page.locator(selector).first();
          if (await fileInput.count() > 0) {
            await fileInput.setInputFiles(resumePath);
            log(`Resume uploaded via ${selector}`);
            break;
          }
        } catch {}
      }
    }

    // ── Take screenshot after filling ────────────────────────────────────────
    const screenshot2 = path.join(screenshotDir, `apply_filled_${Date.now()}.png`);
    await page.screenshot({ path: screenshot2, fullPage: true });
    screenshots.push(screenshot2);

    log('Form filled. NOTE: Actual submission is disabled to prevent accidental applications.');
    log('To enable submission, uncomment the submit section in applyBot.js');

    /*
     * ── SUBMIT (disabled by default for safety) ──────────────────────────────
     * Uncomment to enable actual submission:
     *
     * const submitSelectors = [
     *   'button[type="submit"]',
     *   'input[type="submit"]',
     *   'button:has-text("Submit")',
     *   'button:has-text("Apply")',
     *   'button:has-text("Send Application")',
     * ];
     *
     * for (const selector of submitSelectors) {
     *   const btn = page.locator(selector).first();
     *   if (await btn.count() > 0) {
     *     await btn.click();
     *     await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
     *     log('Form submitted!');
     *     break;
     *   }
     * }
     */

    return {
      success: true,
      notes: logs.join('\n'),
      screenshots,
      fieldsFound,
      message: `Auto-fill completed. ${fieldsFound} fields populated.`,
    };

  } catch (error) {
    log(`Error: ${error.message}`);
    return {
      success: false,
      notes: logs.join('\n'),
      screenshots,
      error: error.message,
    };
  } finally {
    if (browser) {
      await browser.close();
      log('Browser closed');
    }
  }
}

module.exports = { autoApply };
