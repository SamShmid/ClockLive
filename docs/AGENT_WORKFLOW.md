# Agent Orchestration Framework — ClockLive

How substantial build work is decomposed, delegated, verified, and recombined
in this repo. Any session (AI or human) running multi-step work follows this
play. Standing conventions live in `CLAUDE.md`; durable project state lives in
`PROJECT_TASKS.md`; the per-phase contract lives in `PHASE_SPEC.md`.

## Roles

Role names are permanent; the model mapping below is the current tuning and
may change (track cost per phase and adjust).

- **Orchestrator** — the interactive session, on the owner's primary model
  (currently Fable 5). Owns *design*, not typing: writes the phase contract
  (`PHASE_SPEC.md`), batches decisions to the owner, reviews the final
  integrated result. Writes little or no implementation code.
- **Writers** — cheapest capable tier (currently **Haiku 4.5**; bump an
  individual work order to Sonnet if it's subtle). Run in parallel; each takes
  exactly ONE interface-level work order, implements only it in an isolated
  worktree/branch, touches only its assigned files.
- **Integrator** — mid tier (currently **Sonnet 5**). Merges writer branches
  in dependency order, runs the gates, fixes only clear integration breaks,
  stops-and-asks on anything that smells like a design decision.

Keep the expensive model off the keyboard and the cheap models off the
architecture.

## Artifacts

- `CLAUDE.md` (root) — standing conventions that don't change per phase.
- `PROJECT_TASKS.md` (root) — durable state + per-phase metrics log
  (see its own rules in the file header).
- `PHASE_SPEC.md` (root) — the binding per-phase contract, written at
  INTERFACE level by the orchestrator at phase start: file-by-file work
  orders, function signatures, exact request/response shapes, the gate
  commands, the writer/integrator split. Overwritten each phase; git history
  preserves old ones. Its first line names the phase (writers base-check it).
- This document — the roles/workflow/discipline.

## Workflow — one phase at a time

1. **Batch all decisions up front.** Ask the owner every clarification/design
   question before starting; then run autonomously to a single report.
2. **Orchestrator writes `PHASE_SPEC.md`** at interface level. Writer work
   orders must be small and DISJOINT — writers code against the shared
   contract, never against each other's unfinished branches.
3. **Tests first.** Write the acceptance checks from the spec BEFORE
   implementation. Writers make them pass; that is the definition of done.
   (Until Phase 4 lands Jest, acceptance checks = typecheck + lint + a
   scripted verification named in the spec, e.g. a curl round-trip or a
   simulator/emulator check.)
4. **Commit mainline before spawning anyone.** Writers branch from a
   complete, current base.
5. **Spawn writers in parallel, each in its own git worktree/branch.** Every
   writer prompt carries: base-check (`PHASE_SPEC.md` first line matches this
   phase, else sync from main); read `CLAUDE.md` + `PHASE_SPEC.md`; the exact
   touch-only file list; verify locally (typecheck / self-review — NOT the
   full suite); commit on its own branch and report; **STOP-AND-ASK** on any
   ambiguity or spec-vs-code contradiction instead of guessing.
6. **Integrator merges in dependency order and runs the gates** (below),
   fixes only clear integration breaks, stops-and-asks on design questions,
   commits the integrated result.
7. **Orchestrator reviews** the correctness/security-critical pieces, records
   the phase in `PROJECT_TASKS.md` (Done entry + metrics row in the Session
   Log), and delivers ONE report to the owner.

## Discipline

- **Escalation ladder.** Writers halt and return the question on ambiguity;
  the orchestrator resumes them with the answer. The orchestrator answers
  trivial calls itself and logs them. Real forks or scope changes go to the
  owner, even mid-phase. A wrong guess costs far more than a question.
- **The spec is the arbiter.** When a writer's output conflicts with a test
  or another writer, `PHASE_SPEC.md` decides. Reconciliations are made
  explicitly and logged — never by silently weakening a check.
- **Isolation is mandatory.** Parallel writers never share a working tree;
  touch-lists are enforced, not suggested.
- **Grep before you finalize.** Before locking a touch-list, grep for every
  site an affected type/field/enum appears. A change flipping a DEFAULT
  behavior must additionally grep the test suite for callers assuming the old
  behavior. A UI change must name a screen-level owner (Home / Task / Clock /
  About) for every affordance it touches.
- **Gates are non-negotiable and owned by the integrator**, never by the
  writers who wrote the code.
- **Track cost per phase** (tokens and agent count) in the `PROJECT_TASKS.md`
  session log so the role↔tier split can be tuned.

## Repo-specific fill-ins

- **Gate commands** (run in this order):
  1. `npm run typecheck` — `tsc --noEmit`
  2. `npm run lint` — eslint (0 errors required; existing warnings are
     tracked debt, don't add new ones)
  3. `npm test` — **does not exist yet** (Phase 4 adds Jest). Until then the
     spec must name a concrete verification step per phase (curl round-trip
     against `server/index.mjs`, simulator/emulator check, etc.).
  4. `npm run web:build` — web export must succeed (web is a supported
     target; this is the build gate)
  5. Smoke, when the phase touches the server path:
     `npm run web:serve` + curl `/api/tasks`.
- **Isolation mechanism:** git worktrees (preferred; repo supports them) —
  `git worktree add ../clocklive-<order-name> -b phase<N>/<order-name>`.
  Feature branches alone are the fallback.
- **CI:** none yet — there is no `.github/`. Gates run locally until Phase 4
  adds a GitHub Actions workflow (lint + typecheck + tests on push/PR); once
  it exists, a green run on the pushed branch becomes the final gate.
- **Model-tier mapping:** Orchestrator = Fable 5 (session model),
  Writers = Haiku 4.5, Integrator = Sonnet 5. Default proposed 2026-08-21 —
  owner may retune; record changes here.
