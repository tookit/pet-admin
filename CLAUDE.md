# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install
pnpm dev            # Vite dev server
pnpm build          # tsc --noEmit && vite build
pnpm type-check     # tsc --noEmit
pnpm lint           # eslint .
pnpm lint:fix
pnpm format         # prettier --write .
pnpm format:check
```

pnpm is the package manager (`packageManager` field pins the version; `pnpm-lock.yaml` is the only lockfile). No test runner, no CI — `pnpm type-check`, `pnpm lint`, and `pnpm build` are the available checks. Run them after changes.

`@vitejs/plugin-react@6` and `vite@8` are required together (the plugin peers on `^8.0.0`). Vite 8 is Rolldown-based — consult rolldown documentation, not esbuild, when touching build config.

## Current work

`UI_REFINE_TASK.md` is the task ledger (Chinese): T1–T9, checkbox per task, with the scope rules and the verification list for each phase. All nine are checked off; each carries a 说明 note where the implementation departs from the literal spec. `design/adminpro-design-docs/*.md` (dashboard, user-management, settings, profile, security, design) plus `design/*.png` are the specs those tasks implement; `PRODUCT.md` holds audience, brand personality, anti-references, and accessibility requirements. Read both before building UI. Work is committed one task at a time with a `feat:` / `fix:` / `docs:` prefix and is not pushed.

Built: Dashboard, User management, Profile, Security, Settings, and the shared shell/branding. `Role Management` and `Permission` appear in the design but have no spec, so no routes were created for them. Nothing has been verified in a real browser — automated checks only.

`AGENTS.md` restates this file for other agents; keep the overlapping parts in sync.

## Architecture

### Data flows mock-first, in three layers

1. `src/mocks/api.ts` — the only stateful module. In-memory `users` array, 250 ms artificial latency, no HTTP. Mutations last for the browser session only.
2. `src/api/modules/*.api.ts` — adapters that call the mock and shape responses into `PaginatedResponse<T>` (from `@/types`). Filtering and pagination happen client-side in `getUserList`.
3. Pages — import from `@/api/modules/*`, never from `@/mocks/api`.

To connect a real backend, rewrite layer 2 and keep the `PaginatedResponse<T>` contract so `useProTable` and the tables keep working.

`UserInput` and `UserFormValues` in `src/types/index.ts` are the shared shapes: `UserInput` is the upsert payload (`id` present means update), `UserFormValues` the form subset the client may submit. Both are `Pick`s of `User`, so widening the entity's form fields is a one-line change there.

### Routes are declared once, consumed twice

`src/routes/routeDefinitions.tsx` is the single source of truth: `protectedRoutes` (with `name`/`icon`/`hideInMenu`) and `authRoutes`. Protected pages are `lazy()`-loaded; the auth pages are imported eagerly, because their Suspense fallback (`.route-loader`, `min-height: 100vh`) renders inside the auth card and would balloon it before shrinking. `src/routes/index.tsx` maps them into `<Routes>`; `src/layouts/MainLayout.tsx` independently consumes `protectedRoutes` to build the ProLayout menu.

Adding a page = add one entry to `routeDefinitions.tsx`. Paths are relative (`'users'`, not `'/users'`) because they nest under layout routes; `MainLayout` re-prefixes them with `/` for menu keys.

`AuthGuard` in `routes/index.tsx` wraps the whole `MainLayout` branch and redirects to `/login` when unauthenticated. `/` redirects to `settings.landingPage` — not a literal `'/dashboard'` — so the landing page stays configurable from Settings.

### Auth is a stub, settings are real preferences

`src/contexts/AuthContext.tsx` holds a mock user (`{ name, email }`, no token) persisted in **`sessionStorage`** under `STORAGE_KEYS.USER`. The initial state is read synchronously via a lazy `useState` initializer, so there is no loading state and no flash. `sessionStorage` is user-writable, so `readStoredUser` parses defensively. `login` accepts any email; no real validation, no role enforcement — `UserRole` is display only.

`src/contexts/SettingsContext.tsx` is the second context and behaves differently on purpose: it keeps `settings` (what the UI renders) and `saved` (what is persisted) apart, so a settings screen can `preview()` live, then `save()` or `cancel()`. It persists to **`localStorage`** through `readPreferences` in `src/utils/storage.ts`, which copies only keys present in `DEFAULT_SETTINGS` **and** matching the default's `typeof` — a new setting needs an entry in `DEFAULT_SETTINGS` or it will be silently dropped on reload. `DEFAULT_SETTINGS` is seeded from `APP_CONFIG`, so `App.tsx` sets `document.title` from it.

### Theming: one runtime source, bridged to CSS

The chain in `src/App.tsx` is load-bearing — each layer needs the one above it:

`SettingsProvider` → `ThemedApp` (`ConfigProvider`: `appTheme` plus dark/compact algorithms, locale, `settings.primaryColor` overriding the token) → `ThemeSurface` (`theme.useToken()` writes the antd tokens onto `--app-*` CSS variables on `.app-surface`) → `<AntdApp>` → `AuthProvider` → `Router`.

- `src/constants/app.ts` — `APP_CONFIG` (name, logo, version, brand colors) feeds `appTheme`. This is the rebrand entry point. `CHART_TOKENS` reads `series` from the same primary color, so changing the brand color moves the charts too — re-check that hue against the white card surface before shipping it.
- `src/styles/variables.less` — does **not** duplicate the palette. Its LESS variables alias the `--app-*` CSS variables that `ThemeSurface` sets at runtime, which is why hand-written CSS follows dark mode and the user's chosen primary color for free. A literal hex in a `.less` file opts that rule out of theming; use the alias.

`src/styles/index.less` is imported once in `main.tsx` and is the only entry point; it `@import`s `variables.less` first, then `global.less`, `main-layout.less`, `auth-layout.less`. Partial files do **not** import `variables.less` themselves and rely on that ordering — a new `.less` file added to `index.less` before the variables import will fail to compile.

Class names shared between LESS and components (`.header-brand`, `.page-users`, `.auth-switch`, `.route-loader`, `.layout-version`, `.section-card`, `.section-stack`, `.metric-card`, `.metric-icon`, `.metric-trend`, `.card-controls`, `.donut-*`, `.order-customer`, `.task-item`, `.settings-grid`, `.card-head`, `.setting-icon`, `.plan-summary`, `.profile-meta`, `.profile-stats`, `.row-warning`, `.save-footer`, `.setting-row`, `.danger-card`, `.sr-only`) are the coupling point; renaming one side breaks the other silently.

### Tables

`src/hooks/useProTable.ts` centralizes ProTable props (pagination, search, toolbar, `PaginatedResponse` unwrapping). The `request` callback is wrapped in `useCallback` deliberately: ProTable treats a changed `request` identity as a refetch trigger. It reads `message` from `App.useApp()` rather than importing antd's static `message`, so toasts inherit the `ConfigProvider` theme — any component using `App.useApp()` must render inside the `<AntdApp>` wrapper in `src/App.tsx`.

`src/pages/users/UserList.tsx` is the reference list screen, and the pattern it establishes is the one to copy:

- Filters live in a standalone `QueryFilter` above the table, not in ProTable's built-in search form (`search={false}` on the table). `onFinish`/`onReset` write a `params` state object and reset to page 1 through `actionRef.current?.setPageInfo?.({ current: 1 })`; `params` is passed to the table, so a filter change refetches without the table owning the form state.
- Summary tiles render from `getAllUsers()`, never from the current page of results, so the figures do not move when the user pages or filters. Both tiles and table refresh together through the shared `reload()`.
- `perform(action, success)` is the single mutation path: it sets `busy`, runs the call, awaits `reload()`, and owns the success/error toasts. Row actions, bulk actions, and the drawer all route through it, so new mutations should too.
- Bulk actions hang off `rowSelection` + `tableAlertOptionRender`, and the destructive one goes through `modal.confirm` from `App.useApp()`.
- `options.ts` holds `ROLE_OPTIONS`/`STATUS_OPTIONS` shared by the filter, the drawer form, and the columns — a new status should be added to `UserStatus` in `src/types` and to `STATUS_OPTIONS`, and nothing else.
- CSV export goes through `src/utils/csv.ts`: `downloadCsv` writes a UTF-8 BOM so Excel reads non-ASCII names, and `csvCell` prefixes a `'` to any value starting with `=`, `+`, `-`, or `@` so a name cannot become a spreadsheet formula.

User table columns live in `src/pages/users/UserColumn.tsx` (a `use*Columns` hook returning `ProColumns<User>[]`), row actions in `src/pages/users/UserActions.tsx`. Drawer CRUD follows `UserList.tsx`: one `Form.useForm`, an `editing` record in state, `resetFields()` before populating, and a reload after a mutation. Shared presentational components live in `src/components/` (`MetricsRow` for stat tiles).

### Charts

Dashboard charts use `@ant-design/plots` (G2 v5 under the hood — the config shape is G2's, so consult G2 v5 docs, not the older `@ant-design/plots` v1 / G2Plot API). Each chart is a component in `src/pages/dashboard/` owning its own mark spec.

Rules the existing charts follow, and new ones should too:

- **One measure = one hue.** `CHART_TOKENS.series` colours every mark, and `legend={false}` — a single series needs no legend box, the card title names it. Per-category palettes are for identity, not for re-encoding a length the bar already shows.
- **Every chart ships a `ChartDataTable`.** It renders the same numbers as an `.sr-only` table (class in `global.less`), so no value is reachable only by hovering.
- **Spread `NO_ENTRY_ANIMATION` into every plot.** The entry animation is decorative, and G2 ignores `prefers-reduced-motion`. It has to be spread from a variable rather than written as a prop — see the comment on the constant.
- **Labels go outside the mark.** A label at `position: 'top'` lands _on_ the bar's top edge and renders dark gray over the fill; `dy: -18` lifts it clear. Watch for this on any new labelled chart.
- Chart data comes from the seeded 365-day series (`buildDaily`) in `src/mocks/api.ts`, so the KPIs and the charts are computed from one source and reloading does not reshuffle them. Do not reintroduce a hardcoded percentage — the old `metricsFor`/`rolesFor` pair that read the `users` array is gone.
- **The donut is the exception to "one measure = one hue".** Traffic sources encode identity, so `TrafficSources.tsx` uses `CHART_TOKENS.categorical` — a fixed six-hue order, validated for colour-vision separation against both card surfaces. Assign the hues in order and never cycle them: a seventh source folds into "Other" rather than borrowing a hue.

`height` on a plot includes the axis band — do not add a height that assumes the axis lives outside it, and do not give the card a fixed height that clips it.

## Conventions

- `@/` alias resolves to `src/` and is declared in **both** `vite.config.ts` and `tsconfig.json`; add new aliases to both.
- `tsconfig.json` sets `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, and `esModuleInterop`. `verbatimModuleSyntax` makes `import type` mandatory for type-only imports.
- ESLint runs `typescript-eslint`'s **type-checked** rules. Passing an async function where a void return is expected is an error — wrap call sites as `onClick={() => void handler()}`. `react-router`'s `navigate` returns a promise, so it needs `void` too.
- Prettier owns formatting (100 columns, single quotes, trailing commas). Run `pnpm format` rather than hand-formatting.
- No test framework is configured; do not add test files expecting them to run.

## Known gaps

- No error boundary — an unexpected render error blanks the page.
- The mock `users` array is module state, so it is shared across tabs and reset on reload.
- `pnpm type-check`, `pnpm lint` and `pnpm build` pass. The `chrome-devtools` MCP server fails to connect, so layout was checked with a throwaway Chrome DevTools Protocol script instead (headless Chrome on `:9222`, `Emulation.setDeviceMetricsOverride` + `Runtime.evaluate`): inner page width, the dashboard KPI tiles and the locale of both component libraries at 1440px and 375px. Dark mode, the tablet breakpoint and the charts' rendered output remain unchecked.
