import { useState } from 'react';
import data from '@emoji-mart/data';
import type { EmojiData } from 'react-emoji-text/core';
import { EmojiProvider, EmojiText } from 'react-emoji-text/react';

const emojiData = data as unknown as EmojiData;

export default function EmojiPlayground({ ascii: initialAscii = true }: { ascii?: boolean }) {
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
