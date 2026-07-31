import os
import time
import json
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        
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
        
        html = page.content()
        with open("notebooklm_dump.html", "w", encoding="utf-8") as f:
            f.write(html)
            
        print("DOM dumped to notebooklm_dump.html")
        browser.close()

if __name__ == "__main__":
    run()
