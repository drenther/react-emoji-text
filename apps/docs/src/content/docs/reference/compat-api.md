---
title: Compat API
description: Drop-in replacement for react-emoji-render.
---

A drop-in replacement for <a href="https://github.com/tommoor/react-emoji-render" target="_blank" rel="noopener noreferrer">react-emoji-render</a>. Bundles `@emoji-mart/data` so no provider is needed.

## Emoji Component

```tsx
import Emoji from 'react-emoji-text/compat';

<Emoji text="hello :wave:" />
<Emoji text=":wave:" onlyEmojiClassName="jumbo" />
<Emoji
  text=":wave:"
  svg
  options={{ imageUrlTemplate: '/emoji/{set}/{unified}.png' }}
/>
```

### Props

| Prop                 | Type                   | Default    | Description                         |
| -------------------- | ---------------------- | ---------- | ----------------------------------- |
| `text`               | `string`               | _required_ | Source text                         |
| `onlyEmojiClassName` | `string`               | —          | Class when content is only emojis   |
| `svg`                | `boolean`              | —          | When `true`, uses the `"apple"` set |
| `options`            | `CompatOptions`        | —          | Tokenize and render options         |
| `ref`                | `Ref<HTMLSpanElement>` | —          | Forwarded ref                       |

All additional HTML attributes are forwarded to the wrapper `<span>`.

## toArray

Returns an array of strings and React elements for manual rendering:

```ts
import { toArray } from 'react-emoji-text/compat';

const elements = toArray('hello :wave:');
// ['hello ', <span title="wave">👋</span>]
```

Accepts the same `CompatOptions` as the `Emoji` component's `options` prop.

## Divergences from <a href="https://github.com/tommoor/react-emoji-render" target="_blank" rel="noopener noreferrer">react-emoji-render</a>

- **Data source**: Uses `@emoji-mart/data` instead of the legacy dataset. More emojis, more accurate shortcodes.
- **Skin tones**: Supported via `defaultSkin` option (not available in the original).
- **ASCII matching**: Uses boundary-aware matching to avoid false positives in URLs and code.
- **No EmojiProvider required**: Compat imports `@emoji-mart/data` directly.
- **`svg` prop**: Accepted for migration compatibility. It selects an image set, but callers still provide assets through `options.getImageUrl`, `options.imageUrlTemplate`, or `options.sprite`. This package does not host or bundle emoji images.
