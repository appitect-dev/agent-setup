#!/usr/bin/env node
// Claude Code hook (PostToolUse Edit|Write): po úpravě souboru `eslint --fix` na ten soubor
// a typecheck balíčku, kterému soubor patří. Chyby vrací agentovi (exit 2), ať je opraví hned.
//
// Obecná verze z agent-setup. Balíček = nejbližší package.json nad souborem, který má skript
// `typecheck`; když žádný nemá, spustí se kořenový `typecheck` (pokud existuje). Správce balíčků
// (pnpm/yarn/bun/npm) se pozná podle lockfilu. Projekt bez package.json hook přeskočí.
// Soubory mimo repo (absolutní cesty mimo cwd, cesty s `..`) se nikdy neupravují.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, sep } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
const rawPath = input.tool_input?.file_path ?? "";
const cwd = process.cwd();
if (!existsSync(join(cwd, "package.json"))) process.exit(0);

/** Správce balíčků podle lockfilu (pnpm, yarn, bun, npm). */
function packageManager(root) {
  if (existsSync(join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(root, "yarn.lock"))) return "yarn";
  if (existsSync(join(root, "bun.lockb")) || existsSync(join(root, "bun.lock"))) return "bun";
  return "npm";
}

let file;
if (rawPath.startsWith(cwd + sep)) file = rawPath.slice(cwd.length + 1);
else if (rawPath.startsWith("/")) process.exit(0);
else file = rawPath;
if (!file || file.split(sep).includes("..")) process.exit(0);
if (!/\.(ts|tsx|mts|cts|mjs|cjs|js|jsx)$/.test(file)) process.exit(0);

const hasScript = (dir, name) => {
  const pkg = join(cwd, dir, "package.json");
  if (!existsSync(pkg)) return false;
  try { return Boolean(JSON.parse(readFileSync(pkg, "utf8")).scripts?.[name]); } catch { return false; }
};

function owner(relFile) {
  let dir = dirname(relFile);
  while (dir && dir !== ".") {
    if (hasScript(dir, "typecheck")) return dir;
    dir = dirname(dir);
  }
  return hasScript(".", "typecheck") ? "." : null;
}

const problems = [];
const PM = packageManager(cwd);

// ESLint jen když je v projektu nainstalovaný (node_modules/.bin/eslint).
const eslintBin = join(cwd, "node_modules", ".bin", "eslint");
if (existsSync(eslintBin)) {
  try { execFileSync(eslintBin, ["--fix", file], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
  catch (error) { problems.push(`ESLint (${file}):\n${(error.stdout || error.stderr || "").trim()}`); }
}

const dir = owner(file);
if (dir) {
  try { execFileSync(PM, ["run", "typecheck"], { cwd: join(cwd, dir), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
  catch (error) { problems.push(`Typecheck ${dir}:\n${(error.stdout || error.stderr || "").trim()}`); }
}

if (problems.length) { console.error(problems.join("\n\n")); process.exit(2); }
