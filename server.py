import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8080

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        '': 'application/octet-stream',
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.wasm': 'application/wasm',
    }

    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 60)
        print(f"🌕 เกมวันลอยกระทง 3D (Loy Krathong Festival 3D) กำลังทำงานที่:")
        print(f"👉 {url}")
        print("=" * 60)
        print("กด Ctrl+C เพื่อหยุดเซิร์ฟเวอร์")
        
        # Try to open in browser automatically if running interactively
        try:
            if "--open" in sys.argv:
                webbrowser.open(url)
        except Exception:
            pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nปิดเซิร์ฟเวอร์เรียบร้อยแล้วครับ")

if __name__ == "__main__":
    run_server()
