import { buildAsciiIndex } from "./ascii";
import type { CustomEmojiCategory, EmojiData, EmojiEntry, SkinTone } from "./types";

export interface ShortcodeEntry {
  emojiId: string;
  skin?: SkinTone;
  isCustom?: boolean;
}

export interface EmojiIndexes {
  unicodeRegex: RegExp;
  unicodeMap: Map<string, string>;
  shortcodeIndex: Map<string, ShortcodeEntry>;
  asciiIndex: Map<string, string>;
  emojiMap: Map<string, EmojiEntry>;
}

function unifiedToNative(unified: string): string {
  return unified
    .split("-")
    .map((hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .join("");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildIndexes(
  data: EmojiData,
  customEmojis?: CustomEmojiCategory[],
  extraAliases?: Record<string, string>,
): EmojiIndexes {
  const unicodeMap = new Map<string, string>();
  const emojiMap = new Map<string, EmojiEntry>();
  const shortcodeIndex = new Map<string, ShortcodeEntry>();
  const unicodeChars: string[] = [];

  for (const [emojiId, emoji] of Object.entries(data.emojis)) {
    emojiMap.set(emojiId, emoji);
    shortcodeIndex.set(emojiId, { emojiId });

    if (emoji.aliases) {
      for (const alias of emoji.aliases) {
        shortcodeIndex.set(alias, { emojiId });
      }
    }

    for (const skin of emoji.skins) {
      const native = skin.native ?? unifiedToNative(skin.unified);
      unicodeMap.set(native, emojiId);
      unicodeChars.push(escapeRegex(native));
    }
  }

  for (const [alias, emojiId] of Object.entries(data.aliases)) {
    if (!shortcodeIndex.has(alias)) {
      shortcodeIndex.set(alias, { emojiId });
    }
  }

  if (customEmojis) {
    for (const category of customEmojis) {
      for (const emoji of category.emojis) {
        const entry: EmojiEntry = {
          id: emoji.id,
          name: emoji.name,
          keywords: emoji.keywords ?? [],
          skins: emoji.skins.map((skin) => ({
            unified: "",
            native: "",
            src: skin.src,
          })),
        };
        emojiMap.set(emoji.id, entry);
        shortcodeIndex.set(emoji.id, { emojiId: emoji.id, isCustom: true });
      }
    }
  }

  if (extraAliases) {
    for (const [alias, emojiId] of Object.entries(extraAliases)) {
      const cleanAlias = alias.replace(/^:|:$/g, "");
      const resolvedEmojiId = emojiMap.has(emojiId)
        ? emojiId
        : (shortcodeIndex.get(emojiId)?.emojiId ?? emojiId);
      const isCustom = shortcodeIndex.get(resolvedEmojiId)?.isCustom;
      shortcodeIndex.set(cleanAlias, { emojiId: resolvedEmojiId, isCustom });
    }
  }

  unicodeChars.sort((first, second) => second.length - first.length);

  const unicodeRegex = unicodeChars.length > 0 ? new RegExp(unicodeChars.join("|"), "y") : /(?!)/y;

  const asciiIndex = buildAsciiIndex(data);

  return {
    unicodeRegex,
    unicodeMap,
    shortcodeIndex,
    asciiIndex,
    emojiMap,
  };
}
