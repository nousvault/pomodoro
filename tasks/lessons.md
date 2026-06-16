# Lessons

## Settings Changes Must Update the Visible Current State

- When a user edits timer settings, verify the exact visible workflow they will use: open settings, change the current mode duration, and confirm the timer display updates immediately before closing.
- Do not rely on a clean-state equality check for settings changes. If the timer is idle, changing the selected mode duration should reset the visible remaining time to the new full duration.
- For persisted UI settings, verify both immediate effect and reload persistence.

## Visual Matching Requires Layout Geometry, Not Only Style Tokens

- When the user provides current vs expected screenshots, compare major geometry first: header height/style, card count, card boundaries, column widths, canvas margins, and which elements are grouped together.
- When a user asks one control to match another, check for later CSS overrides that cancel shared base styles like shadows or borders.
- Do not preserve an earlier wrapper/card structure if the expected design clearly separates panels.
- Verify visual corrections with browser measurements and screenshots at the expected desktop width, then check mobile overflow.

## Preserve Preferred Microinteractions When Re-aligning Layout

- If the user says they liked a previous element, restore that specific interaction or shape without undoing unrelated layout improvements.
- For speech bubbles, the tail and shadow can be more important to the perceived feel than strict rectangular alignment.

## Decorative Controls Need Either Behavior Or Removal

- If a UI includes a search field, dropdown, toggle, or button, verify it has useful behavior before calling the work done.
- Placeholder actions in new views should be removed unless the requested flow needs them now.
- When a setting is not implemented yet, remove both the visible control and the backing settings persistence/render code.
- For modal scrolling, keep fixed headers outside the scroll container and make the content body the only scrolling region.
- Links inside modals should usually prevent default hash navigation and scroll the modal's internal content container instead of the document.
- Absolutely positioned modal controls need an explicit positioned parent, and their bounds should be checked against the dialog/header at desktop and mobile widths.

## Desktop Views Must Fit Height, Not Just Width

- For replacement screens like Activity Summary, verify desktop viewport height explicitly, especially at 1280x720.
- Avoid placing action buttons outside cards when the user expects a no-scroll desktop view; outside shadows and negative offsets can create accidental vertical overflow.
- Compact chart views by reducing shell padding, card padding, metric height, and plot height together so the layout still feels intentional.

## Metric Icons Should Be Real SVGs

- When a summary card communicates a concept like time, dates, or streaks, use a real SVG icon instead of a text placeholder.
- Keep those SVGs sized through CSS so the cards can stay visually balanced while the icon set changes.

## Empty Metrics Should Read As Numbers

- For count-style summary fields, prefer `0` over `--` when there is no data yet.
- Reserve dash placeholders for values that are truly unknown or not applicable, not for empty-but-valid metrics.

## Reset Controls Should Clear The Whole Visible Story

- If you add a summary reset button, make sure it clears the saved summary history, the visible summary totals, and the related dashboard counters together.
- Keep reset actions scoped to the feature they advertise; do not let a summary reset touch timer settings, tasks, or other unrelated state.

## Active Nav State Needs A Single Source Of Truth

- When a sticky nav shows the current page, derive the active indicator from explicit view state, not just from clicks.
- Modal pages like Settings should restore the underlying page highlight when they close.

## Shared Border Styles Can Leak Rounded Corners

- If a panel inherits a shared sketch class, verify whether its border-radius matches the target screen before assuming the base style is fine.
- For summary or dashboard wrappers that should feel boxy and technical, override the inherited rounding directly on the wrapper, not only on nested cards.

## Destructive Summary Actions Need An Explicit Confirm Step

- If a button clears stored summary data, open a confirmation dialog before mutating state.
- Support cancel, backdrop, and Escape so the user can back out without risking a destructive click.

## Nav Underlines Need An Immediate Repaint On View Switch

- If the active page indicator is derived from explicit view state, call the nav renderer as part of the view-switch handler so the underline updates at click time, not only on the next unrelated render.

## Brand Text In The Header Can Be A Real Link

- If the navbar includes a brand name or handle, make the exact linked portion an anchor so the whole header stays visually stable while still giving the user a usable outbound link.

## Floating Summary Actions Tend To Misalign

- When a summary action needs to sit with the page content, prefer putting it in the header grid or flex flow instead of absolutely positioning it against the wrapper.
- Absolute positioning is fine for icons that belong in a corner, but not for controls that need to visually line up with the content grid below them.

## Compact Popups Should Share The Existing Sketch System

- When adding a new modal like a music player, reuse the same borders, shadows, typography, and yellow/cream palette so the popup feels native to the page.
- For playlist-style popups, make the queue rows the primary affordance and keep decorative art secondary so the control surface stays usable.

## Controls Should Live On The View They Control

- If a button opens a feature that belongs to the home timer experience, keep that trigger on the home view instead of moving it into a secondary summary screen.
- When a control moves between views, also update its focus return target so closing the popup feels anchored to the right place.

## Media Source Swaps Need A Fresh Playback Model

- When replacing a local audio queue with an external playlist source, recheck the player architecture instead of only swapping URLs.
- Keep the sketch wrapper and queue visuals, but make sure the playback controls still map to the new provider's API or embed behavior.

## Simpler Playback UIs Usually Need Less Chrome

- If the user wants the popup simplified, remove queue and volume affordances rather than hiding them behind the same visual footprint.
- A static cover image often reads more clearly than a spinning decorative disc when the player is already doing the heavy lifting.

## Compact Media Popups Should Drop Whole Columns

- When the user asks for a smaller MP4-style popup, shrink the dialog and remove the extra side panel instead of just trimming padding.
- Keep the player readable by preserving a single clear visual stack: title, embed, controls.

## Compact Players Should Not Repeat Their Own Title Bar

- If the player card already has a clear `Now Playing` heading, remove the extra popup-level section title instead of stacking both.
- Put the close button inside the player card when the modal is meant to feel like one compact object.

## Invisible Dialog Wrappers Beat Double Framing

- If a modal already contains a fully framed inner card, remove the outer dialog border instead of trying to visually merge two boxes.
- Keep the dialog element for semantics and overlay behavior, but let the inner panel be the only visible frame.

## Control Icons Should Match Their Action Labels

- If a button changes from close to minimize behavior, update both the visible symbol and the `aria-label` together.
- Small UI copy mismatches are easy to miss, so check icon semantics whenever the user reframes the action.

## Background Features Need A Trigger-State Cue

- If music or another background process keeps running after the popup closes, show a visible live indicator on the launch button so the user is not guessing.
- Keep the cue lightweight, but pair it with an accessibility label update so the state is clear both visually and semantically.

## Small Window Controls Need Proportional Glyphs

- For tiny square controls like minimize buttons, the glyph may need a longer symbol or slightly larger sizing to read clearly at a glance.
- When the user says an icon feels too small, check the symbol choice before adding more visual noise around it.

## Live Badges Need To Survive Busy Layouts

- If a background-state dot sits inside a dense button, it can disappear visually even when the logic is correct.
- For status cues like playing indicators, prefer a corner badge with enough size and contrast to remain visible at a glance.

## Visible Status Cues Should Be Real Elements, Not Just Clever CSS

- If a user cannot spot a status cue in a screenshot, treat that as a design failure even when the state logic is correct.
- For tiny live indicators, prefer a real DOM element inside the control over a pseudo-element that can visually disappear at the edge of a button.

## Headers Should Reserve Their Own Space When Pinned

- If a sticky navbar exposes page background during upward scroll or bounce, promote it to a truly fixed header and reserve its measured height in layout.
- Prefer deriving that reserved space from the real rendered header height instead of hardcoding separate desktop and mobile guesses.

## Data Charts Need Hover Feedback To Feel Legible

- If a bar chart encodes values visually, add a hover or focus affordance that exposes the exact value instead of making the user estimate from height alone.
- A light guide line plus a compact tooltip usually explains the current column without overwhelming the sketch-style layout.

## Chart Helper Direction Needs To Match The User's Mental Model

- When a user asks for a line helper on a column chart, confirm whether they mean a vertical column guide or a horizontal value guide before polishing the styling.
- If the request says "on column," bias toward a vertical guide anchored to that bar rather than a full-width horizontal ruler.

## Overlay Positioning Should Use Measured Rectangles

- For chart helpers, tooltips, and floating guides, prefer `getBoundingClientRect()` against the actual target and overlay container instead of mixing `offsetLeft` values from different ancestors.
- If a hover affordance drifts by whole columns, suspect double-counted offsets before tweaking CSS spacing.
