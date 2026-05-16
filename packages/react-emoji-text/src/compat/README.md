# react-emoji-text/compat

Drop-in replacement for `react-emoji-render`. Uses the same engine as the primary API but exposes the legacy surface.

## Usage

### With @emoji-mart/data

```tsx
import emojiMartData from '@emoji-mart/data';
import { fromEmojiMart } from 'react-emoji-text/adapters/emoji-mart';
import Emoji, { toArray } from 'react-emoji-text/compat';

const data = fromEmojiMart(emojiMartData);

<Emoji text="hello :wave:" options={{ data }} className="msg" onlyEmojiClassName="jumbo" />;
toArray('hello :wave:', { data }); // → Array<string | ReactElement>
```

### With emojibase

```tsx
import emojis from 'emojibase-data/en/data.json';
import shortcodes from 'emojibase-data/en/shortcodes/emojibase.json';
import { fromEmojibase } from 'react-emoji-text/adapters/emojibase';
import Emoji, { toArray } from 'react-emoji-text/compat';

const data = fromEmojibase(emojis, { shortcodes });

<Emoji text="hello :wave:" options={{ data }} className="msg" onlyEmojiClassName="jumbo" />;
toArray('hello :wave:', { data }); // → Array<string | ReactElement>
```

## Wrapper Pattern

Create a thin wrapper to pre-configure the data source once, then use it everywhere without repeating the adapter setup:

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

Then import from your wrapper instead:

```tsx
import Emoji, { toArray } from './emoji';

<Emoji text="hello :wave:" />;
toArray('hello :wave:');
```

## Divergences from react-emoji-render

- **Data source**: Uses adapter functions (`fromEmojiMart` or `fromEmojibase`) instead of the legacy dataset. More emojis, more accurate shortcodes.
- **Data source agnostic**: Works with both `@emoji-mart/data` (via `fromEmojiMart`) and `emojibase-data` (via `fromEmojibase`).
- **Skin tones**: Supported via `defaultSkin` option (not available in the original).
- **ASCII matching**: Uses boundary-aware matching to avoid false positives in URLs and code.
- **No EmojiProvider required**: Data is passed directly via `options.data` — no React context provider needed.
- **`svg` prop**: Accepted for migration compatibility. It selects an image set, but callers still provide assets through `options.getImageUrl`, `options.imageUrlTemplate`, or `options.sprite`; this package does not host or bundle emoji images.
