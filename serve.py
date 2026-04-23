#!/usr/bin/env python3
"""
Simple HTTP server for LM Studio Mobile App
Supports single-page app routing for Expo web export
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

PORT = 8000
DIST_DIR = Path(__file__).parent / "dist"

class SinglePageAppHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)

    def do_GET(self):
        # Handle routing for single-page app
        requested_path = Path(self.path)

        # If it's a route without extension, try to serve the HTML file
        if not requested_path.suffix and self.path != '/':
            # Remove leading slash and add .html
            file_path = DIST_DIR / f"{requested_path.name}.html"
            if file_path.exists():
                self.path = f"{requested_path.name}.html"

        return super().do_GET()

    def end_headers(self):
        # Add headers to prevent caching during development
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        return super().end_headers()

    def log_message(self, format, *args):
        # Custom logging
        print(f"[{self.log_date_time_string()}] {format % args}")


def start_server():
    """Start the HTTP server"""
    if not DIST_DIR.exists():
        print(f"❌ Error: dist directory not found at {DIST_DIR}")
        print("Please run: npx expo export --platform web --output-dir ./dist")
        sys.exit(1)

    handler = SinglePageAppHandler

    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print("=" * 60)
        print("🚀 LM Studio Mobile App - Web Server")
        print("=" * 60)
        print(f"\n✅ Server running at: http://localhost:{PORT}")
        print(f"\n📂 Serving from: {DIST_DIR}")
        print("\n🎯 Open in browser:")
        print(f"   http://localhost:{PORT}")
        print(f"   http://127.0.0.1:{PORT}")
        print(f"   http://<your-ip>:{PORT}  (for network access)")
        print("\n⚠️  Make sure LM Studio is running!")
        print("   Default: http://localhost:1234")
        print("\n💡 Press Ctrl+C to stop the server")
        print("=" * 60 + "\n")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Server stopped.")


if __name__ == "__main__":
    start_server()
