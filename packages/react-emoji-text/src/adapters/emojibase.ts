import type { EmojiData, EmojiEntry, EmojiSkin } from '../core/types';
import type { EmojibaseCompactEmoji, EmojibaseEmoji, EmojibaseShortcodes } from './types';

const GROUP_NAMES: Record<number, string> = {
  0: 'smileys-emotion',
  1: 'people-body',
  2: 'component',
  3: 'animals-nature',
  4: 'food-drink',
  5: 'travel-places',
  6: 'activities',
  7: 'objects',
  8: 'symbols',
  9: 'flags',
};

interface FromEmojibaseOptions {
  shortcodes?: EmojibaseShortcodes;
}

function getNative(entry: EmojibaseEmoji | EmojibaseCompactEmoji): string {
  return 'emoji' in entry ? entry.emoji : (entry as EmojibaseCompactEmoji).unicode;
}

function resolveShortcodes(
  hexcode: string,
  shortcodesMap: EmojibaseShortcodes | undefined,
): string[] {
  if (!shortcodesMap) return [];
  const value = shortcodesMap[hexcode];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toSkin(entry: EmojibaseEmoji | EmojibaseCompactEmoji): EmojiSkin {
  return {
    unified: entry.hexcode,
    native: getNative(entry),
  };
}

export function fromEmojibase(
  emojis: EmojibaseEmoji[] | EmojibaseCompactEmoji[],
  options?: FromEmojibaseOptions,
): EmojiData {
  const shortcodesMap = options?.shortcodes;
  const emojiRecord: Record<string, EmojiEntry> = {};
  const aliases: Record<string, string> = {};
  const categoryBuckets = new Map<string, string[]>();

  for (const raw of emojis) {
    const codes = resolveShortcodes(raw.hexcode, shortcodesMap);
    const emojiId = codes[0] ?? raw.hexcode;

    const skins: EmojiSkin[] = [toSkin(raw)];
    if (raw.skins) {
      for (const skinVariant of raw.skins) {
        skins.push(toSkin(skinVariant));
      }
    }

    const entryAliases = codes.length > 1 ? codes.slice(1) : undefined;

    emojiRecord[emojiId] = {
      id: emojiId,
      name: raw.label,
      keywords: raw.tags ?? [],
      skins,
      aliases: entryAliases,
    };

    if (entryAliases) {
      for (const alias of entryAliases) {
        aliases[alias] = emojiId;
      }
    }

    const emoticons = raw.emoticon
      ? Array.isArray(raw.emoticon)
        ? raw.emoticon
        : [raw.emoticon]
      : [];
    for (const emoticon of emoticons) {
      aliases[emoticon] = emojiId;
    }

    if (raw.group !== undefined) {
      const categoryName = GROUP_NAMES[raw.group] ?? `group-${String(raw.group)}`;
      let bucket = categoryBuckets.get(categoryName);
      if (!bucket) {
        bucket = [];
        categoryBuckets.set(categoryName, bucket);
      }
      bucket.push(emojiId);
    }
  }

  const categories = Array.from(categoryBuckets, ([id, emojiIds]) => ({
    id,
    emojis: emojiIds,
  }));

  return { emojis: emojiRecord, aliases, categories };
}
