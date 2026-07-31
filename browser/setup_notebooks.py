import os
import sys
import json
import time

# Add parent directory to sys.path so we can import framework
sys.path.append(os.path.dirname(__file__))

from framework.browser_session import BrowserSession
from framework.chat_runtime import ChatRuntime
from framework.response_collector import ResponseCollector

def main():
    print("Initializing Browser for Agent Setup...")
    
    config = {
        "sessionId": "ishaan",
        "headless": False, 
        "adapter": "notebooklm",
        "targetUrl": "https://notebooklm.google.com/"
    }
    
    # 1. Initialize session
    session = BrowserSession(
        session_id=config["sessionId"],
        headless=config["headless"]
    )
    
    try:
        page = session.start()
        
        # We no longer import cookies for NotebookLM because we rely on the persistent manual login profile
        # cookies_path = os.path.join(os.path.dirname(__file__), "notebooklm.google.com.cookies.json")
        # if not os.path.exists(cookies_path):
        #     cookies_path = os.path.join(os.path.dirname(__file__), "notebooklm.cookies.json")
        # if os.path.exists(cookies_path):
        #     print(f"Loading cookies from {os.path.basename(cookies_path)}...")
        #     with open(cookies_path, "r") as f:
        #         cookies = json.load(f)
        #         valid_samesite = ["Strict", "Lax", "None"]
        #         for c in cookies:
        #             if "sameSite" in c:
        #                 val = str(c["sameSite"])
        #                 if val.lower() == "no_restriction":
        #                     c["sameSite"] = "None"
        #                 elif val.lower() == "unspecified":
        #                     del c["sameSite"]
        #                 elif val.capitalize() in valid_samesite:
        #                     c["sameSite"] = val.capitalize()
        #                 elif val not in valid_samesite:
        #                     del c["sameSite"]
        #         session.import_cookies(cookies)


        
        # Load adapter config
        adapter_path = os.path.join(os.path.dirname(__file__), "adapters", f"{config['adapter']}.adapter.json")
        with open(adapter_path, "r") as f:
            adapter_config = json.load(f)
            
        print(f"Navigating to {config['targetUrl']}...")
        page.goto(config["targetUrl"], wait_until="domcontentloaded")
        page.wait_for_timeout(3000)
        
        chat = ChatRuntime(page, adapter_config)
        
        # Locate all prompts
        prompts_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts")
        
        agents = []
        if os.path.exists(prompts_dir):
            for entry in os.listdir(prompts_dir):
                agent_dir = os.path.join(prompts_dir, entry)
                if os.path.isdir(agent_dir):
                    system_md = os.path.join(agent_dir, "system.md")
                    if os.path.exists(system_md):
                        with open(system_md, "r", encoding="utf-8") as smd:
                            content = smd.read()
                        agents.append({
                            "codename": entry,
                            "content": content
                        })
                        
        print(f"Found {len(agents)} agents to provision.")
        
        for agent in agents:
            print(f"\n--- Provisioning Agent: {agent['codename']} ---")
            
            # Start new notebook
            try:
                sidebar = adapter_config.get("selectors", {}).get("sidebar", {})
                new_chat_sel = sidebar.get("new_chat_button")
                if new_chat_sel:
                    page.locator(new_chat_sel).first.click(timeout=3000)
                else:
                    page.goto(config["targetUrl"], wait_until="domcontentloaded")
            except Exception as e:
                print(f"Could not click new notebook, navigating instead: {e}")
                page.goto(config["targetUrl"], wait_until="domcontentloaded")
                
            page.wait_for_timeout(3000)
            
            # Construct Master Prompt
            master_prompt = (
                f"Notebook Name: {agent['codename']}\n\n"
                f"Objective:\n{agent['content']}\n\n"
                "Response Guidelines:\n"
                "1. Be concise.\n"
                "2. Do NOT use emojis.\n"
                "3. Do NOT break the fourth wall. Communicate naturally as if you are the system responding directly to an end user.\n"
                "4. To confirm you understand these instructions, reply ONLY with the exact word 'Acknowledged.' (no quotes, no other text)."
            )
            
            print("Sending prompt (fast injection)...")
            
            input_selector = adapter_config.get("selectors", {}).get("chat_input")
            if input_selector:
                input_locator = page.locator(input_selector).first
                input_locator.wait_for(state="visible", timeout=10000)
                input_locator.fill(master_prompt)
                
                send_button_sel = adapter_config.get("selectors", {}).get("send_button")
                if send_button_sel:
                    send_button = page.locator(send_button_sel).first
                    try:
                        send_button.wait_for(state="attached", timeout=5000)
                        send_button.click(timeout=2000)
                    except:
                        input_locator.press("Enter")
                else:
                    input_locator.press("Enter")
            else:
                chat.send_message(master_prompt)
            
            collector = ResponseCollector(page, adapter_config)
            response_text = collector.wait_and_collect()
            
            print(f"Agent Response: {response_text}")
            page.wait_for_timeout(2000) # Buffer before next agent
            
        print("\nAll agents provisioned successfully!")

    except Exception as e:
        print(f"\nFatal Error: {e}")
    finally:
        print("\nClosing browser session...")
        session.stop()

if __name__ == "__main__":
    main()
