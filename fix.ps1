$path = "apps\admin_khcn\app\services\admin\layout.tsx"
$text = [System.IO.File]::ReadAllText($path)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $text, $utf8NoBom)
