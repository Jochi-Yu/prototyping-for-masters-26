import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { students } from '../src/students.js';
import { projects, projectTypes } from '../src/projects.js';
import { templateSlugs, reviewedExclusions } from './project-audit-exclusions.js';

// Report-only: classification still needs a person to inspect each rendered page.
const names = process.argv.slice(2);
const unknown = names.filter((name) => !students.some((student) => student.name === name));
if (unknown.length) {
  console.error(`Unknown student: ${unknown.join(', ')}`);
  process.exit(2);
}
const roster = students.filter(({ name, url }) => url && (!names.length || names.includes(name)));

const normalize = (href) => {
  const url = new URL(href);
  url.hash = '';
  url.search = '';
  url.pathname = url.pathname.replace(/\/index\.html?$/i, '/').replace(/(.)\/+$/, '$1');
  return url.href.replace(/\/$/, '');
};
const slugOf = (href) => new URL(href).pathname.replace(/\/index\.html?$/i, '').replace(/\/+$/, '').split('/').pop() || '';
const typeTitle = Object.fromEntries(projectTypes.map(({ id, title }) => [id, title]));

// Slugs used by two or more students are likely assignment routes worth probing directly.
const slugCounts = new Map();
for (const { path } of projects) {
  if (!path.startsWith('/prototypes/')) continue;
  const slug = path.split('/').pop();
  slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
}
const probeSlugs = [...slugCounts].filter(([, count]) => count >= 2).map(([slug]) => slug).sort();

// Social, font, and hosting links that appear on portfolios but are never projects.
const ignoredHosts = /(^|\.)(github\.com|linkedin\.com|instagram\.com|x\.com|twitter\.com|behance\.net|dribbble\.com|youtube\.com|vimeo\.com|google(apis)?\.com|gstatic\.com|vercel\.com|nextjs\.org|notion\.so|figma\.com|medium\.com|tiktok\.com|cursor\.com|pixijs\.com|openweathermap\.org|sva\.edu)$/i;
const assetPath = /\.(css|js|mjs|json|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|mp3|mp4|webm|pdf|txt|xml)$/i;

const notFoundText = /^\s*404\b|page (could not|cannot) be found|page not found|this page (doesn.t|does not) exist/i;

async function inspect(context, url) {
  const page = await context.newPage();
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
    const status = response?.status() ?? null;
    const readText = async () => (await page.locator('body').innerText({ timeout: 5000 }).catch(() => '')).trim();
    let text = await readText();
    // Some client-rendered projects hydrate well after network idle.
    if (!text) {
      await page.waitForTimeout(5000);
      text = await readText();
    }
    const heading = (await page.locator('h1').first().innerText({ timeout: 1000 }).catch(() => '')).trim().split('\n')[0];
    const title = heading || (await page.title().catch(() => '')).trim();
    const finalUrl = page.url();
    const softNotFound = text.length < 600 && notFoundText.test(`${title}\n${text}`);
    // Canvas-only prototypes legitimately render without any body text.
    const hasMedia = text.length > 0 || await page.locator('canvas, svg, img, video, iframe').count() > 0;
    const ok = status !== null && status < 400 && !softNotFound && hasMedia;
    return { url, finalUrl, status, title, ok, ...(ok ? {} : { reason: status >= 400 ? `HTTP ${status}` : softNotFound ? 'Not-found page' : 'Empty page' }) };
  } catch (error) {
    return { url, finalUrl: url, status: null, title: '', ok: false, reason: error.message.split('\n')[0] };
  } finally {
    await page.close();
  }
}

async function discover(context, student) {
  const page = await context.newPage();
  const scripts = new Set();
  page.on('response', (response) => {
    if (response.request().resourceType() === 'script' && new URL(response.url()).origin === new URL(student.url).origin) {
      scripts.add(response);
    }
  });
  try {
    const response = await page.goto(student.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);
    // Scroll to trigger lazily rendered project grids.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    const links = await page.evaluate(() => [
      ...[...document.querySelectorAll('a[href]')].map((a) => [a.href, a.innerText]),
      ...[...document.querySelectorAll('iframe[src]')].map((frame) => [frame.src, frame.title]),
      ...[...document.querySelectorAll('[data-href], [data-url]')].map((el) => [new URL(el.dataset.href || el.dataset.url, location.href).href, el.innerText]),
    ]);
    const hrefs = links.map(([href]) => href);
    const labels = Object.fromEntries(links.map(([href, text]) => [href, text.trim().split('\n').find((line) => line.trim()) || '']).filter(([, text]) => text));
    // Client-side routers often keep project routes only in their bundles.
    const bundled = [];
    for (const script of scripts) {
      const source = await script.text().catch(() => '');
      for (const [route] of source.matchAll(/\/prototypes\/[a-z0-9][a-z0-9-]*/gi)) bundled.push(new URL(route, student.url).href);
    }
    return { ok: true, hrefs, labels, bundled };
  } catch (error) {
    return { ok: false, reason: error.message.split('\n')[0], hrefs: [], labels: {}, bundled: [] };
  } finally {
    await page.close();
  }
}

const isCandidate = (href, student) => {
  let url;
  try { url = new URL(href); } catch { return false; }
  if (!/^https?:$/.test(url.protocol) || assetPath.test(url.pathname) || ignoredHosts.test(url.hostname)) return false;
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/assets/')) return false;
  if (url.origin !== new URL(student.url).origin) return true;
  return url.pathname !== '/' && normalize(url.href) !== normalize(student.url);
};

const browser = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
const queue = [...roster];
const report = [];
try {
  await Promise.all(Array.from({ length: 3 }, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    for (let student; (student = queue.shift());) {
      const curated = projects
        .filter((project) => project.student === student.name)
        .map((project) => ({ ...project, url: normalize(new URL(project.path, student.url).href) }));
      const curatedUrls = new Set(curated.map(({ url }) => url));
      const excluded = new Set(reviewedExclusions
        .filter((exclusion) => exclusion.student === student.name)
        .map((exclusion) => normalize(new URL(exclusion.url, student.url).href)));

      const home = await discover(context, student);
      const linked = new Set([...home.hrefs, ...home.bundled].filter((href) => isCandidate(href, student)).map(normalize));
      const labels = Object.fromEntries(Object.entries(home.labels).map(([href, text]) => [normalize(href), text]));
      const probed = new Set(probeSlugs.map((slug) => normalize(new URL(`/prototypes/${slug}`, student.url).href)));

      // Cheap status checks keep probing fast; only reachable probes are opened in the browser.
      const reachableProbes = [];
      for (const url of probed) {
        if (linked.has(url) || curatedUrls.has(url)) continue;
        const status = await fetch(url, { redirect: 'follow' }).then((response) => response.status, () => null);
        if (status && status < 400) reachableProbes.push(url);
      }

      const candidates = [...new Set([...linked, ...reachableProbes])].filter((url) =>
        !curatedUrls.has(url) && !excluded.has(url) && !templateSlugs.includes(slugOf(url)));
      const checkedCurated = [];
      for (const project of curated) checkedCurated.push({ ...project, ...(await inspect(context, project.url)), linked: linked.has(project.url) });
      const checkedCandidates = [];
      for (const url of candidates) checkedCandidates.push({ ...(await inspect(context, url)), source: linked.has(url) ? 'homepage' : 'probe' });

      const homeOrigin = new URL(student.url).origin;
      for (const project of checkedCurated) {
        // Routes that redirect back to the homepage are gone, not moved.
        if (project.ok && normalize(project.finalUrl) === normalize(student.url)) Object.assign(project, { ok: false, reason: 'Redirects to homepage' });
      }
      const moved = [];
      for (const project of checkedCurated) {
        const redirected = normalize(project.finalUrl);
        if (project.ok && redirected !== project.url && !curatedUrls.has(redirected)) {
          moved.push({ ...project, to: redirected });
          continue;
        }
        // A curated project whose slug is now linked from the student's own site has probably moved,
        // either off an old deployment or after its route started failing.
        if (project.ok && new URL(project.url).origin === homeOrigin) continue;
        const replacement = checkedCandidates.find((candidate) => candidate.ok && slugOf(candidate.url) === slugOf(project.url)
          && (!project.ok || new URL(candidate.url).origin === homeOrigin));
        if (replacement) moved.push({ ...project, to: replacement.url });
      }
      const movedUrls = new Set(moved.map(({ url }) => url));
      const broken = checkedCurated.filter((project) => !project.ok && !movedUrls.has(project.url));
      const newProjects = checkedCandidates.filter((candidate) => candidate.ok && !moved.some(({ to }) => to === candidate.url));
      const entry = {
        student: student.name,
        homepage: student.url,
        homepageOk: home.ok,
        ...(home.ok ? {} : { homepageError: home.reason }),
        curated: checkedCurated.map(({ title, type, url, ok, status, reason, finalUrl, linked: isLinked }) => ({ title, type, url, ok, status, linked: isLinked, ...(reason ? { reason } : {}), ...(finalUrl !== url ? { finalUrl } : {}) })),
        new: newProjects.map(({ url, title, status, source }) => ({ url, title: labels[url] || title, status, source })),
        broken: broken.map(({ title, type, url, reason }) => ({ title, type, url, reason })),
        moved: moved.map(({ title, type, url, to }) => ({ title, type, from: url, to })),
        unlinked: checkedCurated.filter((project) => project.ok && !project.linked && new URL(project.url).origin === new URL(student.url).origin).map(({ title, url }) => ({ title, url })),
      };
      report.push(entry);
      const summary = [
        home.ok ? null : `homepage unreachable (${home.reason})`,
        entry.new.length ? `${entry.new.length} new` : null,
        entry.broken.length ? `${entry.broken.length} broken` : null,
        entry.moved.length ? `${entry.moved.length} moved` : null,
      ].filter(Boolean);
      console.log(`${summary.length ? '!' : '✓'} ${student.name}: ${summary.join(', ') || `${curated.length} projects OK`}`);
    }
    await context.close();
  }));
} finally {
  await browser.close();
}

report.sort((a, b) => a.student.localeCompare(b.student));
const totals = {
  students: report.length,
  homepagesUnreachable: report.filter((entry) => !entry.homepageOk).length,
  new: report.reduce((sum, entry) => sum + entry.new.length, 0),
  broken: report.reduce((sum, entry) => sum + entry.broken.length, 0),
  moved: report.reduce((sum, entry) => sum + entry.moved.length, 0),
};

const link = (label, url) => `[${(label || url).replace(/[[\]|]/g, '')}](${url})`;
const table = (heading, columns, rows) => rows.length
  ? [`## ${heading}`, '', `| ${columns.join(' | ')} |`, `| ${columns.map(() => '---').join(' | ')} |`, ...rows.map((row) => `| ${row.join(' | ')} |`), '']
  : [`## ${heading}`, '', 'None.', ''];
const markdown = [
  `# Student project audit — ${new Date().toISOString().slice(0, 10)}`,
  '',
  `Checked ${totals.students} student sites. New: ${totals.new}. Broken: ${totals.broken}. Moved: ${totals.moved}. Homepages unreachable: ${totals.homepagesUnreachable}.`,
  '',
  '“New” links are reachable pages not in `src/projects.js`. Open each one before adding it to a collection, or add it to `scripts/project-audit-exclusions.js` if it is not a gallery project.',
  '',
  ...table('New', ['Student', 'Page', 'Found on'], report.flatMap((entry) => entry.new.map((item) => [entry.student, link(item.title, item.url), item.source]))),
  ...table('Broken', ['Student', 'Project', 'Collection', 'Problem'], report.flatMap((entry) => entry.broken.map((item) => [entry.student, link(item.title, item.url), typeTitle[item.type], item.reason]))),
  ...table('Moved', ['Student', 'Project', 'Collection', 'Now at'], report.flatMap((entry) => entry.moved.map((item) => [entry.student, link(item.title, item.from), typeTitle[item.type], item.to]))),
  ...table('Homepage unreachable', ['Student', 'Site', 'Problem'], report.filter((entry) => !entry.homepageOk).map((entry) => [entry.student, entry.homepage, entry.homepageError])),
  ...table('Curated but not linked from homepage', ['Student', 'Project'], report.flatMap((entry) => entry.unlinked.map((item) => [entry.student, link(item.title, item.url)]))),
].join('\n');

const directory = new URL('../output/project-audit/', import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL('report.json', directory), JSON.stringify({ checkedAt: new Date().toISOString(), totals, students: report }, null, 2));
await writeFile(new URL('report.md', directory), `${markdown}\n`);
console.log(`\nNew: ${totals.new}  Broken: ${totals.broken}  Moved: ${totals.moved}  Homepages unreachable: ${totals.homepagesUnreachable}`);
console.log('Report: output/project-audit/report.md');
if (totals.new || totals.broken || totals.moved || totals.homepagesUnreachable) process.exitCode = 1;
