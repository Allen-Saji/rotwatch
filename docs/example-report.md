# Example report

Real output of a Rotwatch audit against a 112-skill agent directory
(`~/.codex/skills`, 168 markdown files, 226 extracted commands, 13 distinct
binaries probed in 5 seconds). Paths are lightly sanitized. Nothing was
modified: detection and drafting are read-only, and the apply queue stays
gated and empty.

The one **confirmed stale** finding is real: `anchor build -- --force` passes
`--force` through `--` to `cargo-build-sbf`, which has no such flag, so the
command fails as written. The **behavior-changed** findings are commands that
still run but are no longer documented in their CLI's help (hidden or
deprecated aliases such as `anchor deploy`) — exactly the class a naive
token-swap tool would silently "fix" the wrong way.

---

# Rotwatch — skill drift audit

Target: ~/.codex/skills — 168 files, 226 commands, 13 binaries probed
Excluded as positional arguments: 147 tokens · --version verified by execution: 10

## Verdict: 1 confirmed stale · 20 behavior-changed · 1 need review · 58 unverifiable

## Confirmed stale

- **data/guides/deploy-runbook.md:143** — `anchor --force` — "--force" absent from "anchor build --help" (vanchor-cli 1.0.2)

## Behavior changed (present but undocumented)

- **build-mobile/SKILL.md:102** — `npm create` — "create" is not listed in "npm --help" (v11.2.0) but "npm create --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **build-mobile/references/mobile-architecture.md:18** — `npm create` — "create" is not listed in "npm --help" (v11.2.0) but "npm create --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **build-mobile/references/mobile-architecture.md:20** — `npm install` — "install" is not listed in "npm --help" (v11.2.0) but "npm install --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **build-with-claude/SKILL.md:122** — `anchor deploy` — "deploy" is not listed in "anchor --help" (vanchor-cli 1.0.2) but "anchor deploy --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **data/guides/deploy-runbook.md:61** — `anchor deploy` — "deploy" is not listed in "anchor --help" (vanchor-cli 1.0.2) but "anchor deploy --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **data/guides/deploy-runbook.md:93** — `anchor deploy` — "deploy" is not listed in "anchor --help" (vanchor-cli 1.0.2) but "anchor deploy --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **data/guides/deploy-runbook.md:179** — `anchor deploy` — "deploy" is not listed in "anchor --help" (vanchor-cli 1.0.2) but "anchor deploy --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **data/guides/deploy-runbook.md:228** — `anchor deploy` — "deploy" is not listed in "anchor --help" (vanchor-cli 1.0.2) but "anchor deploy --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **data/solana-knowledge/03-contract-level.md:568** — `cargo build-sbf` — "build-sbf" is not listed in "cargo --help" (vcargo 1.96.0 (30a34c682 2026-05-25)) but "cargo build-sbf --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **data/solana-knowledge/04-protocols-and-sdks.md:53** — `npm view` — "view" is not listed in "npm --help" (v11.2.0) but "npm view --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **debug-program/references/common-pitfalls.md:63** — `anchor keys` — "keys" is not listed in "anchor --help" (vanchor-cli 1.0.2) but "anchor keys --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **defillama-research/references/defillama-api-guide.md:69** — `npm install` — "install" is not listed in "npm --help" (v11.2.0) but "npm install --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **deploy-to-mainnet/SKILL.md:121** — `anchor deploy` — "deploy" is not listed in "anchor --help" (vanchor-cli 1.0.2) but "anchor deploy --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **deploy-to-mainnet/references/program-upgrade-guide.md:12** — `anchor deploy` — "deploy" is not listed in "anchor --help" (vanchor-cli 1.0.2) but "anchor deploy --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **deploy-to-mainnet/references/program-upgrade-guide.md:15** — `anchor keys` — "keys" is not listed in "anchor --help" (vanchor-cli 1.0.2) but "anchor keys --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **deploy-to-mainnet/references/program-upgrade-guide.md:54** — `anchor upgrade` — "upgrade" is not listed in "anchor --help" (vanchor-cli 1.0.2) but "anchor upgrade --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **deploy-to-mainnet/references/program-upgrade-guide.md:134** — `anchor upgrade` — "upgrade" is not listed in "anchor --help" (vanchor-cli 1.0.2) but "anchor upgrade --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **launch-token/SKILL.md:108** — `npm install` — "install" is not listed in "npm --help" (v11.2.0) but "npm install --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **scaffold-project/SKILL.md:110** — `npm install` — "install" is not listed in "npm --help" (v11.2.0) but "npm install --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved
- **release-checks/SKILL.md:113** — `git remote` — "remote" is not listed in "git --help" (vgit version 2.43.0) but "git remote --help" resolves — undocumented or deprecated alias; the documented equivalent may have moved

## Needs operator review

- **data/guides/deploy-runbook.md:143** — `anchor --force` — no same-name replacement provable from the help text
  - verify with: `anchor --help`

## Unverifiable (reported, no conclusion)

- "open" performs actions (opens files/URLs); probing it with arguments has side effects, so its tokens are reported UNVERIFIABLE
  - `.brand-preview/index.html` (brand-design/SKILL.md:157), `NUMERIC` (build-data-pipeline/references/data-storage.md:174), `NOT` (build-data-pipeline/references/data-storage.md:174), `NULL,` (build-data-pipeline/references/data-storage.md:174), `participation` (find-next-crypto-idea/references/crypto-necessity-test.md:19), `in` (find-next-crypto-idea/references/crypto-necessity-test.md:19) … and 4 more
- "xdg-open" performs actions (opens files/URLs); probing it with arguments has side effects, so its tokens are reported UNVERIFIABLE
  - `.brand-preview/index.html` (brand-design/SKILL.md:159), `2` (brand-design/SKILL.md:159)
- wrapped CLI "remotion" invoked via npx: auto-installing packages is a side effect, so verify manually with npx remotion --help
  - `--codec` (marketing-video/SKILL.md:386), `--crf` (marketing-video/SKILL.md:386), `--codec` (marketing-video/SKILL.md:389), `--crf` (marketing-video/SKILL.md:389), `--color-space` (marketing-video/SKILL.md:389), `--codec` (marketing-video/SKILL.md:390) … and 40 more

## Patch queue (drafted — never applied)

No patches drafted. A diff is produced only when a replacement is provable from the same help text that proved the staleness — a rename never becomes a silent token swap.

## Apply queue

State: empty (mode: gated). APPLY is never automatic: an operator reviews each patch, preserves the file in Git, and applies one file at a time. This play is read-only.

## Stages

  ✓  Locate skills       completed
  ✓  Extract commands    completed
  ✓  Probe live CLIs     completed
  ✓  Classify tokens     completed
  ✓  Draft patches       completed

_Habit: rerun after every CLI upgrade, or daily. Skill files are frozen local snapshots — even a freshly reinstalled skill was written against the author's CLI versions, not yours. The installed binary is the only ground truth._
