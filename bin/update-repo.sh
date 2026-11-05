#!/usr/bin/env bash
# Aktualizuje v repu agenty, hooky a vlastní skilly z agent-setup. Ukáže diff a zeptá se.
# Použití: bin/update-repo.sh <cesta-k-repu>
set -euo pipefail
SETUP="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:?Zadej cestu k repu}"
cd "$TARGET"
changed=0
check() { # check <src> <dst>
  if [ ! -e "$2" ] || ! diff -q "$1" "$2" >/dev/null; then diff -u "$2" "$1" 2>/dev/null || true; changed=1; fi
}
for f in "$SETUP"/agents/*.md; do check "$f" ".claude/agents/$(basename "$f")"; done
for f in "$SETUP"/hooks/*.mjs; do check "$f" "scripts/hooks/$(basename "$f")"; done
for d in "$SETUP"/skills/*/; do n="$(basename "$d")"; diff -ru ".claude/skills/$n" "$d" 2>/dev/null || changed=1; done
[ "$changed" = 0 ] && { echo "Vše aktuální."; exit 0; }
read -r -p "Přepsat lokální verze verzemi z agent-setup? Repo-specifické úpravy v agentech se ztratí. [y/N] " ok
[ "$ok" = "y" ] || exit 0
FORCE=1 "$SETUP/bin/new-repo.sh" "$TARGET" >/dev/null
echo "Aktualizováno. Zkontroluj git diff a commitni."
