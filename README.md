# Rotwatch

Detect stale CLI commands in agent skill files, and draft preserve-intent
fixes before they bite you.

Agent skills are markdown files that tell a coding agent how to work. They embed
shell commands - `git`, `npm`, `rg`, `anchor`, `terraform`, and so on. Those
commands change: flags get renamed, subcommands move, tools get deprecated. A
skill written six months ago can silently tell the agent to run something that
fails today, or worse, runs subtly wrong.

Rotwatch audits a directory of skill files against the CLIs that are actually
installed, reports the drift, and proposes reviewable diffs. It never rewrites a
file on its own.

## What it does

Three stages, in order:

1. **Detect** (read-only) - extract every command, flag, subcommand, and
   version pin from the target skill files, then resolve each one against the
   live CLI using only `--help`, `--version`, and subcommand help.
2. **Draft** (read-only) - for each finding, produce a unified diff that
   replaces the stale token while preserving the original intent.
3. **Apply** (gated) - the same patches, applied one file at a time, only after
   explicit per-file approval. Every change is Git-reversible.

Every finding is classified so a fix is never guessed:

- **CONFIRMED_STALE** - the flag or subcommand is absent from the live CLI's
  help.
- **BEHAVIOR_CHANGED** - the token still exists but its meaning shifted; needs
  an operator's read, not a token swap.
- **UNVERIFIABLE** - the binary is not installed, so no conclusion is possible.

A replacement is only proposed when it can be shown to accept the same argument
shape; otherwise the finding is marked **NEEDS OPERATOR REVIEW**.

## Safety model

- Detection and drafting are strictly read-only.
- Apply only runs after an operator approves a specific diff, one file at a
  time.
- Rotwatch never executes the command a skill describes - only `--help`,
  `--version`, and dry-run discovery forms.
- The original file is preserved in Git before any apply.

## Install

```bash
git clone <repo> rotwatch
cd rotwatch
npm install
```

Requires Node 18+.

## Usage

```bash
npm run scan -- <path-to-skill-dir>
```

Emits a JSON drift report to stdout. For a single skill directory:

```bash
npm run scan -- ~/.codex/skills
```

## How it works

`scan.ts` walks a directory of markdown files and extracts command lines whose
leading token is a known CLI binary. `probe.ts` resolves each command against
the live binary using read-only discovery forms and classifies every flag and
subcommand. `diff.ts` turns confirmed-stale findings into minimal unified
diffs. `index.ts` ties the pipeline together and emits the JSON report.

The scanner is deterministic and uses no language model. If a workflow wants a
human-quality judgment of "does this replacement preserve intent," that belongs
in a separate DRAFT stage that consumes the report - not inside the scanner.

## Development

```bash
npm test         # node --import tsx --test test/**/*.test.ts
npm run build    # tsc
```

## License

MIT
