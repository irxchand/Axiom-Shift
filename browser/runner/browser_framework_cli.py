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
    print(json.dumps({
        "success": True,
        "data": data
    }))
    sys.exit(0)

def send_json_error(message: str, code: str = "INTERNAL_ERROR"):
    print(json.dumps({
        "success": False,
        "error": message,
        "errorCode": code
    }))
    sys.exit(1)

import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=str, help='JSON input')
    args = parser.parse_args()

    input_str = args.input
    if not input_str:
        send_json_error("No input provided via --input", "VALIDATION_ERROR")
        return

    try:
        input_data = json.loads(input_str)
    except json.JSONDecodeError:
        send_json_error("Invalid JSON input", "VALIDATION_ERROR")
        return

    command = input_data.get("command") or input_data.get("action")
    if not command:
        send_json_error("Missing command or action", "VALIDATION_ERROR")
        return

    session_id = input_data.get("sessionId", "default")
    headless = input_data.get("headless", True)
    
    session = BrowserSession(session_id, headless)
    
    try:
        if command in ("status", "GET_STATUS"):
            send_json_response({"status": session.get_status()})
            return

        page = session.start()
        
        # Load cookies automatically for all commands if cookies.json exists
        import os
        cookies_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cookies.json")
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
                session.context.add_cookies(cookies)

        
        if command in ("initialize-session", "INITIALIZE"):
            send_json_response({"status": session.get_status()})
            
        elif command == "import-cookies":
            cookies = input_data.get("cookies", [])
            session.import_cookies(cookies)
            send_json_response({"status": "READY"})
            
        elif command in ("send-chat-message", "SEND_CHAT"):
            adapter_name = input_data.get("adapter", "connected_chat")
            adapter = load_adapter(adapter_name)
            target_url = input_data.get("targetUrl") or input_data.get("chatUrl")
            
            # message can be either in 'message' or inside 'payload' -> 'prompt'
            message = input_data.get("message")
            if not message and input_data.get("payload"):
                message = input_data.get("payload", {}).get("prompt")
                
            file_paths = input_data.get("payload", {}).get("filePaths", [])
            
            chat = ChatRuntime(page, adapter)
            chat.open_chat(target_url)
            chat.send_message(message, file_paths)
            
            collector = ResponseCollector(page, adapter)
            response_text, metrics = collector.wait_and_collect()
            
            send_json_response({
                "status": "SUCCEEDED",
                "message": response_text,
                "metrics": metrics
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
