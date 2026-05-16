'use client';

import { useMemo } from 'react';
import { tokenizeWithIndexes } from '../core/tokenize';
import type { Token, TokenizeOptions } from '../core/types';
import { useEmojiContext } from './provider';

export function useTokens(text: string, overrides?: Partial<TokenizeOptions>): Token[] {
  const { config, indexes: contextIndexes } = useEmojiContext();
  const data = overrides?.data ?? config.data;
  const customEmojis = overrides?.customEmojis ?? config.customEmojis;
  const ascii = overrides?.ascii ?? config.ascii;
  const defaultSkin = overrides?.defaultSkin ?? config.defaultSkin;
  const extraAliases = overrides?.extraAliases ?? config.extraAliases;
  const indexes =
    data === config.data &&
    customEmojis === config.customEmojis &&
    extraAliases === config.extraAliases
      ? contextIndexes
      : undefined;

  return useMemo(() => {
    const options: TokenizeOptions = {
      data,
      customEmojis,
      ascii,
      defaultSkin,
      extraAliases,
    };
    return tokenizeWithIndexes(text, { ...options, indexes });
  }, [text, data, customEmojis, ascii, defaultSkin, extraAliases, indexes]);
}
