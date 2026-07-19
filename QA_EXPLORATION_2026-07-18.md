# ClockLive — Manual QA Exploration (2026-07-18)

Scope: iOS Simulator only, driven by an autonomous agent using the `cua-driver`
macOS accessibility-automation tool plus `xcrun simctl`. Screenshots referenced
below live in `qa/2026-07-18/`. The full Metro log is saved alongside them as
`qa/2026-07-18/metro.log`.

---

## 1. Setup

**Route used: Expo Go for SDK 51 (not a native `expo run:ios` build).**

1. Booted `iPhone 17` simulator (`iOS 26.2` runtime):
   `xcrun simctl boot "iPhone 17"` + `open -a Simulator`. (A second device,
   "iPhone 17 Pro", kept auto-booting on its own throughout the session with
   unrelated apps already installed on it — e.g. a Timer app, a "Manage Codes"
   app, Expo Go's own home screen. This is pre-existing state on this shared
   machine, not something this session created; it was repeatedly shut down
   with `xcrun simctl shutdown <udid>` to avoid confusing `simctl io booted`,
   which is ambiguous when two devices are booted.)
2. Downloaded the SDK 51 Expo Go client directly from
   `https://api.expo.dev/v2/versions` → `sdkVersions["51.0.0"].iosClientUrl`
   (`Exponent-2.31.6.tar.gz`), extracted it, and installed it with
   `xcrun simctl install booted <path>/Exponent.app`. This worked cleanly and
   was much faster than a native build (total setup time: a few minutes,
   almost all of it the ~54 MB download).
3. Started Metro with `npx expo start --port 8081` (no `--dev-client`) from
   the repo root, then opened the project with
   `xcrun simctl openurl booted "exp://127.0.0.1:8081"`.
4. Metro printed a compatibility warning on startup (screenshot: none needed,
   captured in log) — see §4 Console output. The app bundled in **3932 ms
   (1200 modules)** and rendered the Home screen with no red-screen errors.
5. On first load, Expo Go showed its standard one-time "developer menu" sheet
   introducing the project (`SDK version 51.0.0`, connected to
   `127.0.0.1:8081`) — dismissed via its native "Continue"/backdrop control.
   This is normal Expo Go behavior, not an app bug.

Nothing failed on the way; the fallback native-build route was not needed.

---

## 2. Launch state / Clock face

- `01-launch.png` — the "Open in Expo Go?" system confirmation dialog.
- `02-home-clock.png`, `02b-home-full.png` — Home screen after the dev-menu
  sheet was dismissed: black background, white "Home" drawer header, an
  analog clock face (no numerals, minute tick marks with longer ticks every
  5 minutes, thin gray border circle), and an orange **"Add A Task"** button
  near the bottom.
- The clock draws two hands only (no second hand): an orange hour hand and a
  gray minute hand, both animated with `Animated.timing` (1 s linear tween)
  per `HourHand.js` / `MinuteHand.js`.
- Verified the hand angles are computed correctly for the real device time
  (cross-checked math for `hour%12*30 + minute*0.5` against pixel geometry in
  the screenshot — hands point where they should). No incorrect-time bug
  observed.
- The Metro console log confirms `time` ticks once per minute reliably: the
  session's log shows `Current time: {"hour": 22, "minute": N}` incrementing
  every single minute from `22:11` through `22:58` with no gaps or repeats,
  for the ~47-minute duration of the session (see `metro.log`).

---

## 3. Drawer navigation

All three screens were reached and screenshotted:

- `03-drawer-open.png` — drawer showing **Home / Task / About**, black
  background, white/gray labels, active route highlighted.
- `04-task-screen-empty.png` / `06-task-screen.png` — Task screen: "Task
  List" header, orange "Task Name" and "Description" text inputs, "Start
  Time:" / "End Time:" compact time-picker buttons (both defaulted to the
  current time, e.g. `10:15 PM`), and an orange **Pick Color** / **Add Task**
  / red-text **Clear** button row.
- `05-about-screen.png` — About screen: "Clock Live" heading in orange plus
  the full mission-statement paragraph from `About.js`, matches source
  verbatim.

Navigation via the drawer worked reliably for the whole session using
accessibility-tree button presses (see §7 on automation method).

---

## 4. Add-task flow — what worked, what didn't

**Text entry worked and was exercised fully:**

- Focused "Task Name" by tapping it (via coordinate click) — cursor and
  keyboard appeared, typed **"Morning Standup"** correctly
  (`07-task-name-typed.png`).
- Focused "Description" and typed a sentence. Two separate typing mechanisms
  were tried:
  - `cua-driver`'s built-in `type_text` (CGEvent-based) reproducibly typed
    the **wrong characters** — every keystroke came out as repeated `a`/`A`
    regardless of the requested string (e.g. asking for "Hello World" typed
    "Aaaaaaaaaaa"). This is a tool bug in this environment, not an app bug.
  - Typing character-by-character via `press_key` (per-letter virtual
    keydown, with `shift` for capitals) worked correctly and reliably.
  - iOS's own autocorrect intervened once mid-session and silently swapped a
    typed word for an unrelated dictionary word (typed "Daily sync…", field
    ended up reading "**Failure** sync with the team") — an iOS/keyboard
    autocorrect artifact of the synthetic typing cadence, not an app bug.
    `08-task-form-filled.png` shows the final form state actually reached:
    Name = "Morning Standup", Description = "Failure sync with the team",
    Start/End Time both defaulted to "10:15 PM".

**Not reachable by automation this session: Pick Color, Add Task, Clear, and
both compact time-picker buttons.** Extensive attempts were made:

- Pixel clicks via `cua-driver click {x,y}` (both backgrounded and with
  Simulator brought frontmost).
- Accessibility-tree (`element_index`) clicks — not applicable here because
  the entire Task screen body below the header renders as a **single opaque
  collapsed `AXGenericElement`** in the accessibility tree (everything from
  "Task List" down through the button row has no individually-addressable
  children), so there is nothing to target by index for these controls.
- Raw HID-level clicks synthesized directly with `CGEvent(tap: .cghidEventTap)`
  from a small compiled Swift helper (the documented approach for
  canvas/GPU-rendered viewports), including a leading `mouseMoved` and a
  150 ms press-hold.
- Coordinate calibration was independently verified correct using
  `cua-driver`'s `debug_image_out` crosshair feature: `12-click-crosshair-
  evidence.png` shows the crosshair landing squarely on the "Pick Color"
  button. **The click coordinate is right and lands exactly on the button —
  the button's `onPress` still does not fire.**
- By contrast, the same class of synthetic click reliably focuses text
  inputs and even places the text cursor at the correct character offset
  when clicking mid-string.

Conclusion: this is a genuine automation-tooling limitation, not an app bug —
synthetic pointer events delivered to the iOS Simulator's Metal-rendered
content view are sufficient to trigger UITextField's simpler tap-to-focus
responder assignment, but do not satisfy whatever gesture-recognizer
sequence RN's `Button`/`TouchableOpacity` press handling needs in this
Expo Go / RN 0.74 / iOS 26.2 combination. See §8, "Not testable."

Because Add Task could never be triggered, the following flows described in
the task brief could **not** be exercised live and are instead described from
source (`components/Task.js`, `components/Clock.js`) rather than observed:
multiple/overlapping tasks on the clock face, midnight-crossing tasks,
zero-length tasks, task complete flow, and clock-arc rendering of a real
task. This is flagged explicitly in §8.

---

## 5. Persistence check

- Confirmed live in the console: **no task was ever added**, so `Tasks: []`
  is logged every single minute for the entire ~47-minute session — before
  *and* after killing/relaunching the app.
- Relaunch was still tested end-to-end for crash/stability: `xcrun simctl
  terminate booted host.exp.Exponent` → re-opened `exp://127.0.0.1:8081` →
  app came back cleanly to the Home screen with no error screen
  (`10-relaunch-1.png`), Metro re-bundled in 58 ms (fast refresh/cache), and
  logging resumed normally.
- **The suspected 1-minute storage-expiry data-loss bug (PROJECT_REVIEW
  §3, bug 1) is confirmed by source inspection**, since it could not be
  triggered live without a working Add Task button:
  `components/Task.js:46` calls `storage.save({ key: 'tasks', id: '1', data:
  value, expires: 1000 * 60 })` — a hard-coded **1-minute** expiry,
  overriding `Storage.js`'s 24-hour `defaultExpires`. Any task added takes
  effect for at most 60 seconds before `react-native-storage` will treat it
  as expired on the next `load()`.
- A related, previously-undocumented observation from the console log: the
  success-path log line in `Context.js` (`console.log('Tasks loaded:',
  JSON.stringify(ret))`) **never printed once, in either app load**, and
  neither did the `NotFoundError`/`ExpiredError`/`console.warn` branches in
  its `.catch`. The only related log line seen was `in storage.sync.tasks`
  (from the monkey-patched `storage.sync` in `Task.js`) printing once per
  load. This suggests the `storage.load()` promise may never actually
  settle through either the `.then` or `.catch` path once the module-level
  `sync.tasks` monkey-patch is installed and the "no data yet" fallback
  fires — i.e. task loading may be silently hanging rather than cleanly
  resolving to `[]`. Net observable effect is the same (tasks always empty
  on a fresh/expired load), but the mechanism is worth flagging for the
  Phase 2 storage rewrite: the load path may not be completing at all, not
  merely completing with empty data.

---

## 6. Edge interactions attempted

- **Rotate simulator**: used Simulator's `Device > Rotate Right` menu (a
  native macOS menu action, safe to drive while frontmost). The app's layout
  did **not** visibly change to landscape (`11-rotated-landscape.png` still
  shows a full portrait frame). The project's native `ios/ClockLive/
  Info.plist` does list all orientations as supported, but that plist isn't
  used when running inside Expo Go, and `app.json` sets no `orientation` key.
  Likely Expo Go defaults to (or the app effectively behaves as) portrait-
  locked in this configuration. Not confirmed as a hard lock, just an
  observed no-op.
- **Rapid drawer taps / cancel**: drawer open → Task → drawer open → Home →
  etc. was exercised many times over the course of calibrating automation
  (see §7) with no crashes, no stuck states, no duplicate screens.
- **Empty-form save**: not reachable — Add Task could not be triggered (see
  §4). From source, `addTask()` in `Task.js` has no guard against an empty
  `task` name; it would push a task with `count`, empty `startTime`==`endTime`
  strings equal to "now", and `color` defaulting to `#6874e7` if never
  changed. Not verified live.

---

## 7. Note on automation method (for whoever re-runs this)

Two different click mechanisms were used across this session:
1. **Accessibility-tree presses** (`element_index` + `AXPress`) — reliable
   for the drawer (Home/Task/About/hamburger) and for native Simulator/macOS
   menu items. Zero failures once the correct, freshly-snapshotted index was
   used.
2. **Coordinate clicks** (`x`,`y` in the `get_window_state` screenshot's
   pixel space) — reliable for focusing text inputs (confirmed via visible
   cursor and, once, precise mid-string cursor placement), **unreliable for
   RN `Button`/`Pressable` press handlers** even when coordinate accuracy was
   independently verified with a debug crosshair.

A second, unrelated simulator device ("iPhone 17 Pro") repeatedly reappeared
booted with unrelated third-party apps installed throughout the session, and
the frontmost macOS process would periodically revert to a process named
"switchboard" (this session's remote/virtual-desktop host layer) between
actions. Both added noise/uncertainty to timing-sensitive automation and are
called out here in case they recur for a future run.

---

## 8. Behaviors & Bugs observed

1. **All tasks are deleted ~1 minute after saving** (matches
   PROJECT_REVIEW_2026-07-10 §3, bug 1). Confirmed by source
   (`Task.js:46`, `expires: 1000 * 60`), not by live repro (Add Task could
   not be triggered by automation this session — see §4/§8 "Not testable").
   Expected: tasks persist per `defaultExpires` (24h) or indefinitely.
   Actual (per code): hard-coded 1-minute expiry on every save. Severity:
   critical (data loss), already tracked for the Phase 2 storage rewrite.
2. **Storage load path may hang rather than resolve** (new observation, not
   in PROJECT_REVIEW). Expected: `Context.js`'s `getData()` should log either
   `"Tasks loaded: …"` or one of the `NotFoundError`/`ExpiredError` warn
   branches on every app start. Actual: neither ever printed across two full
   app loads in this session; only the unrelated `storage.sync.tasks` stub
   log appeared. Repro: fresh app load with no prior stored data (default
   state for this app on this device) plus the `Task.js` `storage.sync`
   monkey-patch already installed; watch Metro logs. Severity: low/medium —
   no visible functional difference today (tasks default to `[]` either way)
   but worth the Phase 2 team confirming the promise actually settles once
   real persistence exists, so a genuinely-saved task is guaranteed to load.
3. **`Button`/`Pressable` press handlers on the Task screen could not be
   triggered by any automated input method tried** (Pick Color, Add Task,
   Clear, both time pickers). This blocked live verification of: color
   selection, task creation/persistence-to-list, multi-task clock-arc
   rendering, midnight-crossing tasks, zero-length tasks, and the
   complete-task flow. Classified as an **automation/tooling limitation**,
   not an app defect — see §4 for the crosshair-verified evidence that
   coordinates were correct. Flagging because it materially limited this
   session's coverage; a human tester with a real trackpad/finger would very
   likely not hit this at all.
4. **Simulator `Device > Rotate Right` had no visible effect** on the app's
   layout (still full portrait after rotating). Not confirmed as an app bug
   (Expo Go / no `orientation` key in `app.json` most likely explanation);
   flagged as an observation only.
5. Minor, confirmed by direct source reading during this session (already
   listed in PROJECT_REVIEW_2026-07-10 §3, not re-verified live here since
   they require a working Add Task): completing a task is never persisted
   (`handleCompleteTask` in `Clock.js`/`Task.js` never calls `storeData`);
   render-time mutation of shared task objects in `Clock.js`; locale-
   dependent `"H:MM AM"` time-string parsing duplicated four times; tasks
   cannot span midnight; web time pickers render nothing. No new evidence
   contradicting or confirming these beyond what's already in
   PROJECT_REVIEW_2026-07-10 — listed here only for completeness/cross-
   reference.

---

## 9. Console warnings/errors captured (verbatim highlights)

From `qa/2026-07-18/metro.log`:

```
Warning: Root-level "expo" object found. Ignoring extra key in Expo config: "name"
The following packages should be updated for best compatibility with the installed expo version:
  @expo/metro-runtime@3.2.1 - expected version: ~3.2.3
  @react-native-community/datetimepicker@8.1.1 - expected version: 8.0.1
  @react-native-picker/picker@2.7.7 - expected version: 2.7.5
  expo@51.0.11 - expected version: ~51.0.39
  react-native@0.74.2 - expected version: 0.74.5
  react-native-safe-area-context@4.10.1 - expected version: 4.10.5
  react-native-svg@15.3.0 - expected version: 15.2.0
(node:22293) [DEP0044] DeprecationWarning: The `util.isArray` API is deprecated. Please use `Array.isArray()` instead.
```

No red-screen JS errors, no uncaught exceptions, and no crashes were observed
at any point in the session (initial load, drawer navigation ×many, text
entry, relaunch).

---

## 10. Not testable (and why)

- **Pick Color modal, Add Task save, Clear, both time pickers** — button
  presses could not be triggered by any automated input method available in
  this session (accessibility tree offers no addressable children for these
  controls; coordinate clicks are pixel-accurate per crosshair verification
  but do not fire the RN press handler). See §4/§7 for full detail.
- **Multi-task clock rendering** (overlapping tasks, midnight-crossing task,
  task >1 hr, zero-length task, past task) — depends on Add Task working;
  not exercised live, only reasoned about from `Clock.js` source.
- **Task detail modal / complete-task flow** — depends on a task existing in
  the list to tap; not reached.
- **Real persistence-survives-relaunch test with actual saved data** — since
  no task could be saved, relaunch was only verified for app stability, not
  for whether a *real* task would still be present after 1 minute / 2+
  minutes. The 1-minute-expiry bug is instead confirmed by source (§8, item
  1).
- **Web time-picker rendering-nothing bug** (PROJECT_REVIEW §3 bug 6) — out
  of scope, this session was iOS-only.

---

## 11. Android

Not run — no Android SDK/emulator on this machine.

---

## Screenshot index

| File | Shows |
|---|---|
| `01-launch.png` | "Open in Expo Go?" system dialog |
| `02-home-clock.png` / `02b-home-full.png` | Home screen, clock face, Add A Task button |
| `03-drawer-open.png` | Drawer: Home / Task / About |
| `04-task-screen-empty.png` | Task screen, fields empty, defaults 10:15 PM |
| `05-about-screen.png` | About screen full text |
| `06-task-screen.png` | Task screen (duplicate view before typing) |
| `07-task-name-typed.png` | "Morning Standup" typed into Task Name |
| `08-task-form-filled.png` | Both fields filled (Name + Description) |
| `09-start-time-picker.png` | Attempted Start Time tap (picker did not open) |
| `10-relaunch-1.png` | Home screen after kill + relaunch |
| `11-rotated-landscape.png` | After Device > Rotate Right (still portrait) |
| `12-click-crosshair-evidence.png` | Crosshair proving click-coordinate accuracy on Pick Color button |
| `metro.log` | Full Metro/console output for the session |
