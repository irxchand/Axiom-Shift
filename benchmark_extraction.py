import time
from playwright.sync_api import sync_playwright
import statistics

def setup_mock_dom(page):
    """Inject 500 fake ChatGPT messages into the DOM to simulate a heavy, long conversation."""
    html = '<html><body><div id="chat-container">'
    for i in range(500):
        # 250 user, 250 assistant
        role = "user" if i % 2 == 0 else "assistant"
        text = f"This is message {i}. " * 50 # Add some bulk text
        html += f'<div data-message-author-role="{role}">{text}</div>'
    html += '</div></body></html>'
    page.set_content(html)

def benchmark_method(name, func, iterations=1000):
    times = []
    # Warmup
    for _ in range(10):
        func()
        
    for _ in range(iterations):
        t0 = time.perf_counter()
        func()
        t1 = time.perf_counter()
        times.append((t1 - t0) * 1000) # milliseconds
        
    avg = sum(times) / len(times)
    median = statistics.median(times)
    p95 = sorted(times)[int(len(times) * 0.95)]
    
    print(f"{name:.<30} Avg: {avg:.3f}ms | Med: {median:.3f}ms | P95: {p95:.3f}ms")
    return avg

def run_extraction_benchmark():
    print("="*60)
    print("PHASE 7 — DOM EXTRACTION BENCHMARK")
    print("="*60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        print("Setting up heavy mock DOM (500 messages)...")
        setup_mock_dom(page)
        
        sel = "div[data-message-author-role='assistant']"
        locator = page.locator(sel)
        
        # Method 1: locator.last
        def method_last():
            return locator.last.inner_text()
            
        # Method 2: locator.nth(-1)
        def method_nth():
            return locator.nth(-1).inner_text()
            
        # Method 3: locator.all()
        def method_all():
            elements = locator.all()
            return elements[-1].inner_text() if elements else ""
            
        # Method 4: page.evaluate textContent
        def method_eval_textcontent():
            return page.evaluate(f'''() => {{
                const nodes = document.querySelectorAll("{sel}");
                return nodes.length > 0 ? nodes[nodes.length - 1].textContent : "";
            }}''')
            
        # Method 5: page.evaluate innerText
        def method_eval_innertext():
            return page.evaluate(f'''() => {{
                const nodes = document.querySelectorAll("{sel}");
                return nodes.length > 0 ? nodes[nodes.length - 1].innerText : "";
            }}''')

        print("\nBenchmarking (1000 iterations each):")
        results = {}
        results["locator.last.inner_text()"] = benchmark_method("locator.last", method_last)
        results["locator.nth(-1).inner_text()"] = benchmark_method("locator.nth(-1)", method_nth)
        results["locator.all()[-1].inner_text()"] = benchmark_method("locator.all()", method_all, iterations=100) # too slow for 1000
        results["evaluate(textContent)"] = benchmark_method("JS evaluate (textContent)", method_eval_textcontent)
        results["evaluate(innerText)"] = benchmark_method("JS evaluate (innerText)", method_eval_innertext)
        
        print("\n" + "="*60)
        best = min(results, key=results.get)
        print(f"FASTEST METHOD: {best} ({results[best]:.3f}ms)")
        print("="*60)
        
        browser.close()

if __name__ == "__main__":
    run_extraction_benchmark()
