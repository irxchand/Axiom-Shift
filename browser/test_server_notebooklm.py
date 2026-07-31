import os
import sys
import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

# Add parent directory to sys.path so we can import framework
sys.path.append(os.path.dirname(__file__))

from framework.browser_session import BrowserSession
from framework.chat_runtime import ChatRuntime
from framework.response_collector import ResponseCollector

# Global state
session = None
chat = None
page = None
adapter_config = None
config = {
    "sessionId": "ishaan",
    "headless": False,
    "adapter": "notebooklm",
    "targetUrl": "https://notebooklm.google.com/"
}
search_results_cache = []

def init_browser():
    global session, chat, page, adapter_config
    print("Starting Browser Session...")
    session = BrowserSession(session_id=config["sessionId"], headless=config["headless"])
    page = session.start()
    
    adapter_path = os.path.join(os.path.dirname(__file__), "adapters", f"{config['adapter']}.adapter.json")
    with open(adapter_path, "r") as f:
        adapter_config = json.load(f)
        
    # We no longer import cookies for NotebookLM because we rely on the persistent manual login profile
    # cookies_path = os.path.join(os.path.dirname(__file__), "notebooklm.google.com.cookies.json")
    # if not os.path.exists(cookies_path):
    #     cookies_path = os.path.join(os.path.dirname(__file__), "notebooklm.cookies.json")
    # if os.path.exists(cookies_path):
    #     print(f"Loading cookies from {os.path.basename(cookies_path)}...")
    #     with open(cookies_path, "r") as f:
    #         cookies = json.load(f)
    #         valid_samesite = ["Strict", "Lax", "None"]
    #         for c in cookies:
    #             if "sameSite" in c:
    #                 val = str(c["sameSite"])
    #                 if val.lower() == "no_restriction":
    #                     c["sameSite"] = "None"
    #                 elif val.lower() == "unspecified":
    #                     del c["sameSite"]
    #                 elif val.capitalize() in valid_samesite:
    #                     c["sameSite"] = val.capitalize()
    #                 elif val not in valid_samesite:
    #                     del c["sameSite"]
    #         session.import_cookies(cookies)
            
    chat = ChatRuntime(page, adapter_config)
    print("Navigating to NotebookLM...")
    page.goto(config["targetUrl"], wait_until="domcontentloaded")
    page.wait_for_timeout(2000)
    print("Browser Ready! Open http://localhost:8000 in your browser.")

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            with open(os.path.join(os.path.dirname(__file__), "index.html"), "rb") as f:
                self.wfile.write(f.read())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        global search_results_cache
        if self.path == '/api/chat':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except:
                data = {}
            msg = data.get("message", "").strip()
            
            response_data = {"type": "error", "message": "Unknown error"}
            
            if msg == "\\om/":
                sidebar = adapter_config.get("selectors", {}).get("sidebar", {})
                if "search_results" not in sidebar:
                    response_data = {"type": "error", "message": "search_results selector not found."}
                else:
                    try:
                        results_loc = page.locator(sidebar["search_results"])
                        results_loc.first.wait_for(state="attached", timeout=3000)
                        count = results_loc.count()
                        search_results_cache = []
                        for i in range(count):
                            el = results_loc.nth(i)
                            title = el.inner_text().strip()
                            href = el.get_attribute("href")
                            if href and not href.startswith("http"):
                                href = urllib.parse.urljoin(config["targetUrl"], href)
                            if title:
                                search_results_cache.append({"title": title, "url": href})
                        response_data = {"type": "om_results", "data": search_results_cache}
                    except Exception as e:
                        response_data = {"type": "error", "message": str(e)}
            
            elif msg.startswith("search "):
                query = msg[7:].lower()
                filtered = [r for r in search_results_cache if query == r['title'].lower()]
                if filtered:
                    r = filtered[0]
                    target = r['url']
                    if target:
                        page.goto(target, wait_until="domcontentloaded")
                    else:
                        idx = search_results_cache.index(r)
                        sidebar = adapter_config.get("selectors", {}).get("sidebar", {})
                        page.locator(sidebar["search_results"]).nth(idx).click()
                    page.wait_for_timeout(2000)
                    response_data = {"type": "system", "message": f"Auto-selected and navigated to '{r['title']}'"}
                else:
                    response_data = {"type": "system", "message": "No exact matches found."}
                    
            elif msg.isdigit():
                try:
                    idx = int(msg) - 1
                    if 0 <= idx < len(search_results_cache):
                        target = search_results_cache[idx]['url']
                        if target:
                            page.goto(target, wait_until="domcontentloaded")
                        else:
                            sidebar = adapter_config.get("selectors", {}).get("sidebar", {})
                            page.locator(sidebar["search_results"]).nth(idx).click(timeout=5000, force=True)
                        page.wait_for_timeout(2000)
                        response_data = {"type": "system", "message": f"Navigated to '{search_results_cache[idx]['title']}'"}
                    else:
                        response_data = {"type": "error", "message": "Invalid index."}
                except Exception as e:
                    import traceback
                    print(f"Error handling digit command: {traceback.format_exc()}")
                    response_data = {"type": "error", "message": str(e)}
            elif msg == "\\n/":
                try:
                    sidebar = adapter_config.get("selectors", {}).get("sidebar", {})
                    new_chat_sel = sidebar.get("new_chat_button")
                    if new_chat_sel:
                        page.locator(new_chat_sel).first.click(timeout=3000)
                        page.wait_for_timeout(2000)
                    else:
                        page.goto(config["targetUrl"], wait_until="domcontentloaded")
                        page.wait_for_timeout(2000)
                    response_data = {"type": "system", "message": "Started a New Chat."}
                except Exception as e:
                    response_data = {"type": "error", "message": f"Failed to start new chat: {str(e)}"}
            elif msg == "\\m/":
                help_text = (
                    "Available Commands:\n"
                    "\\n/ - Start a New Notebook\n"
                    "\\om/ - List recent notebooks (Open Mode)\n"
                    "\\r/ - Refresh the current page\n"
                    "\\u/ <filepath> - Upload a file to current context\n"
                    "\\q/ - Quit the test server\n"
                    "\\m/ - Show this menu\n"
                    "search <name> - Search for a notebook\n"
                    "<number> - Select a notebook by index"
                )
                response_data = {"type": "system", "message": help_text}
            elif msg == "\\r/":
                try:
                    page.reload(wait_until="domcontentloaded")
                    page.wait_for_timeout(2000)
                    response_data = {"type": "system", "message": "Page refreshed successfully."}
                except Exception as e:
                    response_data = {"type": "error", "message": f"Failed to refresh page: {str(e)}"}
            elif msg == "\\q/":
                response_data = {"type": "quit", "message": "Closing the tab... You can also close it manually."}
            elif msg.startswith("\\u/"):
                filepath = msg[3:].strip()
                if not os.path.exists(filepath):
                    response_data = {"type": "error", "message": f"File not found: {filepath}"}
                else:
                    try:
                        upload_sel = adapter_config.get("selectors", {}).get("upload", {}).get("file_input")
                        if not upload_sel:
                            response_data = {"type": "error", "message": "Upload selector not defined in adapter."}
                        else:
                            page.locator(upload_sel).first.set_input_files(filepath)
                            page.wait_for_timeout(2000)
                            response_data = {"type": "system", "message": f"Successfully uploaded: {filepath}"}
                    except Exception as e:
                        response_data = {"type": "error", "message": f"Failed to upload: {str(e)}"}
            else:
                try:
                    chat.send_message(msg)
                    collector = ResponseCollector(page, adapter_config)
                    response_text = collector.wait_and_collect()
                    if response_text:
                        response_data = {"type": "message", "message": response_text}
                    else:
                        response_data = {"type": "error", "message": "Failed to collect response"}
                except Exception as e:
                    response_data = {"type": "error", "message": str(e)}
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode("utf-8"))
            
    def log_message(self, format, *args):
        pass # Suppress standard HTTP logs for cleaner console

httpd = None

def main():
    global httpd
    try:
        init_browser()
        server_address = ('', 8000)
        httpd = HTTPServer(server_address, RequestHandler)
        print("\n==================================================")
        print(" Test UI Running at: http://localhost:8000")
        print(" Press Ctrl+C in this terminal to stop.")
        print("==================================================\n")
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        if session:
            session.stop()

if __name__ == '__main__':
    main()
