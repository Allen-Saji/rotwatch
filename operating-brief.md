# Rotwatch operating brief

The canonical prompt to run Rotwatch as a reusable Play. Paste into a harness
as `$play explore [...]`.

```text
$play explore [
Outcome: Skill drift audit with proposed fixes.

Tools: Work only with local agent skill files (SKILL.md and their references), the CLIs those skills invoke, and Git. Use read-only shell commands - --help, --version, --dry-run, command completion - and record directory, tool version, command, exit code, and artifact digest for every check. Never execute a skill's actual command or any write-capable form.

Access: Use only local skill directories and installed CLIs. Do not read secrets, environment-variable values, or credential files. Use sanitized paths so the Play can be published without exposing private context.

Method: Define the target before the first call - one skill directory (or an explicit list of skill files) and the CLIs those skills reference. Extract every command, flag, subcommand, and version pin embedded in the skill text. For each, resolve it against the live CLI using help and dry-run forms only. Produce three artifacts, in this order:
  1. DETECT - a drift report: stale flags, renamed subcommands, removed options, changed defaults, and version pins that no longer hold.
  2. DRAFT - a proposed patch per finding, shown as a unified diff against the skill file, preserving the original intent rather than doing a blind token swap.
  3. APPLY - a gated queue: the same patches, held behind explicit approval and applied one file at a time, never automatically.

Connections: Store every result in the Rote context workspace. Pass response addresses to later steps; never paste raw command output or skill contents into the prompt wholesale. Before each check, name the skill file, line or section, and the exact command string being validated. Carry the CLI version and the checked-at timestamp for every result.

Validation: Check every finding against the source. Requery a representative sample by re-running the help form and confirming the flag really is absent. A missing flag in one help page is not proof of removal - confirm across the full help tree and changelog. Distinguish three outcomes: CONFIRMED STALE (removed or renamed), BEHAVIOR-CHANGED (still present, semantics shifted), and UNVERIFIABLE (cannot confirm from help alone). For any proposed patch, prove it preserves intent by checking the replacement exists and accepts the same argument shape; mark the rest as NEEDS OPERATOR REVIEW.

Failure handling: Preserve failed branches, conflicting evidence, and operator corrections. Stop a blocked branch and name the missing tool, permission, or identifier rather than guessing. Never fabricate a replacement command when the correct one is not confirmable from help output.

Safety: Detect and draft are strictly read-only. Apply only ever runs after an operator approves a specific diff, one file at a time. Never rewrite a skill that the operator did not explicitly select. Never execute the underlying command a skill describes. Preserve the original file in Git before any apply so every change is reversible.

Complete only when: every finding cites the skill file, the exact command, the live CLI version, and the evidence for its classification; every proposed patch is shown as a reviewable diff; and the whole run can repeat against a fresh skill directory and reproduce or name the changed condition.

Return: the drift report, the proposed patch queue, the apply queue, validation results, blocked branches, and the proposed Play inputs (skill directory, CLI scope, approval mode). Before crystallizing the Play, rerun the smallest representative case - a single skill file with one known-stale command - and confirm the second run reproduces the detection or names the changed condition.
]
```
