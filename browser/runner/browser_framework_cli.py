import sys
import os
import json
import traceback

# Add the root directory (Axiom-Shift) to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from browser.framework.adapter_loader import load_adapter
from browser.framework.browser_session import BrowserSession
from browser.framework.chat_runtime import ChatRuntime
from browser.framework.response_collector import ResponseCollector

def send_json_response(data: dict):
    print(json.dumps(data))
    sys.exit(0)

def send_json_error(message: str, code: str = "INTERNAL_ERROR"):
    print(json.dumps({"error": {"code": code, "message": message}}))
    sys.exit(1)

def main():
    # Read from stdin
    input_str = sys.stdin.read()
    if not input_str:
        send_json_error("No input provided via stdin", "VALIDATION_ERROR")
        return

    try:
        input_data = json.loads(input_str)
    except json.JSONDecodeError:
        send_json_error("Invalid JSON input", "VALIDATION_ERROR")
        return

    command = input_data.get("command")
    if not command:
        send_json_error("Missing command", "VALIDATION_ERROR")
        return

    session_id = input_data.get("sessionId", "default")
    headless = input_data.get("headless", True)
    
    session = BrowserSession(session_id, headless)
    
    try:
        if command == "status":
            send_json_response({"status": session.get_status()})
            return

        page = session.start()
        
        if command == "initialize-session":
            send_json_response({"status": session.get_status()})
            
        elif command == "import-cookies":
            cookies = input_data.get("cookies", [])
            session.import_cookies(cookies)
            send_json_response({"status": "READY"})
            
        elif command == "send-chat-message":
            adapter_name = input_data.get("adapter", "connected_chat")
            adapter = load_adapter(adapter_name)
            target_url = input_data.get("targetUrl")
            message = input_data.get("message")
            
            chat = ChatRuntime(page, adapter)
            chat.open_chat(target_url)
            chat.send_message(message)
            
            collector = ResponseCollector(page, adapter)
            response_text = collector.wait_and_collect()
            
            send_json_response({
                "status": "SUCCEEDED",
                "message": response_text
            })
            
        else:
            send_json_error(f"Unknown command: {command}", "VALIDATION_ERROR")
            
    except Exception as e:
        sys.stderr.write(traceback.format_exc() + "\n")
        send_json_error(str(e))
    finally:
        session.stop()

if __name__ == "__main__":
    main()
