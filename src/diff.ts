import { Finding } from "./types.js";

/**
 * Deterministic diff of a finding: compute the minimal one-line unified diff
 * that would replace the stale token, if a replacement is known.
 *
 * This module is intentionally conservative. It only produces a patch when the
 * caller supplies a replacement that is already proven to exist in the CLI's
 * help (that proof happens in the DRAFT/LLM stage, not here). Without a
 * replacement it returns null: Rotwatch never invents a fix.
 */
export interface DraftPatch {
  file: string;
  line: number;
  token: string;
  replacement: string;
  diff: string;
}

export function draftPatch(finding: Finding): DraftPatch | null {
  if (finding.classification !== "CONFIRMED_STALE") return null;
  if (!finding.replacement || finding.replacement === finding.token) return null;

  // Prefer a full-line replacement when we have the source line; fall back to
  // the bare token for synthesized findings (tests, LLM-supplied).
  const oldLine = finding.rawLine ?? finding.token;
  const newLine = oldLine.includes(finding.token)
    ? oldLine.replace(finding.token, finding.replacement)
    : finding.replacement;

  const diff =
    `--- a/${finding.file}\n` +
    `+++ b/${finding.file}\n` +
    `@@ -${finding.line},1 +${finding.line},1 @@\n` +
    `-${oldLine}\n` +
    `+${newLine}\n`;

  return {
    file: finding.file,
    line: finding.line,
    token: finding.token,
    replacement: finding.replacement,
    diff,
  };
}

export function draftAll(findings: Finding[]): DraftPatch[] {
  const out: DraftPatch[] = [];
  for (const f of findings) {
    const p = draftPatch(f);
    if (p) out.push(p);
  }
  return out;
}
