# Pravidla pro agenty

- Kompletní zadání je v BRIEF.md. Pro milník čti jeho specifikaci v `docs/specs/` a tikety v `docs/tickets/`.
- Implementuj VŽDY jen jeden milník (a v něm tiket), který ti zadám.
- Pojmy používej podle `GLOSSARY.md` — v UI, v názvech testů i v kódu.
- Rozhodnutí mimo zadání do DECISIONS.md (datum, rozhodnutí, důvod).
- Po milníku ověř všechna akceptační kritéria a napiš, jak.
- Testy nesmí volat skutečné LLM ani externí API, vždy fake adaptéry a fixtures.
- Nic mimo zadání (BRIEF.md „Co NEdělat“).
- **Nejvýš dvě opravná kola.**
- **Co jde ověřit strojem, patří do kódu a testů.**
- Drobnosti z review do `BACKLOG.md`.

## Kde co je

- `CLAUDE.md` – jak se tu pracuje. `BRIEF.md` – zadání. `GLOSSARY.md` – pojmy. `DECISIONS.md`, `docs/adr/` – rozhodnutí.
- `docs/specs/`, `docs/tickets/` – specifikace a tikety. `STATUS.md` – stav. `BACKLOG.md` – odložené nálezy.
- `.claude/agents/` – builder, reviewer, ui-qa. `.claude/skills/` – skilly.

## Specifické pro toto repo

__DOPLNIT: co reviewer kontroluje navíc, čeho se nesmí dotknout, sousední repa jen pro čtení__
