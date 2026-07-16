$lines = Get-Content "prompt_clean.txt"
for ($i = 19603; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match "port" -or $line -match "localhost" -or $line -match "npm run" -or $line -match "viva" -or $line -match "setup") {
        Write-Output "Line $($i + 1): $line"
    }
}
