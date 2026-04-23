#!/usr/bin/env node

/**
 * Fix paths for GitHub Pages deployment
 * Adds /lm_mobile/ prefix to all static resource paths
 */

const fs = require('fs');
const path = require('path');

const REPO_NAME = 'lm_mobile';
const BASE_PATH = `/${REPO_NAME}`;
const DIST_DIR = path.join(__dirname, '../dist');

function fixHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix script src paths
  content = content.replace(/src="\/([^/])/g, `src="${BASE_PATH}/$1`);
  content = content.replace(/src="\/_expo/g, `src="${BASE_PATH}/_expo`);

  // Fix link href paths
  content = content.replace(/href="\/([^/])/g, `href="${BASE_PATH}/$1`);
  content = content.replace(/href="\/_expo/g, `href="${BASE_PATH}/_expo`);

  // Fix other absolute paths
  content = content.replace(/content="\/([^/])/g, `content="${BASE_PATH}/$1`);

  fs.writeFileSync(filePath, content, 'utf8');
}

function findHtmlFiles(dir) {
  const files = [];

  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);

    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        walk(itemPath);
      } else if (item.endsWith('.html')) {
        files.push(itemPath);
      }
    });
  }

  walk(dir);
  return files;
}

console.log('🔧 Fixing GitHub Pages paths...');
console.log(`📁 Base path: ${BASE_PATH}`);
console.log(`📂 Processing: ${DIST_DIR}\n`);

const htmlFiles = findHtmlFiles(DIST_DIR);

htmlFiles.forEach(file => {
  console.log(`✏️  ${path.relative(DIST_DIR, file)}`);
  fixHtmlFile(file);
});

console.log(`\n✅ Fixed ${htmlFiles.length} HTML files`);
console.log('🚀 Ready for GitHub Pages deployment!');
