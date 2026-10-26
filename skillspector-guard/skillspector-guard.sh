#!/bin/bash
# skillspector-guard.sh
# Hook PreToolUse (matcher "Bash") de Claude Code: antes de que entre un repo, skill o MCP,
# lo pasa por NVIDIA SkillSpector (--no-llm) y decide segun risk_assessment.recommendation.
#
#   SAFE            -> deja pasar en silencio
#   CAUTION         -> deja pasar con un systemMessage (score + 2 hallazgos principales)
#   DO_NOT_INSTALL  -> permissionDecision "ask" con score, severidad y 3 hallazgos graves
#   cualquier fallo -> deja pasar con un systemMessage "NO se reviso"
#
# Siempre termina con codigo 0 y solo imprime JSON valido (o nada). Nunca usa exit 2.
# Compatible con bash 3.2 de macOS. Requiere jq y skillspector.
#
# Variables opcionales (para pruebas): SKILLSPECTOR_GUARD_TIMEOUT (segundos, 100 por defecto)
# y SKILLSPECTOR_BIN (ruta del escaner).

export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
LIMIT="${SKILLSPECTOR_GUARD_TIMEOUT:-100}"
SCANNER="${SKILLSPECTOR_BIN:-skillspector}"

# ---------- salidas ----------
say() {  # deja pasar mostrando un mensaje
  jq -n --arg m "$1" '{systemMessage: $m}' 2>/dev/null \
    || printf '{"systemMessage":"SkillSpector guard: aviso (no se pudo formatear el detalle)."}\n'
}
ask() {  # pide decision al usuario
  jq -n --arg r "$1" '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "ask", permissionDecisionReason: $r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"SkillSpector recomienda NO instalar, pero no se pudo formatear el detalle."}}\n'
}

# ---------- que comandos le interesan ----------
B='(^|[^[:alnum:]_./-])'
kind_of() {
  local c="$1"
  if   [[ $c =~ ${B}git[[:space:]]+(-C[[:space:]]+[^[:space:]]+[[:space:]]+)?clone([[:space:]]|$) ]]; then echo "git clone"
  elif [[ $c =~ ${B}gh[[:space:]]+repo[[:space:]]+clone([[:space:]]|$) ]]; then echo "gh repo clone"
  elif [[ $c =~ ${B}npx([[:space:]]+-[^[:space:]]+)*[[:space:]]+skills(@[^[:space:]]+)?[[:space:]]+add([[:space:]]|$) ]]; then echo "npx skills add"
  elif [[ $c =~ ${B}claude[[:space:]]+mcp[[:space:]]+add([[:space:]]|-|$) ]]; then echo "claude mcp add"
  elif [[ $c =~ ${B}uv[[:space:]]+(tool|pip)[[:space:]]+install[[:space:]].*git\+ ]]; then echo "uv install git+"
  elif [[ $c =~ ${B}(pip|pip3|pipx)[[:space:]]+install[[:space:]].*git\+ ]]; then echo "pip install git+"
  elif [[ $c =~ ${B}(curl|wget)[[:space:]][^\|]*\|[[:space:]]*(sudo[[:space:]]+(-[^[:space:]]+[[:space:]]+)*)?(ba|z)?sh([[:space:]]|\;|\&|\)|$) ]]; then echo "curl/wget | sh"
  elif [[ $c =~ ${B}(ba|z)?sh[[:space:]]+(-[^[:space:]]+[[:space:]]+)*\<\((curl|wget)[[:space:]] ]]; then echo "curl/wget | sh"
  elif [[ $c =~ ${B}(ba|z)?sh[[:space:]]+-c[[:space:]]+[\"\']?\$\((curl|wget)[[:space:]] ]]; then echo "curl/wget | sh"
  fi
}

# ---------- entrada ----------
RAW="$(cat)"

if ! command -v jq >/dev/null 2>&1; then
  # Sin jq no puedo leer el JSON bien: solo aviso si el texto crudo huele a instalacion.
  if [ -n "$(kind_of "$RAW")" ]; then
    say "SkillSpector guard: este comando NO se reviso porque falta jq. Instalalo con: brew install jq"
  fi
  exit 0
fi

CMD="$(printf '%s' "$RAW" | jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -z "$CMD" ] && exit 0
KIND="$(kind_of "$CMD")"
[ -z "$KIND" ] && exit 0

# ---------- sacar el repo de GitHub ----------
REPOS="$(printf '%s\n' "$CMD" \
  | grep -oE '(^|[^A-Za-z0-9.-])(raw\.githubusercontent\.com/|github\.com[:/]+)[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+' 2>/dev/null \
  | sed -E 's#^[^A-Za-z0-9]*##; s#^(raw\.githubusercontent\.com/|github\.com[:/]+)##; s#\.git$##' \
  | awk 'NF && !seen[$0]++')"

# usuario/repo a secas (solo gh repo clone y npx skills add)
if [ -z "$REPOS" ]; then
  REST=""
  case "$KIND" in
    "gh repo clone")  REST="$(printf '%s' "$CMD" | sed -E 's/.*gh[[:space:]]+repo[[:space:]]+clone[[:space:]]+//')" ;;
    "npx skills add") REST="$(printf '%s' "$CMD" | sed -E 's/.*skills(@[^[:space:]]+)?[[:space:]]+add[[:space:]]+//')" ;;
  esac
  for w in $REST; do
    w="${w//\"/}"; w="${w//\'/}"; w="${w%%@*}"; w="${w%.git}"
    if [[ $w =~ ^[A-Za-z0-9_-][A-Za-z0-9_.-]*/[A-Za-z0-9_.-]+$ ]]; then REPOS="$w"; break; fi
  done
fi

if [ -z "$REPOS" ]; then
  say "SkillSpector guard: ($KIND) este comando NO se reviso. No trae ningun repo de GitHub (es un paquete de npm/PyPI o una URL de otro sitio) y SkillSpector solo escanea repos de GitHub. Revisalo por tu cuenta antes de confiar en el."
  exit 0
fi

REPO="$(printf '%s\n' "$REPOS" | head -n 1)"
URL="https://github.com/$REPO"
EXTRA=""
N="$(printf '%s\n' "$REPOS" | wc -l | tr -d ' ')"
[ "$N" -gt 1 ] && EXTRA=" Ojo: el comando trae $((N - 1)) repo(s) mas que NO se revisaron."

# ---------- escaneo con limite de tiempo (sin comando timeout) ----------
if ! command -v "$SCANNER" >/dev/null 2>&1; then
  say "SkillSpector guard: $URL NO se reviso porque no encuentro el comando skillspector. Instalalo con: uv tool install git+https://github.com/NVIDIA/skillspector.git$EXTRA"
  exit 0
fi

TMP="$(mktemp -d "${TMPDIR:-/tmp}/skillspector-guard.XXXXXX" 2>/dev/null)" || { say "SkillSpector guard: $URL NO se reviso (no pude crear carpeta temporal).$EXTRA"; exit 0; }
trap 'rm -rf "$TMP"' EXIT

"$SCANNER" scan "$URL" --no-llm -f json >"$TMP/out.json" 2>"$TMP/err.txt" </dev/null &
PID=$!
START=$SECONDS
TIMED_OUT=0
while kill -0 "$PID" 2>/dev/null; do
  if [ $((SECONDS - START)) -ge "$LIMIT" ]; then
    TIMED_OUT=1
    pkill -TERM -P "$PID" 2>/dev/null; kill -TERM "$PID" 2>/dev/null
    sleep 1
    pkill -KILL -P "$PID" 2>/dev/null; kill -KILL "$PID" 2>/dev/null
    break
  fi
  sleep 0.2
done
wait "$PID" 2>/dev/null
RC=$?

if [ "$TIMED_OUT" -eq 1 ]; then
  say "SkillSpector guard: $URL NO se reviso: el escaneo paso de ${LIMIT}s y lo corte.$EXTRA"
  exit 0
fi

# ---------- decidir por el JSON, no por el codigo de salida ----------
if ! jq -e '.execution_successful == true and (.risk_assessment.recommendation | type == "string")' "$TMP/out.json" >/dev/null 2>&1; then
  say "SkillSpector guard: $URL NO se reviso: el escaneo fallo o el resultado no se pudo leer (codigo de salida $RC).$EXTRA"
  exit 0
fi

REC="$(jq -r '.risk_assessment.recommendation' "$TMP/out.json")"
SCORE="$(jq -r '.risk_assessment.score // "?"' "$TMP/out.json")"
SEV="$(jq -r '.risk_assessment.severity // "?"' "$TMP/out.json")"

# hallazgos ordenados por gravedad (y confianza); $1 = cuantos
top() {
  jq -r --argjson n "$1" '
    def rank: ({"CRITICAL":4,"HIGH":3,"MEDIUM":2,"LOW":1}[(.severity // "") | ascii_upcase]) // 0;
    [.issues[]?] | sort_by([-(rank), -(.confidence // 0)]) | .[0:$n][]
    | "[\(.severity // "?")] \(.category // "?") - \(.location.file // "?"):\(.location.start_line // "?")"' "$TMP/out.json" 2>/dev/null
}

case "$REC" in
  SAFE)
    exit 0
    ;;
  CAUTION)
    T="$(top 2 | paste -sd ';' - | sed 's/;/; /g')"
    say "SkillSpector: CAUTION en $URL (score $SCORE, severidad $SEV). Principales hallazgos: ${T:-ninguno detallado}.$EXTRA"
    exit 0
    ;;
  DO_NOT_INSTALL)
    L="$(top 3 | awk '{print NR ". " $0}')"
    ask "SkillSpector recomienda NO INSTALAR $URL. Score $SCORE, severidad $SEV. Hallazgos mas graves:
$L$EXTRA
Aprobar solo si confias en el origen."
    exit 0
    ;;
  *)
    say "SkillSpector guard: $URL NO se reviso: recomendacion desconocida ($REC).$EXTRA"
    exit 0
    ;;
esac
