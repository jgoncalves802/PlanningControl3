Write-Host "🧪 Testando API de user-permissions..." -ForegroundColor Green

$testUserId = "cmdt1nl930001i8bc2qwokeuu"
$url = "http://localhost:3001/api/settings/user-permissions/$testUserId"

Write-Host "📡 Testando GET $url" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $url -Method GET -ContentType "application/json"
    Write-Host "✅ Resposta:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Erro:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
} 