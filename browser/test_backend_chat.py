import os
import sys
import json

# Add parent directory to sys.path so we can import framework
sys.path.append(os.path.dirname(__file__))

from framework.browser_session import BrowserSession
from framework.chat_runtime import ChatRuntime
from framework.response_collector import ResponseCollector

def main():
    print("Initializing Backend Simulation Chat...")
    print("Mode: Headful, but window hidden off-screen (-32000, -32000)")
    
    # Hardcoded config for backend simulation
    config = {
        "sessionId": "ishaan",
        "headless": False,  # Keeps headful to avoid bot detection, browser_session will hide it off-screen
        "adapter": "connected_chat",
        "targetUrl": "https://chatgpt.com"
    }
    
    # 1. Initialize session
    session = BrowserSession(
        session_id=config["sessionId"],
        headless=config["headless"]
    )
    
    try:
        page = session.start()
        
        # 2. Load adapter config
        adapter_path = os.path.join(os.path.dirname(__file__), "adapters", f"{config['adapter']}.adapter.json")
        with open(adapter_path, "r") as f:
            adapter_config = json.load(f)
            
        # 3. Load cookies (with sanitizer for sameSite issue)
        # Using the cookies file in the browser folder by default
        cookies_path = os.path.join(os.path.dirname(__file__), "cookies.json")
        if os.path.exists(cookies_path):
            print(f"Loading cookies from {cookies_path} ...")
            with open(cookies_path, "r") as f:
                cookies = json.load(f)
                
                # Sanitize cookies
                valid_samesite = ["Strict", "Lax", "None"]
                for c in cookies:
                    if "sameSite" in c:
                        val = str(c["sameSite"])
                        if val.lower() == "no_restriction":
                            c["sameSite"] = "None"
                        elif val.lower() == "unspecified":
                            del c["sameSite"]
                        elif val.capitalize() in valid_samesite:
                            c["sameSite"] = val.capitalize()
                        elif val not in valid_samesite:
                            del c["sameSite"]
                            
                session.import_cookies(cookies)
        else:
            print(f"No cookies found at {cookies_path}. Running unauthenticated.")
                
        # 4. Initialize Runtime
        chat = ChatRuntime(page, adapter_config)
        
        print(f"Navigating to {config['targetUrl']} ...")
        # Go to URL with domcontentloaded to prevent hanging
        page.goto(config["targetUrl"], wait_until="domcontentloaded")
        page.wait_for_timeout(2000) # Give it a second to settle
        
        print("\n" + "="*50)
        print("--- Backend API Simulation REPL ---")
        print("Type your message to simulate an incoming API request.")
        print("Type 'quit' or 'exit' to stop the server simulation.")
        print("="*50 + "\n")
        
        while True:
            try:
                user_input = input("Frontend API -> Backend: ").strip()
            except KeyboardInterrupt:
                break
                
            if user_input.lower() in ['quit', 'exit', 'q']:
                break
            if not user_input:
                continue
            if user_input == "\\om/":
                print("Backend: Fetching recent chats from sidebar...")
                sidebar = adapter_config.get("selectors", {}).get("sidebar", {})
                if "search_results" not in sidebar:
                    print("Error: search_results selector not found.")
                    continue
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
                            import urllib.parse
                            href = urllib.parse.urljoin(config["targetUrl"], href)
                        if title:
                            search_results_cache.append({"title": title, "url": href})
                            
                    if not search_results_cache:
                        print("No recent chats found.")
                        continue
                        
                    start = 0
                    while True:
                        end = start + 10
                        batch = search_results_cache[start:end]
                        print(f"\n--- Recent Chats ({start+1} to {min(end, len(search_results_cache))}) ---")
                        for i, res in enumerate(batch):
                            print(f"[{start + i + 1}] {res['title']}")
                        print("-------------------")
                        print("Options: '->' (Next), '<-' (Prev), 'search <query>' (Filter), '\\c' (Cancel), or index [number]")
                        
                        sel = input("Selection: ").strip()
                        if sel == "\\c":
                            break
                        elif sel == "->":
                            if end < len(search_results_cache): start = end
                            else: print("No more chats loaded.")
                        elif sel == "<-":
                            if start >= 10: start -= 10
                            else: print("Already at beginning.")
                        elif sel.startswith("search "):
                            query = sel[7:].lower()
                            filtered = [r for r in search_results_cache if query == r['title'].lower()]
                            if filtered:
                                r = filtered[0]
                                orig_idx = search_results_cache.index(r) + 1
                                print(f"\n--- Search Result Found ---")
                                print(f"[{orig_idx}] {r['title']}")
                                target = r['url']
                                print(f"Auto-selecting... Navigating to {target} ...")
                                page.goto(target, wait_until="domcontentloaded")
                                page.wait_for_timeout(2000)
                                break
                            else:
                                print("No matches found.")
                        elif sel.isdigit():
                            idx = int(sel) - 1
                            if 0 <= idx < len(search_results_cache):
                                target = search_results_cache[idx]['url']
                                print(f"Navigating to {target} ...")
                                page.goto(target, wait_until="domcontentloaded")
                                page.wait_for_timeout(2000)
                                break
                            else:
                                print("Invalid index.")
                        else:
                            print("Invalid option.")
                except Exception as e:
                    print(f"Error fetching chats: {str(e)}")
                continue
                
            print("Backend -> Browser Framework: Sending message... (Waiting for reply)")
            chat.send_message(user_input)
            
            collector = ResponseCollector(page, adapter_config)
            response_text = collector.wait_and_collect()
            
            if response_text:
                print(f"\nBrowser Framework -> Backend:\n{response_text}\n")
            else:
                print(f"\nBrowser Framework Error: Failed to collect response\n")
                
    except Exception as e:
        print(f"\nFatal Error: {str(e)}")
    finally:
        print("\nClosing browser session...")
        session.stop()

if __name__ == "__main__":
    main()
