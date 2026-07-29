import json
import os

def load_adapter(adapter_name: str) -> dict:
    base_dir = os.path.dirname(os.path.dirname(__file__))
    adapter_path = os.path.join(base_dir, "adapters", f"{adapter_name}.adapter.json")
    if not os.path.exists(adapter_path):
        raise FileNotFoundError(f"Adapter not found: {adapter_path}")
    with open(adapter_path, "r", encoding="utf-8") as f:
        return json.load(f)
