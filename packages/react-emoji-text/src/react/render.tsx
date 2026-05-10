'use client';

import type { ReactNode } from 'react';
import type {
  EmojiImageContext,
  EmojiSet,
  EmojiSkin,
  EmojiToken,
  GetImageUrl,
  SpriteConfig,
  Token,
  UnknownToken,
} from '../core/types';

export interface DefaultRenderOptions {
  set: EmojiSet;
  getImageUrl?: GetImageUrl;
  sprite?: SpriteConfig;
  emojiClassName?: string;
}

export function renderTokenDefault(token: Token, options: DefaultRenderOptions): ReactNode {
  switch (token.type) {
    case 'text':
      return token.value;
    case 'emoji':
      return renderEmojiDefault(token, options);
    case 'unknown':
      return renderUnknownDefault(token);
  }
}

function renderEmojiDefault(token: EmojiToken, options: DefaultRenderOptions): ReactNode {
  if (token.source === 'custom') {
    const src = token.emoji.skins[0]?.src;
    if (!src) return token.match;

    return (
      <img
        src={src}
        alt={token.shortcode ?? token.emoji.id}
        className={options.emojiClassName}
        style={emojiImageStyle}
      />
    );
  }

  if (options.set === 'native') {
    return token.native;
  }

  const skinEntry = getResolvedSkinEntry(token);

  if (options.getImageUrl) {
    const context: EmojiImageContext = {
      set: options.set,
      skin: token.skin ?? 1,
      unified: skinEntry?.unified ?? '',
    };
    const src = options.getImageUrl(token.emoji, context);

    return (
      <img
        src={src}
        alt={token.native}
        className={options.emojiClassName}
        style={emojiImageStyle}
      />
    );
  }

  if (options.sprite && skinEntry) {
    return renderSpriteEmoji(token, skinEntry, options.sprite, options.emojiClassName);
  }

  return token.native;
}

function getResolvedSkinEntry(token: EmojiToken): EmojiSkin | undefined {
  if (token.skin) {
    return token.emoji.skins[token.skin - 1] ?? token.emoji.skins[0];
  }

  return token.emoji.skins.find((skin) => skin.native === token.native) ?? token.emoji.skins[0];
}

function findSpriteCoordinates(
  sprite: SpriteConfig,
  unified: string,
): { x: number; y: number } | undefined {
  return (
    sprite.sheet[unified] ??
    sprite.sheet[unified.toLowerCase()] ??
    sprite.sheet[unified.toUpperCase()]
  );
}

function renderSpriteEmoji(
  token: EmojiToken,
  skinEntry: EmojiSkin,
  sprite: SpriteConfig,
  emojiClassName?: string,
): ReactNode {
  const coordinates = findSpriteCoordinates(sprite, skinEntry.unified);
  if (!coordinates) return token.native;

  return (
    <span
      role="img"
      aria-label={token.native}
      className={emojiClassName}
      style={{
        backgroundImage: `url(${sprite.src})`,
        backgroundPosition: `-${coordinates.x * sprite.size}px -${coordinates.y * sprite.size}px`,
        backgroundSize: `${sprite.columns * sprite.size}px auto`,
        display: 'inline-block',
        height: `${sprite.size}px`,
        verticalAlign: '-0.1em',
        width: `${sprite.size}px`,
      }}
    />
  );
}

function renderUnknownDefault(token: UnknownToken): ReactNode {
  return token.match;
}

const emojiImageStyle = {
  display: 'inline',
  height: '1em',
  verticalAlign: '-0.1em',
  width: '1em',
};

export function isOnlyEmoji(tokens: Token[]): boolean {
  return (
    tokens.some((token) => token.type === 'emoji') &&
    tokens.every(
      (token) => token.type === 'emoji' || (token.type === 'text' && token.value.trim() === ''),
    )
  );
}
