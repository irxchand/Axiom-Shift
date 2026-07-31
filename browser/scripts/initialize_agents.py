import os
import sys
import json
import time

# Add Axiom-Shift root to path
sys.path.insert(0, r"E:\Python\Sem Ops\Axiom-Shift")

from browser.framework.adapter_loader import load_adapter
from browser.framework.browser_session import BrowserSession
from browser.framework.chat_runtime import ChatRuntime
from browser.framework.response_collector import ResponseCollector

def run_initialization():
    registry_path = r"E:\Python\Sem Ops\Axiom-Shift\configs\agents.registry.json"
    with open(registry_path, "r") as f:
        registry = json.load(f)

    session = BrowserSession("default", headless=False)
    
    try:
        # We only need the context to create new pages
        base_page = session.start()
        context = session.context
        
        adapter = load_adapter("connected_chat")
        
        # Load cookies
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
                context.add_cookies(cookies)

        updated_agents = []
        
        for agent in registry["agents"]:
            agent_id = agent["agentId"]
            print(f"\n==============================================")
            print(f"Initializing {agent_id}...")
            print(f"==============================================")
            
            # Read prompt
            prompt_path = os.path.join(r"E:\Python\Sem Ops\Axiom-Shift\agents", agent_id, "prompt.md")
            if not os.path.exists(prompt_path):
                print(f"WARNING: Prompt file not found for {agent_id} at {prompt_path}")
                updated_agents.append(agent)
                continue
                
            with open(prompt_path, "r") as f:
                system_prompt = f.read()
            
            page = context.new_page()
            page.bring_to_front()
            
            chat = ChatRuntime(page, adapter)
            # Open a fresh chat
            page.goto("https://chatgpt.com/")
            page.wait_for_load_state("domcontentloaded")
            
            collector = ResponseCollector(page, adapter)
            sel = adapter.get("selectors", {}).get("response_container")
            
            # Wait for UI to settle
            time.sleep(2)
            
            initial_c = page.locator(sel).count()
            prev_last = page.locator(sel).last.inner_text() if initial_c > 0 else ""
            
            print("Sending system prompt...")
            # We send the system prompt, but we append a small test message to ensure it responds in JSON
            full_prompt = f"{system_prompt}\n\nTEST INSTRUCTION: Acknowledge this system prompt by outputting a JSON object with 'messageToUser' set to 'Initialization Complete'."
            
            chat.send_message(full_prompt)
            
            try:
                response, metrics = collector.wait_and_collect(initial_c, prev_last)
                print(f"\nResponse received: {response[:100]}...\n")
                
                # Capture the new URL
                new_url = page.url
                print(f"New Chat URL for {agent_id}: {new_url}")
                agent["chatUrl"] = new_url
                
            except Exception as e:
                print(f"Error collecting response for {agent_id}: {e}")
            
            updated_agents.append(agent)
            
            # Wait a bit before starting the next to avoid rate limits
            time.sleep(2)
            
        # Update registry
        registry["agents"] = updated_agents
        with open(registry_path, "w") as f:
            json.dump(registry, f, indent=2)
            
        print("\nSuccessfully updated agents.registry.json with new chat URLs.")
            
    finally:
        session.stop()

if __name__ == "__main__":
    run_initialization()
