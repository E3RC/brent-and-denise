(function () {
  'use strict';

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

  function getPostIndex(slug) {
    var all = BlogPosts.getPosts(1, 999);
    for (var i = 0; i < all.length; i++) {
      if (all[i].slug === slug) return i;
    }
    return -1;
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

    skeleton.hidden = false;
    container.innerHTML = '';
    emptyEl.hidden = true;
    errorEl.hidden = true;
    pagination.hidden = true;

    var posts;

    try {
      posts = BlogPosts.getPosts(blogPage, 6);
    } catch (e) {
      skeleton.hidden = true;
      errorEl.hidden = false;
      return;
    }

    skeleton.hidden = true;

    if (!posts || posts.length === 0) {
      if (blogPage > 1) {
        blogPage = 1;
        renderBlog();
        return;
      }
      emptyEl.hidden = false;
      return;
    }

    container.innerHTML = posts.map(function (p) {
      return BlogPosts.renderPostCard(p);
    }).join('');

    var olderPosts = BlogPosts.getPosts(blogPage + 1, 1);
    if (olderPosts.length > 0) {
      pagination.hidden = false;
      olderLink.removeAttribute('aria-disabled');
    } else {
      olderLink.setAttribute('aria-disabled', 'true');
    }

    if (blogPage > 1) {
      pagination.hidden = false;
      newerLink.removeAttribute('aria-disabled');
    } else {
      newerLink.setAttribute('aria-disabled', 'true');
    }

    olderLink.onclick = function (e) {
      e.preventDefault();
      if (olderLink.getAttribute('aria-disabled') === 'true') return;
      blogPage++;
      renderBlog();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    newerLink.onclick = function (e) {
      e.preventDefault();
      if (newerLink.getAttribute('aria-disabled') === 'true') return;
      blogPage--;
      renderBlog();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }

  function renderPost(slug) {
    var container = document.getElementById('post-container');
    var skeleton = document.getElementById('post-skeleton');
    var errorEl = document.getElementById('post-error');
    var postNav = document.getElementById('post-nav');
    var prevLink = document.getElementById('prev-post');
    var nextLink = document.getElementById('next-post');

    if (!container) return;

    skeleton.hidden = false;
    container.innerHTML = '';
    errorEl.hidden = true;
    postNav.hidden = true;

    var post;

    try {
      post = BlogPosts.getPost(slug);
    } catch (e) {
      skeleton.hidden = true;
      errorEl.hidden = false;
      return;
    }

    skeleton.hidden = true;

    if (!post) {
      errorEl.hidden = false;
      return;
    }

    container.innerHTML = BlogPosts.renderPost(post);

    var shareDiv = document.createElement('div');
    shareDiv.className = 'share-buttons';
    var pageUrl = encodeURIComponent(window.location.href);
    var postTitle = encodeURIComponent(post.title);
    shareDiv.innerHTML =
      '<a href="https://x.com/intent/tweet?text=' + postTitle + '&url=' + pageUrl + '" target="_blank" rel="noopener" class="share-btn">Share on X</a>' +
      '<button class="share-btn" id="copy-link-btn">Copy Link</button>';
    container.appendChild(shareDiv);

    var copyBtn = document.getElementById('copy-link-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(window.location.href).then(function () {
          var msg = document.createElement('span');
          msg.className = 'copy-msg';
          msg.textContent = 'Link copied!';
          copyBtn.parentNode.insertBefore(msg, copyBtn.nextSibling);
          setTimeout(function () { msg.remove(); }, 2000);
        });
      });
    }

    var idx = getPostIndex(slug);
    var all = BlogPosts.getPosts(1, 999);

    if (idx > 0) {
      postNav.hidden = false;
      prevLink.href = '#post-' + all[idx - 1].slug;
      prevLink.innerHTML = '← ' + all[idx - 1].title;
    } else {
      prevLink.href = '#';
    }

    if (idx < all.length - 1) {
      postNav.hidden = false;
      nextLink.href = '#post-' + all[idx + 1].slug;
      nextLink.innerHTML = all[idx + 1].title + ' →';
    } else {
      nextLink.href = '#';
    }
  }

  function renderHomeLatest() {
    var container = document.getElementById('latest-posts');
    if (!container) return;

    if (!postsReady) return;

    try {
      var posts = BlogPosts.getLatestPosts(3);
      if (posts && posts.length > 0) {
        container.innerHTML = posts.map(function (p) {
          return BlogPosts.renderPostCard(p);
        }).join('');
      }
    } catch (e) {
      /* keep static fallback */
    }
  }

  function route() {
    var hash = window.location.hash.replace(/^#/, '') || 'home';
    var viewName = hash;

    if (hash.indexOf('post-') === 0) {
      viewName = 'post';
      window.__postSlug = hash.slice(5);
    } else {
      window.__postSlug = null;
    }

    if (knownViews.indexOf(viewName) === -1) {
      viewName = 'home';
    }

    for (var key in views) {
      if (views[key]) {
        views[key].hidden = key !== viewName;
      }
    }

    var navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === '#' + viewName || (viewName === 'post' && href === '#blog')) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (postsReady) {
      if (viewName === 'blog') {
        blogPage = 1;
        renderBlog();
      } else if (viewName === 'post' && window.__postSlug) {
        renderPost(window.__postSlug);
      }
    } else {
      pendingRoute = viewName;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.addEventListener('hashchange', route);

  function boot() {
    route();

    BlogPosts.init().then(function () {
      postsReady = true;
      renderHomeLatest();
      if (pendingRoute === 'blog') {
        blogPage = 1;
        renderBlog();
      } else if (pendingRoute === 'post' && window.__postSlug) {
        renderPost(window.__postSlug);
      }
      pendingRoute = null;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
