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

const PORT = 8000;
const DIST_DIR = path.join(__dirname, 'dist');

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

// Check if dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Error: dist directory not found');
  console.error('Please run: npx expo export --platform web --output-dir ./dist');
  process.exit(1);
}

// Start server
server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 LM Studio Mobile App - Web Server');
  console.log('='.repeat(60));
  console.log(`\n✅ Server running at: http://localhost:${PORT}\n`);
  console.log('🎯 Open in browser:');
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://127.0.0.1:${PORT}`);
  console.log(`   http://<your-ip>:${PORT}  (for network access)\n`);
  console.log('⚠️  Make sure LM Studio is running!');
  console.log('   Default: http://localhost:1234\n');
  console.log('💡 Press Ctrl+C to stop the server');
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
