import { readFile } from "node:fs/promises";
import { DriftReport, Finding, emptyReport } from "./types.js";
import { classify } from "./probe.js";
import { scanDir } from "./scan.js";

export interface ScanOptions {
  dir: string;
  /** When true, attach a naive replacement hint for exact-flag findings.
   *  Kept false by default; real replacements come from the DRAFT stage. */
  suggest?: boolean;
}

/**
 * Full pipeline: scan a directory -> classify every command -> report.
 * Read-only. Writes nothing.
 */
export async function runScan(opts: ScanOptions): Promise<DriftReport> {
  const report = emptyReport();
  const commands = await scanDir(opts.dir);
  report.scannedFiles = [...new Set(commands.map((c) => c.file))];
  report.commands = commands;
  report.findings = await classify(commands);
  return report;
}

export async function reportToJson(report: DriftReport): Promise<string> {
  return JSON.stringify(report, null, 2);
}

export async function loadReport(path: string): Promise<DriftReport> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as DriftReport;
}

export type { DriftReport, Finding };
