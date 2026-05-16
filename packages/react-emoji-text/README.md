# react-emoji-text

A modern React 19 renderer that converts plain text into rendered emojis, backed by `@emoji-mart/data`.

## Entry Points

```ts
import { EmojiProvider, EmojiText } from 'react-emoji-text/react';
import { tokenize } from 'react-emoji-text/core';
import Emoji, { toArray } from 'react-emoji-text/compat';
```

The root entry (`react-emoji-text`) re-exports the core and React APIs. Use the subpath entries when you want the smallest import surface.

## React Usage

Wrap your app (or subtree) with `EmojiProvider` and use `EmojiText` to render emoji-enriched text.

```tsx
import data from '@emoji-mart/data';
import { EmojiProvider, EmojiText } from 'react-emoji-text/react';

export function Message() {
  return (
    <EmojiProvider data={data}>
      <EmojiText>hello :wave:</EmojiText>
    </EmojiProvider>
  );
}
```

`EmojiText` accepts content as a `children` string or via the `text` prop. Use `text` when `children` contains slots (see [Custom Rendering](#custom-rendering)).

### EmojiProvider Props

| Prop               | Type                                                         | Default    | Description                                                         |
| ------------------ | ------------------------------------------------------------ | ---------- | ------------------------------------------------------------------- |
| `data`             | `EmojiData`                                                  | _required_ | Emoji dataset (e.g. `@emoji-mart/data`)                             |
| `set`              | `"native" \| "apple" \| "google" \| "twitter" \| "facebook"` | `"native"` | Emoji image set                                                     |
| `defaultSkin`      | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                                 | —          | Default skin tone applied to all emojis                             |
| `ascii`            | `boolean`                                                    | `true`     | Match ASCII emoticons like `:)` and `<3`                            |
| `customEmojis`     | `CustomEmojiCategory[]`                                      | —          | Custom emoji categories (see [Custom Emojis](#custom-emojis))       |
| `extraAliases`     | `Record<string, string>`                                     | —          | Additional shortcode mappings (see [Extra Aliases](#extra-aliases)) |
| `getImageUrl`      | `(emoji, context) => string`                                 | —          | Custom image URL resolver                                           |
| `imageUrlTemplate` | `string`                                                     | —          | URL template with `{set}`, `{unified}`, `{skin}` placeholders       |
| `sprite`           | `SpriteConfig`                                               | —          | Sprite sheet configuration                                          |

### EmojiText Props

All `EmojiProvider` props except `data` can be overridden per-instance on `EmojiText`.

| Prop                 | Type                          | Default  | Description                                                    |
| -------------------- | ----------------------------- | -------- | -------------------------------------------------------------- |
| `children`           | `string`                      | —        | Source text (mutually exclusive with `text`)                   |
| `text`               | `string`                      | —        | Source text (use when `children` contains slots)               |
| `as`                 | `keyof HTMLElementTagNameMap` | `"span"` | Wrapper element tag                                            |
| `className`          | `string`                      | —        | Class on the wrapper element                                   |
| `emojiClassName`     | `string`                      | —        | Class applied to individual emoji images                       |
| `onlyEmojiClassName` | `string`                      | —        | Class applied to the wrapper when content contains only emojis |
| `ref`                | `Ref<HTMLElement>`            | —        | Forwarded ref to the wrapper element                           |

Any additional HTML attributes are forwarded to the wrapper element.

```tsx
<EmojiText as="p" className="message" data-testid="msg" title="Greeting">
  hello :wave:
</EmojiText>
```

## Custom Rendering

Customize token rendering with compound slots. Use `text` for the source string when `children` contains slots.

```tsx
<EmojiText text="hello :wave: :missing:">
  <EmojiText.Emoji>
    {(token) => <strong title={token.shortcode}>{token.native}</strong>}
  </EmojiText.Emoji>
  <EmojiText.Unknown>{(token) => <code>{token.match}</code>}</EmojiText.Unknown>
</EmojiText>
```

The `EmojiText.Emoji` slot receives an `EmojiToken` with fields: `emoji`, `native`, `skin`, `shortcode`, `match`, and `source`. The `EmojiText.Unknown` slot receives an `UnknownToken` with `shortcode` and `match`.

For full control over every token type, compose the `useTokens` hook with `renderTokenDefault`:

```tsx
import { useTokens, renderTokenDefault } from 'react-emoji-text/react';

function CustomRenderer({ text }: { text: string }) {
  const tokens = useTokens(text);

  return (
    <span>
      {tokens.map((token, index) => {
        if (token.type === 'emoji') {
          return (
            <span key={index} className="emoji">
              {token.native}
            </span>
          );
        }
        return renderTokenDefault(token, { set: 'native' });
      })}
    </span>
  );
}
```

## Image Rendering

By default, emojis render as native Unicode characters. To render image-based emojis, configure one of the image resolution strategies on the provider or per-instance.

### Image URL Template

Use `{set}`, `{unified}`, and `{skin}` placeholders:

```tsx
<EmojiProvider data={data} set="apple" imageUrlTemplate="/emoji/{set}/{unified}.png">
  <EmojiText>:wave:</EmojiText>
</EmojiProvider>
```

### Custom Image URL Function

For full control, provide a `getImageUrl` function:

```tsx
<EmojiProvider
  data={data}
  set="apple"
  getImageUrl={(emoji, context) => `/cdn/${context.set}/${context.unified}.svg`}
>
  <EmojiText>:wave:</EmojiText>
</EmojiProvider>
```

### Sprite Sheets

Render emojis from a sprite sheet by providing a `sprite` config:

```tsx
<EmojiText
  set="apple"
  sprite={{
    src: '/emoji-sheet.png',
    size: 20,
    columns: 4,
    sheet: { '1F44B': { x: 1, y: 2 } },
  }}
>
  :wave:
</EmojiText>
```

Sprite coordinates are matched case-insensitively. Emojis without coordinates fall back to native rendering.

### Resolution Priority

When multiple image strategies are configured, they resolve in this order:

1. `getImageUrl` (highest priority)
2. `sprite`
3. `imageUrlTemplate`
4. Native Unicode (fallback)

The `emojiClassName` prop is applied to rendered `<img>` and sprite `<span>` elements.

## Skin Tones

### Default Skin Tone

Set a default skin tone on the provider or per-instance. Values range from `1` (default yellow) to `6`.

```tsx
<EmojiProvider data={data} defaultSkin={3}>
  <EmojiText>:wave:</EmojiText> {/* renders 👋🏼 */}
</EmojiProvider>
```

### Shortcode Skin Tone Suffix

Append `:skin-tone-N:` to a shortcode to override the skin tone for that emoji:

```tsx
<EmojiText>:wave::skin-tone-5:</EmojiText> {/* renders 👋🏾 */}
```

Unicode skin tone modifiers embedded in the source text are always preserved.

## ASCII Emoticons

ASCII emoticons like `:)`, `<3`, `:D`, and `;)` are matched by default. They require whitespace or string boundaries on both sides to avoid false positives inside words.

Disable ASCII matching on the provider or per-instance:

```tsx
<EmojiProvider data={data} ascii={false}>
  <EmojiText>hello :)</EmojiText> {/* renders as plain text */}
</EmojiProvider>
```

## Only-Emoji Detection

When the rendered content contains only emoji tokens (and optional whitespace), the `onlyEmojiClassName` is applied to the wrapper element. This is useful for styling messages that contain only emojis differently (e.g., rendering them larger).

```tsx
<EmojiText className="message" onlyEmojiClassName="jumbo">
  :wave:
</EmojiText>;
{
  /* wrapper gets class="message jumbo" */
}

<EmojiText className="message" onlyEmojiClassName="jumbo">
  hello :wave:
</EmojiText>;
{
  /* wrapper gets class="message" */
}
```

Empty content does not receive `onlyEmojiClassName`.

## Custom Emojis

Register custom emojis via the provider or per-instance. Each category contains an array of emojis with image sources.

```tsx
<EmojiProvider
  data={data}
  customEmojis={[
    {
      id: 'custom',
      name: 'Custom',
      emojis: [
        {
          id: 'partyparrot',
          name: 'Party Parrot',
          keywords: ['party', 'parrot'],
          skins: [{ src: '/emojis/partyparrot.gif' }],
        },
      ],
    },
  ]}
>
  <EmojiText>:partyparrot:</EmojiText>
</EmojiProvider>
```

Custom emojis render as `<img>` elements. If a custom emoji shares the same ID as a built-in emoji, the custom emoji takes precedence.

## Extra Aliases

Map additional shortcodes to existing emoji IDs via `extraAliases`. Values can reference built-in emoji IDs, built-in shortcodes, or custom emoji IDs.

```tsx
<EmojiProvider data={data}>
  <EmojiText extraAliases={{ hi: 'wave', dance: 'partyparrot' }}>:hi: :dance:</EmojiText>
</EmojiProvider>
```

### Shortcode Resolution Priority

When multiple sources define the same shortcode, the last writer wins. Resolution runs in this order, where later entries overwrite earlier ones:

1. Built-in emoji IDs and their aliases
2. Data-level aliases (`data.aliases`)
3. Custom emoji IDs
4. Extra aliases

This means an `extraAliases` entry with the same key as a custom emoji ID will override that custom emoji's shortcode. This is intentional — `extraAliases` acts as the highest-priority override.

## Core API

The `tokenize` function is framework-agnostic and can be used without React.

```ts
import { tokenize } from 'react-emoji-text/core';
import data from '@emoji-mart/data';

const tokens = tokenize('hello :wave: world', { data });
// [
//   { type: "text", value: "hello " },
//   { type: "emoji", emoji: {...}, native: "👋", source: "shortcode", ... },
//   { type: "text", value: " world" },
// ]
```

### TokenizeOptions

| Option         | Type                     | Default    | Description                   |
| -------------- | ------------------------ | ---------- | ----------------------------- |
| `data`         | `EmojiData`              | _required_ | Emoji dataset                 |
| `customEmojis` | `CustomEmojiCategory[]`  | —          | Custom emoji categories       |
| `ascii`        | `boolean`                | `true`     | Match ASCII emoticons         |
| `defaultSkin`  | `SkinTone`               | —          | Default skin tone             |
| `extraAliases` | `Record<string, string>` | —          | Additional shortcode mappings |

### Token Types

```ts
type Token = TextToken | EmojiToken | UnknownToken;

type TextToken = { type: 'text'; value: string };

type EmojiToken = {
  type: 'emoji';
  emoji: EmojiEntry;
  native: string;
  skin?: SkinTone;
  shortcode?: string;
  match: string;
  source: 'unicode' | 'shortcode' | 'ascii' | 'custom';
};

type UnknownToken = {
  type: 'unknown';
  shortcode: string;
  match: string;
};
```

## Compat API

A drop-in replacement for `react-emoji-render`. Pass adapted emoji data directly via `options` — no provider needed. Works with both `@emoji-mart/data` and `emojibase-data`.

### Emoji Component

#### With @emoji-mart/data

```tsx
import emojiMartData from '@emoji-mart/data';
import { fromEmojiMart } from 'react-emoji-text/adapters/emoji-mart';
import Emoji from 'react-emoji-text/compat';

const data = fromEmojiMart(emojiMartData);

<Emoji text="hello :wave:" options={{ data }} />
<Emoji text=":wave:" onlyEmojiClassName="jumbo" options={{ data }} />
<Emoji text=":wave:" svg options={{ data, imageUrlTemplate: "/emoji/{set}/{unified}.png" }} />
```

#### With emojibase

```tsx
import emojis from 'emojibase-data/en/data.json';
import shortcodes from 'emojibase-data/en/shortcodes/emojibase.json';
import { fromEmojibase } from 'react-emoji-text/adapters/emojibase';
import Emoji from 'react-emoji-text/compat';

const data = fromEmojibase(emojis, { shortcodes });

<Emoji text="hello :wave:" options={{ data }} />;
```

| Prop                 | Type                   | Default    | Description                               |
| -------------------- | ---------------------- | ---------- | ----------------------------------------- |
| `text`               | `string`               | _required_ | Source text                               |
| `onlyEmojiClassName` | `string`               | —          | Class when content is only emojis         |
| `svg`                | `boolean`              | —          | When `true`, uses the `"apple"` image set |
| `options`            | `CompatOptions`        | _required_ | Tokenize and render options               |
| `ref`                | `Ref<HTMLSpanElement>` | —          | Forwarded ref                             |

All additional HTML attributes are forwarded to the wrapper `<span>`.

### toArray

Returns an array of strings and React elements for manual rendering:

```ts
import { toArray } from 'react-emoji-text/compat';

const elements = toArray('hello :wave:', { data });
// ["hello ", <span title="wave">👋</span>]
```

Accepts the same `CompatOptions` as the `Emoji` component's `options` prop.

### Wrapper Pattern

Create a thin wrapper to pre-configure the data source, then use it everywhere without repeating the adapter setup:

```tsx
// emoji.tsx
import emojiMartData from '@emoji-mart/data';
import { fromEmojiMart } from 'react-emoji-text/adapters/emoji-mart';
import BaseEmoji, { toArray as baseToArray } from 'react-emoji-text/compat';
import type { EmojiProps } from 'react-emoji-text/compat';

const data = fromEmojiMart(emojiMartData);

export default function Emoji(props: Omit<EmojiProps, 'options'>) {
  return <BaseEmoji {...props} options={{ data }} />;
}

export function toArray(text: string) {
  return baseToArray(text, { data });
}
```

```tsx
// usage
import Emoji, { toArray } from './emoji';

<Emoji text="hello :wave:" />;
toArray('hello :wave:');
```
