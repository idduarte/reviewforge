#!/usr/bin/env bash
set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

info()    { echo -e "${BOLD}${GREEN}[✓]${RESET} $*"; }
warn()    { echo -e "${BOLD}${YELLOW}[!]${RESET} $*"; }
error()   { echo -e "${BOLD}${RED}[✗]${RESET} $*"; exit 1; }
section() { echo -e "\n${BOLD}$*${RESET}"; }

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NVM_VERSION="v0.40.3"

section "── ReviewForge · Setup de entorno de desarrollo ──"

# ── 1. nvm ────────────────────────────────────────────────────────────────────
section "1/4  Instalando nvm ${NVM_VERSION}…"

export NVM_DIR="${HOME}/.nvm"

if [ -s "${NVM_DIR}/nvm.sh" ]; then
  warn "nvm ya está instalado — omitiendo descarga"
else
  curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh" | bash
  info "nvm instalado"
fi

# Cargar nvm en la sesión actual
# shellcheck source=/dev/null
source "${NVM_DIR}/nvm.sh"

# ── 2. Node.js 22 ─────────────────────────────────────────────────────────────
section "2/4  Instalando Node.js 22 LTS…"

cd "${PROJECT_DIR}"

NODE_VERSION="$(cat .nvmrc 2>/dev/null || echo '22')"

if nvm ls "${NODE_VERSION}" &>/dev/null; then
  warn "Node.js ${NODE_VERSION} ya está instalado"
else
  nvm install "${NODE_VERSION}"
fi

nvm use "${NODE_VERSION}"
info "Node $(node --version)  ·  npm $(npm --version)"

# ── 3. Dependencias npm ───────────────────────────────────────────────────────
section "3/4  Instalando dependencias del proyecto…"

npm ci
info "Dependencias instaladas"

# ── 4. Shell rc (auto-switch nvm) ─────────────────────────────────────────────
section "4/4  Configurando auto-switch de nvm en la shell…"

SHELL_RC=""
if [ -n "${ZSH_VERSION:-}" ] || [[ "${SHELL}" == */zsh ]]; then
  SHELL_RC="${HOME}/.zshrc"
else
  SHELL_RC="${HOME}/.bashrc"
fi

NVM_AUTOSWITCH_MARKER="# nvm-auto-switch (reviewforge)"

if grep -q "${NVM_AUTOSWITCH_MARKER}" "${SHELL_RC}" 2>/dev/null; then
  warn "Auto-switch ya configurado en ${SHELL_RC}"
else
  cat >> "${SHELL_RC}" <<'EOF'

# nvm-auto-switch (reviewforge)
export NVM_DIR="${HOME}/.nvm"
[ -s "${NVM_DIR}/nvm.sh" ] && source "${NVM_DIR}/nvm.sh"
[ -s "${NVM_DIR}/bash_completion" ] && source "${NVM_DIR}/bash_completion"

_nvm_auto_switch() {
  if [ -f .nvmrc ]; then
    local required
    required="$(cat .nvmrc)"
    if [ "$(node --version 2>/dev/null)" != "v${required}" ] && [ "$(node --version 2>/dev/null)" != "${required}" ]; then
      nvm use --silent
    fi
  fi
}

if [ -n "${ZSH_VERSION:-}" ]; then
  autoload -U add-zsh-hook
  add-zsh-hook chpwd _nvm_auto_switch
else
  export PROMPT_COMMAND="${PROMPT_COMMAND:+$PROMPT_COMMAND; }_nvm_auto_switch"
fi
EOF
  info "Auto-switch añadido a ${SHELL_RC}"
fi

# ── Resumen ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}──────────────────────────────────────────────────${RESET}"
echo -e "${BOLD}  Entorno listo. Comandos disponibles:${RESET}"
echo ""
echo "  npm run dev      → servidor de desarrollo (localhost:5173)"
echo "  npm run build    → build de producción"
echo "  npm run preview  → preview del build en dist/"
echo ""
echo -e "  Recarga tu shell para activar el auto-switch:"
echo -e "  ${BOLD}source ${SHELL_RC}${RESET}"
echo -e "${BOLD}──────────────────────────────────────────────────${RESET}"
