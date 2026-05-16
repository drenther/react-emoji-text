export interface EmojibaseEmoji {
  label: string;
  hexcode: string;
  emoji: string;
  text: string;
  type: number;
  order?: number;
  group?: number;
  subgroup?: number;
  version: number;
  tags?: string[];
  emoticon?: string | string[];
  skins?: EmojibaseEmoji[];
  tone?: number | number[];
}

export interface EmojibaseCompactEmoji {
  label: string;
  hexcode: string;
  unicode: string;
  order?: number;
  group?: number;
  tags?: string[];
  emoticon?: string | string[];
  skins?: EmojibaseCompactEmoji[];
}

export type EmojibaseShortcodes = Record<string, string | string[]>;
