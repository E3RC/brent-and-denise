#!/usr/bin/env node
// Regenerates feed.xml and sitemap.xml from assets/data/posts.json.
//
// The Decap CMS only writes posts.json, so these two files used to be edited
// by hand after every publish and drifted from the real content. Run this
// after publishing:
//
//   node scripts/generate-feeds.mjs
//
// Exits non-zero and writes nothing if the data has problems, so a broken
// post cannot ship a half-valid feed.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const siteUrl = 'https://brentanddenise.com';
const postsPath = join(root, 'assets/data/posts.json');

const REQUIRED_FIELDS = ['id', 'slug', 'title', 'date', 'image', 'alt', 'excerpt', 'content'];
const problems = [];
const warnings = [];

function fail(message) {
  problems.push(message);
}

function xml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

let data;
try {
  data = JSON.parse(readFileSync(postsPath, 'utf8'));
} catch (error) {
  console.error(`Could not read ${postsPath}: ${error.message}`);
  process.exit(1);
}

const posts = Array.isArray(data.posts) ? data.posts : [];
if (posts.length === 0) {
  fail('posts.json contains no posts.');
}

const seenIds = new Set();
const seenSlugs = new Set();

posts.forEach((post, index) => {
  const label = post && post.slug ? `post "${post.slug}"` : `post #${index + 1}`;

  REQUIRED_FIELDS.forEach((field) => {
    if (typeof post[field] !== 'string' || post[field].trim() === '') {
      fail(`${label}: missing required field "${field}".`);
    }
  });

  if (post.id) {
    if (seenIds.has(post.id)) fail(`${label}: duplicate id "${post.id}".`);
    seenIds.add(post.id);
  }

  if (post.slug) {
    if (seenSlugs.has(post.slug)) fail(`${label}: duplicate slug "${post.slug}".`);
    seenSlugs.add(post.slug);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
      warnings.push(`${label}: slug is not lowercase-hyphenated.`);
    }
  }

  if (post.date && !/^\d{4}-\d{2}-\d{2}$/.test(post.date)) {
    fail(`${label}: date "${post.date}" is not YYYY-MM-DD.`);
  }

  if (post.excerpt && (post.excerpt.length < 50 || post.excerpt.length > 220)) {
    warnings.push(`${label}: excerpt is ${post.excerpt.length} characters (target 50-220).`);
  }

  if (post.image && !/^https?:\/\//i.test(post.image) && !existsSync(join(root, post.image))) {
    fail(`${label}: image not found at "${post.image}".`);
  }

  if (post.tags !== undefined && !Array.isArray(post.tags)) {
    fail(`${label}: tags must be an array.`);
  }

  if (post.content !== undefined && /<[a-z][\s\S]*>/i.test(post.content) && !/[#*`>]/.test(post.content)) {
    warnings.push(`${label}: content looks like HTML; the site renders Markdown.`);
  }
});

if (problems.length > 0) {
  console.error('feed.xml and sitemap.xml were not written:');
  problems.forEach((problem) => console.error('  - ' + problem));
  process.exit(1);
}

// Same ordering the site uses, so the feed and the blog page agree.
const sorted = posts
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
const newestDate = sorted.length > 0 ? sorted[0].date : null;

const entries = sorted
  .map((post) =>
    [
      '  <entry>',
      `    <title>${xml(post.title)}</title>`,
      `    <link href="${siteUrl}/post/${post.slug}"/>`,
      `    <id>${siteUrl}/post/${post.slug}</id>`,
      `    <updated>${post.date}T00:00:00Z</updated>`,
      `    <summary>${xml(post.excerpt)}</summary>`,
      '    <author>',
      '      <name>Brent &amp; Denise</name>',
      '    </author>',
      '  </entry>'
    ].join('\n')
  )
  .join('\n\n');

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Brent &amp; Denise — Retiring Abroad</title>
  <link href="${siteUrl}/"/>
  <updated>${newestDate}T00:00:00Z</updated>
  <id>${siteUrl}/</id>
  <author>
    <name>Brent &amp; Denise</name>
  </author>

${entries}
</feed>
`;

// Posts have real pages (scripts/generate-post-pages.mjs), so the sitemap can
// list URLs a crawler keeps. Section routes stay hash-based and are omitted:
// crawlers strip fragments, so listing them adds nothing.
const routes = [
  { path: '/', changefreq: 'weekly', priority: '1.0', lastmod: newestDate },
  ...sorted.map((post) => ({
    path: `/post/${post.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: post.date
  }))
];

const urlEntries = routes
  .map((route) => {
    const lines = [`    <loc>${siteUrl}${route.path}</loc>`];
    if (route.lastmod) {
      lines.push(`    <lastmod>${route.lastmod}</lastmod>`);
    }
    lines.push(`    <changefreq>${route.changefreq}</changefreq>`);
    lines.push(`    <priority>${route.priority}</priority>`);
    return ['  <url>', ...lines, '  </url>'].join('\n');
  })
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by scripts/generate-feeds.mjs from assets/data/posts.json. Do not edit by hand. -->
<!-- Post pages are real URLs. Section routes are hash-based and intentionally omitted. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

writeFileSync(join(root, 'feed.xml'), feed);
writeFileSync(join(root, 'sitemap.xml'), sitemap);

console.log(`Wrote feed.xml and sitemap.xml for ${sorted.length} post(s); newest is ${newestDate || 'none'}.`);

if (warnings.length > 0) {
  console.warn('\nWarnings (not fatal):');
  warnings.forEach((warning) => console.warn('  - ' + warning));
}
