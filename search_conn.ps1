$lines = Get-Content "prompt_clean.txt"
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match "Road Connection" -or $line -match "edge" -and $line -match "load") {
        Write-Output "Line $($i + 1): $line"
    }
}
