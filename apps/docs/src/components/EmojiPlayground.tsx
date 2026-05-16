import { useState } from 'react';
import emojiMartData from '@emoji-mart/data';
import emojis from 'emojibase-data/en/data.json';
import shortcodes from 'emojibase-data/en/shortcodes/emojibase.json';
import type { EmojiData } from 'react-emoji-text/core';
import { fromEmojibase } from 'react-emoji-text/adapters/emojibase';
import { EmojiProvider, EmojiText } from 'react-emoji-text/react';

type Adapter = 'emoji-mart' | 'emojibase';

const emojiMartEmojiData = emojiMartData as unknown as EmojiData;
const emojibaseEmojiData: EmojiData = fromEmojibase(emojis, { shortcodes });

const ADAPTERS: { value: Adapter; label: string }[] = [
  { value: 'emoji-mart', label: '@emoji-mart/data' },
  { value: 'emojibase', label: 'emojibase' },
];

export default function EmojiPlayground({ ascii: initialAscii = true }: { ascii?: boolean }) {
  const [adapter, setAdapter] = useState<Adapter>('emoji-mart');
  const [text, setText] = useState('hello :wave: world :heart:');
  const [ascii, setAscii] = useState(initialAscii);

  const data = adapter === 'emoji-mart' ? emojiMartEmojiData : emojibaseEmojiData;

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <div style={styles.segmented}>
          {ADAPTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setAdapter(value)}
              style={adapter === value ? styles.segmentedActive : styles.segmentedInactive}
            >
              {label}
            </button>
          ))}
        </div>
        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={ascii}
            onChange={(event) => setAscii(event.target.checked)}
          />
          ASCII
        </label>
      </div>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        style={styles.input}
      />
      <div style={styles.output}>
        <EmojiProvider key={adapter} data={data} ascii={ascii}>
          <EmojiText>{text}</EmojiText>
        </EmojiProvider>
      </div>
    </div>
  );
}

const segmentedBase: React.CSSProperties = {
  padding: '4px 12px',
  margin: 0,
  border: 'none',
  appearance: 'none',
  cursor: 'pointer',
  fontSize: '12px',
  lineHeight: '1.5',
  borderRadius: '4px',
  transition: 'background 0.15s, color 0.15s',
};

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
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    flexWrap: 'wrap',
  } satisfies React.CSSProperties,
  segmented: {
    display: 'inline-flex',
    padding: '2px',
    background: 'var(--sl-color-gray-6)',
    borderRadius: '6px',
    gap: '2px',
  } satisfies React.CSSProperties,
  segmentedActive: {
    ...segmentedBase,
    background: 'var(--sl-color-bg)',
    color: 'var(--sl-color-text)',
    fontWeight: 600,
    boxShadow: '0 1px 2px rgba(0,0,0,.12)',
  } satisfies React.CSSProperties,
  segmentedInactive: {
    ...segmentedBase,
    background: 'transparent',
    color: 'var(--sl-color-gray-2)',
    fontWeight: 400,
  } satisfies React.CSSProperties,
  checkbox: {
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--sl-color-gray-2)',
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
  output: {
    padding: '10px 12px',
    background: 'var(--sl-color-gray-7)',
    borderRadius: '6px',
    fontSize: '18px',
  } satisfies React.CSSProperties,
};
