# Pet Portal Design QA

## Comparison targets

- Source visual truth:
  - `design/dashboard.png` — 2720 × 1410 px
  - `design/login.png` — 2720 × 1060 px
  - Supporting specifications: `design/adminpro-design-docs/`
- Browser-rendered implementation:
  - `output/design-qa/dashboard-implementation.png` — normalized to 1425 × 704 px
  - `output/design-qa/login-implementation.png` — normalized to 1440 × 520 px
- Full-view comparison evidence:
  - `output/design-qa/dashboard-comparison.png`
  - `output/design-qa/login-comparison.png`
- Routes and states:
  - `/dashboard` — authenticated workbench shell with deterministic preview data used only for the capture; no preview bypass remains in production source.
  - `/login` — unauthenticated login state.

## Viewport and normalization

| Screen | Browser CSS viewport | Source pixels | Implementation pixels | Normalization |
| --- | --- | --- | --- | --- |
| Dashboard | 1440 × 760, DPR 1 | 2720 × 1410 | 1425 × 704 content crop | Browser chrome removed; source and implementation scaled to the same comparison height. |
| Login | 1440 × 600, DPR 1 | 2720 × 1060 | 1440 × 520 content crop | Browser chrome removed; source and implementation scaled to the same comparison height. |

The comparison images place the source on the left and the latest browser capture on the right. Focused-region captures were not required: the sidebar, header actions, KPI typography, chart/todo cards, login branding, form controls, and footer copy remain readable in the normalized full-view comparisons.

## Findings

No actionable P0, P1, or P2 differences remain in the verified dashboard and login states.

- [P3] Dashboard amount metric is represented as inquiry count.
  - Location: dashboard fourth KPI.
  - Evidence: the design shows a monthly inquiry amount; the current quote API does not expose amount or unit-price data.
  - Decision: retain the truthful `Inquiries This Month` count instead of fabricating revenue.
- [P3] Dashboard comparison series and one supplier-certificate task are absent.
  - Location: inquiry trend chart and to-do list.
  - Evidence: the current API exposes one 30-day series and no supplier-certificate-expiry endpoint.
  - Decision: render only real, supported data. Add the extra series/task when the API contract exists.
- [P3] Source screenshots use Chinese labels while the application default locale is English.
  - Impact: copy length differs slightly, but hierarchy, density, and information architecture remain aligned.

## Required fidelity surfaces

- Fonts and typography: Ant Design's system stack, weights, hierarchy, line heights, truncation, and compact UI sizing align with the reference. The custom wordmark applies the mint accent only to `pallets`.
- Spacing and layout rhythm: full-height sidebar, right-side top bar, card grid, chart/todo proportions, split-login composition, radii, and elevation align after the fixes below.
- Colors and visual tokens: mint teal primary, warm neutral surfaces, gray text hierarchy, and restrained borders/shadows match the supplied brand direction.
- Image quality and asset fidelity: the supplied logo/mascot asset is used directly at native proportions; no placeholder or CSS-drawn substitute is present.
- Copy and content: the visible navigation is reduced to the seven core destinations from the design. Login no longer advertises public registration and retains the authorized-personnel audit notice.

## Comparison history

### Iteration 1 — blocked by P2 differences

- Sidebar exposed secondary routes and long labels that crowded or truncated the intended core information architecture.
- Header contained an extra template-settings action not present in the design.
- Default sidebar branding did not reproduce the dark/mint Petpallets wordmark treatment.
- Version footer was visible although absent from the reference.
- Login exposed a public registration prompt, and the brand/form blocks were vertically misaligned.

### Fixes applied

- Kept the seven primary sidebar destinations and retained secondary routes as direct-link pages.
- Renamed primary navigation to concise English labels that fit the 216 px sidebar.
- Removed the template-settings header action and sidebar version footer.
- Added a custom logo/wordmark header with the brand mint accent.
- Removed public registration promotion from login, moved brand copy upward, and adjusted the desktop form position.

### Iteration 2 — passed

- Post-fix evidence: `output/design-qa/dashboard-comparison.png` and `output/design-qa/login-comparison.png`.
- The final visual pass found no remaining P0/P1/P2 differences on the verified screens.

## Interaction and console checks

- Verified direct navigation to login and the authenticated dashboard shell during visual capture.
- Inspected login controls: email/password fields, remember-me checkbox, password visibility control, forgot-password link, and submit button.
- Confirmed sidebar/header layout remains visible and usable at the captured desktop viewport.
- No application exception was observed on the two target screens. Full live CRUD verification is not included because `pet-api` was unavailable locally.
- Expected offline API failures and existing Ant Design deprecation warnings were observed only while probing data-driven product views; they do not affect the two captured target states.

## Implementation checklist

- [x] Align sidebar information architecture and brand header.
- [x] Restrict the top navigation bar to the right content region.
- [x] Align dashboard shell, KPI hierarchy, chart, and to-do composition.
- [x] Align login split layout, branding, form position, and access copy.
- [x] Run TypeScript/build, ESLint, and Prettier checks.
- [ ] Re-run live product, inquiry, and media workflows once `pet-api` is available.

## Follow-up polish

- Add inquiry amount and prior-period trend only after the backend exposes those fields.
- Add supplier-certificate expiry tasks only after a corresponding endpoint exists.

final result: passed
