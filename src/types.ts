export type Classification =
  | "CONFIRMED_STALE"
  | "BEHAVIOR_CHANGED"
  | "UNVERIFIABLE";

export interface SkillCommand {
  file: string;
  line: number;
  /** The executable name, e.g. "rg", "git", "anchor". */
  binary: string;
  /** Subcommands in order, e.g. ["build"] for `anchor build`. */
  subcommands: string[];
  /** Flags found on the command line, e.g. ["--json", "-p"]. */
  flags: string[];
  /** The raw command string as it appeared in the file. */
  raw: string;
  /** The untrimmed source line the command came from. */
  sourceLine: string;
}

export interface Finding {
  file: string;
  line: number;
  binary: string;
  /** The token that is stale or changed: a flag or a subcommand. */
  token: string;
  kind: "flag" | "subcommand";
  classification: Classification;
  evidence: string;
  replacement?: string;
  /** The full source line the token came from, for building a real diff. */
  rawLine?: string;
}

export interface DriftReport {
  generatedAt: string;
  scannedFiles: string[];
  commands: SkillCommand[];
  findings: Finding[];
}

export function emptyReport(): DriftReport {
  return {
    generatedAt: new Date().toISOString(),
    scannedFiles: [],
    commands: [],
    findings: [],
  };
}
