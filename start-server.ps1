# MailMind Dev Server - Keep Window Open
Write-Host "Starting MailMind dev server..." -ForegroundColor Green
Write-Host "Log location: D:\AgnesRepo\mail-mind-assistant\server.log" -ForegroundColor Yellow
Write-Host ""

cd D:\AgnesRepo\mail-mind-assistant\apps\web
pnpm dev 2>&1 | Tee-Object -FilePath "D:\AgnesRepo\mail-mind-assistant\server.log" -Append

Write-Host "Server stopped. Press any key to exit..." -ForegroundColor Red
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
