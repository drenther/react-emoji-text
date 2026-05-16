---
title: Custom Rendering
description: Customize how emojis and unknown shortcodes are rendered.
---

## Compound Slots

Customize token rendering with compound slots. Use `text` for the source string when `children` contains slots.

```tsx
<EmojiText text="hello :wave: :missing:">
  <EmojiText.Emoji>
    {(token) => <strong title={token.shortcode}>{token.native}</strong>}
  </EmojiText.Emoji>
  <EmojiText.Unknown>{(token) => <code>{token.match}</code>}</EmojiText.Unknown>
</EmojiText>
```

The `EmojiText.Emoji` slot receives an `EmojiToken` with fields: `emoji`, `native`, `skin`, `shortcode`, `match`, and `source`.

The `EmojiText.Unknown` slot receives an `UnknownToken` with `shortcode` and `match`.

## useTokens Hook

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

The `useTokens` hook must be used inside an `EmojiProvider`. It accepts optional overrides for all tokenize options, falling back to the provider's configuration.

## Only-Emoji Detection

The exported `isOnlyEmoji` function checks whether a token array contains only emoji tokens (and optional whitespace). This powers the `onlyEmojiClassName` prop on `EmojiText`:

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
  /* wrapper gets class="message" — text content present */
}
```

Empty content does not receive `onlyEmojiClassName`.
