# Pomodoro Sketch UI Plan

## Requirements

- Build a single-page Pomodoro web app with no login and client-only logic.
- Persist timer settings, tasks, completed focus count, and total focus minutes in localStorage.
- Match the provided Figma and prompt style: hand-drawn illustrative sketch, charcoal-black textured borders/icons/text, brand-yellow background, off-white cards.
- Use the Figma cat assets for cover, focus, almost, times up, done, break, ignored, walking, walking pose, and food tray where available.
- Animate the small cat along the progress line as the timer counts down.
- Change the main character, speech bubble, timer button, tabs, task completion, and stats based on app state.

## Implementation Plan

- [x] Attempt Figma asset export and document fallback.
  - Figma MCP returned core screenshot URLs, but asset download failed after network timeout and additional MCP exports hit the Starter-plan limit. The app uses CSS-drawn sketch fallbacks for now.
- [x] Create the static app shell in `index.html`.
- [x] Implement the sketch visual system and responsive two-column layout in `styles.css`.
- [x] Implement Pomodoro state, timer behavior, localStorage persistence, task controls, cat state transitions, and idle behavior in `app.js`.
- [x] Verify the app in-browser at desktop and mobile widths.
- [x] Document the verification result here.

## Acceptance Checks

- [x] Header is full-width black with title and sketch gear icon.
- [x] Main off-white card has double sketchy charcoal border and two-column layout.
- [x] Focus tab starts active, other tabs switch durations and break cat state.
- [x] START changes to STOP while running.
- [x] Cat moves from left to right as time elapses.
- [x] At 10% remaining, character and speech switch to the almost state.
- [x] At timer completion, character and speech switch to times-up, then done.
- [x] Tasks can be added and checked, and persist after reload.
- [x] Completed focus and total focus stats update after focus sessions.
- [x] Layout remains usable on mobile.

## Review

- Built a static client-only app in `index.html`, `styles.css`, and `app.js`.
- Verified in the in-app browser on `http://localhost:4173`.
- Verified start/stop, task add/edit persistence after reload, mode switching, timer completion, times-up to done transition, and responsive layout at 1280px and 390px.
- Final production focus duration was restored to 25 minutes after using a temporary two-second duration to verify completion without waiting.
- Figma MCP hit a Starter-plan limit and asset download timed out, so the delivered UI uses local CSS-drawn sketch cat/food fallbacks instead of the exact exported Figma art assets.
- User added the PNG assets to `assets/`, and the app now loads `cover.png`, `focus.png`, `break.png`, `walking.png`, `walking-pose-1.png`, and `food-tray.png` in-browser. Other state files are wired through CSS state classes.

## Settings Popup Update

### Requirements

- Fix the broken-looking settings gear in the header.
- Add a settings popup opened from the gear button and closed via X, backdrop, or Escape.
- Include timer, task, sound, and theme settings inspired by the provided references.
- Wire practical settings into the implementation: timer durations, auto-start behavior, long break interval, auto-check tasks, check-to-bottom, sound repeat/volume placeholders, theme color, and dark mode while running.
- Persist settings in localStorage.

### Implementation Plan

- [x] Add settings dialog markup to `index.html`.
- [x] Style the modal, desktop section rail, mobile stacked layout, toggles, inputs, sliders, selects, and swatches in `styles.css`.
- [x] Refactor timer durations to come from persisted settings in `app.js`.
- [x] Wire settings controls, modal open/close, auto-start behavior, task automation, theme color, and dark-running state.
- [x] Verify gear appearance, modal open/close, settings persistence, and timer duration updates in-browser.

### Acceptance Checks

- [x] Gear icon looks clean at header size.
- [x] Clicking gear opens the settings popup.
- [x] X, backdrop, and Escape close the popup.
- [x] Editing Pomodoro/Short Break/Long Break minutes updates the timer after switching/resetting mode.
- [x] Settings persist after reload.
- [x] Popup is usable on desktop and mobile widths.

### Review

- Replaced the header gear with a cleaner stroke-only sketch icon.
- Added a settings dialog with desktop left rail, mobile top rail, timer/task/sound/theme sections, toggles, selects, sliders, and theme swatches.
- Settings now persist in localStorage and drive timer durations, auto-start choices, long-break interval, auto-check task behavior, check-to-bottom behavior, theme color, and dark-while-running class.
- Verified in-browser on `http://localhost:4173/`: no console errors, modal opens from the gear, closes via X/backdrop/Escape, Pomodoro minutes update timer immediately, duration persists after reload, desktop modal is two columns at 1280px, mobile modal is single column at 390px, and yellow theme was restored after testing swatches.

## Timer Settings Bug Fix

### Requirement

- Changing the currently selected timer duration in settings must immediately update the visible idle timer.

### Plan

- [x] Fix `updateSettingsFromForm` so idle duration edits reset the current mode display directly.
- [x] Verify Pomodoro can change to 1 minute from the settings modal and persists after reload.
- [x] Record the user-correction lesson in `tasks/lessons.md`.

### Review

- Root cause: `updateSettingsFromForm` only reset the timer when the old remaining time exactly equaled the old full duration. If the timer had prior state, the setting could save while the visible timer stayed stale.
- Fix: when the timer is idle, any settings duration change now resets the selected mode display to the new configured duration.
- Verified visible app state after cache-busted reload: Focus timer shows `01:00`, no console errors.

## Figma Layout Alignment Update

### Requirement

- Adjust the current UI to better match the provided Figma screenshot without using Figma MCP.

### Plan

- [x] Change the header from black sketch bar to compact white bar with black bottom stroke.
- [x] Reshape the main canvas into separate left timer card and right stacked cards on the yellow background.
- [x] Move the speech bubble into the right character card and reduce timer/control scale.
- [x] Tune card widths, spacing, borders, task rows, mascot progress, and stats to the expected proportions.
- [x] Verify desktop and mobile layout in-browser.

### Review

- Updated the header to a compact white strip with black bottom stroke and smaller brand treatment.
- Removed the single oversized wrapper card; the layout now uses a transparent grid with a bordered left timer card and a separate right column, matching the Figma proportions.
- Tuned desktop geometry to `730px + 360px` columns, `1110px` total width, centered at 1280px viewport.
- Moved the speech bubble into the character card, reduced timer/button/control scale, and tightened task/stat card styling.
- Verified in-browser at 1280px and 390px: no horizontal overflow and no console errors.

## Chatty Speech Bubble Adjustment

### Requirement

- Restore the previous chatty speech bubble treatment while keeping the newer Figma-style page layout.

### Plan

- [x] Add a top-left speech tail back to the bubble.
- [x] Restore rounded sketchy yellow bubble styling and stronger shadow.
- [x] Verify the right character card remains stable in desktop layout.

### Review

- Updated `.speech-bubble` with rounded corners, hand font, taller padding, sketch shadow, and a top-left tail.
- Verified in-browser at 1280px: bubble sits inside the character card, no console errors, no horizontal overflow.

## Settings Scrollbar And Search Fix

### Requirement

- Fix the buggy settings scrollbar behavior.
- Make the settings search useful or remove it.

### Plan

- [x] Move settings scrolling from the whole content shell to the form body below the sticky header.
- [x] Convert the fake Search block into a real search input.
- [x] Filter settings sections and rail links based on the search query.
- [x] Verify modal open, internal scroll, search filter, clear search, and no console errors.

### Review

- Settings dialog now keeps the header fixed in the dialog while only `#settingsForm` scrolls, so the scrollbar no longer runs through the title/close area.
- Search is now a real input. Typing `sound` filters the modal down to the Sound section and Sound rail link; clearing restores all sections.
- Search remains visible on mobile, spanning the rail width.
- Verified at 1280px and 390px: internal form scroll, no horizontal overflow, and no console errors.

## Settings Rail Navigation Fix

### Requirement

- Clicking settings rail links such as Theme must not change the page URL or break the modal position.

### Plan

- [x] Prevent default anchor navigation for settings rail links.
- [x] Scroll the internal settings form to the target section instead of scrolling the document.
- [x] Verify clicking Theme keeps the URL stable and the modal contained.

### Review

- Rail links now call `preventDefault()` and scroll `#settingsForm` internally to the target section.
- Active rail links get an `is-active` state after selection.
- Verified Theme click at 1280px and 390px: URL does not change to `#themeSettings`, page scroll stays `0`, modal remains contained, internal form scrolls to Theme, and no console errors.

## Settings Close Button Placement Fix

### Requirement

- The settings close `x` must sit inside the popup header, not outside the modal.

### Plan

- [x] Make the settings header the positioning context for the close button.
- [x] Verify close button bounds are inside the dialog at desktop and mobile widths.

### Review

- Added `position: relative` to `.settings-header` so `.settings-close` anchors inside the header.
- Vertically centered the close button with `top: 50%` and `transform: translateY(-50%)`.
- Verified bounds at 1280px and 390px: close button is inside both the dialog and the header, with no console errors.

## Audio Settings Integration

### Requirement

- Use the audio files from `assets/audio/` as the selectable sound options.
- When the timer reaches `00:00`, play the selected alarm audio 3 times with a 1 second pause between plays.

### Plan

- [x] Populate Alarm Sound and Focus Sound dropdowns from the local audio file list.
- [x] Store selected audio paths in settings.
- [x] Add alarm playback sequence on timer completion.
- [x] Verify dropdown options render and the app has no console errors.

### Review

- Added local audio options for `cat-1.wav`, `cat-2.ogg`, `digital.flac`, and `door-chime.wav`, plus `None`.
- Alarm Sound and Focus Sound dropdowns are populated from the same local audio registry.
- Old saved sound values are normalized to a valid local option.
- Timer completion now calls `playAlarmSequence()`, which plays the selected alarm 3 times with a 1 second pause between plays.
- Repeat is fixed at `3` and disabled in the UI to match the requested behavior.
- Verified the dropdown options in-browser, checked audio file types locally, and ran `node --check app.js`.

## Audio Preview Buttons

### Requirement

- Add a test audio control beside the sound options in settings.

### Plan

- [x] Add test buttons beside Alarm Sound and Focus Sound selects.
- [x] Style the select-plus-button row so it fits desktop and mobile settings layouts.
- [x] Wire preview buttons to play the currently selected audio once at the configured volume.
- [x] Verify the buttons render and no console errors occur.

### Review

- Added `Test` buttons next to Alarm Sound and Focus Sound.
- Preview uses the current selected sound and its corresponding volume slider.
- `None` safely does nothing.
- Button temporarily changes to `Playing` and disables during playback, then returns to `Test`.
- Verified the settings UI renders the buttons and clicking Alarm Test produces no console errors.

## Activity Summary View

### Requirement

- Implement Activity Summary as a view that replaces the current timer screen.
- Add a back icon at the top-left of the summary to return to timer mode.
- Keep the Activity Summary compact enough to avoid page scrolling on desktop.

### Plan

- [x] Add Activity Summary markup inside the main app area.
- [x] Track focus session completions in localStorage for chart data.
- [x] Render summary metrics: hours focused, days accessed, day streak.
- [x] Render a focus-hours bar chart with Week, Month, and Year ranges.
- [x] Wire See Activity Summary, Back, range tabs, and previous/next controls.
- [x] Verify view switching, chart rendering, persistence-compatible state, and mobile layout.
- [x] Compact desktop Activity Summary spacing so it fits without page scroll.

### Review

- Added a replacement Activity Summary view opened from `See Activity Summary`.
- Added a top-left back button that restores the timer and right info column.
- Focus completions now save dated session entries in localStorage for chart data, while older saved total-focus data still appears as a legacy current-day entry.
- Summary renders hours focused, days accessed, day streak, and a focus-hours bar chart for Week, Month, and Year ranges.
- Verified in-browser: summary open/back flow, Week/Month/Year bars, previous/next controls without URL changes, desktop 1280px layout, mobile 390px layout, no horizontal overflow, and no console errors.
- Compacted the desktop summary: tighter page padding while open, smaller metric cards, and shorter chart. Verified at 1280x720 that the Activity Summary does not require vertical page scroll.
- Removed the placeholder Edit Goals button from Activity Summary until goals are implemented.

## Settings Unsupported Controls Cleanup

### Requirement

- Remove Focus Sound, Focus Volume, Dark Mode when running, and Small Window from settings until those features are implemented.

### Plan

- [x] Remove unsupported controls from the settings markup.
- [x] Remove matching JavaScript bindings and settings update/render logic.
- [x] Verify settings opens, Sound/Theme search still works, and no console errors appear.

### Review

- Removed Focus Sound, Focus Volume, Dark Mode when running, and Small Window from the settings UI.
- Removed their JavaScript element bindings, render/update logic, and unused running-dark styling.
- Normalized saved settings to active fields only, so old localStorage values for removed controls do not keep getting persisted.
- Verified in-browser: settings opens, removed controls are absent, Sound keeps Alarm Sound/Alarm Volume/Repeat, Theme keeps Color Themes/Hour Format, search works, and no console errors appear.

## Sticky Header Navigation Update

### Requirement

- Make the top navbar sticky.
- Use Bricolage Grotesque with bold `Pomodoro` and regular `by NousVault`.
- Replace the single settings icon with labeled nav actions: Home, Summary, and Settings.

### Plan

- [x] Update header markup with brand typography and Home/Summary/Settings buttons.
- [x] Style sticky navbar, Bricolage font, icons, labels, and responsive wrapping.
- [x] Wire Home to timer view, Summary to Activity Summary, and Settings to the modal.
- [x] Verify desktop/mobile navbar behavior and console output.

### Review

- Made the header sticky at the top with a compact white bar and black sketch stroke.
- Added Bricolage Grotesque from Google Fonts, using weight 700 for `Pomodoro` and weight 400 for `by NousVault`.
- Replaced the old icon-only settings button with labeled nav actions: Home, Summary, and Settings.
- Wired Home to return to the timer view, Summary to open Activity Summary, and Settings to open the existing settings modal.
- Verified at 1280x720 and 390x820: sticky top remains fixed after scroll, no horizontal overflow, nav wraps cleanly on mobile, font weights apply, nav actions work, and no console errors appear.
