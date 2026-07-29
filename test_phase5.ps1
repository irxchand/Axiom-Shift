$InputData = @{
    command = "send-chat-message"
    sessionId = "ishaan"
    headless = $false
    adapter = "connected_chat"
    targetUrl = "https://chatgpt.com"
    message = "What is the current spatial risk index?"
}

$JsonInput = $InputData | ConvertTo-Json -Compress

Write-Host "Sending the following payload to Browser Framework Adapter:"
Write-Host $JsonInput
Write-Host ""
Write-Host "Starting browser (this may pop up on your screen)..."

$JsonInput | & "E:\Python\Sem Ops\Axiom-Shift\browser\venv\Scripts\python.exe" "E:\Python\Sem Ops\Axiom-Shift\browser\runner\browser_framework_cli.py"

Write-Host ""
Write-Host "Test complete."

