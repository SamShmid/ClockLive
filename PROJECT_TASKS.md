# ClockLive Project Tasks
Last updated: 2026-08-21 (v2 — brought file to canonical spec: priority tags,
deploy checklist, numbered Up Next queue with P-tags + domain grouping, commit
hashes added to Done entries; installed `docs/AGENT_WORKFLOW.md`. Prior:
v1 2026-07-20 — Android verify, clock tick fix, server-side web backend.)

Priority tags: (P0) blocks a real deployment · (P1) important · (P2) polish/enhancement.

Deploy checklist (every release):
- Web: `npm run web:build` before `npm run web:serve` — the server serves `dist/`.
- Server-backed web mode has NO auth / multi-user separation — personal
  hosting only until the open question below is decided.
- Android emulator reaches host Metro via `exp://10.0.2.2:8081`; `adb` lives
  at `~/Library/Android/sdk/platform-tools`.

> **This is the living plan — single source of truth for project state.**
> Update the moment a task starts, finishes, or blocks (never batched to end of
> session). "Currently In Progress" must always contain the exact next step so
> a cold session can resume without questions. "Done" is append-only history.
> Every session: read this first, resume from "Currently In Progress", and end
> with a Session Log entry.
> Findings that motivated this plan: see `PROJECT_REVIEW_2026-07-10.md`.

## Currently In Progress

- Nothing in flight. All background processes were stopped (Metro, test
  server, cua-driver); the Android emulator `Medium_Phone` was left running.
  Exact next step: fix ANDROID BUG #A1 below (stuck time-picker dialog) —
  it makes the Task screen unusable on Android — then Phase 3.

## Up Next (in order)

1. Android bug #A1 — stuck DateTimePicker dialog (P0)
2. Android bug #A2 — deprecated `onChange` migration (P1, same code as #A1)
3. Verify server-backed web repo end-to-end in a real browser (P1)
4. Phase 3 — Rendering & compute optimization (P1)
5. Phase 4 — Tests & CI (P1)
6. Phase 5 — Google Calendar integration (P2)

### Bugs / hardening

- [ ] (P0) **ANDROID BUG #A1 (do first) — DateTimePicker dialog is stuck open.**
      On Android, `@react-native-community/datetimepicker` with
      `display="default"` IS a modal dialog, not an inline widget. `Task.js`
      renders BOTH pickers unconditionally, so opening the Task screen pops a
      time dialog that CANCEL / OK / hardware-back all fail to dismiss (two
      dialogs are stacked). Task screen is effectively unusable on Android;
      iOS is unaffected (renders inline there).
      Fix: gate each picker behind state — a Button showing the current time
      that sets `showStartPicker`/`showEndPicker`, render `<DateTimePicker>`
      only when true, and hide it again in the change handler
      (`Platform.OS === 'android'`). Verify on emulator + iOS sim.
- [ ] (P1) **ANDROID BUG #A2 — `onChange` is deprecated** (Metro warns:
      "DateTimePicker: `onChange` is deprecated. Use `onValueChange`,
      `onDismiss`, and `onNeutralButtonPress` instead"). Migrate while doing
      #A1 — same code.
- [ ] (P1) Verify server-backed web repo end-to-end in a real browser
      (`npm run web:build && npm run web:serve`, add a task in the UI, confirm
      it lands in `server/data/clocklive.db` and survives a hard reload). The
      API itself is already verified via curl; the browser round-trip is not.

### Performance / observability

- [ ] (P1) Phase 3 — Rendering & compute optimization. Details below.

### Infra / deploy

- [ ] (P1) Phase 4 — Tests & CI. Details below.

### Enhancements

- [ ] (P2) Phase 5 — Google Calendar integration. Details below.

## Done

- [x] Agent orchestration framework installed + tracker brought to canonical
      spec — 2026-08-21 — c7297bb — added `docs/AGENT_WORKFLOW.md`
      (roles, PHASE_SPEC.md convention, gates, worktree isolation), wired from
      `CLAUDE.md`; this file gained priority tags, deploy checklist, versioned
      changelog, grouped/tagged Up Next, hashes on Done entries
- [x] Full project review — 2026-07-10 — f04c21a — findings in
      `PROJECT_REVIEW_2026-07-10.md` (7 bugs, dep audit, architecture issues)
- [x] Plan saved to task tracker — 2026-07-12 — f04c21a — phased plan
      (originally `TASKS.md`)
- [x] Open decisions resolved — 2026-07-18 — f04c21a — TypeScript: yes;
      storage: expo-sqlite; web target: in scope (see Resolved Decisions)
- [x] Tracker migrated `TASKS.md` → `PROJECT_TASKS.md` — 2026-07-18 —
      f04c21a — canonical sections added, phase plan preserved below
- [x] Phase 0 — Repo restructure & docs — 2026-07-18 — f04c21a — flattened app to git
      root (git mv, history preserved); added CLAUDE.md (+ README pointer),
      .eslintrc.js/.prettierrc (eslint 8 + eslint-config-expo, 0 errors /
      8 warnings deferred to Ph1/Ph3), .nvmrc (24), tsconfig.json (strict,
      expo base; file renames to .ts happen incrementally); lint/format/
      typecheck npm scripts; verified Metro boots from new root
- [x] iOS simulator QA exploration (Sonnet subagent) — 2026-07-18 —
      fc38dd4/6414581 — Expo Go
      SDK 51 on iPhone 17 sim; 13 screenshots in `qa/2026-07-18/`; report in
      `QA_EXPLORATION_2026-07-18.md`. Confirmed 1-min expiry bug (source);
      NEW finding: `storage.load()` promise appears to never settle in
      `Context.js` (neither .then nor .catch logs fire). RN Button presses
      untriggerable by synthetic clicks (tooling limit) so add-task/complete
      flows were source-audited, not live-tested.
- [x] Phase 2 — Storage DI seam — 2026-07-19 — 13f0ff2 — lib/tasks (TS): TaskRepository
      interface + SqliteTaskRepository (expo-sqlite, WAL) + AsyncStorage web
      backend + platform factory + legacy migration; lib/time.ts; Context.tsx
      owns repo & exposes operations; Task.js/Clock.js on minutes model
      (4x duplicated string parsing gone; complete-task now persists — old
      bug); react-native-storage + Storage.js deleted. A11y fix: Task form no
      longer collapses into one AX element (accessible={false} on wrapper).
      LIVE-VERIFIED on sim: task added via automation -> row in clocklive.db;
      app relaunched 2m42s later -> task loaded (old code killed it at 60s);
      clock hands verified correct through hour boundary. Web export OK,
      tsc/eslint clean.
- [x] Phase 1 — Expo SDK 51→57 + dep pruning — 2026-07-18/19 — ecb7f65 — removed 9
      unused deps + dead regenerator-runtime import; expo 57.0.7 / RN 0.86 /
      React 19.2.3; React Navigation v6→v7; @expo/vector-icons + expo-font
      explicit; deleted android/+ios/ (CNG; ids com.clocklive in app.json);
      proper app.json (scheme, orientation default, web.bundler metro);
      expo-doctor 20/20; npm audit 0 high/critical (11 moderate); tsc clean;
      eslint 0 errors (react-hooks/refs + set-state-in-effect demoted to warn
      until Ph2/3 rewrites); web export verified; live iOS verify on Expo Go
      57 — clock + drawer + Task screen work. BONUS: new-arch RN exposes
      buttons via accessibility → automated QA can now press Add A Task etc.
      Android verify deferred (no toolchain).

- [x] Android emulator verification — 2026-07-20 — bf34bf5 — owner installed the
      Android SDK; AVD `Medium_Phone` booted, Expo Go 57 APK installed,
      app opened via `exp://10.0.2.2:8081`. RESULT: app bundles and runs on
      Android — clock renders with correct hands, drawer header, Task screen
      renders, native Material time picker opens. FOUND Android bugs #A1/#A2
      (see Up Next). Note: run Metro and use 10.0.2.2 (emulator alias for
      host localhost); `adb` lives at ~/Library/Android/sdk/platform-tools.
- [x] Clock tick robustness fix — 2026-07-20 — bf34bf5 — the "clock sometimes doesn't
      move" report: a plain 60s `setInterval` drifts (fires up to 59s after
      the real minute flip) and is paused/throttled while the app is
      backgrounded, so the clock could sit visibly stale. `Context.tsx` now
      schedules each tick to the actual next minute boundary and force-
      refreshes on `AppState` -> 'active'.
- [x] Web server-side SQLite backend — 2026-07-20 — bf34bf5 — owner asked for web data
      to live on the server that hosts the site (not in the browser).
      `server/index.mjs`: zero-dependency Node server (`node:sqlite`, built
      into Node 22.5+) serving the Expo web export from `dist/` AND
      `/api/tasks` (GET list, POST create, POST /:id/complete, DELETE clear)
      over `server/data/clocklive.db`. `ApiTaskRepository` implements the
      same `TaskRepository` interface and is now the web factory's choice,
      degrading to browser AsyncStorage if the API is unreachable (so
      `expo start --web` dev still works). Scripts: `npm run web:build`,
      `npm run web:serve`. VERIFIED via curl: create/list/complete round-trip
      persisted to the server DB; static site + JS bundle served (200).

## Blocked / Open Questions

- RESOLVED 2026-07-20: Android toolchain installed by owner; emulator
  verification done (see Done). No open blockers.
- Open question for later: the server-backed web mode has no auth or
  multi-user separation — every visitor shares one task list. Fine for a
  personal deployment; needs a decision before any public hosting.

## Session Log

- 2026-08-21: Installed the agent orchestration framework
  (`docs/AGENT_WORKFLOW.md`: orchestrator/writers/integrator roles,
  `PHASE_SPEC.md` convention, gate commands, worktree isolation) and wired it
  from `CLAUDE.md`; brought this file to the canonical task-tracking spec
  (priority tags, deploy checklist, versioned changelog, P-tags + domain
  grouping in Up Next, commit hashes on Done entries — no content removed).
  Next: Android bug #A1.
- 2026-07-10: Full project review; findings written to
  `PROJECT_REVIEW_2026-07-10.md`.
- 2026-07-12: Phased rebuild plan created and saved to `TASKS.md`; decided
  architecture-first order (storage rewrite before piecemeal bug fixes).
- 2026-07-20: Android emulator verified working (app runs; found stuck
  time-picker bug #A1 + deprecated onChange #A2 — both queued as next work).
  Fixed clock-tick drift/background staleness. Built the server-side SQLite
  backend for web (server/index.mjs + ApiTaskRepository), curl-verified.
  Session ended with a context clear; all state captured here.
- 2026-07-19 (later): Phase 2 done and live-verified (persistence past the
  old 60s bug window, correct clock, a11y form fix). Next: Phase 3.
- 2026-07-19: Phase 1 done — Expo 57 / RN 0.86 / React 19, nav v7, 9 deps
  pruned, native folders deleted (CNG), doctor 20/20, iOS + web verified
  live. Discovered new-arch RN exposes buttons to accessibility, unblocking
  automated QA (the button-press limitation from the 2026-07-18 QA run is
  gone). Android verify still pending toolchain install.
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

### Phase 1 — Expo upgrade & dependency pruning — DONE 2026-07-19 (Android verify pending)

- [x] Upgrade Expo SDK 51 → 57 (`npx expo install expo@latest` + `--fix`)
- [x] Delete `android/` + `ios/`, adopt prebuild/CNG (native folders are
      unmodified templates); move icons/splash config into app.json
- [x] Remove unused deps: react-native-color-picker, react-native-color-picker-ios,
      react-native-wheel-color-picker, react-datetime-picker,
      @react-navigation/stack, @react-native-picker/picker,
      @react-native-community/slider, `install`, `npm`
- [x] Add explicit dep: @expo/vector-icons (+ expo-font peer); drop regenerator-runtime import
- [x] Verify: `expo-doctor` clean (20/20); `npm audit` no high/critical; app
      runs on iOS simulator (Expo Go 57, live-verified incl. navigation and
      Add A Task press) AND web (export verified). Android emulator verify
      DEFERRED — blocked on toolchain install (see Up Next leftover)

### Phase 2 — Storage architecture (DI seam) — DONE 2026-07-19
(extended 2026-07-20 with the server-backed web backend)

- [x] Design Task model: `{ id, name, description, startMinutes, endMinutes,
      date?, color, isCompleted }` (numbers, not locale strings)
- [x] Define `TaskRepository` interface: `getTasks / addTask / completeTask /
      clearTasks` (+ subscribe/change notification)
- [x] Implement local backend (expo-sqlite per decision; AsyncStorage backend for web via createTaskRepository.web.ts) — injected
      into the repository, never imported directly by components
- [x] Context provider owns a repository instance and exposes *operations*, not
      a raw `setTasks` setter; every mutation persists automatically
- [x] Remove `react-native-storage`, the `storage.sync` monkey-patch, and the
      1-minute expiry (data-loss bugs #1, #2, #7 die here by construction)
- [x] One-time migration for any previously saved task data (best-effort; legacy data was all expired by bug #1 anyway)
- [x] Verify the load path actually settles — confirmed live: cold start
      logs `Tasks: []` then the loaded list (regression test still owed in
      Phase 4)
- [x] Design note: cloud/Google Calendar later = a second backend or a
      sync-decorator in front of the local one; app code unchanged
- [x] Server-backed web backend (`ApiTaskRepository` + `server/index.mjs`) —
      proof the seam works: adding a third backend touched zero component
      code, only the web factory line

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
