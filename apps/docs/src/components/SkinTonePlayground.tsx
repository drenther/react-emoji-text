import { useState } from 'react';
import data from '@emoji-mart/data';
import type { EmojiData, SkinTone } from 'react-emoji-text/core';
import { EmojiProvider, EmojiText } from 'react-emoji-text/react';

const emojiData = data as unknown as EmojiData;
const SKIN_LABELS = ['Default', 'Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark'] as const;

export default function SkinTonePlayground() {
  const [text, setText] = useState(':wave: :thumbsup: :clap:');
  const [skinTone, setSkinTone] = useState<SkinTone>(1);

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
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 600 }}>
          Default skin tone
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {([1, 2, 3, 4, 5, 6] as const).map((tone) => (
            <button
              key={tone}
              onClick={() => setSkinTone(tone)}
              style={{
                padding: '4px 12px',
                border:
                  skinTone === tone
                    ? '2px solid var(--sl-color-accent)'
                    : '1px solid var(--sl-color-gray-5)',
                borderRadius: '4px',
                background: skinTone === tone ? 'var(--sl-color-accent-low)' : 'var(--sl-color-bg)',
                color: 'var(--sl-color-text)',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {SKIN_LABELS[tone - 1]} ({tone})
            </button>
          ))}
        </div>
      </div>
      <div
        style={{
          padding: '12px',
          background: 'var(--sl-color-gray-7)',
          borderRadius: '4px',
          fontSize: '24px',
        }}
      >
        <EmojiProvider data={emojiData} defaultSkin={skinTone}>
          <EmojiText>{text}</EmojiText>
        </EmojiProvider>
      </div>
    </div>
  );
}
