import { useState } from 'react';
import emojiMartData from '@emoji-mart/data';
import type { EmojiData } from 'react-emoji-text/core';
import { EmojiProvider, EmojiText } from 'react-emoji-text/react';

const emojiData = emojiMartData as unknown as EmojiData;
const emojiAssetBase = `${import.meta.env.BASE_URL}example-emoji`;

const SPRITE_SHEET = {
  '1f44b': { x: 0, y: 0 },
  '2764-fe0f': { x: 1, y: 0 },
  '2728': { x: 0, y: 1 },
  '1f600': { x: 1, y: 1 },
};

const EXAMPLES = [
  {
    id: 'template',
    label: 'URL template',
    render(text: string) {
      return (
        <EmojiText
          emojiClassName="image-rendering-playground__emoji"
          imageUrlTemplate={`${emojiAssetBase}/singles/{unified}.png`}
          set="apple"
        >
          {text}
        </EmojiText>
      );
    },
  },
  {
    id: 'function',
    label: 'Custom function',
    render(text: string) {
      return (
        <EmojiText
          emojiClassName="image-rendering-playground__emoji"
          getImageUrl={(_emoji, context) => `${emojiAssetBase}/singles/${context.unified}.png`}
          set="apple"
        >
          {text}
        </EmojiText>
      );
    },
  },
  {
    id: 'sprite',
    label: 'Sprite sheet',
    render(text: string) {
      return (
        <EmojiText
          emojiClassName="image-rendering-playground__emoji"
          set="apple"
          sprite={{
            src: `${emojiAssetBase}/sprite-2x2.png`,
            size: 24,
            columns: 2,
            sheet: SPRITE_SHEET,
          }}
        >
          {text}
        </EmojiText>
      );
    },
  },
];

export default function ImageRenderingPlayground() {
  const [text, setText] = useState(':wave: :heart: :sparkles: :grinning:');

  return (
    <div style={styles.container}>
      <input
        aria-label="Example text"
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        style={styles.input}
      />
      <EmojiProvider data={emojiData}>
        <div style={styles.stack}>
          {EXAMPLES.map((example) => (
            <section key={example.id} style={styles.example}>
              <div style={styles.label}>{example.label}</div>
              <div style={styles.output}>{example.render(text)}</div>
            </section>
          ))}
        </div>
      </EmojiProvider>
    </div>
  );
}

const styles = {
  container: {
    border: '1px solid var(--sl-color-gray-5)',
    borderRadius: '8px',
    padding: '12px',
    marginBlock: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  } satisfies React.CSSProperties,
  input: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid var(--sl-color-gray-5)',
    borderRadius: '6px',
    fontSize: '14px',
    background: 'var(--sl-color-bg)',
    color: 'var(--sl-color-text)',
    boxSizing: 'border-box',
  } satisfies React.CSSProperties,
  stack: {
    display: 'grid',
    gap: '10px',
  } satisfies React.CSSProperties,
  example: {
    display: 'grid',
    gridTemplateColumns: 'minmax(110px, 0.35fr) minmax(0, 1fr)',
    alignItems: 'center',
    gap: '10px',
  } satisfies React.CSSProperties,
  label: {
    color: 'var(--sl-color-gray-2)',
    fontSize: '13px',
    fontWeight: 600,
  } satisfies React.CSSProperties,
  output: {
    minHeight: '36px',
    padding: '8px 10px',
    background: 'var(--sl-color-gray-7)',
    borderRadius: '6px',
    fontSize: '24px',
    lineHeight: 1.35,
  } satisfies React.CSSProperties,
};
