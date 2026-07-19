# ClockLive

React Native (Expo) app that renders the next hour of your tasks as arcs around
an analog clock face. iOS + Android + web are all target platforms.

**Before any work, read `PROJECT_TASKS.md` for current project state, and keep
it updated per its rules as you work** — update it the moment a task starts,
finishes, or blocks; never batch updates to end of session.

## Run commands

- `npm start` — Expo dev server (currently `--dev-client`; native folders still
  present until Phase 1 moves to prebuild/CNG)
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
  - `Context.js` — `AppContext`: `{ tasks, setTasks, time }`; loads tasks on
    mount, ticks `time` every minute
  - `Storage.js` — react-native-storage over AsyncStorage (being replaced in
    Phase 2 by a DI `TaskRepository` over expo-sqlite — do NOT patch storage
    bugs piecemeal here; see PROJECT_TASKS.md)
  - `ColorPicker.js` — task color selection

## Data model (current, pre-Phase-2)

Tasks: array under storage key `tasks` id `1`. Fields include name,
description, start/end times as locale strings, color, completion flag. The
Phase 2 target model is
`{ id, name, description, startMinutes, endMinutes, date?, color, isCompleted }`
(numbers, not locale strings).

## Known issues / constraints

- Storage layer has known data-loss bugs (see `PROJECT_REVIEW_2026-07-10.md`
  §3); they are fixed by the Phase 2 rewrite, not piecemeal.
- Local-only mode must always remain supported; cloud/Google Calendar sync is
  opt-in behind the repository interface (Phase 5).
- Frontend/UI design is considered fine as-is — don't redesign it.
- TypeScript is adopted: new files in TS, existing files renamed incrementally.
