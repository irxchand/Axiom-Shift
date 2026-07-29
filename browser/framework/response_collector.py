import time
from typing import Dict, Any

class ResponseCollector:
    def __init__(self, page, adapter_config: Dict[str, Any]):
        self.page = page
        self.config = adapter_config
        self.selectors = self.config.get("selectors", {})
        self.timing = self.config.get("timing", {})

    def wait_and_collect(self) -> str:
        self.page.wait_for_timeout(self.timing.get("initial_wait_before_check_ms", 1000))
        
        stable_checks = 0
        last_text = ""
        max_wait_seconds = self.timing.get("max_wait_ms", 60000) / 1000.0
        start_time = time.time()
        
        while True:
            if time.time() - start_time > max_wait_seconds:
                raise TimeoutError("Timeout waiting for response to stabilize")
                
            if self.config.get("completion_strategy") == "generating_indicator_gone_and_text_stable":
                gen_ind = self.selectors.get("generating_indicator")
                if gen_ind:
                    stop_button = self.page.locator(gen_ind).first
                    if stop_button.is_visible():
                        stable_checks = 0
                        time.sleep(self.timing.get("stability_check_interval_ms", 500) / 1000.0)
                        continue
                        
            responses = self.page.locator(self.selectors.get("response_container"))
            count = responses.count()
            
            if count == 0:
                time.sleep(self.timing.get("stability_check_interval_ms", 500) / 1000.0)
                continue
                
            latest_response = responses.nth(count - 1)
            current_text = latest_response.inner_text()
            
            if current_text == last_text and current_text.strip() != "":
                stable_checks += 1
                if stable_checks >= self.timing.get("stability_required_checks", 3):
                    return current_text
            else:
                stable_checks = 0
                last_text = current_text
                
            time.sleep(self.timing.get("stability_check_interval_ms", 500) / 1000.0)
