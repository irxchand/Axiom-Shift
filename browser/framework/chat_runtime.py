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

    def send_message(self, message: str, file_paths: list = None) -> dict:
        import time
        metrics = {}
        
        if file_paths and len(file_paths) > 0:
            import os, base64, mimetypes
            files_data = []
            for p in file_paths:
                mime = mimetypes.guess_type(p)[0] or 'application/octet-stream'
                with open(p, 'rb') as f:
                    b64 = base64.b64encode(f.read()).decode('utf-8')
                files_data.append({'name': os.path.basename(p), 'mime': mime, 'b64': b64})
            
            input_selector = self.selectors.get("chat_input", "div[id='prompt-textarea']")
            self.page.locator(input_selector).first.wait_for(state="visible", timeout=60000)
            
            self.page.evaluate('''([selector, files]) => {
                const dt = new DataTransfer();
                for (const f of files) {
                    const byteCharacters = atob(f.b64);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const file = new File([byteArray], f.name, { type: f.mime });
                    dt.items.add(file);
                }
                const target = document.querySelector(selector) || document.body;
                
                // Fire dragenter and dragover to satisfy React Dropzone
                target.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt }));
                target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
                target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
            }''', [input_selector, files_data])
            # wait for upload to complete
            time.sleep(8)
        
        t0 = time.perf_counter()
        input_selector = self.selectors.get("chat_input")
        if not input_selector:
            raise ValueError("chat_input selector not found in adapter")

        input_locator = self.page.locator(input_selector).first
        input_locator.wait_for(state="visible", timeout=60000)
        input_locator.focus()
        metrics["t_find_input"] = (time.perf_counter() - t0) * 1000

        t0 = time.perf_counter()
        self.page.keyboard.insert_text(message)
        metrics["t_insert"] = (time.perf_counter() - t0) * 1000
        
        t0 = time.perf_counter()
        input_locator.press("Enter")
        metrics["t_submit"] = (time.perf_counter() - t0) * 1000
        
        return metrics
