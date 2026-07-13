$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8000/")
$listener.Start()
Write-Host "Server running at http://localhost:8000/"
$root = (Resolve-Path .).Path
while ($listener.IsListening) {
  $context = $listener.GetContext()
  $request = $context.Request
  $response = $context.Response
  $rawUrl = $request.RawUrl
  $path = Join-Path $root ($rawUrl -replace '^/', '')
  if ($rawUrl -eq '/') { $path = Join-Path $root 'index.html' }
  if (Test-Path $path -PathType Leaf) {
    $ext = [System.IO.Path]::GetExtension($path)
    $mime = switch ($ext) {
      '.html' { 'text/html; charset=utf-8' }
      '.css'  { 'text/css; charset=utf-8' }
      '.js'   { 'application/javascript; charset=utf-8' }
      '.png'  { 'image/png' }
      '.jpg'  { 'image/jpeg' }
      '.jpeg' { 'image/jpeg' }
      '.gif'  { 'image/gif' }
      '.svg'  { 'image/svg+xml' }
      '.ttf'  { 'font/ttf' }
      '.woff' { 'font/woff' }
      '.woff2'{ 'font/woff2' }
      default { 'application/octet-stream' }
    }
    $buffer = [System.IO.File]::ReadAllBytes($path)
    $response.ContentType = $mime
    $response.ContentLength64 = $buffer.Length
    $response.OutputStream.Write($buffer, 0, $buffer.Length)
  } else {
    $response.StatusCode = 404
    $msg = [Text.Encoding]::UTF8.GetBytes("Not found: $rawUrl")
    $response.ContentLength64 = $msg.Length
    $response.OutputStream.Write($msg, 0, $msg.Length)
  }
  $response.Close()
}
