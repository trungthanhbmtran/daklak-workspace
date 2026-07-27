$apps = Get-ChildItem -Path apps -Directory
foreach ($app in $apps) {
  if (Test-Path "$($app.FullName)/prisma") {
    Write-Host "Installing in $($app.Name)..."
    Push-Location "$($app.FullName)"
    npm install @prisma/adapter-mariadb mariadb
    Pop-Location
  }
}
