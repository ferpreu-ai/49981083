#!/bin/bash
# Instala el guardia SkillSpector en tu Mac. Correr desde esta carpeta: bash install-mac.sh
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
HOOK_DIR="$HOME/.claude/hooks"; HOOK="$HOOK_DIR/skillspector-guard.sh"
SETTINGS="$HOME/.claude/settings.json"
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "1/4 Dependencias"
if ! command -v uv >/dev/null; then
  echo "  - Instalo uv (instalador oficial de Astral): gestor de Python que trae su propio Python 3.12+"
  curl -LsSf https://astral.sh/uv/install.sh | sh || { echo "No pude instalar uv"; exit 1; }
  export PATH="$HOME/.local/bin:$PATH"
fi
if ! command -v jq >/dev/null; then
  if command -v brew >/dev/null; then brew install jq || exit 1
  else echo "Falta jq. Instala Homebrew (https://brew.sh) y corre: brew install jq"; exit 1; fi
fi
if ! command -v skillspector >/dev/null; then
  uv tool install git+https://github.com/NVIDIA/skillspector.git || exit 1
fi
skillspector --help >/dev/null 2>&1 && echo "  skillspector responde OK" || { echo "skillspector no responde"; exit 1; }

echo "2/4 Script del guardia"
mkdir -p "$HOOK_DIR"
cp "$HERE/skillspector-guard.sh" "$HOOK" && chmod +x "$HOOK" && echo "  copiado a $HOOK"

echo "3/4 Cambio propuesto a settings.json"
[ -f "$SETTINGS" ] || echo '{}' > "$SETTINGS"
jq empty "$SETTINGS" 2>/dev/null || { echo "Tu settings.json no es JSON valido; no toco nada."; exit 1; }
NEW="$(mktemp)"
# conserva todo lo existente; solo agrega la entrada si no esta ya
jq '.hooks.PreToolUse = (
      (.hooks.PreToolUse // [])
      | if any(.[]?; (.hooks // []) | any(.command? // "" | test("skillspector-guard")))
        then . else . + [{"matcher":"Bash","hooks":[{"type":"command","command":"~/.claude/hooks/skillspector-guard.sh","timeout":120}]}] end)' \
   "$SETTINGS" > "$NEW" || exit 1
if cmp -s "$SETTINGS" "$NEW"; then echo "  Ya estaba registrado. Nada que cambiar."; rm -f "$NEW"; exit 0; fi
diff -u "$SETTINGS" "$NEW"

echo
printf "4/4 Guardo este cambio? (se hace copia en settings.json.bak) [s/N] "
read -r ans
case "$ans" in
  s|S|si|SI|y|Y) cp "$SETTINGS" "$SETTINGS.bak"; mv "$NEW" "$SETTINGS"; echo "Listo. Reinicia Claude Code y mira /hooks > PreToolUse." ;;
  *) rm -f "$NEW"; echo "No guarde nada. El script quedo copiado, pero no esta activo." ;;
esac
