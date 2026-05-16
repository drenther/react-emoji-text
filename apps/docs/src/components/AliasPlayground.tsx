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

interface AliasEntry {
  alias: string;
  emojiId: string;
}

export default function AliasPlayground() {
  const [adapter, setAdapter] = useState<Adapter>('emoji-mart');
  const [text, setText] = useState(':hi: :love:');
  const [aliases, setAliases] = useState<AliasEntry[]>([
    { alias: 'hi', emojiId: 'wave' },
    { alias: 'love', emojiId: 'heart' },
  ]);

  const data = adapter === 'emoji-mart' ? emojiMartEmojiData : emojibaseEmojiData;

  const extraAliases = Object.fromEntries(
    aliases
      .filter((entry) => entry.alias && entry.emojiId)
      .map((entry) => [entry.alias, entry.emojiId]),
  );

  function addAlias() {
    setAliases([...aliases, { alias: '', emojiId: '' }]);
  }

  function removeAlias(index: number) {
    setAliases(aliases.filter((_, entryIndex) => entryIndex !== index));
  }

  function updateAlias(index: number, field: keyof AliasEntry, value: string) {
    setAliases(
      aliases.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    );
  }

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
      </div>
      <div>
        <label style={styles.label}>Alias mappings</label>
        {aliases.map((entry, index) => (
          <div
            key={index}
            style={{ display: 'flex', gap: '6px', marginBottom: '4px', alignItems: 'center' }}
          >
            <input
              type="text"
              value={entry.alias}
              onChange={(event) => updateAlias(index, 'alias', event.target.value)}
              placeholder="alias"
              style={{ ...styles.input, flex: 1 }}
            />
            <span style={{ color: 'var(--sl-color-gray-3)', fontSize: '13px' }}>&rarr;</span>
            <input
              type="text"
              value={entry.emojiId}
              onChange={(event) => updateAlias(index, 'emojiId', event.target.value)}
              placeholder="emoji ID"
              style={{ ...styles.input, flex: 1 }}
            />
            <button onClick={() => removeAlias(index)} style={styles.segmentedInactive}>
              Remove
            </button>
          </div>
        ))}
        <button onClick={addAlias} style={{ ...styles.segmentedInactive, marginTop: '2px' }}>
          + Add alias
        </button>
      </div>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Input text"
        style={styles.input}
      />
      <div style={styles.output}>
        <EmojiProvider key={adapter} data={data} extraAliases={extraAliases}>
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
  label: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '12px',
    fontWeight: 500,
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
