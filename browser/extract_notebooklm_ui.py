import os
import time
import json
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        profile_dir = os.path.join(os.getcwd(), ".browser_profiles", "ishaan")
        context = p.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            headless=True,
            viewport={"width": 1280, "height": 720},
            args=["--disable-blink-features=AutomationControlled"]
        )
        page = context.pages[0] if context.pages else context.new_page()
        print("Navigating to NotebookLM...")
        page.goto("https://notebooklm.google.com/", wait_until="networkidle")
        time.sleep(8) # let it load fully
        
        print("Clicking Create new notebook...")
        page.locator("button[aria-label='Create new notebook']").first.click()
        time.sleep(8)
        
        elements = page.evaluate(r'''() => {
            const els = document.querySelectorAll("button, div[role='button'], a, input, textarea, div[role='textbox'], span, div");
            const result = [];
            for (let e of els) {
                const text = e.innerText || e.value || e.placeholder || "";
                const ariaLabel = e.getAttribute("aria-label");
                const role = e.getAttribute("role");
                
                // We only care about things that might be buttons or inputs, or contain specific keywords
                const tLower = text.toLowerCase();
                const aLower = ariaLabel ? ariaLabel.toLowerCase() : "";
                
                if (
                    (role === 'button' || role === 'textbox' || e.tagName === 'BUTTON' || e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') ||
                    (tLower.includes("new") || tLower.includes("notebook") || tLower.includes("source") || tLower.includes("send") || tLower.includes("upload") || tLower.includes("chat")) ||
                    (aLower.includes("new") || aLower.includes("notebook") || aLower.includes("source") || aLower.includes("send") || aLower.includes("upload") || aLower.includes("chat"))
                ) {
                    if (text.trim().length > 0 || ariaLabel) {
                        result.push({
                            tag: e.tagName,
                            role: role,
                            ariaLabel: ariaLabel,
                            text: text.trim().substring(0, 50).replace(/\n/g, ' '),
                            className: typeof e.className === 'string' ? e.className : ''
                        });
                    }
                }
            }
            return result;
        }''')
        
        with open("ui_dump_2.json", "w", encoding="utf-8") as f:
            json.dump(elements, f, indent=2)
        print("Dumped inner UI elements.")
        
        context.close()

if __name__ == "__main__":
    run()
