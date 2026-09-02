# Methodology

The rules that make Rotwatch's output trustworthy, and the boundaries it never
crosses.

## Three stages

### Detect

Read-only. Walks the target directory, extracts command lines, and resolves
every flag and subcommand against the live CLI.

The only shell forms ever executed are discovery forms:

- `<binary> --version`
- `<binary> --help`
- `<binary> <subcommand> --help`

No command a skill actually describes is ever run.

### Draft

Read-only. Turns each confirmed-stale finding into a unified diff. A diff is
produced only when a replacement is known and can be shown to accept the same
argument shape. When that cannot be proven, the finding is left without a diff
and marked **NEEDS OPERATOR REVIEW**.

### Apply

Gated. Applies one patch to one file at a time, only after explicit approval.
The target file is preserved in Git first, so every change is reversible.

## Classification

Every finding carries exactly one classification:

| Classification | Meaning | Action |
| --- | --- | --- |
| CONFIRMED_STALE | Token absent from live CLI help | Draft a diff if a proven replacement exists |
| BEHAVIOR_CHANGED | Token present, semantics shifted | Mark NEEDS OPERATOR REVIEW |
| UNVERIFIABLE | Binary not installed or help unavailable | Report only, no conclusion |

`BEHAVIOR_CHANGED` exists because a renamed flag is a different bug from a flag
whose meaning drifted. A naive token swap fixes the first and silently corrupts
the second.

## What counts as evidence

- The exact skill file and line number.
- The exact command string.
- The live CLI version.
- The help text that confirmed or refuted the token.

A missing flag in one help page is not proof of removal. The flag is checked
against the full help tree before `CONFIRMED_STALE` is assigned.

## What Rotwatch refuses to do

- Execute the underlying command a skill describes.
- Invent a replacement when the correct one is not confirmable from help.
- Rewrite a file the operator did not explicitly select.
- Touch credentials, environment-variable values, or secret files.
