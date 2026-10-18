#!/usr/bin/env node
// Writes a static page per post at post/<slug>/index.html.
//
// Hash routing gives every post the same share preview: the home page tags.
// These pages carry per-post meta and prerendered Markdown, so crawlers and
// social cards see the real post at a real URL. The SPA keeps working, and
// the hash URL still resolves for anyone who already has one.
//
//   node scripts/generate-post-pages.mjs
//
// Deliberately no dependencies: the Markdown subset below covers what the
// CMS produces (paragraphs, headings, lists, quotes, links, images, inline
// emphasis, code).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const siteUrl = 'https://brentanddenise.com';

const postsPath = join(root, 'assets/data/posts.json');

function escapeHtml(value) {
  return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

function inline(text) {
  let out = escapeHtml(text);
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, src) =>
    `<img src="${src}" alt="${alt}" loading="lazy">`);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) =>
    `<a href="${href}">${label}</a>`);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return out;
}

function markdownToHtml(markdown) {
  const blocks = String(markdown || '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    const lines = block.split('\n');

    const heading = /^(#{1,6})\s+(.*)$/.exec(block);
    if (heading && lines.length === 1) {
      const level = heading[1].length;
      return `<h${level}>${inline(heading[2])}</h${level}>`;
    }

    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      return '<ul>' + lines.map((line) => `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`).join('') + '</ul>';
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      return '<ol>' + lines.map((line) => `<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>`).join('') + '</ol>';
    }

    if (lines.every((line) => /^>\s?/.test(line))) {
      return '<blockquote><p>' + inline(lines.map((line) => line.replace(/^>\s?/, '')).join(' ')) + '</p></blockquote>';
    }

    return `<p>${inline(lines.join(' '))}</p>`;
  }).join('\n');
}

function formatDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''));
  if (!match) return String(value || '');
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (isNaN(date.getTime())) return String(value || '');
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

const data = JSON.parse(readFileSync(postsPath, 'utf8'));
const posts = Array.isArray(data.posts) ? data.posts : [];

const themeBoot = `<script>
    (function () {
      var saved = (document.cookie.match(/(^| )theme=([^;]+)/) || [])[2];
      var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    })();
  </script>`;

const themeToggle = `<button id="theme-toggle" aria-label="Toggle dark mode">
      <svg class="icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
      <svg class="icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
    </button>`;

const toggleScript = `<script>
    (function () {
      var button = document.getElementById('theme-toggle');
      if (!button) return;
      button.addEventListener('click', function () {
        var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        var expires = new Date();
        expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000);
        document.cookie = 'theme=' + next + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax';
      });
    })();
  </script>`;

let written = 0;
for (const post of posts) {
  if (!post || !post.slug) continue;

  const pageUrl = `${siteUrl}/post/${post.slug}`;
  const description = post.excerpt || '';
  const published = `${post.date}T00:00:00Z`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(post.title)} &mdash; Brent &amp; Denise</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${siteUrl}/assets/img/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Brent and Denise, Retiring Abroad">
  <meta property="og:site_name" content="Brent &amp; Denise">
  <meta property="article:published_time" content="${published}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${siteUrl}/assets/img/og-image.png">
  <link rel="alternate" type="application/atom+xml" title="Brent &amp; Denise — Retiring Abroad" href="/feed.xml">
  <link rel="icon" href="/favicon.ico" type="image/svg+xml">
  ${themeBoot}
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <header>
    <div class="container">
      <a href="/#home" class="site-logo">Brent &amp; Denise</a>
      <nav aria-label="Main navigation">
        <a href="/#home">Home</a>
        <a href="/#about">About</a>
        <a href="/#blog">Blog</a>
        <a href="/#contact">Contact</a>
        <a href="/#resources">Resources</a>
      </nav>
      ${themeToggle}
    </div>
  </header>

  <main class="container">
    <a href="/#blog" class="post-back-link">&#8592; Back to Blog</a>

    <article class="post-full">
      <img src="/${escapeHtml(post.image)}" alt="${escapeHtml(post.alt)}" width="1200" height="675">
      <h1>${escapeHtml(post.title)}</h1>
      <div class="post-meta">
        <span>${escapeHtml(post.author)}</span> &middot; <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>
      </div>
      <div class="post-content">
${markdownToHtml(post.content)}
      </div>
    </article>

    <nav class="post-nav" aria-label="Post navigation">
      <a href="/#blog" class="post-nav-link">&#8592; All posts</a>
      <a href="/#contact" class="post-nav-link next">Get in touch &#8594;</a>
    </nav>
  </main>

  <footer>
    <div class="container">
      <p>&copy; 2026 Brent &amp; Denise. All rights reserved.</p>
    </div>
  </footer>
  ${toggleScript}
</body>
</html>
`;

  const targetDir = join(root, 'post', post.slug);
  if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });
  writeFileSync(join(targetDir, 'index.html'), html);
  written += 1;
}

console.log(`Wrote ${written} static post page(s) under post/.`);
