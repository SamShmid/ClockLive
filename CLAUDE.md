# ClockLive

React Native (Expo) app that renders the next hour of your tasks as arcs around
an analog clock face. iOS + Android + web are all target platforms.

**Before any work, read `PROJECT_TASKS.md` for current project state, and keep
it updated per its rules as you work** — update it the moment a task starts,
finishes, or blocks; never batch updates to end of session.

**For any multi-step build work, follow `docs/AGENT_WORKFLOW.md`** — the
orchestrator/writers/integrator framework: phase contract in `PHASE_SPEC.md`,
parallel writers in isolated worktrees, integrator-owned gates
(typecheck → lint → web:build).

## Run commands

- `npm start` — Expo dev server (CNG/prebuild; no checked-in native folders)
- `npm run ios` / `npm run android` — build & run natively
- `npm run web` — web target (in scope; keep it working)

## Structure

- `App.js` — root; navigation (drawer) + `ContextProvider`
- `index.js` — entry point (`registerRootComponent`)
- `components/` — all UI and logic:
  - `Clock.js` — clock face, task arc layout
  - `TaskBlock.js` — renders a task's arc segment
  - `HourHand.js` / `MinuteHand.js` — clock hands
  - `Task.js` — add/edit task UI
  - `Item.js` — task list row
  - `Home.js`, `About.js` — screens
  - `Context.tsx` — `AppContext`: `{ tasks, addTask, completeTask, clearTasks,
    time }`; owns a `TaskRepository` (injectable via prop), subscribes for
    changes, ticks `time` every minute
  - `ColorPicker.js` — task color selection
- `lib/` — TypeScript core:
  - `lib/tasks/` — the storage seam: `TaskRepository` interface,
    `SqliteTaskRepository` (native), `AsyncStorageTaskRepository` (web),
    `createTaskRepository` factory (`.web.ts` picks the web backend),
    `legacyMigration` (one-time react-native-storage import)
  - `lib/time.ts` — minutes-of-day conversions and 12h formatting

## Data model

`Task = { id, name, description, startMinutes, endMinutes, date?, color,
isCompleted }` — times are minutes since midnight (numbers), stored in SQLite
table `tasks` (`clocklive.db`) on native, AsyncStorage JSON on web. Components
never import a storage backend directly — always go through the context
operations / `TaskRepository`.

## Known issues / constraints

- Local-only mode must always remain supported; cloud/Google Calendar sync is
  opt-in behind the repository interface (Phase 5).
- Frontend/UI design is considered fine as-is — don't redesign it.
- TypeScript is adopted: new files in TS, existing files renamed incrementally.
