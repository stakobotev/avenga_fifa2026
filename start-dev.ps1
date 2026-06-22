<#
.SYNOPSIS
    Local dev startup for FIFA 2026 Prode (personal use).

.DESCRIPTION
    Runs four steps in order and STOPS at the first failure with a clear reason:
      1. Build backend  (Maven)
      2. Build frontend (npm install + tsc + vite build)
      3. Start backend  (runs the built jar with the dev profile, new window)
      4. Start frontend (vite dev server, new window)

    The build steps run here and must succeed before anything is started.
    The two servers then launch in their own PowerShell windows so you can
    read their logs and Ctrl+C either one independently.

.PARAMETER WithTests
    Run the backend test suite as part of the build (skipped by default for speed).

.EXAMPLE
    .\start-dev.ps1
    .\start-dev.ps1 -WithTests
#>
[CmdletBinding()]
param(
    [switch]$WithTests
)

$ErrorActionPreference = 'Stop'

$root     = $PSScriptRoot
$backend  = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'

function Step($name) {
    Write-Host ''
    Write-Host "==> $name" -ForegroundColor Cyan
}

function Fail($message) {
    Write-Host ''
    Write-Host "STARTUP FAILED: $message" -ForegroundColor Red
    exit 1
}

# Wait until a TCP port accepts a connection, or give up after $timeoutSec.
# $proc is the server process so we can fail fast if it dies before binding.
function Wait-Port {
    param([int]$Port, [int]$TimeoutSec, [System.Diagnostics.Process]$Proc)

    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        if ($Proc -and $Proc.HasExited) {
            return $false   # process died before the port opened
        }
        try {
            $client = New-Object System.Net.Sockets.TcpClient
            $client.Connect('127.0.0.1', $Port)
            $client.Close()
            return $true
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    return $false
}

# --- Sanity checks -----------------------------------------------------------

if (-not (Test-Path (Join-Path $backend 'mvnw.cmd'))) {
    Fail "backend\mvnw.cmd not found. Run this script from the repository root."
}
if (-not (Test-Path (Join-Path $frontend 'package.json'))) {
    Fail "frontend\package.json not found. Run this script from the repository root."
}
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    Fail "'java' is not on your PATH. Install a JDK (17+) or add it to PATH so the backend jar can run."
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Fail "'npm' is not on your PATH. Install Node.js so the frontend can build and run."
}

# --- 1. Build backend --------------------------------------------------------

Step 'Building backend (Maven)'
Push-Location $backend
try {
    $mvnArgs = @('clean', 'package')
    if (-not $WithTests) { $mvnArgs += '-DskipTests' }
    & .\mvnw.cmd @mvnArgs
    if ($LASTEXITCODE -ne 0) {
        Fail "Backend build failed (Maven exited $LASTEXITCODE). See the Maven output above for the failing module/test."
    }
} finally {
    Pop-Location
}

# Locate the runnable jar (Spring Boot repackaged jar, not the *.jar.original).
$jar = Get-ChildItem (Join-Path $backend 'target') -Filter '*.jar' -ErrorAction SilentlyContinue |
       Where-Object { $_.Name -notlike '*.original' } |
       Select-Object -First 1
if (-not $jar) {
    Fail "Backend build succeeded but no runnable jar was found in backend\target. Check the Maven 'package' output."
}

# --- 2. Build frontend -------------------------------------------------------

Step 'Building frontend (npm install + build)'
Push-Location $frontend
try {
    # Call npm.cmd explicitly: invoking bare 'npm' goes through npm.ps1, whose
    # arg handling is buggy on Windows (turns 'install' into 'pm').
    & npm.cmd install
    if ($LASTEXITCODE -ne 0) {
        Fail "Frontend dependency install failed (npm exited $LASTEXITCODE). See the npm output above."
    }
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) {
        Fail "Frontend build failed (npm exited $LASTEXITCODE). This is usually a TypeScript (tsc) or Vite error shown above."
    }
} finally {
    Pop-Location
}

# --- 3. Start backend --------------------------------------------------------

Step 'Starting backend (dev profile, port 8080)'
$backendCmd = "Set-Location '$backend'; `$env:SPRING_PROFILES_ACTIVE='dev'; " +
              "Write-Host 'Backend (dev) - http://localhost:8080' -ForegroundColor Green; " +
              "java -jar '$($jar.FullName)'"
$backendProc = Start-Process powershell -ArgumentList '-NoExit', '-Command', $backendCmd -PassThru

Write-Host '    Waiting for backend to accept connections on port 8080...' -ForegroundColor DarkGray
if (-not (Wait-Port -Port 8080 -TimeoutSec 120 -Proc $backendProc)) {
    if ($backendProc.HasExited) {
        Fail "The backend process exited before it started listening on port 8080. Check its window for the stack trace (common causes: port 8080 already in use, or a Flyway/schema error)."
    }
    Fail "The backend did not start listening on port 8080 within 120s. Check its window for the cause."
}
Write-Host '    Backend is up.' -ForegroundColor Green

# --- 4. Start frontend -------------------------------------------------------

Step 'Starting frontend (Vite dev server, port 5173)'
$frontendCmd = "Set-Location '$frontend'; " +
               "Write-Host 'Frontend (dev) - http://localhost:5173' -ForegroundColor Green; " +
               "npm.cmd run dev"
Start-Process powershell -ArgumentList '-NoExit', '-Command', $frontendCmd | Out-Null

# --- Done --------------------------------------------------------------------

Write-Host ''
Write-Host 'All set. Both servers are starting in their own windows:' -ForegroundColor Green
Write-Host '  Backend : http://localhost:8080  (H2 console: http://localhost:8080/h2-console)'
Write-Host '  Frontend: http://localhost:5173'
Write-Host ''
Write-Host 'Close those windows (or Ctrl+C in each) to stop the servers.' -ForegroundColor DarkGray
