import time
from playwright.sync_api import sync_playwright

def setup_mock_dom(page):
    html = '<html><body><div id="chat-container"></div></body></html>'
    page.set_content(html)
    
def simulate_streaming(page):
    """Simulate ChatGPT generating a response in the DOM over 2 seconds."""
    page.evaluate('''() => {
        const container = document.getElementById("chat-container");
        const msg = document.createElement("div");
        msg.setAttribute("data-message-author-role", "assistant");
        container.appendChild(msg);
        
        let count = 0;
        const interval = setInterval(() => {
            msg.innerText += "token ";
            count++;
            if (count > 20) {
                clearInterval(interval);
            }
        }, 100);
    }''')

def benchmark_polling(page):
    t0 = time.perf_counter()
    simulate_streaming(page)
    
    last_text = ""
    stable_checks = 0
    while True:
        current_text = page.evaluate('''() => {
            const nodes = document.querySelectorAll("div[data-message-author-role='assistant']");
            return nodes.length > 0 ? nodes[nodes.length - 1].innerText : "";
        }''')
        
        if current_text == last_text and current_text != "":
            stable_checks += 1
            if stable_checks >= 2:
                break
        else:
            stable_checks = 0
            last_text = current_text
            
        time.sleep(0.1)
    
    return (time.perf_counter() - t0) * 1000

def benchmark_mutation_observer(page):
    t0 = time.perf_counter()
    
    # Inject observer
    page.evaluate('''() => {
        window.isStreamingDone = false;
        const container = document.getElementById("chat-container");
        
        let timeout;
        const observer = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                window.isStreamingDone = true;
            }, 200); // 200ms of no mutations = done
        });
        
        observer.observe(container, {childList: true, subtree: true, characterData: true});
    }''')
    
    simulate_streaming(page)
    
    # Wait for the JS variable to turn true
    page.wait_for_function('window.isStreamingDone === true', timeout=10000)
    
    return (time.perf_counter() - t0) * 1000

def run_detection_benchmark():
    print("="*60)
    print("PHASE 6 — RESPONSE DETECTION BENCHMARK")
    print("="*60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        print("Benchmarking Python Polling (10 runs)...")
        times_polling = []
        for _ in range(10):
            setup_mock_dom(page)
            times_polling.append(benchmark_polling(page))
            
        print("Benchmarking JS MutationObserver (10 runs)...")
        times_observer = []
        for _ in range(10):
            setup_mock_dom(page)
            times_observer.append(benchmark_mutation_observer(page))
            
        avg_polling = sum(times_polling) / len(times_polling)
        avg_observer = sum(times_observer) / len(times_observer)
        
        print("\nRESULTS:")
        print(f"Python Polling (0.1s sleep): {avg_polling:.1f} ms")
        print(f"JS MutationObserver:         {avg_observer:.1f} ms")
        
        print("\n" + "="*60)
        if avg_observer < avg_polling:
            print(f"FASTEST METHOD: MutationObserver (wins by {avg_polling - avg_observer:.1f} ms)")
        else:
            print(f"FASTEST METHOD: Python Polling (wins by {avg_observer - avg_polling:.1f} ms)")
        print("="*60)
        
        browser.close()

if __name__ == "__main__":
    run_detection_benchmark()
