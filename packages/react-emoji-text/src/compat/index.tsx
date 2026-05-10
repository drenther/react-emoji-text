'use client';

import emojiMartData from '@emoji-mart/data';
import type { HTMLAttributes, ReactElement, Ref } from 'react';
import { cloneElement, isValidElement } from 'react';
import { tokenize } from '../core/tokenize';
import type {
  EmojiData,
  EmojiSet,
  GetImageUrl,
  SpriteConfig,
  TokenizeOptions,
} from '../core/types';
import { resolveImageUrlFn } from '../react/image-url';
import { createTokenKeyFactory } from '../react/keys';
import { renderTokenDefault } from '../react/render';

export interface CompatOptions extends Partial<TokenizeOptions> {
  getImageUrl?: GetImageUrl;
  imageUrlTemplate?: string;
  set?: EmojiSet;
  sprite?: SpriteConfig;
}

export interface EmojiProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  onlyEmojiClassName?: string;
  ref?: Ref<HTMLSpanElement>;
  svg?: boolean;
  options?: CompatOptions;
}

export function toArray(text: string, options?: CompatOptions): Array<string | ReactElement> {
  const data: TokenizeOptions['data'] = options?.data ?? (emojiMartData as unknown as EmojiData);

  const fullOptions: TokenizeOptions = {
    data,
    customEmojis: options?.customEmojis,
    ascii: options?.ascii ?? true,
    defaultSkin: options?.defaultSkin,
    extraAliases: options?.extraAliases,
  };
  const renderSet = options?.set ?? 'native';
  const resolvedGetImageUrl = resolveImageUrlFn({
    getImageUrl: options?.getImageUrl,
    imageUrlTemplate: options?.imageUrlTemplate,
    sprite: options?.sprite,
  });
  const createKey = createTokenKeyFactory();

  return tokenize(text, fullOptions).map((token) => {
    if (token.type === 'text') return token.value;
    if (token.type === 'unknown') return token.match;

    const key = createKey(token);
    const rendered = renderTokenDefault(token, {
      getImageUrl: resolvedGetImageUrl,
      set: renderSet,
      sprite: options?.sprite,
    });

    if (isValidElement(rendered)) {
      return cloneElement(rendered, { key });
    }

    return (
      <span key={key} title={token.shortcode}>
        {rendered}
      </span>
    );
  });
}

export default function Emoji({
  text,
  className,
  onlyEmojiClassName,
  options,
  ref,
  svg,
  ...htmlProps
}: EmojiProps) {
  const elements = toArray(text, {
    ...options,
    set: options?.set ?? (svg ? 'apple' : 'native'),
  });
  const allEmoji = elements.every(
    (element) => typeof element !== 'string' || element.trim() === '',
  );

  const combinedClassName =
    [className, allEmoji && onlyEmojiClassName].filter(Boolean).join(' ') || undefined;

  return (
    <span className={combinedClassName} ref={ref} {...htmlProps}>
      {elements}
    </span>
  );
}
