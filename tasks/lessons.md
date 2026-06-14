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
