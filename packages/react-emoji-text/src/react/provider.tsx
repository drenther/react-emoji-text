"use client";

import { type ReactNode, createContext, use, useMemo } from "react";
import { buildIndexes, type EmojiIndexes } from "../core/indexes";
import type {
  CustomEmojiCategory,
  EmojiConfig,
  EmojiData,
  EmojiSet,
  GetImageUrl,
  SkinTone,
  SpriteConfig,
} from "../core/types";
import { resolveImageUrlFn } from "./image-url";

export interface EmojiContextValue {
  indexes: EmojiIndexes;
  config: EmojiConfig;
  resolvedGetImageUrl?: GetImageUrl;
}

const EmojiContext = createContext<EmojiContextValue | undefined>(undefined);

export interface EmojiProviderProps {
  data: EmojiData;
  customEmojis?: CustomEmojiCategory[];
  set?: EmojiSet;
  defaultSkin?: SkinTone;
  ascii?: boolean;
  getImageUrl?: GetImageUrl;
  imageUrlTemplate?: string;
  sprite?: SpriteConfig;
  extraAliases?: Record<string, string>;
  children: ReactNode;
}

export function EmojiProvider({
  data,
  customEmojis,
  set = "native",
  defaultSkin,
  ascii = true,
  getImageUrl,
  imageUrlTemplate,
  sprite,
  extraAliases,
  children,
}: EmojiProviderProps) {
  const indexes = useMemo(
    () => buildIndexes(data, customEmojis, extraAliases),
    [data, customEmojis, extraAliases],
  );

  const resolvedGetImageUrl = useMemo(
    () => resolveImageUrlFn({ getImageUrl, sprite, imageUrlTemplate }),
    [getImageUrl, sprite, imageUrlTemplate],
  );

  const value = useMemo<EmojiContextValue>(
    () => ({
      indexes,
      config: {
        data,
        customEmojis,
        set,
        defaultSkin,
        ascii,
        getImageUrl: resolvedGetImageUrl,
        imageUrlTemplate,
        sprite,
        extraAliases,
      },
      resolvedGetImageUrl,
    }),
    [
      indexes,
      data,
      customEmojis,
      set,
      defaultSkin,
      ascii,
      resolvedGetImageUrl,
      imageUrlTemplate,
      sprite,
      extraAliases,
    ],
  );

  return <EmojiContext value={value}>{children}</EmojiContext>;
}

export function useEmojiContext(): EmojiContextValue {
  const context = use(EmojiContext);
  if (!context) {
    throw new Error("useEmojiContext must be used within an EmojiProvider");
  }
  return context;
}
