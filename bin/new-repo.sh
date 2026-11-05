#!/usr/bin/env bash
# Nasadí do repa agentní kolečko: agenty, hooky, šablony dokumentů a skilly.
# Použití: bin/new-repo.sh <cesta-k-repu> ["Název projektu"]
# Nic existujícího nepřepisuje (kromě agentů a hooků s --force).
set -euo pipefail

SETUP="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:?Zadej cestu k repu}"
NAME="${2:-$(basename "$TARGET")}"
FORCE="${FORCE:-0}"

POCOCK_SKILLS=(setup-matt-pocock-skills grill-with-docs grilling grill-me domain-modeling to-spec to-tickets tdd codebase-design code-review diagnosing-bugs improve-codebase-architecture prototype wayfinder retro)

mkdir -p "$TARGET"/.claude/agents "$TARGET"/.claude/skills "$TARGET"/scripts/hooks "$TARGET"/docs/specs "$TARGET"/docs/tickets "$TARGET"/docs/adr
cd "$TARGET"
[ -d .git ] || git init -q -b main

copy() { # copy <src> <dst> — bez přepsání, s FORCE=1 přepíše
  if [ -e "$2" ] && [ "$FORCE" != "1" ]; then echo "  přeskakuji $2 (existuje)"; else cp "$1" "$2"; echo "  + $2"; fi
}

echo "Agenti:";   for f in "$SETUP"/agents/*.md; do copy "$f" ".claude/agents/$(basename "$f")"; done
echo "Hooky:";    for f in "$SETUP"/hooks/*.mjs; do copy "$f" "scripts/hooks/$(basename "$f")"; done
echo "Nastavení:"; copy "$SETUP/templates/settings.json" .claude/settings.json
echo "Dokumenty:"
for f in CLAUDE.md AGENTS.md BRIEF.md DECISIONS.md BACKLOG.md STATUS.md; do
  if [ -e "$f" ]; then echo "  přeskakuji $f (existuje)"; else sed "s/__NAZEV__/$(printf %s "$NAME" | sed 's/[\/&]/\\&/g')/g; s/__POPIS__//g" "$SETUP/templates/$f" > "$f"; echo "  + $f"; fi
done

echo "Vlastní skilly:"
for d in "$SETUP"/skills/*/; do n="$(basename "$d")"; rm -rf ".claude/skills/$n"; cp -R "$d" ".claude/skills/$n"; echo "  + .claude/skills/$n"; done

echo "Skilly Matta Pococka:"
npx -y skills@latest add mattpocock/skills -a claude-code --copy -y -s "${POCOCK_SKILLS[@]}"

echo
echo "Hotovo. Další kroky v repu:"
echo "  1. doplň BRIEF.md a sekci 'Specifické pro toto repo' v AGENTS.md"
echo "  2. claude → /setup-matt-pocock-skills (tracker: lokální soubory v docs/tickets/)"
echo "  3. /grill-with-docs Milník M0"
