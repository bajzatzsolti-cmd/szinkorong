# Betölti a projekt hordozható Node.js-ét az aktuális PowerShell-munkamenetbe.
# Használat (a projekt gyökeréből):   . .\scripts\env.ps1
# Ha a gépen van rendszerszintű Node.js, erre nincs szükség.
$nodeDir = Join-Path $PSScriptRoot '..\.tools\node'
if (Test-Path $nodeDir) {
  $env:PATH = (Resolve-Path $nodeDir).Path + ';' + $env:PATH
}
