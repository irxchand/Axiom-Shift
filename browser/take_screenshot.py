import os
import time
import json
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        
        # Load cookies
        cookies_path = "notebooklm.google.com.cookies.json"
        if os.path.exists(cookies_path):
            with open(cookies_path, "r") as f:
                cookies = json.load(f)
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
                context.add_cookies(cookies)
        
        page = context.new_page()
        page.goto("https://notebooklm.google.com/", wait_until="networkidle")
        time.sleep(5)  # Wait for it to settle
        
        screenshot_path = r"C:\Users\irxchand\.gemini\antigravity-ide\brain\aa6b20a5-35b8-4a89-9bb4-da6061dfd555\notebooklm_screenshot.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print("Screenshot saved to", screenshot_path)
        browser.close()

if __name__ == "__main__":
    run()
