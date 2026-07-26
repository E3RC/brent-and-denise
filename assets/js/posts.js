window.BlogPosts = (function () {
  'use strict';

  var posts = [];

  function init() {
    return fetch('assets/data/posts.json')
      .then(function (response) { return response.json(); })
      .then(function (data) {
        posts = data.posts || [];
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
      '<div class="post-content">' + post.content + '</div>' +
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
