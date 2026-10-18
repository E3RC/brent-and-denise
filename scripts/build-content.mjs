#!/usr/bin/env node
// Rebuilds everything derived from assets/data/posts.json in one command.
// Run after publishing a post:
//
//   node scripts/build-content.mjs

import './generate-post-pages.mjs';
import './generate-feeds.mjs';
