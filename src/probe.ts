import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Finding, SkillCommand } from "./types.js";

const execFileAsync = promisify(execFile);

/**
 * Resolve a command against the live CLI using read-only discovery forms only:
 * `--help`, `--version`, and subcommand help. Never executes the actual command.
 *
 * Returns a help text blob plus the CLI version, or null when the binary is
 * not installed.
 */
export async function probeCli(
  binary: string,
  subcommands: string[] = [],
): Promise<{ version: string; help: string } | null> {
  try {
    const version = await runQuietly(binary, ["--version"]);
    const helpArgs = subcommands.length > 0
      ? [...subcommands, "--help"]
      : ["--help"];
    let help = await runQuietly(binary, helpArgs);

    // Fall back to plain `--help` if subcommand help is empty.
    if (!help.trim() && subcommands.length > 0) {
      help = await runQuietly(binary, ["--help"]);
    }

    return { version: version.trim(), help };
  } catch {
    return null;
  }
}

async function runQuietly(
  binary: string,
  args: string[],
): Promise<string> {
  try {
    const { stdout, stderr } = await execFileAsync(binary, args, {
      timeout: 5000,
      env: { ...process.env, NO_COLOR: "1" },
    });
    return `${stdout}\n${stderr}`;
  } catch (err) {
    // `--help` often exits 0; `--version` too. If it exits non-zero but still
    // printed help on stdout/stderr, surface it rather than failing outright.
    const e = err as { stdout?: string; stderr?: string };
    return `${e?.stdout ?? ""}\n${e?.stderr ?? ""}`;
  }
}

/**
 * Detect whether a flag token exists in the help text. We match the exact flag
 * token so `--json` does not falsely match `--json-lines`.
 */
export function flagPresent(help: string, flag: string): boolean {
  const base = flag.split("=")[0];
  const esc = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${esc}([\\s,=]|$)`).test(help);
}

/**
 * Detect whether a subcommand exists in the help text.
 */
export function subcommandPresent(help: string, sub: string): boolean {
  const esc = sub.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${esc}([\\s,]|$)`).test(help);
}

/**
 * Classify every flag and subcommand in the scanned commands against the live
 * CLI. Deterministic; makes no guesses.
 */
export async function classify(
  commands: SkillCommand[],
): Promise<Finding[]> {
  const findings: Finding[] = [];
  const cache = new Map<string, { version: string; help: string } | null>();

  async function lookup(binary: string, subcommands: string[]): Promise<{ version: string; help: string } | null> {
    const key = `${binary}\u0000${subcommands.join(" ")}`;
    if (!cache.has(key)) {
      cache.set(key, await probeCli(binary, subcommands));
    }
    return cache.get(key) ?? null;
  }

  for (const cmd of commands) {
    const info = await lookup(cmd.binary, cmd.subcommands);

    // Binary not installed -> every flag/subcommand is unverifiable.
    if (info === null) {
      for (const flag of cmd.flags) {
        findings.push({
          file: cmd.file,
          line: cmd.line,
          binary: cmd.binary,
          token: flag,
          kind: "flag",
          classification: "UNVERIFIABLE",
          evidence: `binary "${cmd.binary}" not installed or not on PATH`,
          rawLine: cmd.sourceLine,
        });
      }
      for (const sub of cmd.subcommands) {
        findings.push({
          file: cmd.file,
          line: cmd.line,
          binary: cmd.binary,
          token: sub,
          kind: "subcommand",
          classification: "UNVERIFIABLE",
          evidence: `binary "${cmd.binary}" not installed or not on PATH`,
          rawLine: cmd.sourceLine,
        });
      }
      continue;
    }

    for (const flag of cmd.flags) {
      if (flagPresent(info.help, flag)) {
        continue; // present, not a finding
      }
      findings.push({
        file: cmd.file,
        line: cmd.line,
        binary: cmd.binary,
        token: flag,
        kind: "flag",
        classification: "CONFIRMED_STALE",
        evidence: `"${flag}" absent from "${cmd.binary}${cmd.subcommands.length ? " " + cmd.subcommands.join(" ") : ""} --help" (v${info.version})`,
        rawLine: cmd.sourceLine,
      });
    }

    for (const sub of cmd.subcommands) {
      if (subcommandPresent(info.help, sub)) {
        continue;
      }
      findings.push({
        file: cmd.file,
        line: cmd.line,
        binary: cmd.binary,
        token: sub,
        kind: "subcommand",
        classification: "CONFIRMED_STALE",
        evidence: `"${sub}" absent from "${cmd.binary} --help" (v${info.version})`,
        rawLine: cmd.sourceLine,
      });
    }
  }

  return findings;
}
