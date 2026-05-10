# react-emoji-text

A modern React renderer that converts plain text into rendered emojis, backed by `@emoji-mart/data`.

## Project Structure

pnpm monorepo with two workspace members:

- `packages/react-emoji-text` — the published npm package
- `apps/docs` — Fumadocs documentation site (TanStack Start)

## Commands

- `pnpm run build` — build all packages via Turborepo
- `pnpm run test` — run all tests via Turborepo
- `pnpm run typecheck` — type-check all packages
- `pnpm run lint` — oxlint across the repo
- `pnpm run format` — oxfmt across the repo
- `pnpm run format:check` — check formatting
- `pnpm run dev` — start all dev servers
- `pnpm run docs:dev` — start docs dev server only

## Conventions

- TypeScript strict mode, target ES2022
- No single-character variable names — use descriptive names
- No nested ternaries — use ts-pattern for complex conditionals
- Conventional Commits enforced via commitlint
- Exact pinned dependency versions (no `~`/`^`)
- oxlint for linting, oxfmt for formatting (no eslint/prettier)
- Vitest for testing with happy-dom environment

## Architecture

- `src/core/` — framework-agnostic: tokenizer, indexes, types (zero React imports)
- `src/react/` — React bindings: provider, hook, component, render paths
- `src/compat/` — drop-in replacement for `react-emoji-render`

## Supply Chain Config — Do Not Modify Without Approval

This repo enforces strict install-time supply chain defenses:

- Exact pinned versions (no `~`/`^`).
- `minimumReleaseAge` of 7 days (pnpm: minutes).
- Install/lifecycle scripts disabled by default; only packages in
  `onlyBuiltDependencies` (in `pnpm-workspace.yaml`) may run them.
- `blockExoticSubdeps: true`, `trustPolicy: no-downgrade` (in `pnpm-workspace.yaml`).

**Never disable, loosen, or bypass these settings** — including adding packages
to the script allow-list, shortening `minimumReleaseAge`, or setting
`dangerouslyAllowAllBuilds` — without explicit confirmation from the user in
the current conversation. A prior approval does not carry over.
