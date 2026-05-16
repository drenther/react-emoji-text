---
title: Core API
description: Framework-agnostic tokenizer and type definitions.
---

The `tokenize` function is framework-agnostic and can be used without React.

## tokenize

```ts
import { tokenize } from 'react-emoji-text/core';
import data from '@emoji-mart/data';

const tokens = tokenize('hello :wave: world', { data });
// [
//   { type: 'text', value: 'hello ' },
//   { type: 'emoji', emoji: {...}, native: '👋', source: 'shortcode', ... },
//   { type: 'text', value: ' world' },
// ]
```

## TokenizeOptions

| Option         | Type                     | Default    | Description                   |
| -------------- | ------------------------ | ---------- | ----------------------------- |
| `data`         | `EmojiData`              | _required_ | Emoji dataset                 |
| `customEmojis` | `CustomEmojiCategory[]`  | —          | Custom emoji categories       |
| `ascii`        | `boolean`                | `true`     | Match ASCII emoticons         |
| `defaultSkin`  | `SkinTone`               | —          | Default skin tone             |
| `extraAliases` | `Record<string, string>` | —          | Additional shortcode mappings |

## Token Types

```ts
type Token = TextToken | EmojiToken | UnknownToken;
```

### TextToken

```ts
type TextToken = {
  type: 'text';
  value: string;
};
```

Plain text between emoji matches.

### EmojiToken

```ts
type EmojiToken = {
  type: 'emoji';
  emoji: EmojiEntry;
  native: string;
  skin?: SkinTone;
  shortcode?: string;
  match: string;
  source: 'unicode' | 'shortcode' | 'ascii' | 'custom';
};
```

| Field       | Description                                          |
| ----------- | ---------------------------------------------------- |
| `emoji`     | Full emoji entry from the dataset                    |
| `native`    | Resolved native Unicode string                       |
| `skin`      | Applied skin tone (if any)                           |
| `shortcode` | The matched shortcode (for shortcode/custom sources) |
| `match`     | The original matched text in the input               |
| `source`    | How the emoji was matched                            |

### UnknownToken

```ts
type UnknownToken = {
  type: 'unknown';
  shortcode: string;
  match: string;
};
```

Shortcodes that look like `:name:` but don't match any known emoji.
