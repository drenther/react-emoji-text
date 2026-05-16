import { useState } from 'react';
import data from '@emoji-mart/data';
import type { EmojiData } from 'react-emoji-text/core';
import { EmojiProvider, EmojiText } from 'react-emoji-text/react';

const emojiData = data as unknown as EmojiData;

interface AliasEntry {
  alias: string;
  emojiId: string;
}

export default function AliasPlayground() {
  const [text, setText] = useState(':hi: :love:');
  const [aliases, setAliases] = useState<AliasEntry[]>([
    { alias: 'hi', emojiId: 'wave' },
    { alias: 'love', emojiId: 'heart' },
  ]);

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
    <div
      style={{
        border: '1px solid var(--sl-color-gray-5)',
        borderRadius: '8px',
        padding: '16px',
        marginBlock: '16px',
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 600 }}>
          Alias mappings
        </label>
        {aliases.map((entry, index) => (
          <div
            key={index}
            style={{ display: 'flex', gap: '8px', marginBottom: '4px', alignItems: 'center' }}
          >
            <input
              type="text"
              value={entry.alias}
              onChange={(event) => updateAlias(index, 'alias', event.target.value)}
              placeholder="alias"
              style={{
                flex: 1,
                padding: '6px 10px',
                border: '1px solid var(--sl-color-gray-5)',
                borderRadius: '4px',
                fontSize: '14px',
                background: 'var(--sl-color-bg)',
                color: 'var(--sl-color-text)',
              }}
            />
            <span style={{ color: 'var(--sl-color-gray-3)' }}>&rarr;</span>
            <input
              type="text"
              value={entry.emojiId}
              onChange={(event) => updateAlias(index, 'emojiId', event.target.value)}
              placeholder="emoji ID (e.g. wave)"
              style={{
                flex: 1,
                padding: '6px 10px',
                border: '1px solid var(--sl-color-gray-5)',
                borderRadius: '4px',
                fontSize: '14px',
                background: 'var(--sl-color-bg)',
                color: 'var(--sl-color-text)',
              }}
            />
            <button
              onClick={() => removeAlias(index)}
              style={{
                padding: '4px 8px',
                border: '1px solid var(--sl-color-gray-5)',
                borderRadius: '4px',
                background: 'var(--sl-color-bg)',
                color: 'var(--sl-color-text)',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={addAlias}
          style={{
            padding: '4px 12px',
            border: '1px solid var(--sl-color-gray-5)',
            borderRadius: '4px',
            background: 'var(--sl-color-bg)',
            color: 'var(--sl-color-text)',
            cursor: 'pointer',
            fontSize: '13px',
            marginTop: '4px',
          }}
        >
          + Add alias
        </button>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 600 }}>
          Input text
        </label>
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid var(--sl-color-gray-5)',
            borderRadius: '4px',
            fontSize: '16px',
            background: 'var(--sl-color-bg)',
            color: 'var(--sl-color-text)',
          }}
        />
      </div>
      <div
        style={{
          padding: '12px',
          background: 'var(--sl-color-gray-7)',
          borderRadius: '4px',
          fontSize: '18px',
        }}
      >
        <EmojiProvider data={emojiData} extraAliases={extraAliases}>
          <EmojiText>{text}</EmojiText>
        </EmojiProvider>
      </div>
    </div>
  );
}
