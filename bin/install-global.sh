#!/usr/bin/env bash
# Nainstaluje obecné skilly globálně (pro všechny projekty Claude Code).
set -euo pipefail
SETUP="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$HOME/.claude/skills"
for d in "$SETUP"/skills/*/; do n="$(basename "$d")"; ln -sfn "$d" "$HOME/.claude/skills/$n"; echo "  ~/.claude/skills/$n → $d"; done
npx -y skills@latest add mattpocock/skills -a claude-code -g -y -s grill-me grilling handoff
echo "Hotovo. Vlastní skilly jsou symlinky — změna v agent-setup se projeví hned."
