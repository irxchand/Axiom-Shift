import os
import sys
import time
import json
import psutil

# Add Axiom-Shift root to path
sys.path.insert(0, r"E:\Python\Sem Ops\Axiom-Shift")

from browser.framework.adapter_loader import load_adapter
from browser.framework.browser_session import BrowserSession
from browser.framework.chat_runtime import ChatRuntime
from browser.framework.response_collector import ResponseCollector

def print_turn_metrics(turn_id, agent_name, m_send, m_recv, t_switch, t_total):
    print("-" * 60)
    print(f"TURN {turn_id} - {agent_name}")
    print(f"Switch Tab:     {t_switch:.1f} ms")
    print(f"Find Input:     {m_send.get('t_find_input', 0):.1f} ms")
    print(f"Insert Text:    {m_send.get('t_insert', 0):.1f} ms")
    print(f"Submit:         {m_send.get('t_submit', 0):.1f} ms")
    print(f"First Token:    {m_recv.get('t_ttft', 0):.1f} ms")
    print(f"Streaming:      {m_recv.get('t_streaming', 0):.1f} ms")
    print(f"DOM Extraction: {m_recv.get('t_extract', 0):.1f} ms")
    print(f"TOTAL:          {t_total:.1f} ms")
    print("-" * 60)

def run_chat_test():
    print("Starting Performance Benchmark Suite...")
    session = BrowserSession("default", headless=False)
    
    # Telemetry storage
    turn_metrics = []
    
    try:
        page1 = session.start()
        context = session.context
        page2 = context.new_page()
        
        adapter = load_adapter("connected_chat")
        
        cookies_path = os.path.join(os.path.dirname(__file__), "browser", "cookies.json")
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
        
        print("\nInitializing Agent 1 (Tab 1)...")
        chat1 = ChatRuntime(page1, adapter)
        chat1.open_chat()
        
        print("Initializing Agent 2 (Tab 2)...")
        chat2 = ChatRuntime(page2, adapter)
        chat2.open_chat()
        
        collector1 = ResponseCollector(page1, adapter)
        collector2 = ResponseCollector(page2, adapter)
        sel = adapter.get("selectors", {}).get("response_container")

        # Turn 1: Initialization for Agent 1
        print("\n--- Initialization: Agent 1 ---")
        t_start_turn = time.perf_counter()
        
        t0 = time.perf_counter()
        page1.bring_to_front()
        t_switch = (time.perf_counter() - t0) * 1000
        
        initial_c1 = page1.locator(sel).count()
        prev_last_init_1 = page1.locator(sel).last.inner_text() if initial_c1 > 0 else ""
        m_send = chat1.send_message("Hello! You are Agent 1. You are having a conversation with Agent 2 about the future of AI. Keep your answers to exactly 2 sentences. Please start the conversation.")
        response1, m_recv = collector1.wait_and_collect(initial_c1, prev_last_init_1)
        t_total = (time.perf_counter() - t_start_turn) * 1000
        
        print(f"\n[Agent 1 Init]: {response1}")
        print_turn_metrics("INIT", "Agent 1", m_send, m_recv, t_switch, t_total)
        current_message = response1
        
        # Turn 1: Initialization for Agent 2
        print("\n--- Initialization: Agent 2 ---")
        t_start_turn = time.perf_counter()
        
        t0 = time.perf_counter()
        page2.bring_to_front()
        t_switch = (time.perf_counter() - t0) * 1000
        
        initial_c2 = page2.locator(sel).count()
        prev_last_init_2 = page2.locator(sel).last.inner_text() if initial_c2 > 0 else ""
        m_send = chat2.send_message(f"Hello! You are Agent 2. You are having a conversation with Agent 1 about the future of AI. Keep your answers to exactly 2 sentences.\n\nAgent 1 just said: '{current_message}'\n\nPlease respond.")
        response2, m_recv = collector2.wait_and_collect(initial_c2, prev_last_init_2)
        t_total = (time.perf_counter() - t_start_turn) * 1000
        
        print(f"\n[Agent 2 Init]: {response2}")
        print_turn_metrics("INIT", "Agent 2", m_send, m_recv, t_switch, t_total)
        current_message = response2
        
        # 19 subsequent turns (making 20 turns total)
        for i in range(1, 20):
            print(f"\n================ TURN {i+1} ================")
            
            # --- Agent 1 ---
            t_start_turn = time.perf_counter()
            t0 = time.perf_counter()
            page1.bring_to_front()
            t_switch = (time.perf_counter() - t0) * 1000
            
            initial_c1 = page1.locator(sel).count()
            prev_last_1 = page1.locator(sel).last.inner_text() if initial_c1 > 0 else ""
            m_send = chat1.send_message(current_message)
            response1, m_recv = collector1.wait_and_collect(initial_c1, prev_last_1)
            t_total = (time.perf_counter() - t_start_turn) * 1000
            
            dom_nodes_1 = page1.evaluate("document.querySelectorAll('*').length")
            print(f"\n[Agent 1]: {response1}")
            print_turn_metrics(str(i+1), "Agent 1", m_send, m_recv, t_switch, t_total)
            turn_metrics.append({"turn": i+1, "agent": "Agent 1", "total": t_total, "ttft": m_recv.get('t_ttft', 0), "stream": m_recv.get('t_streaming', 0), "dom_nodes": dom_nodes_1})
            current_message = response1
            
            # --- Agent 2 ---
            t_start_turn = time.perf_counter()
            t0 = time.perf_counter()
            page2.bring_to_front()
            t_switch = (time.perf_counter() - t0) * 1000
            
            initial_c2 = page2.locator(sel).count()
            prev_last_2 = page2.locator(sel).last.inner_text() if initial_c2 > 0 else ""
            m_send = chat2.send_message(current_message)
            response2, m_recv = collector2.wait_and_collect(initial_c2, prev_last_2)
            t_total = (time.perf_counter() - t_start_turn) * 1000
            
            dom_nodes_2 = page2.evaluate("document.querySelectorAll('*').length")
            print(f"\n[Agent 2]: {response2}")
            print_turn_metrics(str(i+1), "Agent 2", m_send, m_recv, t_switch, t_total)
            turn_metrics.append({"turn": i+1, "agent": "Agent 2", "total": t_total, "ttft": m_recv.get('t_ttft', 0), "stream": m_recv.get('t_streaming', 0), "dom_nodes": dom_nodes_2})
            current_message = response2
            
        print("\n" + "="*50)
        print("PHASE 2 — BOTTLENECK ANALYSIS REPORT")
        print("="*50)
        
        totals = [m["total"] for m in turn_metrics]
        totals.sort()
        
        avg_turn = sum(totals) / len(totals)
        median_turn = totals[len(totals)//2]
        p95_turn = totals[int(len(totals)*0.95)]
        p99_turn = totals[int(len(totals)*0.99)]
        fastest_turn = totals[0]
        slowest_turn = totals[-1]
        
        avg_ttft = sum([m["ttft"] for m in turn_metrics]) / len(turn_metrics)
        avg_stream = sum([m["stream"] for m in turn_metrics]) / len(turn_metrics)
        
        process = psutil.Process(os.getpid())
        mem_mb = process.memory_info().rss / (1024 * 1024)
        
        print(f"Average Turn Time:       {avg_turn:.1f} ms")
        print(f"Median:                  {median_turn:.1f} ms")
        print(f"P95:                     {p95_turn:.1f} ms")
        print(f"P99:                     {p99_turn:.1f} ms")
        print(f"Fastest Turn:            {fastest_turn:.1f} ms")
        print(f"Slowest Turn:            {slowest_turn:.1f} ms")
        print(f"Average TTFT:            {avg_ttft:.1f} ms")
        print(f"Average Streaming:       {avg_stream:.1f} ms")
        print(f"Final DOM Nodes (Ag1):   {turn_metrics[-2]['dom_nodes']}")
        print(f"Final DOM Nodes (Ag2):   {turn_metrics[-1]['dom_nodes']}")
        print(f"Python Memory Usage:     {mem_mb:.1f} MB")
        
        bottleneck = "Streaming Generation" if avg_stream > avg_ttft else "Time To First Token (TTFT)"
        print(f"Largest Bottleneck:      {bottleneck}")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        session.stop()

if __name__ == "__main__":
    run_chat_test()
