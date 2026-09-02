import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runScan } from "../src/index.js";
import { cleanCommandLine, tokenize } from "../src/scan.js";
import { flagPresent, subcommandPresent } from "../src/probe.js";
import { draftPatch } from "../src/diff.js";

test("cleanCommandLine strips backticks and prompts", () => {
  assert.equal(cleanCommandLine("`git status`"), "git status");
  assert.equal(cleanCommandLine("$ git status"), "git status");
  assert.equal(cleanCommandLine("# comment"), null);
  assert.equal(cleanCommandLine(""), null);
});

test("tokenize separates binary, subcommands, flags", () => {
  const t = tokenize("anchor build --tools-version");
  assert.equal(t.binary, "anchor");
  assert.deepEqual(t.subcommands, ["build"]);
  assert.ok(t.flags.includes("--tools-version"));
});

test("flagPresent matches exact token, not prefix", () => {
  const help = "  --json  output json\n  --json-lines  output json lines\n";
  assert.equal(flagPresent(help, "--json"), true);
  assert.equal(flagPresent(help, "--js"), false);
});

test("subcommandPresent matches exact token", () => {
  const help = "commands: build, test, deploy\n";
  assert.equal(subcommandPresent(help, "build"), true);
  assert.equal(subcommandPresent(help, "buil"), false);
});

test("scan classifies a fabricated flag as confirmed-stale or unverifiable", async () => {
  const dir = await mkdtemp(join(tmpdir(), "rotwatch-"));
  await writeFile(
    join(dir, "SKILL.md"),
    "# test\n\n```bash\ngit status --this-flag-does-not-exist-xyz\n```\n",
  );

  const report = await runScan({ dir });
  // git is installed here, so the fabricated flag should be flagged.
  const finding = report.findings.find((f) =>
    f.token === "--this-flag-does-not-exist-xyz"
  );
  assert.ok(finding, "fabricated flag should produce a finding");
  assert.ok(
    finding.classification === "CONFIRMED_STALE" ||
      finding.classification === "UNVERIFIABLE",
    "fabricated flag must be flagged stale or unverifiable, never accepted",
  );
});

test("draftPatch is null without a proven replacement", () => {
  const patch = draftPatch({
    file: "x.md",
    line: 1,
    binary: "git",
    token: "--old",
    kind: "flag",
    classification: "CONFIRMED_STALE",
    evidence: "absent",
  });
  assert.equal(patch, null);
});

test("draftPatch builds a unified diff when replacement is supplied", () => {
  const patch = draftPatch({
    file: "x.md",
    line: 3,
    binary: "git",
    token: "--old",
    kind: "flag",
    classification: "CONFIRMED_STALE",
    evidence: "absent",
    replacement: "--new",
  });
  assert.ok(patch);
  assert.match(patch.diff, /--- a\/x\.md/);
  assert.match(patch.diff, /\+\+\+ b\/x\.md/);
  assert.match(patch.diff, /--old/);
  assert.match(patch.diff, /\+--new/);
});
