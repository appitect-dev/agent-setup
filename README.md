# agent-setup

Hotové nastavení pro práci s AI agenty v [Claude Code](https://docs.claude.com/en/docs/claude-code/overview): agenti, kteří staví, kontrolují a testují kód, hooky, které hlídají kvalitu, šablony dokumentů a vlastní skilly. Jedno repo jako zdroj pravdy, do projektů se kopíruje jedním příkazem.

## Jak to funguje

Hlavní session kód nepíše. Dělá zadavatele a dispečera:

```
grilování zadání → specifikace → tikety → builder (testy napřed) → CI → reviewer (čistý kontext) → ui-qa → STOP, schvaluje člověk
```

- **builder** staví jeden tiket. Nejdřív test, pak kód. Hotovo = zelené testy.
- **reviewer** dostane jen diff a specifikaci, ne zdůvodnění autora. Proto najde, co by autor přehlédl. Nálezy třídí na blocker / major / minor.
- **ui-qa** vyfotí změněné obrazovky v 390 a 1440 px a obodujuje je rubrikou 1–5.
- Nejvýš dvě opravná kola, pak se agent zastaví a zeptá.
- Pravidlo, na kterém to celé stojí: **co jde ověřit strojem, patří do kódu a testů**, ne do promptu.

## Co tu je

```
agents/      builder, reviewer, ui-qa
hooks/       after-edit.mjs   – po úpravě souboru eslint --fix + typecheck (JS/TS)
             before-commit.mjs – nepustí git commit, dokud neprojdou lint a testy
templates/   CLAUDE.md, AGENTS.md, BRIEF.md, DECISIONS.md, BACKLOG.md, STATUS.md, settings.json
skills/      vlastní skilly (copywriting, video-scripty)
bin/         new-repo.sh, update-repo.sh, install-global.sh
```

Hooky poznají správce balíčků podle lockfilu (pnpm, yarn, bun, npm) a spouští skripty `lint`, `test` a `typecheck` z `package.json`. Chybějící skript přeskočí, projekt bez `package.json` nechají být. Agenti a šablony fungují v jakémkoli jazyce.

## Požadavky

- Claude Code
- Node.js 18+ (hooky a `npx`)
- git, bash (macOS, Linux, WSL)

## Instalace

```
git clone https://github.com/appitect-dev/agent-setup.git ~/agent-setup
```

**Nasadit do projektu** (nový nebo existující, nic nepřepíše):

```
~/agent-setup/bin/new-repo.sh ~/cesta/k/projektu "Název projektu"
```

Zkopíruje agenty do `.claude/agents/`, hooky do `scripts/hooks/`, nastavení do `.claude/settings.json`, šablony dokumentů do kořene a skilly do `.claude/skills/`. Navíc nainstaluje [skilly Matta Pococka](https://github.com/mattpocock/skills) (grilování, specifikace, tikety, TDD, code review), na kterých kolečko stojí.

Pak v projektu:

1. doplň `BRIEF.md` (co stavíš, pro koho, co nedělat) a sekci „Specifické pro toto repo“ v `AGENTS.md`,
2. spusť `claude` a `/setup-matt-pocock-skills` (tracker: lokální soubory v `docs/tickets/`),
3. `/grill-with-docs` nad prvním milníkem.

**Aktualizace projektu** po změně tady (ukáže diff a zeptá se):

```
~/agent-setup/bin/update-repo.sh ~/cesta/k/projektu
```

**Jen skilly, globálně pro všechny projekty** (symlinky do `~/.claude/skills`):

```
~/agent-setup/bin/install-global.sh
```

**Jen jeden skill bez klonování:**

```
npx skills@latest add appitect-dev/agent-setup -a claude-code -s copywriting video-scripty
```

## Úpravy

- Změnu, která má platit všude, udělej tady a pak spusť `update-repo.sh` v projektech.
- Úpravu jen pro jeden projekt dej do jeho `AGENTS.md` (sekce „Specifické pro toto repo“), ne do agenta. Jinak ji příští aktualizace přepíše.
- Nový skill = nová složka `skills/<nazev>/` se `SKILL.md`. Detaily, které skill nepotřebuje vždy, dej do `references/`, ať zbytečně nezabírají kontext.

## Skilly

- **copywriting** – český prodejní copywriting: titulky, landing a prodejní stránky, e-maily, hooky. Postup v 10 krocích, data o zákaznících, žebříček titulků, česká typografie, poctivá urgence podle práva EU a hodnoticí rubrika. Zdroje jsou v `references/zdroje.md`.
- **video-scripty** – scénáře krátkých videí (Reels, TikTok, Shorts) z vašich hlasových poznámek: hook, střed jako řetěz „ale / takže“, pointa na konci, výzva k akci. Výstupem jsou body k natočení, ne text k odříkání. Profil vašeho hlasu a příklady vlastních reelů si skill při prvním použití založí v `~/.claude/video-scripty/` (mimo repo).

## Licence

MIT, viz [LICENSE](LICENSE). Skilly Matta Pococka mají vlastní licenci ve svém repu.
