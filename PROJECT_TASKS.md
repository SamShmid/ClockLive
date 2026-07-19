# ClockLive Project Tasks
Last updated: 2026-07-18

> **This is the living plan — single source of truth for project state.**
> Update the moment a task starts, finishes, or blocks (never batched to end of
> session). "Currently In Progress" must always contain the exact next step so
> a cold session can resume without questions. "Done" is append-only history.
> Every session: read this first, resume from "Currently In Progress", and end
> with a Session Log entry.
> Findings that motivated this plan: see `PROJECT_REVIEW_2026-07-10.md`.

## Currently In Progress

- Nothing. Exact next step: start Phase 1 (Expo 51→57 upgrade) — and first
  remind the owner to install the Android toolchain (see Blocked section).

## Up Next (in order)

- [ ] Phase 1 — Expo SDK 51→57 upgrade + dependency pruning. ⏰ At start:
      remind owner to install the Android toolchain (see Blocked section).
      Note from Phase 0: app.json has a root-level "expo" object warning to
      clean up. Details below.
- [ ] Phase 2 — Storage architecture: DI `TaskRepository` seam over
      `expo-sqlite` (core priority). Details below.
- [ ] Phase 3 — Rendering & compute optimization. Details below.
- [ ] Phase 4 — Tests & CI. Details below.
- [ ] Phase 5 — Google Calendar integration. Details below.

## Done

- [x] Full project review — 2026-07-10 — findings in
      `PROJECT_REVIEW_2026-07-10.md` (7 bugs, dep audit, architecture issues)
- [x] Plan saved to task tracker — 2026-07-12 — phased plan (originally
      `TASKS.md`)
- [x] Open decisions resolved — 2026-07-18 — TypeScript: yes; storage:
      expo-sqlite; web target: in scope (see Resolved Decisions)
- [x] Tracker migrated `TASKS.md` → `PROJECT_TASKS.md` — 2026-07-18 —
      canonical sections added, phase plan preserved below
- [x] Phase 0 — Repo restructure & docs — 2026-07-18 — flattened app to git
      root (git mv, history preserved); added CLAUDE.md (+ README pointer),
      .eslintrc.js/.prettierrc (eslint 8 + eslint-config-expo, 0 errors /
      8 warnings deferred to Ph1/Ph3), .nvmrc (24), tsconfig.json (strict,
      expo base; file renames to .ts happen incrementally); lint/format/
      typecheck npm scripts; verified Metro boots from new root
- [x] iOS simulator QA exploration (Sonnet subagent) — 2026-07-18 — Expo Go
      SDK 51 on iPhone 17 sim; 13 screenshots in `qa/2026-07-18/`; report in
      `QA_EXPLORATION_2026-07-18.md`. Confirmed 1-min expiry bug (source);
      NEW finding: `storage.load()` promise appears to never settle in
      `Context.js` (neither .then nor .catch logs fire). RN Button presses
      untriggerable by synthetic clicks (tooling limit) so add-task/complete
      flows were source-audited, not live-tested.

## Blocked / Open Questions

- **Android QA exploration** — deferred by owner 2026-07-18. No Android
  SDK/adb/emulator installed on this machine. ⏰ REMIND OWNER at Phase 1 start:
  install Android toolchain (Android Studio or cmdline-tools + emulator +
  system image) — required for Phase 1's Android verification step and the
  Android QA walkthrough.

## Session Log

- 2026-07-10: Full project review; findings written to
  `PROJECT_REVIEW_2026-07-10.md`.
- 2026-07-12: Phased rebuild plan created and saved to `TASKS.md`; decided
  architecture-first order (storage rewrite before piecemeal bug fixes).
- 2026-07-18: Resolved the three open decisions (TypeScript yes, expo-sqlite,
  web in scope); migrated tracker to `PROJECT_TASKS.md`; completed and
  committed all of Phase 0 (flatten, CLAUDE.md, ESLint/Prettier, .nvmrc,
  tsconfig; f04c21a). Ran subagent iOS QA exploration → report + 13
  screenshots; confirmed expiry bug, found new load-never-settles issue,
  logged Phase 2 follow-up. Android QA deferred by owner (no SDK installed);
  reminder wired to Phase 1 start.

---

## Resolved Decisions

- [x] **TypeScript?** Yes — adopt during Phase 0/1 (tsconfig in Phase 0,
      rename files incrementally). *(2026-07-18)*
- [x] **Storage backend for local mode:** `expo-sqlite`, behind the
      `TaskRepository` interface. Note: web support needs expo-sqlite's
      wasm/web setup (supported since SDK 50+; verify during Phase 2).
      *(2026-07-18)*
- [x] **Web target matters?** Yes — keep web working. Phase 1 dep pruning and
      time-picker choices must stay web-compatible. *(2026-07-18)*

## Phase Plan (detail)

### Phase 0 — Repo restructure & docs (no app-code behavior changes) — DONE 2026-07-18

- [x] Flatten `ClockLive/ClockLive/*` up one level so the git root is the app
      root (README.md, package.json, components/ side by side)
- [x] Add `CLAUDE.md` (run commands, structure, data model, "read + update
      PROJECT_TASKS.md" rule)
- [x] Add ESLint + Prettier (catches unused imports, hook violations, formatting)
- [x] Add `.nvmrc`
- [x] TypeScript scaffolding (tsconfig; file renames happen incrementally in
      later phases)

### Phase 1 — Expo upgrade & dependency pruning

- [ ] Upgrade Expo SDK 51 → 57 (`npx expo install expo@latest` + `--fix`)
- [ ] Delete `android/` + `ios/`, adopt prebuild/CNG (native folders are
      unmodified templates); move icons/splash config into app.json
- [ ] Remove unused deps: react-native-color-picker, react-native-color-picker-ios,
      react-native-wheel-color-picker, react-datetime-picker,
      @react-navigation/stack, @react-native-picker/picker,
      @react-native-community/slider, `install`, `npm`
- [ ] Add explicit dep: @expo/vector-icons; drop regenerator-runtime import
- [ ] Verify: `expo-doctor` clean; `npm audit` no high/critical; app builds and
      runs on iOS simulator AND Android emulator (Android port target) AND
      web (`npx expo start --web`) — web target confirmed in scope 2026-07-18

### Phase 2 — Storage architecture (DI seam) ← *core priority*

- [ ] Design Task model: `{ id, name, description, startMinutes, endMinutes,
      date?, color, isCompleted }` (numbers, not locale strings)
- [ ] Define `TaskRepository` interface: `getTasks / addTask / completeTask /
      clearTasks` (+ subscribe/change notification)
- [ ] Implement local backend (expo-sqlite per decision) — injected
      into the repository, never imported directly by components
- [ ] Context provider owns a repository instance and exposes *operations*, not
      a raw `setTasks` setter; every mutation persists automatically
- [ ] Remove `react-native-storage`, the `storage.sync` monkey-patch, and the
      1-minute expiry (data-loss bugs #1, #2, #7 die here by construction)
- [ ] One-time migration for any previously saved task data
- [ ] Verify the load path actually settles: QA 2026-07-18 found
      `storage.load()` in `Context.js` never hits `.then` OR `.catch`
      (see `QA_EXPLORATION_2026-07-18.md` §5/§8.2) — the rewrite must
      guarantee load resolves and add a regression test for it
- [ ] Design note: cloud/Google Calendar later = a second backend or a
      sync-decorator in front of the local one; app code unchanged

### Phase 3 — Rendering & compute optimization

- [ ] Extract pure modules: `lib/time` (12h/24h conversion — kills the 4×
      duplicated parsing) and `lib/clockLayout` (arc geometry + overlap rings);
      no mutation of inputs (fixes bug #3)
- [ ] Memoize layout: recompute only when the minute ticks or tasks change
- [ ] Replace per-degree `<View>` notches in TaskBlock with one SVG arc path
      per task (react-native-svg already installed)
- [ ] Single shared `TaskDetailModal`; remove duplicate modals and pass-through
      wrapper components

### Phase 4 — Tests & CI

- [ ] Jest (jest-expo preset) unit tests: lib/time, lib/clockLayout,
      TaskRepository against a fake/in-memory backend
- [ ] React Native Testing Library component tests: add a task → appears in
      list; complete a task → disappears
- [ ] GitHub Actions workflow: lint + typecheck + tests on every push/PR

### Phase 5 — Google Calendar integration (the README vision)

- [ ] `SyncProvider` interface behind/beside TaskRepository
- [ ] Google Calendar read-only import first (events → tasks for today)
- [ ] Local-only mode remains fully supported (no account required)

## Known bugs deferred until after Phase 2/3 (verify fixed then)

Bugs #1–#7 in `PROJECT_REVIEW_2026-07-10.md` §3 — most are eliminated by the
storage rewrite (Ph2) and layout extraction (Ph3). After those phases, walk the
list and confirm each one is actually gone; fix any survivors directly.
