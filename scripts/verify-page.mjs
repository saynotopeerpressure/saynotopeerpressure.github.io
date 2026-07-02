import { chromium } from '@playwright/test';
import { access, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const baseUrl = process.env.SITE_URL || 'http://127.0.0.1:5173/';
const screenshotDir = new URL('../screenshots/', import.meta.url);

await mkdir(screenshotDir, { recursive: true });

const executablePath = await findExecutable([
  process.env.PLAYWRIGHT_CHROMIUM_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
]);

const browser = await chromium.launch(executablePath ? { executablePath } : undefined);

async function findExecutable(paths) {
  for (const candidate of paths.filter(Boolean)) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Keep looking for a browser that exists on this machine.
    }
  }
  return null;
}

async function verifyViewport(name, viewport) {
  const page = await browser.newPage({ viewport });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas');
  await page.getByRole('heading', { name: 'Cookie' }).waitFor();
  await page.screenshot({
    path: fileURLToPath(new URL(`${name}.png`, screenshotDir)),
    fullPage: true,
  });

  const metrics = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const rect = canvas.getBoundingClientRect();
    const sample = document.createElement('canvas');
    sample.width = 32;
    sample.height = 32;
    const context = sample.getContext('2d', { willReadFrequently: true });
    context.drawImage(canvas, 0, 0, sample.width, sample.height);
    const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
    let nonEmpty = 0;
    let varied = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const alpha = pixels[i + 3];
      const brightness = pixels[i] + pixels[i + 1] + pixels[i + 2];
      if (alpha > 0 && brightness > 12) nonEmpty += 1;
      if (alpha > 0 && brightness > 60 && brightness < 735) varied += 1;
    }

    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      nonEmpty,
      varied,
      title: document.querySelector('h1')?.textContent,
      cards: document.querySelectorAll('article').length,
    };
  });

  if (metrics.width < 320 || metrics.height < 420) {
    throw new Error(`${name}: canvas is too small: ${metrics.width}x${metrics.height}`);
  }

  if (metrics.nonEmpty < 200 || metrics.varied < 120) {
    throw new Error(`${name}: canvas looks blank: ${JSON.stringify(metrics)}`);
  }

  if (metrics.title !== 'Cookie' || metrics.cards < 8) {
    throw new Error(`${name}: content check failed: ${JSON.stringify(metrics)}`);
  }

  await page.close();
  return metrics;
}

const results = [
  await verifyViewport('desktop', { width: 1440, height: 1000 }),
  await verifyViewport('mobile', { width: 390, height: 844 }),
];

await browser.close();
console.log(JSON.stringify({ baseUrl, results }, null, 2));
