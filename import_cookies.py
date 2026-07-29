import json
import subprocess
import sys

# Read the cookies
cookie_file = r"E:\Python\Sem Ops\Prerequisites\Browser API\venv\cookies.json"
with open(cookie_file, "r") as f:
    cookies = json.load(f)

# Build the payload
payload = {
    "command": "import-cookies",
    "cookies": cookies,
    "sessionId": "default"
}

# Pipe to the CLI
cli_script = r"E:\Python\Sem Ops\Axiom-Shift\browser\runner\browser_framework_cli.py"
python_exe = r"E:\Python\Sem Ops\Axiom-Shift\browser\venv\Scripts\python.exe"

print("Importing cookies into the default browser profile...")
process = subprocess.Popen([python_exe, cli_script], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
stdout, stderr = process.communicate(input=json.dumps(payload))

print("STDOUT:", stdout)
print("STDERR:", stderr)
