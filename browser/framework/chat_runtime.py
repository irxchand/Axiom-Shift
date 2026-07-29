import random
from typing import Dict, Any

class ChatRuntime:
    def __init__(self, page, adapter_config: Dict[str, Any]):
        self.page = page
        self.config = adapter_config
        self.selectors = self.config.get("selectors", {})
        self.timing = self.config.get("timing", {})

    def open_chat(self, target_url: str = None):
        base_url = self.config.get("base_url")
        url = target_url if target_url else base_url
        self.page.goto(url)
        self.page.wait_for_timeout(2000)

    def send_message(self, message: str):
        input_selector = self.selectors.get("chat_input")
        if not input_selector:
            raise ValueError("chat_input selector not found in adapter")

        input_locator = self.page.locator(input_selector).first
        input_locator.wait_for(state="visible", timeout=60000)
        input_locator.focus()

        delay_min, delay_max = self.timing.get("typing_delay_ms", [10, 50])
        for char in message:
            input_locator.type(char, delay=random.randint(delay_min, delay_max))

        send_button_sel = self.selectors.get("send_button")
        if send_button_sel:
            send_button = self.page.locator(send_button_sel).first
            try:
                send_button.wait_for(state="attached", timeout=5000)
                send_button.click(timeout=2000)
            except Exception:
                input_locator.press("Enter")
        else:
            input_locator.press("Enter")
