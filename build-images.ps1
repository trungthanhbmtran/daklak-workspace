$ErrorActionPreference = "Stop"

$services = @(
    @{ Name = "user-service"; Path = "apps/user-service"; HasMigration = $true },
    @{ Name = "hrm-service"; Path = "apps/hrm-service"; HasMigration = $true },
    @{ Name = "posts-service"; Path = "apps/posts-service"; HasMigration = $true },
    @{ Name = "media-service"; Path = "apps/media-service"; HasMigration = $true },
    @{ Name = "translate-service"; Path = "apps/translate_service"; HasMigration = $true },
    @{ Name = "admin-khcn"; Path = "apps/admin_khcn"; HasMigration = $false },
    @{ Name = "api-gateway"; Path = "apps/api-gateway"; HasMigration = $false },
    @{ Name = "notification-service"; Path = "apps/notification_service"; HasMigration = $false },
    @{ Name = "e-portal"; Path = "apps/e-portal"; HasMigration = $false }
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " STARTING BUILD: DAKLAK WORKSPACE FULL SYSTEM " -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan

foreach ($svc in $services) {
    $name = $svc.Name
    $path = $svc.Path
    $hasMigration = $svc.HasMigration
    $tag = "daklak-${name}:latest"
    
    Write-Host "`n[+] Processing: $name" -ForegroundColor Yellow
    
    $dockerfile = Join-Path $path "Dockerfile"
    if (-not (Test-Path $dockerfile)) {
        $dockerfile = Join-Path $path "dockerfile"
    }

    if (-not (Test-Path $dockerfile)) {
        Write-Warning " WARNING: Dockerfile not found at $path. Skipping $name."
        continue
    }

    if ($hasMigration) {
        Write-Host "--> [1/2] Building App Image (Target: runner)..." -ForegroundColor Gray
        # TRẢ LẠI DẤU .
        docker build --target runner -t $tag -f $dockerfile .
        Write-Host " SUCCESS: $tag" -ForegroundColor Green

        $migrationTag = "daklak-${name}-migration:latest"
        Write-Host "--> [2/2] Building Migration Image (Target: migration)..." -ForegroundColor Gray
        # TRẢ LẠI DẤU .
        docker build --target migration -t $migrationTag -f $dockerfile .
        Write-Host " SUCCESS: $migrationTag" -ForegroundColor Green
    }
    else {
        Write-Host "--> Building Standard Image..." -ForegroundColor Gray
        # TRẢ LẠI DẤU .
        docker build -t $tag -f $dockerfile .
        Write-Host " SUCCESS: $tag" -ForegroundColor Green
    }
}

Write-Host "`n ALL IMAGES BUILT SUCCESSFULLY!" -ForegroundColor Cyan