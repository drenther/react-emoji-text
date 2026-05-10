'use client';

import { useMemo } from 'react';
import { tokenize } from '../core/tokenize';
import type { Token, TokenizeOptions } from '../core/types';
import { useEmojiContext } from './provider';

export function useTokens(text: string, overrides?: Partial<TokenizeOptions>): Token[] {
  const { config } = useEmojiContext();

  return useMemo(() => {
    const options: TokenizeOptions = {
      data: overrides?.data ?? config.data,
      customEmojis: overrides?.customEmojis ?? config.customEmojis,
      ascii: overrides?.ascii ?? config.ascii,
      defaultSkin: overrides?.defaultSkin ?? config.defaultSkin,
      extraAliases: overrides?.extraAliases ?? config.extraAliases,
    };
    return tokenize(text, options);
  }, [text, config, overrides]);
}
