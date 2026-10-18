# Design QA: Template settings drawer

## Evidence

- Source visual truth:
  - `C:\Users\ADMINI~1\AppData\Local\Temp\codex-clipboard-0d21dd3a-5c8d-4466-aa1a-6fa7ffa8a971.png` (390 x 1306 px)
  - `C:\Users\ADMINI~1\AppData\Local\Temp\codex-clipboard-1c087387-a09d-4207-9e89-d48ccaa56ebf.png` (372 x 1266 px)
- Implementation screenshot: Codex in-app Browser tab 1 inline capture; the browser surface does
  not expose a filesystem path for its screenshot.
- Desktop viewport: 1451 x 1272 CSS px at device pixel ratio 1.
- Mobile viewport: 390 x 844 CSS px at device pixel ratio 1.
- State: authenticated dashboard with the template settings drawer open; Theme and Layout tabs
  checked in light and dark modes.
- Full-view comparison: the drawer preserves the reference hierarchy (compact title bar, two-part
  navigation, grouped controls, dividers, and live preview) while using the project's Ant Design
  tokens and component language.
- Focused-region comparison: the drawer header, mode segmented control, color swatches, layout
  choices, reset control, and collapsed-sidebar switch were inspected at desktop and mobile widths.

## Required fidelity surfaces

- Fonts and typography: uses the existing Inter/system stack, Ant Design heading weights, 14 px body
  copy, and 13 px supporting copy. Labels remain readable without truncation at 390 px.
- Spacing and layout rhythm: 20 px drawer padding, 24 px section rhythm, 12 px option gaps, and 8-10
  px radii align with the existing design system. The drawer fills the 390 px mobile viewport.
- Colors and visual tokens: surfaces, borders, muted text, selection states, and focus styling use the
  live Ant Design theme tokens. Both light and dark modes retain readable contrast.
- Image quality and asset fidelity: no raster imagery is required. All visible icons use
  `@ant-design/icons`; no placeholder or handcrafted SVG assets are present.
- Copy and content: labels are concise, describe the actual behavior, and communicate immediate
  local persistence.

## Findings

No actionable P0, P1, or P2 visual differences remain. The reference uses pill-style top tabs while
the implementation intentionally uses Ant Design's native line tabs to remain consistent with this
project's component language.

## Comparison history

1. First pass: P1 - selecting Top layout removed primary navigation because a custom
   `headerContentRender` replaced ProLayout's horizontal menu.
2. Fix: the custom global search now renders only for Side and Mixed layouts; Top layout delegates
   header content to ProLayout.
3. Post-fix evidence: the browser displayed Dashboard, User Management, Profile, Security, and
   Settings in the top navigation. Side, Mixed, and Top choices all remained selectable.

## Interaction and responsive checks

- Open and close drawer from the header settings button.
- Switch light/dark mode and confirm the full application surface updates.
- Apply layout changes for Side, Mixed, and Top.
- Confirm Top layout keeps all five primary navigation links.
- Confirm sidebar collapse is disabled when Top layout is selected.
- Reset appearance and confirm Mixed, light, blue, expanded-sidebar defaults.
- Reload and confirm the saved layout remains selected.
- Confirm the drawer width is exactly 390 px on a 390 px viewport.
- Console check: no feature-specific errors. One existing Ant Design 5 / React 19 compatibility
  warning remains outside this change.

## Follow-up polish

- P3: a future iteration could add a System theme option to this compact drawer; System mode remains
  available on the full Settings page.

final result: passed
