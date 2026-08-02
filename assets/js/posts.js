window.BlogPosts = (function () {
  'use strict';

  var posts = [];

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

  function init() {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 8000);

    return fetch('/assets/data/posts.json', { signal: controller.signal })
      .then(function (response) {
        clearTimeout(timer);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        posts = data.posts || [];
        return posts;
      })
      .catch(function (err) {
        posts = [];
        return posts;
      });
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
    return posts.filter(function (p) { return p.tags.indexOf(tag) !== -1; });
  }

  function renderPostCard(post) {
    return '<article class="post-card">' +
      '<img src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.alt) + '" width="600" height="338" loading="lazy">' +
      '<div class="post-card-body">' +
      '<h3>' + escapeHtml(post.title) + '</h3>' +
      '<time datetime="' + escapeHtml(post.date) + '">' + escapeHtml(post.date) + '</time>' +
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
      '<time datetime="' + escapeHtml(post.date) + '">' + escapeHtml(post.date) + '</time>' +
      '</div>' +
      '<div class="post-content">' + renderMarkdown(post.content) + '</div>' +
      '</article>';
  }

  return {
    init: init,
    getPost: getPost,
    getPosts: getPosts,
    getLatestPosts: getLatestPosts,
    getPostsByTag: getPostsByTag,
    renderPostCard: renderPostCard,
    renderPost: renderPost
  };
})();
