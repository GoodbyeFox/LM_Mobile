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

PORT = int(os.environ.get("PORT", 8000))


def find_serve_dir():
    """自动检测静态文件目录。

    - 源码目录：使用 ./dist（如果有构建产物）
    - gh-pages 分支克隆目录：使用当前目录（文件直接在根目录）
    """
    script_dir = Path(__file__).parent

    # 优先使用 dist 子目录
    dist_path = script_dir / "dist"
    if dist_path.is_dir():
        if any(p.suffix == ".html" for p in dist_path.iterdir()):
            return dist_path

    # 检查当前目录是否已经是构建产物（例如 gh-pages 分支）
    current_files = list(script_dir.iterdir())
    has_html = any(p.suffix == ".html" for p in current_files)
    has_expo = (script_dir / "_expo").is_dir()
    if has_html and has_expo:
        return script_dir

    return dist_path


DIST_DIR = find_serve_dir()

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
    """启动 HTTP 服务器"""
    if not DIST_DIR.exists():
        print(f"❌ 错误：找不到静态文件目录 {DIST_DIR}")
        print("")
        print("请确认以下情况之一：")
        print("  1. 源码目录：运行 npx expo export --platform web --output-dir ./dist")
        print("  2. gh-pages 分支：直接在克隆目录运行 python serve.py")
        sys.exit(1)

    html_files = [p for p in DIST_DIR.iterdir() if p.suffix == ".html"]
    if not html_files:
        print(f"❌ 错误：{DIST_DIR} 中没有找到 HTML 文件")
        print("请先运行 npx expo export --platform web --output-dir ./dist")
        sys.exit(1)

    handler = SinglePageAppHandler

    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print("=" * 60)
        print("🚀 LM Studio Mobile App - Web Server")
        print("=" * 60)
        print(f"\n📂 静态目录: {DIST_DIR}")
        print(f"✅ 服务运行中: http://localhost:{PORT}\n")
        print("🎯 在浏览器打开:")
        print(f"   http://localhost:{PORT}")
        print(f"   http://127.0.0.1:{PORT}\n")
        print("⚠️  请确保 LM Studio 已运行 (默认 http://localhost:1234)")
        print("💡 按 Ctrl+C 停止服务")
        print("=" * 60 + "\n")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 服务已停止")


if __name__ == "__main__":
    start_server()
