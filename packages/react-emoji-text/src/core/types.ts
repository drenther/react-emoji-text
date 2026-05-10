export interface EmojiSkin {
  unified: string;
  native: string;
  src?: string;
}

export interface EmojiEntry {
  id: string;
  name: string;
  keywords: string[];
  skins: EmojiSkin[];
  aliases?: string[];
}

export interface CustomEmoji {
  id: string;
  name: string;
  keywords?: string[];
  skins: Array<{ src: string }>;
}

export interface CustomEmojiCategory {
  id: string;
  name: string;
  emojis: CustomEmoji[];
}

export interface SpriteConfig {
  src: string;
  size: number;
  columns: number;
  sheet: Record<string, { x: number; y: number }>;
}

export type EmojiSet = 'native' | 'apple' | 'google' | 'twitter' | 'facebook';
export type SkinTone = 1 | 2 | 3 | 4 | 5 | 6;
export type EmojiSource = 'unicode' | 'shortcode' | 'ascii' | 'custom';

export interface EmojiImageContext {
  set: EmojiSet;
  skin: SkinTone;
  unified: string;
}

export type GetImageUrl = (emoji: EmojiEntry, context: EmojiImageContext) => string;

export interface EmojiConfig {
  data: EmojiData;
  customEmojis?: CustomEmojiCategory[];
  set?: EmojiSet;
  defaultSkin?: SkinTone;
  ascii?: boolean;
  getImageUrl?: GetImageUrl;
  imageUrlTemplate?: string;
  sprite?: SpriteConfig;
  extraAliases?: Record<string, string>;
}

export interface EmojiData {
  emojis: Record<string, EmojiEntry>;
  aliases: Record<string, string>;
  categories: Array<{ id: string; emojis: string[] }>;
}

export type TextToken = {
  type: 'text';
  value: string;
};

export type EmojiToken = {
  type: 'emoji';
  emoji: EmojiEntry;
  native: string;
  skin?: SkinTone;
  shortcode?: string;
  match: string;
  source: EmojiSource;
};

export type UnknownToken = {
  type: 'unknown';
  shortcode: string;
  match: string;
};

export type Token = TextToken | EmojiToken | UnknownToken;

export interface TokenizeOptions {
  data: EmojiData;
  customEmojis?: CustomEmojiCategory[];
  ascii?: boolean;
  defaultSkin?: SkinTone;
  extraAliases?: Record<string, string>;
}
