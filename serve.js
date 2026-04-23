#!/usr/bin/env node

/**
 * Simple HTTP server for LM Studio Mobile App
 * Supports single-page app routing for Expo web export
 *
 * Usage: node serve.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8000;

// 自动检测静态文件目录：
// - 如果当前目录下有 dist，使用 dist（本地开发/导出后的场景）
// - 否则使用当前目录（gh-pages 分支克隆后的场景）
function findServeDir() {
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath) && fs.statSync(distPath).isDirectory()) {
    // 确保 dist 里有 HTML 文件（避免空目录误判）
    const files = fs.readdirSync(distPath);
    if (files.some(f => f.endsWith('.html'))) {
      return distPath;
    }
  }

  // 检查当前目录是否包含构建产物
  const currentFiles = fs.readdirSync(__dirname);
  if (currentFiles.some(f => f.endsWith('.html')) && currentFiles.includes('_expo')) {
    return __dirname;
  }

  return distPath; // 默认返回 dist 路径，后续会报错提示
}

const DIST_DIR = findServeDir();

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

const server = http.createServer((req, res) => {
  const urlPath = url.parse(req.url).pathname;
  let filePath = path.join(DIST_DIR, urlPath);

  // If path is a directory or doesn't have extension, try HTML file
  if (!path.extname(filePath)) {
    const htmlPath = filePath + '.html';
    if (fs.existsSync(htmlPath)) {
      filePath = htmlPath;
    } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  // Prevent directory traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Try to serve the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Try to serve root index.html for SPA routing
        fs.readFile(path.join(DIST_DIR, 'index.html'), (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
      return;
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Add cache control headers
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(data);

    // Log request
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - ${contentType}`);
  });
});

// 检查静态文件目录是否可用
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ 错误：找不到静态文件目录');
  console.error('');
  console.error('请确认以下情况之一：');
  console.error('  1. 源码目录：运行 npx expo export --platform web --output-dir ./dist');
  console.error('  2. gh-pages 分支：直接在克隆目录运行 node serve.js');
  process.exit(1);
}

const hasHtml = fs.readdirSync(DIST_DIR).some(f => f.endsWith('.html'));
if (!hasHtml) {
  console.error(`❌ 错误：${DIST_DIR} 中没有找到 HTML 文件`);
  console.error('请先运行 npx expo export --platform web --output-dir ./dist');
  process.exit(1);
}

// Start server
server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 LM Studio Mobile App - Web Server');
  console.log('='.repeat(60));
  console.log(`\n📂 静态目录: ${DIST_DIR}`);
  console.log(`✅ 服务运行中: http://localhost:${PORT}\n`);
  console.log('🎯 在浏览器打开:');
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://127.0.0.1:${PORT}\n`);
  console.log('⚠️  请确保 LM Studio 已运行 (默认 http://localhost:1234)');
  console.log('💡 按 Ctrl+C 停止服务');
  console.log('='.repeat(60) + '\n');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('   Try: PORT=3000 node serve.js');
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});
