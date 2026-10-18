# Repository Guidelines

## Project Structure & Module Organization

This is a React 19, TypeScript, Vite, and Ant Design admin starter with in-memory mock data.

- `src/pages/` groups screens and related components by feature; `src/layouts/` contains auth and admin shells.
- `src/routes/routeDefinitions.tsx` defines routes and sidebar metadata. Use relative paths such as `users`.
- `src/api/modules/*.api.ts` adapts `src/mocks/api.ts`; pages consume adapters, never mocks directly. Preserve the shared `PaginatedResponse<T>` contract in `src/types/`.
- `src/hooks/` contains reusable hooks, including `useProTable`; `src/contexts/` holds authentication state (`AuthContext`) and branding/preferences (`SettingsContext`).
- `src/constants/app.ts` configures branding and Ant Design tokens. LESS lives in `src/styles/`; keep `variables.less` first in `index.less`.
- `public/` contains static assets; `design/` contains visual references. Production output goes to `dist/`.

## Build, Test, and Development Commands

Use pnpm, pinned in `package.json`, and retain `pnpm-lock.yaml`.

- `pnpm install` — install dependencies.
- `pnpm dev` — start Vite with hot reload; use the printed local URL.
- `pnpm build` — type-check and build to `dist/`.
- `pnpm preview` — serve the production build locally.
- `pnpm type-check` — run TypeScript without emitting files.
- `pnpm lint` / `pnpm lint:fix` — check or autofix ESLint issues.
- `pnpm format:check` / `pnpm format` — check or apply Prettier formatting.

## Coding Style & Naming Conventions

Use two spaces, LF endings, semicolons, single quotes, trailing commas, and a 100-column formatting target. Follow strict TypeScript and type-aware ESLint rules; use type-only imports. Prefer `@/` imports for modules under `src/`. Name components and their files in PascalCase (`UserList.tsx`), hooks with `use` (`useProTable.ts`), and API modules as `*.api.ts`.

## Testing Guidelines

No test runner, test naming convention, coverage threshold, or CI workflow is configured. Run type-check, lint, and build after code changes. Manually verify affected flows, including authentication, user CRUD, filtering, pagination, and dashboard updates. For UI changes, check responsive layouts and chart data-table accessibility. Configure a runner before introducing automated tests.

## Commit & Pull Request Guidelines

Follow the existing type-prefixed style, for example `feat: rebuild the dashboard against the design spec` or `fix: refresh users after deletion`. Keep changes focused, and commit one item of `UI_REFINE_TASK.md` at a time. PRs should describe behavior, reference relevant issues, list verification performed, and include screenshots for visual changes.

## Security & Configuration

Authentication is a demo stub using `sessionStorage`, without server validation or role enforcement. Replace it before production use. Never commit secrets.
