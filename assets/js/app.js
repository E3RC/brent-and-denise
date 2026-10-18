(function () {
  'use strict';

  var PER_PAGE = 6;
  var knownViews = ['home', 'about', 'blog', 'contact', 'resources', 'post'];
  var themeToggle = document.getElementById('theme-toggle');
  var html = document.documentElement;

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function getCurrentTheme() {
    return html.getAttribute('data-theme') || 'light';
  }

  window.__isDark = getCurrentTheme() === 'dark';

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    window.__isDark = theme === 'dark';
    setCookie('theme', theme, 365);
  }

  function toggleTheme() {
    var next = window.__isDark ? 'light' : 'dark';
    setTheme(next);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  var views = {};
  knownViews.forEach(function (name) {
    views[name] = document.getElementById('view-' + name);
  });

  var postsReady = false;
  var pendingRoute = null;
  var blogPage = 1;
  var activeTag = 'all';
  var currentSlug = null;

  function escapeHtml(value) {
    return BlogPosts.escapeHtml(value);
  }

  function parseRoute() {
    var hash = window.location.hash.replace(/^#/, '');
    if (hash.indexOf('post-') === 0) {
      return { view: 'post', slug: hash.slice(5) || null };
    }
    if (knownViews.indexOf(hash) !== -1) {
      return { view: hash, slug: null };
    }
    return { view: 'home', slug: null };
  }

  function showView(viewName) {
    for (var key in views) {
      if (views[key]) {
        views[key].hidden = key !== viewName;
      }
    }

    document.querySelectorAll('nav a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === '#' + viewName || (viewName === 'post' && href === '#blog')) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  // Tags are derived from the loaded posts, so this runs again after every
  // load and after every filter click (to move the active state).
  function renderTagFilters() {
    var container = document.getElementById('tag-filters');
    if (!container) return;

    var tags = postsReady ? BlogPosts.getTags() : [];
    var markup = '<button type="button" class="tag-filter" data-tag="all" data-active="' +
      (activeTag === 'all' ? 'true' : 'false') + '">All</button>';

    tags.forEach(function (entry) {
      markup += '<button type="button" class="tag-filter" data-tag="' + escapeHtml(entry.tag) +
        '" data-active="' + (activeTag === entry.tag ? 'true' : 'false') + '">' +
        escapeHtml(entry.tag) + ' <span class="tag-count">' + entry.count + '</span></button>';
    });

    container.innerHTML = markup;

    Array.prototype.forEach.call(container.querySelectorAll('.tag-filter'), function (button) {
      button.addEventListener('click', function () {
        activeTag = button.getAttribute('data-tag') || 'all';
        blogPage = 1;
        renderTagFilters();
        renderBlog();
      });
    });
  }

  function renderBlog() {
    var container = document.getElementById('posts-container');
    var skeleton = document.getElementById('posts-skeleton');
    var emptyEl = document.getElementById('posts-empty');
    var errorEl = document.getElementById('posts-error');
    var pagination = document.getElementById('posts-pagination');
    var olderLink = document.getElementById('older-posts');
    var newerLink = document.getElementById('newer-posts');

    if (!container) return;

    if (skeleton) skeleton.hidden = false;
    container.innerHTML = '';
    if (emptyEl) emptyEl.hidden = true;
    if (errorEl) errorEl.hidden = true;
    if (pagination) pagination.hidden = true;

    if (BlogPosts.hasError()) {
      if (skeleton) skeleton.hidden = true;
      if (errorEl) errorEl.hidden = false;
      return;
    }

    var list = activeTag === 'all' ? BlogPosts.getAll() : BlogPosts.getPostsByTag(activeTag);
    var totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));

    if (blogPage > totalPages) blogPage = totalPages;
    if (blogPage < 1) blogPage = 1;

    if (skeleton) skeleton.hidden = true;

    if (list.length === 0) {
      if (emptyEl) {
        var message = emptyEl.querySelector('p');
        if (message) {
          message.textContent = activeTag === 'all'
            ? 'No posts yet \u2014 check back soon! In the meantime, follow us on Instagram.'
            : 'No posts tagged "' + activeTag + '" yet.';
        }
        emptyEl.hidden = false;
      }
      return;
    }

    container.innerHTML = list
      .slice((blogPage - 1) * PER_PAGE, blogPage * PER_PAGE)
      .map(function (post) { return BlogPosts.renderPostCard(post); })
      .join('');

    if (pagination && olderLink && newerLink) {
      var hasOlder = blogPage < totalPages;
      var hasNewer = blogPage > 1;

      if (hasOlder || hasNewer) {
        pagination.hidden = false;
        if (hasOlder) {
          olderLink.removeAttribute('aria-disabled');
        } else {
          olderLink.setAttribute('aria-disabled', 'true');
        }
        if (hasNewer) {
          newerLink.removeAttribute('aria-disabled');
        } else {
          newerLink.setAttribute('aria-disabled', 'true');
        }
      }

      olderLink.onclick = function (event) {
        event.preventDefault();
        if (olderLink.getAttribute('aria-disabled') === 'true') return;
        blogPage++;
        renderBlog();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      newerLink.onclick = function (event) {
        event.preventDefault();
        if (newerLink.getAttribute('aria-disabled') === 'true') return;
        blogPage--;
        renderBlog();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }
  }

  // navigator.clipboard needs a secure context; file:// and plain-http
  // deployments do not have one, so keep an execCommand fallback and tell the
  // reader when both fail instead of failing silently.
  function legacyCopy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '-1000px';
    document.body.appendChild(field);
    var copied = false;
    try {
      field.select();
      copied = document.execCommand('copy');
    } catch (e) {
      copied = false;
    }
    document.body.removeChild(field);
    return copied;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject(new Error('Clipboard API unavailable'));
  }

  function showCopyFeedback(button, text, failed) {
    if (!button || !button.parentNode) return;
    var existing = button.parentNode.querySelector('.copy-msg');
    if (existing) existing.remove();
    var message = document.createElement('span');
    message.className = failed ? 'copy-msg copy-msg-error' : 'copy-msg';
    message.textContent = text;
    button.parentNode.insertBefore(message, button.nextSibling);
    setTimeout(function () { message.remove(); }, 2400);
  }

  function renderPost(slug) {
    var container = document.getElementById('post-container');
    var skeleton = document.getElementById('post-skeleton');
    var errorEl = document.getElementById('post-error');
    var postNav = document.getElementById('post-nav');
    var prevLink = document.getElementById('prev-post');
    var nextLink = document.getElementById('next-post');

    if (!container) return;

    if (skeleton) skeleton.hidden = false;
    container.innerHTML = '';
    if (errorEl) errorEl.hidden = true;
    if (postNav) postNav.hidden = true;

    if (BlogPosts.hasError()) {
      if (skeleton) skeleton.hidden = true;
      if (errorEl) errorEl.hidden = false;
      return;
    }

    var post = BlogPosts.getPost(slug);
    if (skeleton) skeleton.hidden = true;

    if (!post) {
      if (errorEl) errorEl.hidden = false;
      return;
    }

    container.innerHTML = BlogPosts.renderPost(post);

    var shareDiv = document.createElement('div');
    shareDiv.className = 'share-buttons';
    var pageUrl = encodeURIComponent(window.location.href);
    var postTitle = encodeURIComponent(post.title);
    shareDiv.innerHTML =
      '<a href="https://x.com/intent/tweet?text=' + postTitle + '&url=' + pageUrl + '" target="_blank" rel="noopener" class="share-btn">Share on X</a>' +
      '<button type="button" class="share-btn" id="copy-link-btn">Copy Link</button>';
    container.appendChild(shareDiv);

    var copyBtn = document.getElementById('copy-link-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var url = window.location.href;
        copyToClipboard(url)
          .catch(function () {
            return legacyCopy(url) ? undefined : Promise.reject(new Error('Copy failed'));
          })
          .then(function () {
            showCopyFeedback(copyBtn, 'Link copied!', false);
          })
          .catch(function () {
            showCopyFeedback(copyBtn, 'Copy failed. Use the address bar.', true);
          });
      });
    }

    var all = BlogPosts.getAll();
    var idx = -1;
    for (var i = 0; i < all.length; i++) {
      if (all[i].slug === slug) { idx = i; break; }
    }

    if (postNav && prevLink && nextLink) {
      if (idx > 0) {
        postNav.hidden = false;
        prevLink.href = '#post-' + all[idx - 1].slug;
        prevLink.innerHTML = '\u2190 ' + escapeHtml(all[idx - 1].title);
      } else {
        prevLink.href = '#blog';
      }

      if (idx !== -1 && idx < all.length - 1) {
        postNav.hidden = false;
        nextLink.href = '#post-' + all[idx + 1].slug;
        nextLink.innerHTML = escapeHtml(all[idx + 1].title) + ' \u2192';
      } else {
        nextLink.href = '#blog';
      }
    }
  }

  function renderHomeLatest() {
    var container = document.getElementById('latest-posts');
    if (!container || !postsReady) return;

    if (BlogPosts.hasError()) return;

    var posts = BlogPosts.getLatestPosts(3);
    if (posts && posts.length > 0) {
      container.innerHTML = posts
        .map(function (post) { return BlogPosts.renderPostCard(post); })
        .join('');
    }
  }

  function renderCurrentView(parsed) {
    if (parsed.view === 'blog') {
      renderTagFilters();
      renderBlog();
    } else if (parsed.view === 'post') {
      renderPost(parsed.slug);
    }
  }

  function route() {
    var parsed = parseRoute();
    currentSlug = parsed.slug;
    showView(parsed.view);

    if (parsed.view === 'blog') {
      activeTag = 'all';
      blogPage = 1;
    }

    if (postsReady) {
      renderCurrentView(parsed);
    } else {
      pendingRoute = parsed;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Retry link lives inside the blog error panel. It used to point at #blog,
  // which fires no hashchange when you are already on #blog, so it did nothing.
  function reloadPosts() {
    postsReady = false;
    var skeleton = document.getElementById('posts-skeleton');
    var errorEl = document.getElementById('posts-error');
    var container = document.getElementById('posts-container');

    if (errorEl) errorEl.hidden = true;
    if (skeleton) skeleton.hidden = false;
    if (container) container.innerHTML = '';

    BlogPosts.init().then(function () {
      postsReady = true;
      renderHomeLatest();
      renderTagFilters();
      renderBlog();
    });
  }

  function bindRetry() {
    var retry = document.getElementById('retry-posts');
    if (!retry) return;
    retry.addEventListener('click', function (event) {
      event.preventDefault();
      reloadPosts();
    });
  }

  function bindSkipLink() {
    var skip = document.querySelector('.skip-link');
    var main = document.getElementById('app');
    if (!skip || !main) return;
    skip.addEventListener('click', function (event) {
      event.preventDefault();
      main.setAttribute('tabindex', '-1');
      main.focus();
      main.scrollIntoView();
    });
  }

  function boot() {
    bindRetry();
    bindSkipLink();
    route();

    BlogPosts.init().then(function () {
      postsReady = true;
      renderHomeLatest();
      if (pendingRoute) {
        var parsed = pendingRoute;
        pendingRoute = null;
        renderCurrentView(parsed);
      }
    });
  }

  window.addEventListener('hashchange', route);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
