window.BlogPosts = (function () {
  'use strict';

  var posts = [];
  // idle | loading | ok | error. The blog view uses this to tell "no posts
  // published yet" apart from "the fetch failed", which need different UI.
  var loadState = 'idle';

  function escapeHtml(s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Configure marked once: external links (http/https) get target=_blank and
  // rel=noopener so they open in a new tab safely. Same-origin/relative links
  // and #hash links stay in-tab. Idempotent — safe to call multiple times.
  function setupMarked() {
    if (!window.marked || window.marked.__bnConfigured) return;
    window.marked.use({
      renderer: {
        link: function (token) {
          var href = token.href || '';
          var titlePart = token.title ? ' title="' + token.title + '"' : '';
          var text = this.parser && this.parser.parseInline ? this.parser.parseInline(token.tokens) : '';
          var extra = /^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
          return '<a href="' + href + '"' + titlePart + extra + '>' + text + '</a>';
        }
      }
    });
    window.marked.__bnConfigured = true;
  }

  function renderMarkdown(md) {
    var src = String(md || '');
    if (!window.marked) {
      // Marked failed to load (network/CDN blocked). Show the raw source as a
      // preformatted block so readers at least see the words instead of broken UI.
      return '<pre class="post-fallback">' + escapeHtml(src) + '</pre>';
    }
    setupMarked();
    var html = window.marked.parse(src);
    if (window.DOMPurify) {
      return window.DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
                       'a', 'em', 'strong', 'blockquote', 'code', 'pre', 'br', 'hr',
                       'img', 'figure', 'figcaption'],
        ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'loading', 'width', 'height',
                       'target', 'rel']
      });
    }
    // No sanitizer available — escape so we never render trust-the-author HTML.
    return escapeHtml(html);
  }

  // posts.json is authored in ascending date order (the CMS appends new posts
  // to the end of the list), so nothing downstream can assume array order.
  // Sorting once at load keeps the home page, blog list, tag filter, and
  // prev/next navigation consistent without touching the data file.
  function sortByDateDesc(list) {
    return list.slice().sort(function (a, b) {
      var aDate = String((a && a.date) || '');
      var bDate = String((b && b.date) || '');
      if (aDate === bDate) return 0;
      return aDate < bDate ? 1 : -1;
    });
  }

  // Machine dates stay ISO in `datetime`; readers get "August 20, 2026".
  function formatDate(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''));
    if (!match) return String(value || '');
    var date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    if (isNaN(date.getTime())) return String(value || '');
    try {
      return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
      });
    } catch (e) {
      return String(value || '');
    }
  }

  function init() {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 8000);
    loadState = 'loading';

    return fetch('/assets/data/posts.json', { signal: controller.signal })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        posts = sortByDateDesc(data && Array.isArray(data.posts) ? data.posts : []);
        loadState = 'ok';
        return posts;
      })
      .catch(function () {
        posts = [];
        loadState = 'error';
        return posts;
      })
      .then(function (result) {
        clearTimeout(timer);
        return result;
      });
  }

  function getAll() {
    return posts;
  }

  function getPost(slug) {
    return posts.find(function (p) { return p.slug === slug; }) || null;
  }

  function getPosts(page, perPage) {
    page = page || 1;
    perPage = perPage || 5;
    var start = (page - 1) * perPage;
    return posts.slice(start, start + perPage);
  }

  function getLatestPosts(count) {
    return posts.slice(0, count || 3);
  }

  function getPostsByTag(tag) {
    return posts.filter(function (p) {
      return (p.tags || []).indexOf(tag) !== -1;
    });
  }

  // Unique tags, most used first, then alphabetical. Drives the filter buttons,
  // so it has to be derived from the posts rather than hardcoded.
  function getTags() {
    var counts = {};
    var order = [];
    posts.forEach(function (post) {
      (post.tags || []).forEach(function (tag) {
        if (typeof tag !== 'string' || tag === '') return;
        if (!Object.prototype.hasOwnProperty.call(counts, tag)) {
          counts[tag] = 0;
          order.push(tag);
        }
        counts[tag] += 1;
      });
    });
    return order
      .map(function (tag) { return { tag: tag, count: counts[tag] }; })
      .sort(function (a, b) {
        if (b.count !== a.count) return b.count - a.count;
        return a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0;
      });
  }

  function hasError() {
    return loadState === 'error';
  }

  function renderPostCard(post) {
    return '<article class="post-card">' +
      '<img src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.alt) + '" width="600" height="338" loading="lazy">' +
      '<div class="post-card-body">' +
      '<h3>' + escapeHtml(post.title) + '</h3>' +
      '<time datetime="' + escapeHtml(post.date) + '">' + escapeHtml(formatDate(post.date)) + '</time>' +
      '<p>' + escapeHtml(post.excerpt) + '</p>' +
      '<a href="#post-' + escapeHtml(post.slug) + '" class="read-more">Read More</a>' +
      '</div></article>';
  }

  function renderPost(post) {
    return '<article class="post-full">' +
      '<img src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.alt) + '" width="1200" height="675" loading="lazy">' +
      '<h1>' + escapeHtml(post.title) + '</h1>' +
      '<div class="post-meta">' +
      '<span>' + escapeHtml(post.author) + '</span> \u00B7 ' +
      '<time datetime="' + escapeHtml(post.date) + '">' + escapeHtml(formatDate(post.date)) + '</time>' +
      '</div>' +
      '<div class="post-content">' + renderMarkdown(post.content) + '</div>' +
      '</article>';
  }

  return {
    init: init,
    getAll: getAll,
    getPost: getPost,
    getPosts: getPosts,
    getLatestPosts: getLatestPosts,
    getPostsByTag: getPostsByTag,
    getTags: getTags,
    hasError: hasError,
    escapeHtml: escapeHtml,
    formatDate: formatDate,
    renderPostCard: renderPostCard,
    renderPost: renderPost
  };
})();
