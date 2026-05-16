import { useState } from 'react';
import emojis from 'emojibase-data/en/data.json';
import shortcodes from 'emojibase-data/en/shortcodes/emojibase.json';
import type { EmojiData } from 'react-emoji-text/core';
import { fromEmojibase } from 'react-emoji-text/adapters/emojibase';
import { EmojiProvider, EmojiText } from 'react-emoji-text/react';

const emojiData: EmojiData = fromEmojibase(emojis, { shortcodes });

export default function EmojibasePlayground({ ascii: initialAscii = true }: { ascii?: boolean }) {
  const [text, setText] = useState('hello :wave: world :heart:');
  const [ascii, setAscii] = useState(initialAscii);

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
          Input text (powered by emojibase)
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
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '14px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={ascii}
            onChange={(event) => setAscii(event.target.checked)}
            style={{ marginRight: '6px' }}
          />
          Enable ASCII emoticons
        </label>
      </div>
      <div
        style={{
          padding: '12px',
          background: 'var(--sl-color-gray-7)',
          borderRadius: '4px',
          fontSize: '18px',
        }}
      >
        <EmojiProvider data={emojiData} ascii={ascii}>
          <EmojiText>{text}</EmojiText>
        </EmojiProvider>
      </div>
    </div>
  );
}
