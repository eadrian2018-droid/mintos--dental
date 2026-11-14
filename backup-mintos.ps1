param(
    [string]$BackupRoot = "C:\MintOS-Backups",
    [switch]$IncluirRadiografias
)

# ============================================================
# MintOS Dental System
# Respaldo de PostgreSQL + Supabase Storage
# Compatible con Supabase CLI 3.1.0
# ============================================================

$ErrorActionPreference = "Stop"

$fecha = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

$BackupRoot = [System.IO.Path]::GetFullPath($BackupRoot)
$backupDir = Join-Path $BackupRoot $fecha
$storageRoot = Join-Path $backupDir "storage"

# ------------------------------------------------------------
# Validar ubicación
# ------------------------------------------------------------

$proyecto = [System.IO.Path]::GetFullPath($PSScriptRoot)

if (
    $BackupRoot.Equals(
        $proyecto,
        [System.StringComparison]::OrdinalIgnoreCase
    ) -or
    $BackupRoot.StartsWith(
        $proyecto.TrimEnd('\') + '\',
        [System.StringComparison]::OrdinalIgnoreCase
    )
) {
    throw "No se permite guardar respaldos dentro del proyecto MintOS."
}

$oneDrivePaths = @(
    $env:OneDrive,
    $env:OneDriveConsumer,
    $env:OneDriveCommercial
) | Where-Object { $_ }

foreach ($oneDrivePath in $oneDrivePaths) {

    $rutaOneDrive = [System.IO.Path]::GetFullPath(
        $oneDrivePath
    ).TrimEnd('\')

    if (
        $BackupRoot.Equals(
            $rutaOneDrive,
            [System.StringComparison]::OrdinalIgnoreCase
        ) -or
        $BackupRoot.StartsWith(
            $rutaOneDrive + '\',
            [System.StringComparison]::OrdinalIgnoreCase
        )
    ) {
        throw "No se permite guardar respaldos dentro de OneDrive."
    }
}

# ------------------------------------------------------------
# Función para ejecutar Supabase CLI
# ------------------------------------------------------------

function Invoke-SupabaseCLI {

    param(
        [string[]]$Argumentos,
        [string]$MensajeError
    )

    & npx supabase @Argumentos

    if ($LASTEXITCODE -ne 0) {
        throw $MensajeError
    }
}

# ------------------------------------------------------------
# Preparar directorios
# ------------------------------------------------------------

New-Item `
    -ItemType Directory `
    -Force `
    -Path $backupDir | Out-Null

New-Item `
    -ItemType Directory `
    -Force `
    -Path $storageRoot | Out-Null

Write-Host ""
Write-Host "========================================="
Write-Host " MintOS - Backup"
Write-Host " $fecha"
Write-Host "========================================="
Write-Host ""
Write-Host "Destino: $backupDir"
Write-Host ""

# ------------------------------------------------------------
# Ejecutar desde el directorio del proyecto
# ------------------------------------------------------------

Push-Location $PSScriptRoot

try {

    # --------------------------------------------------------
    # 1. Estructura de PostgreSQL
    # --------------------------------------------------------

    Write-Host "[1/4] Respaldando estructura..."

    $schemaFile = Join-Path $backupDir "schema.sql"

    Invoke-SupabaseCLI `
        -Argumentos @(
            "db",
            "dump",
            "--linked",
            "--file",
            $schemaFile
        ) `
        -MensajeError "Error al respaldar estructura."

    # --------------------------------------------------------
    # 2. Datos de PostgreSQL
    # --------------------------------------------------------

    Write-Host ""
    Write-Host "[2/4] Respaldando datos..."

    $dataFile = Join-Path $backupDir "data.sql"

    Invoke-SupabaseCLI `
        -Argumentos @(
            "db",
            "dump",
            "--linked",
            "--data-only",
            "--use-copy",
            "--file",
            $dataFile
        ) `
        -MensajeError "Error al respaldar datos."

    # --------------------------------------------------------
    # 3. Roles de PostgreSQL
    # --------------------------------------------------------

    Write-Host ""
    Write-Host "[3/4] Respaldando roles..."

    $rolesFile = Join-Path $backupDir "roles.sql"

    Invoke-SupabaseCLI `
        -Argumentos @(
            "db",
            "dump",
            "--linked",
            "--role-only",
            "--file",
            $rolesFile
        ) `
        -MensajeError "Error al respaldar roles."

    # --------------------------------------------------------
    # Verificar archivos SQL
    # --------------------------------------------------------

    foreach ($archivo in @(
        $schemaFile,
        $dataFile,
        $rolesFile
    )) {

        if (-not (Test-Path -LiteralPath $archivo)) {
            throw "No se genero el archivo: $archivo"
        }

        $info = Get-Item -LiteralPath $archivo

        if ($info.Length -eq 0) {
            throw "El archivo esta vacio: $archivo"
        }
    }

    # --------------------------------------------------------
    # 4. Supabase Storage
    # --------------------------------------------------------

    Write-Host ""
    Write-Host "[4/4] Respaldando Supabase Storage..."

    $buckets = @(
        "documentos_clinicos",
        "mintos-consentimientos-firmas"
    )

    if ($IncluirRadiografias) {
        $buckets += "radiografias"
    }

    $resumenStorage = @()

    foreach ($bucket in $buckets) {

        Write-Host ""
        Write-Host "Descargando bucket: $bucket"

        $destino = Join-Path $storageRoot $bucket

        New-Item `
            -ItemType Directory `
            -Force `
            -Path $destino | Out-Null

        Invoke-SupabaseCLI `
            -Argumentos @(
                "storage",
                "cp",
                "--recursive",
                "ss:///$bucket",
                $destino,
                "--remote"
            ) `
            -MensajeError "Error descargando bucket: $bucket"

        $archivos = @(
            Get-ChildItem `
                -LiteralPath $destino `
                -File `
                -Recurse
        )

        if ($archivos.Count -eq 0) {
            throw "El bucket $bucket no genero archivos locales. Verificar si esta vacio o si fallo la descarga."
        }

        $bytes = (
            $archivos |
            Measure-Object -Property Length -Sum
        ).Sum

        $resumenStorage += [PSCustomObject]@{
            Bucket   = $bucket
            Archivos = $archivos.Count
            Bytes    = $bytes
        }

        Write-Host "Archivos: $($archivos.Count)"
        Write-Host "Bytes: $bytes"
    }

    # --------------------------------------------------------
    # Generar manifiesto de integridad
    # --------------------------------------------------------

    Write-Host ""
    Write-Host "Generando manifiesto SHA-256..."

    $archivosBackup = @(
        Get-ChildItem `
            -LiteralPath $backupDir `
            -File `
            -Recurse
    )

    $manifest = foreach ($archivo in $archivosBackup) {

        $rutaRelativa = $archivo.FullName.Substring(
            $backupDir.Length
        ).TrimStart('\', '/')

        [PSCustomObject]@{
            Archivo = $rutaRelativa
            Bytes   = $archivo.Length
            SHA256  = (
                Get-FileHash `
                    -LiteralPath $archivo.FullName `
                    -Algorithm SHA256
            ).Hash
        }
    }

    $manifestFile = Join-Path $backupDir "manifest.json"

    $manifest |
        ConvertTo-Json -Depth 5 |
        Set-Content `
            -LiteralPath $manifestFile `
            -Encoding UTF8

    # --------------------------------------------------------
    # Marcar respaldo como completado
    # --------------------------------------------------------

    $estadoFile = Join-Path $backupDir "BACKUP_COMPLETADO.txt"

    @(
        "MintOS Backup"
        "Fecha: $fecha"
        "Estado: COMPLETADO"
        "Destino: $backupDir"
        "Archivos verificados localmente: $($archivosBackup.Count)"
    ) | Set-Content `
        -LiteralPath $estadoFile `
        -Encoding UTF8

    # --------------------------------------------------------
    # Resultado
    # --------------------------------------------------------

    Write-Host ""
    Write-Host "========================================="
    Write-Host " BACKUP COMPLETADO"
    Write-Host "========================================="
    Write-Host ""

    Write-Host "Carpeta:"
    Write-Host $backupDir

    Write-Host ""
    Write-Host "PostgreSQL:"
    Write-Host "Schema: $((Get-Item $schemaFile).Length) bytes"
    Write-Host "Datos:  $((Get-Item $dataFile).Length) bytes"
    Write-Host "Roles:  $((Get-Item $rolesFile).Length) bytes"

    Write-Host ""
    Write-Host "Storage:"

    $resumenStorage | Format-Table -AutoSize

    Write-Host ""
    Write-Host "Manifest: $manifestFile"
    Write-Host ""
    Write-Host "Respaldo finalizado correctamente."
    Write-Host ""

}
finally {

    Pop-Location

}