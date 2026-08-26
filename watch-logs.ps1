# MailMind Server Log Viewer
while ($true) {
    Clear-Host
    Write-Host "=== MailMind Server Logs (Press Ctrl+C to exit) ===" -ForegroundColor Cyan
    Write-Host ""
    
    $logFile = "D:\AgnesRepo\mail-mind-assistant\server.log"
    if (Test-Path $logFile) {
        Get-Content $logFile -Tail 50 -Wait
    } else {
        Write-Host "Log file not found: $logFile" -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}
