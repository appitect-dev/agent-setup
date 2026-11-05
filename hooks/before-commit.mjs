#!/usr/bin/env node
// Claude Code hook (PreToolUse Bash): odmítne `git commit`, dokud je červený skript `lint` nebo `test`
// z package.json (pnpm/yarn/bun/npm podle lockfilu). Chybějící skript se přeskočí. Nenahrazuje CI.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

/** Správce balíčků podle lockfilu (pnpm, yarn, bun, npm). */
function packageManager(root) {
  if (existsSync(join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(root, "yarn.lock"))) return "yarn";
  if (existsSync(join(root, "bun.lockb")) || existsSync(join(root, "bun.lock"))) return "bun";
  return "npm";
}


// Global git options that take their argument as a *separate* token
// (`git -C path commit`, `git -c key=value commit`), not glued to the flag
// (`-Cpath`) or joined with `=` (`--git-dir=path`). A regex like
// `(-\S+\s+)*` only ever consumes whole `-flag` tokens, so `-C .` — flag
// token, then a bare `.` that starts with neither `-` nor the literal
// `commit` — broke the match entirely and let the whole command through
// unrecognised as a commit (`git -C . commit` and
// `git -c user.name=x commit` used to slip through). Tokenizing and walking the option list explicitly
// handles the separate-argument case instead of hoping a regex does.
const GLOBAL_OPTIONS_WITH_SEPARATE_ARG = new Set([
  "-C",
  "-c",
  "--git-dir",
  "--work-tree",
  "--namespace",
  "--exec-path",
  "--html-path",
  "--man-path",
  "--info-path",
  "--super-prefix",
]);

/** Minimal shell-word split — good enough to find `git ... commit`, not to run a shell. */
function tokenize(command) {
  return command.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
}

/** True if `command` contains a `git` invocation whose subcommand is `commit`. */
function invokesGitCommit(command) {
  const tokens = tokenize(command);
  for (let i = 0; i < tokens.length; i++) {
    // `basename`, not `===`: `git` is invoked by path too (`/usr/bin/git`, `./bin/git`), and an
    // exact-token check missed both.
    if (basename(tokens[i]) !== "git") continue;
    let j = i + 1;
    while (j < tokens.length && tokens[j].startsWith("-")) {
      const hasInlineValue = tokens[j].includes("=");
      const consumesNextToken =
        !hasInlineValue && GLOBAL_OPTIONS_WITH_SEPARATE_ARG.has(tokens[j]);
      j += consumesNextToken ? 2 : 1;
    }
    if (tokens[j] === "commit") return true;
  }
  return false;
}

const input = JSON.parse(readFileSync(0, "utf8"));
const command = input.tool_input?.command ?? "";
// Only a real commit. `git log`, `git show` and friends pass straight through.
if (!invokesGitCommit(command)) process.exit(0);
// --amend on a commit that is already green, and --no-verify, are the author's call.
if (/--no-verify/.test(command)) process.exit(0);

const cwd = process.cwd();
const pkgPath = join(cwd, "package.json");
if (!existsSync(pkgPath)) process.exit(0);
let scripts = {};
try { scripts = JSON.parse(readFileSync(pkgPath, "utf8")).scripts ?? {}; } catch { process.exit(0); }
const PM = packageManager(cwd);

const problems = [];
for (const [label, name] of [["Lint", "lint"], ["Testy", "test"]]) {
  if (!scripts[name]) continue;
  try { execFileSync(PM, ["run", name], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
  catch (error) { problems.push(`${label} neprošly:\n${(error.stdout || error.stderr || "").trim().slice(-3000)}`); }
}

if (problems.length) { console.error(`Commit zastaven.\n\n${problems.join("\n\n")}`); process.exit(2); }
