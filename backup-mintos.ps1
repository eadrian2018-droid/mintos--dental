# ============================================================
# MintOS - Backup de Supabase
# Base de datos + Storage
# ============================================================

$ErrorActionPreference = "Stop"

$fecha = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

$backupRoot = Join-Path $PSScriptRoot "backups"
$backupDir = Join-Path $backupRoot $fecha
$storageDir = Join-Path $backupDir "storage\radiografias"

Write-Host ""
Write-Host "========================================="
Write-Host " MintOS - Backup"
Write-Host " $fecha"
Write-Host "========================================="
Write-Host ""

# ------------------------------------------------------------
# Crear carpetas
# ------------------------------------------------------------

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
New-Item -ItemType Directory -Force -Path $storageDir | Out-Null

# ------------------------------------------------------------
# 1. Estructura de base de datos
# ------------------------------------------------------------

Write-Host "[1/4] Respaldando estructura de base de datos..."

& npx supabase db dump `
    --linked `
    --file "$backupDir\schema.sql"

if ($LASTEXITCODE -ne 0) {
    throw "Error al respaldar la estructura de la base de datos."
}

# ------------------------------------------------------------
# 2. Datos
# ------------------------------------------------------------

Write-Host ""
Write-Host "[2/4] Respaldando datos..."

& npx supabase db dump `
    --linked `
    --data-only `
    --use-copy `
    --file "$backupDir\data.sql"

if ($LASTEXITCODE -ne 0) {
    throw "Error al respaldar los datos."
}

# ------------------------------------------------------------
# 3. Roles
# ------------------------------------------------------------

Write-Host ""
Write-Host "[3/4] Respaldando roles..."

& npx supabase db dump `
    --linked `
    --role-only `
    --file "$backupDir\roles.sql"

if ($LASTEXITCODE -ne 0) {
    throw "Error al respaldar los roles."
}

# ------------------------------------------------------------
# 4. Supabase Storage
# ------------------------------------------------------------

Write-Host ""
Write-Host "[4/4] Respaldando Storage: radiografias..."

Push-Location $PSScriptRoot

try {

    $storageRelative = Join-Path `
        "backups\$fecha" `
        "storage\radiografias"

    & npx supabase storage cp `
        -r `
        "ss:///radiografias" `
        "$storageRelative" `
        --linked `
        --experimental

    if ($LASTEXITCODE -ne 0) {
        throw "Error al respaldar Supabase Storage."
    }

}
finally {
    Pop-Location
}

# ------------------------------------------------------------
# Verificar archivos SQL
# ------------------------------------------------------------

$schemaFile = Join-Path $backupDir "schema.sql"
$dataFile = Join-Path $backupDir "data.sql"
$rolesFile = Join-Path $backupDir "roles.sql"

if (-not (Test-Path $schemaFile)) {
    throw "No se encontro schema.sql."
}

if (-not (Test-Path $dataFile)) {
    throw "No se encontro data.sql."
}

if (-not (Test-Path $rolesFile)) {
    throw "No se encontro roles.sql."
}

$schema = Get-Item $schemaFile
$data = Get-Item $dataFile
$roles = Get-Item $rolesFile

if ($schema.Length -eq 0) {
    throw "schema.sql esta vacio."
}

if ($data.Length -eq 0) {
    throw "data.sql esta vacio."
}

if ($roles.Length -eq 0) {
    throw "roles.sql esta vacio."
}

# ------------------------------------------------------------
# Verificar Storage
# ------------------------------------------------------------

$storageFiles = @(
    Get-ChildItem $storageDir -File -Recurse
)

$storageBytes = (
    $storageFiles |
    Measure-Object -Property Length -Sum
).Sum

if ($null -eq $storageBytes) {
    $storageBytes = 0
}

if ($storageFiles.Count -eq 0) {
    throw "El respaldo de Storage no contiene archivos."
}

# ------------------------------------------------------------
# Resultado
# ------------------------------------------------------------

Write-Host ""
Write-Host "========================================="
Write-Host " BACKUP COMPLETADO"
Write-Host "========================================="
Write-Host ""

Write-Host "Carpeta:"
Write-Host $backupDir

Write-Host ""
Write-Host "Base de datos:"
Write-Host "Schema:  $($schema.Length) bytes"
Write-Host "Datos:   $($data.Length) bytes"
Write-Host "Roles:   $($roles.Length) bytes"

Write-Host ""
Write-Host "Storage:"
Write-Host "Archivos: $($storageFiles.Count)"
Write-Host "Tamano:   $storageBytes bytes"

Write-Host ""
Write-Host "Backup MintOS finalizado correctamente."
Write-Host ""