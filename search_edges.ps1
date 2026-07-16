$lines = Get-Content "prompt_clean.txt"
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match "Graph Builder" -or $line -match "Graph Construction" -or $line -match "adjacency") {
        Write-Output "Line $($i + 1): $line"
    }
}
