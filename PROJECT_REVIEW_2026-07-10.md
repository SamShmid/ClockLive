# ClockLive — Full Project Review (2026-07-10)

> Snapshot of the state of the repo as reviewed on 2026-07-10. This document is a
> frozen record of findings. The living plan lives in `TASKS.md` — update that,
> not this.

## 1. Project Summary

ClockLive is a **React Native app (Expo SDK 51, bare workflow)** that renders an
analog clock and overlays the current hour's tasks as colored arcs around the
clock face. Users add tasks (name, description, start/end time, color) on a Task
screen; tasks persist locally via `react-native-storage` backed by AsyncStorage.
Navigation is a 3-screen drawer (Home / Task / About). There is **no backend, no
network calls, and no API endpoints** — the app is 100% offline. The README's
vision of unifying tasks from calendars/alarms is not yet implemented.

Architecture: a single React Context (`components/Context.js`) holds `tasks` and
a once-a-minute `time` tick; `Clock.js` does all the math and rendering;
`Task.js` does CRUD; storage is a module-level singleton.

Repo state oddities (as of review):
- Triple-nested folders: `ClockLive/ClockLive/ClockLive`. The git repo
  (`origin: SamShmid/ClockLive`) lives at the middle level; the app one level deeper.
- No tests, no CI, no linter, no TypeScript, no CLAUDE.md.

## 2. Verified Runtime Status (2026-07-10)

- `npm install` succeeds — with **81 vulnerabilities: 3 critical, 47 high**.
- Metro bundles successfully for iOS and web (no import errors).
- Web export boots and renders in headless Chrome without crashing.
- **iOS native build is blocked on this machine**: Expo SDK 51 requires
  Xcode ≤ 16.2; installed Xcode is 26.2. `expo-doctor` fails 5 checks.
- Several packages mismatch even SDK 51's expectations (react-native 0.74.2 vs
  expected 0.74.5, etc.).
- On web, `@react-native-community/datetimepicker` renders `null` — the Task
  screen has no time pickers on web; tasks get start = end = "now".

## 3. Overt Bugs Found

1. **All tasks are deleted 1 minute after saving.** `Task.js:46` saves with
   `expires: 1000 * 60`. On next launch the load finds expired data, the
   do-nothing sync stub resolves `undefined`, and `Context.js` replaces tasks
   with `[]`. Persistence effectively does not exist.
2. **Completing a task is never persisted.** `handleCompleteTask` in both
   `Clock.js` and `Task.js` calls `setTasks` but never saves.
3. **Render-time mutation corrupts task geometry.** `Clock.js` stamps
   `task.startDegree/endDegree/duration` onto shared context objects during
   render; the `??` fallbacks then never recompute after the hour rolls over,
   and the mutated fields get persisted on the next save.
4. **Locale-dependent time storage.** Tasks store `toLocaleTimeString()` display
   strings, re-parsed in four duplicated blocks assuming `"H:MM AM"`. 24-hour
   locales / locale changes break parsing. Times should be stored as
   minutes-since-midnight integers.
5. **Tasks can't span midnight**, and tasks have no date (time-of-day only).
6. **Web time pickers render nothing** (verified in package source).
7. **Module-level side effect:** `Task.js` monkey-patches `storage.sync` at
   import time; `Context.js`'s load only works due to import ordering.

Minor: unused props in `Item.js`; dead `StatusBar` import in `About.js`;
`ExpiredError` branch in `Context.js` never resets state.

## 4. Modularity / DI Problems

- Storage is a hard-wired module singleton, imported directly and mutated from
  another module. Nothing is swappable or testable.
- Business logic lives inside render functions; the 12h→24h parsing block is
  copy-pasted 4× in `Clock.js`; the overlap-ring layout algorithm is inline.
- Components mutate their inputs instead of computing derived data.
- `TaskBlock.js` renders one `<View>` per degree (a full-hour task = 361 Views,
  re-created every render) while `react-native-svg` sits unused in deps.
- Byte-identical task-detail modals duplicated in `Clock.js` and `Task.js`;
  pointless `const Clock = () => <ClockComponent />` wrappers.

## 5. Dependency Findings

Unused/wrong: `react-native-color-picker`, `react-native-color-picker-ios`,
`react-native-wheel-color-picker`, `react-datetime-picker` (web-DOM library),
`@react-navigation/stack`, `@react-native-picker/picker`,
`@react-native-community/slider`, `react-native-svg` (unused but should be USED
for arcs), and `install` + `npm` (accidental installs).
Used but undeclared: `@expo/vector-icons` (transitive via expo).
Unnecessary: `regenerator-runtime` import in `Task.js`.
`react-native-storage` to be replaced entirely per the storage architecture plan.

## 6. Direction Decided After Review (owner input, 2026-07-10)

- Architecture first, bug fixes second — most buggy code is being replaced anyway.
- Storage must be **dependency-injectable**: a repository/handler interface in
  front of storage so a cloud instance (Google Calendar first) can be switched
  on later without touching the rest of the app. Local-only remains a supported mode.
- Considering a database (e.g., SQLite) instead of react-native-storage.
- Upgrade Expo; port to Android as well as iOS.
- Flatten folder structure before any code changes; add CLAUDE.md and a task
  tracker doc (`TASKS.md`) that Claude keeps updated.
- Reduce recompute-everything-every-tick rendering.
