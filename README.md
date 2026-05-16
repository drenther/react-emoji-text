<p align="center">
  <img src="apps/docs/public/favicon.svg" width="64" height="64" alt="react-emoji-text logo" />
</p>

# react-emoji-text

Monorepo for `react-emoji-text`, a React 19 emoji text renderer backed by [`@emoji-mart/data`](https://github.com/missive/emoji-mart).

## Development

```sh
pnpm install
pnpm run lint
pnpm run format:check
pnpm run test
pnpm run build
```

The published package lives in `packages/react-emoji-text`. It exposes separate tree-shakeable entry points for `react-emoji-text/core`, `react-emoji-text/react`, and `react-emoji-text/compat` (a drop-in replacement for [`react-emoji-render`](https://github.com/tommoor/react-emoji-render)).
