import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SkillCommand } from "./types.js";

/**
 * A conservative set of common CLI binaries. A command line is only treated as
 * inspectable if its leading token matches one of these. This avoids probing
 * arbitrary shell words that are not CLIs (paths, variable assignments, prose).
 */
const KNOWN_BINARIES = new Set([
  "git",
  "npm",
  "pnpm",
  "yarn",
  "npx",
  "node",
  "tsx",
  "tsc",
  "rg",
  "ripgrep",
  "curl",
  "wget",
  "ssh",
  "scp",
  "docker",
  "gh",
  "vercel",
  "netlify",
  "aws",
  "gcloud",
  "terraform",
  "cargo",
  "rustc",
  "rustup",
  "anchor",
  "solana",
  "codex",
  "claude",
  "playwright",
  "python3",
  "python",
  "pip",
  "pip3",
  "uv",
  "helm",
  "kubectl",
  "systemctl",
  "journalctl",
  "brave-browser",
  "xdg-open",
]);

/**
 * Strip fenced-code markers, inline backticks, and a leading shell prompt.
 * Returns the cleaned line, or null if the line is not a command.
 */
export function cleanCommandLine(line: string): string | null {
  let s = line.trim();

  // Drop inline backtick wrappers: `git status` -> git status
  if (s.startsWith("`") && s.endsWith("`")) {
    s = s.slice(1, -1).trim();
  }

  // Drop comments and markdown headings before treating "#" as a prompt.
  if (s.startsWith("#")) return null;

  // Drop a leading shell prompt like "$" or ">".
  if (/^[$>]\s+/.test(s)) {
    s = s.replace(/^[$>]\s+/, "").trim();
  }

  if (s.length === 0) return null;

  // Only lines that look like a CLI invocation: first token is a known binary.
  return s;
}

/**
 * Split a command string into the binary, subcommands, and flags.
 * Keeps it token-based and deterministic: we do not try to resolve shell
 * quoting, pipes, or redirects in v1; anything after `|`, `>`, `<`, `&&`, `||`
 * is ignored for safety.
 */
export function tokenize(command: string): {
  binary: string;
  subcommands: string[];
  flags: string[];
  raw: string;
} {
  const raw = command;
  // Cut at the first shell operator so we only inspect the primary invocation.
  const primary = command.split(/\s*(?:\|\||&&|\||[<>])\s*/)[0].trim();
  const tokens = primary.split(/\s+/).filter(Boolean);
  const binary = tokens[0] ?? "";

  const rest = tokens.slice(1);
  const flags: string[] = [];
  const subcommands: string[] = [];

  for (const t of rest) {
    if (t.startsWith("-")) {
      flags.push(t);
    } else if (t.includes("=")) {
      // `--flag=value` -> flag, `key=value` (env) -> ignore.
      if (t.startsWith("-")) flags.push(t.split("=")[0]);
    } else {
      subcommands.push(t);
    }
  }

  return { binary, subcommands, flags, raw };
}

/**
 * Walk a directory of skill files and extract every known-CLI command.
 */
export async function scanDir(dir: string): Promise<SkillCommand[]> {
  const files = await listSkillFiles(dir);
  const out: SkillCommand[] = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, idx) => {
      const cleaned = cleanCommandLine(line);
      if (cleaned === null) return;
      const { binary, subcommands, flags, raw } = tokenize(cleaned);
      if (!KNOWN_BINARIES.has(binary)) return;
      out.push({
        file,
        line: idx + 1,
        binary,
        subcommands,
        flags,
        raw,
        sourceLine: line,
      });
    });
  }

  return out;
}

/**
 * Minimal recursive listing of skill files (SKILL.md and *.md references).
 * Does not follow symlinks or descend into hidden dirs.
 */
export async function listSkillFiles(
  dir: string,
): Promise<string[]> {
  const { readdir } = await import("node:fs/promises");
  const { stat } = await import("node:fs/promises");
  const results: string[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        results.push(full);
      }
    }
  }

  try {
    await walk(dir);
  } catch {
    // Return what we have; the caller reports an empty or partial scan.
  }

  return results.sort();
}
