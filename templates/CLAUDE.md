# __NAZEV__

__POPIS__ Čeština v UI a dokumentaci, angličtina v kódu a commitech.

**Pravidla práce jsou v [AGENTS.md](AGENTS.md).** Zadání produktu je v `BRIEF.md`, pojmy v `GLOSSARY.md`, rozhodnutí v `DECISIONS.md` a `docs/adr/`, stav v `STATUS.md`.

Agentní kolečko pochází z `agent-setup`; změny, které mají platit všude, patří tam.

## Jak se tu pracuje

- **Jeden milník najednou.** Nic z dalších, ani „když už jsem v tom“.
- **Testy napřed** (skill `tdd`). Hotovo znamená zelené testy.
- **Co jde ověřit strojem, patří do kódu a testů**, ne do promptu ani dokumentu.
- **Nejvýš dvě opravná kola.** Stejný nález podruhé = zastav se a zeptej se.
- **Rozhodnutí mimo zadání** do `DECISIONS.md` (datum, co, proč); větší jako ADR do `docs/adr/`.
- **Drobnosti** z review do `BACKLOG.md`, neopravují se mimochodem.

## Postup milníku

**Hlavní session je zadavatel a dispečer, ne programátor.**

1. **Grilování** — `/grill-with-docs` nad milníkem. Pojmy do `GLOSSARY.md`, rozhodnutí do `docs/adr/`. Ke každé otázce doporučení.
2. **Specifikace** — `/to-spec` → `docs/specs/M<n>-<nazev>.md` se seams pro testy a akceptačními kritérii.
3. **Tikety** — `/to-tickets` → `docs/tickets/M<n>-<nazev>/`.
4. **Hlavní session kód nepíše** (výjimka: dokumentace a konfigurace kolečka).
5. **Implementuje `builder`** — tiket po tiketu, skill `tdd`.
6. **Po zelené CI vždy `reviewer`** (skill `code-review`). Dostane diff a specifikaci, nikdy zdůvodnění buildera. Blocker a major zpátky builderovi, minor do `BACKLOG.md`.
7. **U změn v UI navíc `ui-qa`** (390 + 1440 px, rubrika 1–5).
8. **Shrnutí:** kolik kol, co reviewer našel a jak se to vyřešilo. Aktualizuj `STATUS.md`.
9. **STOP** — schvaluje člověk (vlastník repa). Zelený PR po revieweru bez blockeru a majoru merguješ sám merge commitem a jen to oznámíš; ptej se, když merge spouští deploy do produkce.

Těžká chyba: `/diagnosing-bugs`. Otázka návrhu: skill `prototype`. Texty, které mají přimět k akci: skill `copywriting`.

### Kdy se ptát

Rozhodni sám a oznam, když je to vratné a v rámci zadání. **Zeptej se**, když: jde to ven (zpráva, e-mail, nasazení do produkce), je to nevratné, týká se to peněz, mění to pravidlo, které stanovil člověk, nebo jsou dvě rozumné varianty s jiným dopadem na byznys. Vždy s doporučením.

## Co nikdy

- Nevolat skutečné LLM ani externí API z testů.
- Neodesílat nic ven bez schválení člověkem.
- Nevymýšlet texty, ceny, reference ani čísla.
- Nepřidávat `@import` velkých souborů do tohoto souboru; odkaz stačí.
