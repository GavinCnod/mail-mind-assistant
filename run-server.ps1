# MailMind Development Server Launcher
$projectRoot = "D:\AgnesRepo\mail-mind-assistant"
$webApp = "$projectRoot\apps\web"
$logFile = "$projectRoot\server.log"

Write-Host "Starting MailMind development server..." -ForegroundColor Green
Write-Host "Log file: $logFile" -ForegroundColor Yellow
Write-Host ""

# Redirect output to log file and console
cd $webApp
pnpm dev | Tee-Object -FilePath $logFile -Append
