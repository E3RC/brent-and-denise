window.BlogPosts = (function () {
  'use strict';

  var posts = [];

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

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function inlineMarkdown(value) {
    return escapeHtml(value)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  function formatContent(content) {
    if (!content) return '';
    if (String(content).trim().charAt(0) === '<') return content;

    return String(content).split(/\n{2,}/).map(function (block) {
      var trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.indexOf('### ') === 0) return '<h3>' + inlineMarkdown(trimmed.slice(4)) + '</h3>';
      if (trimmed.indexOf('## ') === 0) return '<h2>' + inlineMarkdown(trimmed.slice(3)) + '</h2>';
      if (trimmed.indexOf('# ') === 0) return '<h1>' + inlineMarkdown(trimmed.slice(2)) + '</h1>';
      return '<p>' + inlineMarkdown(trimmed).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  function renderPostCard(post) {
    return '<article class="post-card">' +
      '<img src="' + post.image + '" alt="' + post.alt + '" width="600" height="338" loading="lazy">' +
      '<div class="post-card-body">' +
      '<h3>' + post.title + '</h3>' +
      '<time datetime="' + post.date + '">' + post.date + '</time>' +
      '<p>' + post.excerpt + '</p>' +
      '<a href="#post-' + post.slug + '" class="read-more">Read More</a>' +
      '</div></article>';
  }

  function renderPost(post) {
    return '<article class="post-full">' +
      '<img src="' + post.image + '" alt="' + post.alt + '" width="1200" height="675" loading="lazy">' +
      '<h1>' + post.title + '</h1>' +
      '<div class="post-meta">' +
      '<span>' + post.author + '</span> \u00B7 ' +
      '<time datetime="' + post.date + '">' + post.date + '</time>' +
      '</div>' +
      '<div class="post-content">' + formatContent(post.content) + '</div>' +
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
