# react-emoji-text/compat

Drop-in replacement for `react-emoji-render`. Uses the same engine as the primary API but exposes the legacy surface.

## Usage

```tsx
import Emoji, { toArray } from "react-emoji-text/compat";

<Emoji text="hello :wave:" className="msg" onlyEmojiClassName="jumbo" />;
toArray("hello :wave:"); // → Array<string | ReactElement>
```

## Divergences from react-emoji-render

- **Data source**: Uses `@emoji-mart/data` instead of the legacy dataset. More emojis, more accurate shortcodes.
- **Skin tones**: Supported via `defaultSkin` option (not available in the original).
- **ASCII matching**: Uses boundary-aware matching to avoid false positives in URLs and code.
- **No EmojiProvider required**: Compat imports `@emoji-mart/data` directly.
- **`svg` prop**: Accepted for migration compatibility. It selects an image set, but callers still provide assets through `options.getImageUrl`, `options.imageUrlTemplate`, or `options.sprite`; this package does not host or bundle emoji images.
