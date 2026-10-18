# PetPallets Admin Design System

> Version: 1.0  
> Updated: 2026-10-18  
> Visual target: Product Design direction 3 — Dense Supply Console  
> Implementation: Ant Design 5 + Ant Design ProComponents

## 1. Product intent

PetPallets Admin is an internal operations console for wholesale catalog, sourcing, quotes, users,
and access control. The interface optimizes for fast scanning and decisive action by catalog and
sourcing managers.

Design principles:

1. Data first: tables, progress, statuses, and deadlines carry the interface.
2. Dense but calm: compact operational information with consistent 8px rhythm.
3. Brand through restraint: mint signals action and progress; gold signals attention.
4. Standard components first: prefer Ant Design and ProComponents APIs over bespoke UI.
5. One primary action per page: secondary operations stay neutral or inside dropdowns.

## 2. Brand foundation

The owl logo is the visual source of truth.

| Role | Token | Value | Usage |
|---|---|---:|---|
| Primary | `colorPrimary` | `#5CC4A8` | Primary buttons, progress, selected controls |
| Primary hover | `colorPrimaryHover` | `#45B095` | Hover and active interaction |
| Primary active | `colorPrimaryActive` | `#368F79` | Pressed state, strong emphasis |
| Primary tint | `colorPrimaryBg` | `#DFF5EE` | Selected menu and success-adjacent background |
| Brand mark | `brandMint` | `#7FD1BE` | Logo-derived secondary mint |
| Accent | `colorWarning` | `#E7AD42` | Due, blocked, pending, attention |
| Text | `colorText` | `#272425` | Primary text |
| Secondary text | `colorTextSecondary` | `#7E787A` | Metadata and supporting labels |
| Page background | `colorBgLayout` | `#F7F6F7` | Main application background |
| Surface | `colorBgContainer` | `#FFFFFF` | Tables, cards, drawers, forms |
| Border | `colorBorderSecondary` | `#EDEBEC` | Dividers and soft boundaries |
| Success | `colorSuccess` | `#2D8C5A` | Approved, active, healthy |
| Error | `colorError` | `#D14343` | Failed, overdue, destructive |
| Info | `colorInfo` | `#3B82C4` | Neutral informational state only |

Rules:

- Do not use the legacy blue `#007AFF` or purple gradients.
- Gold is never decorative. It only marks attention, warning, or pending state.
- Dark sidebar uses `#1F2221`; selected menu uses translucent mint.
- Shadows are limited to dropdowns, drawers, and the sticky header.

## 3. Typography

Use Inter for all admin UI. The admin console does not use the storefront's Playfair display font.

| Role | Size / line-height | Weight |
|---|---|---:|
| Page title | 32 / 40 | 600 |
| Section title | 18 / 26 | 600 |
| Card metric | 32 / 38 | 600 |
| Body | 14 / 22 | 400 |
| Label | 13 / 20 | 500 |
| Metadata | 12 / 18 | 400 |

Preferred stack:

```css
Inter, "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

## 4. Layout

### Desktop

- ProLayout sidebar: 224px, fixed, dark, and full viewport height from `top: 0`.
- Global header: fixed to the right content region only; it never spans across or sits above the sidebar.
- Header: 64px, white, sticky.
- Main content: fluid width, 24px outer padding.
- Content grid: 12 columns, 16px gutters.
- Dashboard split: 9 columns primary workspace + 3 columns action rail.
- Maximum useful content width is fluid; do not center the admin in a marketing-page container.

### Tablet and mobile

- Below 992px, the dashboard becomes one column.
- KPI cards wrap 2 × 2, then 1 × 4 below 576px.
- Tables retain horizontal scroll instead of collapsing critical columns into cards.
- Action rail moves below the primary workspace.
- Sidebar uses ProLayout's built-in collapsed/drawer behavior.

## 5. Shape and spacing

- Base spacing: 4px; standard rhythm: 8, 12, 16, 24, 32.
- Component radius: 4px.
- Large containers: 6px maximum.
- Buttons and inputs: 40px default height; 32px compact table controls.
- Cards: 20–24px padding.
- Do not nest cards unless the child is an independently actionable object.

## 6. Navigation

Use `ProLayout` in `mix` mode, with shell-level positioning that extends the dark sidebar to `top: 0` and constrains the light header to the right content region. Preserve the built-in header actions and responsive sider behavior.

Navigation order:

1. Dashboard
2. Products
3. Categories
4. Attributes
5. Quotes
6. Users
7. Roles
8. Settings

Behavior:

- Current item: mint icon/text, translucent mint fill, 3px mint leading marker.
- Hover: subtle white alpha background.
- Logo lockup: owl symbol + `PetPallets` + small `Admin` label.
- Header: organization selector, global search, notifications, user menu.
- Page titles remain inside `PageContainer`; do not duplicate them in page bodies.

## 7. Dashboard

The dashboard answers three questions: what changed, what needs action, and how sourcing is
progressing.

### Header

- Title: `Operations overview`
- Sync timestamp with healthy mint indicator.
- Seven-day date range control.
- Primary `Create` dropdown linking to product and quote workflows.

### KPI strip

Four standard `Statistic` cards:

- Revenue from accepted quotes
- Open quotes
- Live SKUs
- Products at risk

Trend color reflects meaning, not direction alone. An increase in at-risk products is warning.

### Main workspace

- Weekly quotes pipeline: standard progress bars grouped by week with legend.
- Priority products: Ant Design `Table`, compact density, issue/risk/due fields.
- Today: `List`/timeline-like action queue with simple dividers.
- Sourcing status: four progress rows mapped to the sourcing pipeline.

Dashboard data is currently representative UI data until matching reporting endpoints exist.

## 8. Tables and forms

Use `ProTable` for entity lists.

- Table header uses neutral-50 surface, 13px medium labels, no uppercase transformation.
- Row height target: 56–64px for Product rows, 48–56px elsewhere.
- Filters use ProTable query mode; advanced filters remain collapsed by default on small screens.
- Primary creation action sits in `toolBarRender`.
- Destructive actions remain in row dropdowns with confirmation.
- Status uses semantic Ant Design `Tag`; custom color is only allowed when semantic presets do not
  match the domain state.

Use `DrawerForm` for quick create/edit and full pages only for complex multi-section Product forms.

## 9. Authentication

- White form surface on a pale mint/neutral background.
- Owl logo is the only illustration.
- No gradient background.
- 440px form width, 40px controls, visible labels.
- Footer metadata uses secondary text with AA contrast.

## 10. Component mapping

| Design element | Implementation |
|---|---|
| Application shell | `ProLayout` |
| Page chrome | `PageContainer` |
| Metrics | `Card` + `Statistic` |
| Pipeline | `Progress` |
| Entity lists | `ProTable` |
| Priority list | `Table` |
| Status | `Tag`, `Badge` |
| Action queue | `List` |
| Create action | `Dropdown.Button` |
| Date filtering | `DatePicker.RangePicker` |
| User menu | `Dropdown` + `Avatar` |
| Quick edit/create | `DrawerForm` / existing drawers |

## 11. Accessibility

- Body contrast meets WCAG AA.
- Mint text on white uses dark mint `#286B5B`, not `#5CC4A8`.
- Focus rings use `#9FE0C5` with 2px outline.
- Icon-only actions require tooltip or accessible label.
- Color never carries status alone; include label, icon, or value.
- Tables preserve keyboard focus and visible selected-row state.

## 12. Implementation boundaries

- Preserve existing React Router, RBAC, Alova API client, and entity CRUD flows.
- Do not add runtime dependencies.
- Use `@ant-design/icons`; do not introduce another icon library.
- Theme changes belong in `src/theme.ts`; layout-specific tokens belong in `MainLayout`.
- Page-specific styles use scoped classes in the existing Less pipeline.
- New dashboard visuals must be CSS/component based data visualization, not canvas chart packages.

