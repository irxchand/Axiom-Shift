import os
from playwright.sync_api import sync_playwright

class BrowserSession:
    def __init__(self, session_id: str, headless: bool = True):
        self.session_id = session_id or "default_session"
        self.headless = headless
        self.playwright = None
        self.context = None
        self.page = None

    def start(self):
        self.playwright = sync_playwright().start()
        # Profiles stored centrally outside the project or in a gitignored dir
        profile_dir = os.path.join(os.getcwd(), ".browser_profiles", self.session_id)
        os.makedirs(profile_dir, exist_ok=True)
        
        browser_args = ["--disable-blink-features=AutomationControlled"]
        if not self.headless:
            # Shift window out of view to avoid bot detection while keeping headful benefits
            browser_args.append("--window-position=-32000,-32000")

        self.context = self.playwright.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            headless=self.headless,
            viewport={"width": 1280, "height": 720},
            args=browser_args
        )
        self.page = self.context.pages[0] if self.context.pages else self.context.new_page()
        return self.page

    def import_cookies(self, cookies_data: list):
        if self.context:
            self.context.add_cookies(cookies_data)
            return True
        return False

    def get_status(self) -> str:
        if self.context:
            return "READY"
        return "UNINITIALIZED"

    def stop(self):
        if self.context:
            self.context.close()
        if self.playwright:
            self.playwright.stop()
