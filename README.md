<p align="center">
  <img src="apps/docs/public/favicon.svg" width="64" height="64" alt="react-emoji-text logo" />
</p>

# react-emoji-text

Monorepo for `react-emoji-text`, a React 19 emoji text renderer with adapters for [`@emoji-mart/data`](https://github.com/missive/emoji-mart) and [`emojibase`](https://emojibase.dev).

## Development

```sh
pnpm install
pnpm run lint
pnpm run format:check
pnpm run test
pnpm run build
```

The published package lives in `packages/react-emoji-text`. It exposes separate tree-shakeable entry points:

- `react-emoji-text/core` — framework-agnostic tokenizer
- `react-emoji-text/react` — React provider, hook, and component
- `react-emoji-text/adapters/emoji-mart` — adapter for `@emoji-mart/data`
- `react-emoji-text/adapters/emojibase` — adapter for `emojibase-data`
- `react-emoji-text/compat` — drop-in replacement for [`react-emoji-render`](https://github.com/tommoor/react-emoji-render) (requires `@emoji-mart/data`)
