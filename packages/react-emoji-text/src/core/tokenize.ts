import { matchAscii } from "./ascii";
import { type EmojiIndexes, buildIndexes } from "./indexes";
import { detectSkinToneFromUnified, resolveSkin, skinToneShortcodeToTone } from "./skin";
import type { SkinTone, Token, TokenizeOptions } from "./types";

const SHORTCODE_RE = /^:([a-zA-Z0-9_+-]+):/;
const SKIN_TONE_SHORTCODE_RE = /^:skin-tone-([1-6]):/;

const indexCache = new WeakMap<
  TokenizeOptions["data"],
  Array<{
    customEmojis: TokenizeOptions["customEmojis"];
    extraAliases: TokenizeOptions["extraAliases"];
    indexes: EmojiIndexes;
  }>
>();

function getIndexes(options: TokenizeOptions): EmojiIndexes {
  const cachedEntries = indexCache.get(options.data);
  const cachedEntry = cachedEntries?.find(
    (entry) =>
      entry.customEmojis === options.customEmojis && entry.extraAliases === options.extraAliases,
  );

  if (cachedEntry) {
    return cachedEntry.indexes;
  }

  const indexes = buildIndexes(options.data, options.customEmojis, options.extraAliases);

  const nextEntry = {
    customEmojis: options.customEmojis,
    extraAliases: options.extraAliases,
    indexes,
  };

  if (cachedEntries) {
    cachedEntries.push(nextEntry);
  } else {
    indexCache.set(options.data, [nextEntry]);
  }

  return indexes;
}

function tryMatchUnicode(
  input: string,
  position: number,
  indexes: EmojiIndexes,
): { native: string; emojiId: string; unified?: string } | undefined {
  indexes.unicodeRegex.lastIndex = position;
  const regexResult = indexes.unicodeRegex.exec(input);
  if (regexResult) {
    const native = regexResult[0];
    const emojiId = indexes.unicodeMap.get(native);
    if (emojiId) {
      const emoji = indexes.emojiMap.get(emojiId);
      const skin = emoji?.skins.find((skinEntry) => skinEntry.native === native);
      return { native, emojiId, unified: skin?.unified };
    }
  }
  return;
}

function tryMatchShortcode(
  input: string,
  position: number,
  indexes: EmojiIndexes,
):
  | {
      shortcode: string;
      emojiId: string;
      fullMatch: string;
      isCustom?: boolean;
    }
  | undefined {
  const remaining = input.slice(position);
  const regexResult = SHORTCODE_RE.exec(remaining);
  if (regexResult?.[1]) {
    const shortcode = regexResult[1];
    const entry = indexes.shortcodeIndex.get(shortcode);
    if (entry) {
      return {
        shortcode,
        emojiId: entry.emojiId,
        fullMatch: regexResult[0],
        isCustom: entry.isCustom,
      };
    }
  }
  return;
}

function tryMatchUnknownShortcode(
  input: string,
  position: number,
): { shortcode: string; fullMatch: string } | undefined {
  const remaining = input.slice(position);
  const regexResult = SHORTCODE_RE.exec(remaining);
  if (regexResult?.[1]) {
    return { shortcode: regexResult[1], fullMatch: regexResult[0] };
  }
  return;
}

export function tokenize(input: string, options: TokenizeOptions): Token[] {
  const indexes = getIndexes(options);
  const tokens: Token[] = [];
  const ascii = options.ascii ?? true;
  let position = 0;
  let textBuffer = "";

  function flushText() {
    if (textBuffer.length > 0) {
      tokens.push({ type: "text", value: textBuffer });
      textBuffer = "";
    }
  }

  while (position < input.length) {
    let matched = false;

    const unicodeResult = tryMatchUnicode(input, position, indexes);
    if (unicodeResult) {
      flushText();
      const detectedSkin = detectSkinToneFromUnified(unicodeResult.unified ?? "");
      const emoji = indexes.emojiMap.get(unicodeResult.emojiId);
      if (emoji) {
        const resolved = resolveSkin(emoji, detectedSkin, options.defaultSkin);
        tokens.push({
          type: "emoji",
          emoji,
          native: resolved.native || unicodeResult.native,
          skin: resolved.skin,
          match: unicodeResult.native,
          source: "unicode",
        });
      }
      position += unicodeResult.native.length;
      matched = true;
    }

    if (!matched) {
      const shortcodeResult = tryMatchShortcode(input, position, indexes);
      if (shortcodeResult) {
        flushText();
        let skinTone: SkinTone | undefined;
        let totalLength = shortcodeResult.fullMatch.length;

        const afterShortcode = input.slice(position + totalLength);
        const skinRegexResult = SKIN_TONE_SHORTCODE_RE.exec(afterShortcode);
        if (skinRegexResult?.[1]) {
          skinTone = skinToneShortcodeToTone(`skin-tone-${skinRegexResult[1]}`);
          totalLength += skinRegexResult[0].length;
        }

        const emoji = indexes.emojiMap.get(shortcodeResult.emojiId);
        if (emoji) {
          const isCustom = shortcodeResult.isCustom;
          const resolved = resolveSkin(emoji, skinTone, options.defaultSkin);
          tokens.push({
            type: "emoji",
            emoji,
            native: resolved.native,
            skin: resolved.skin,
            shortcode: shortcodeResult.shortcode,
            match: input.slice(position, position + totalLength),
            source: isCustom ? "custom" : "shortcode",
          });
        }
        position += totalLength;
        matched = true;
      }
    }

    if (!matched) {
      const unknownResult = tryMatchUnknownShortcode(input, position);
      if (unknownResult) {
        flushText();
        tokens.push({
          type: "unknown",
          shortcode: unknownResult.shortcode,
          match: unknownResult.fullMatch,
        });
        position += unknownResult.fullMatch.length;
        matched = true;
      }
    }

    if (!matched && ascii) {
      const asciiResult = matchAscii(input, position, indexes.asciiIndex);
      if (asciiResult) {
        flushText();
        const emoji = indexes.emojiMap.get(asciiResult.emojiId);
        if (emoji) {
          const resolved = resolveSkin(emoji, undefined, options.defaultSkin);
          tokens.push({
            type: "emoji",
            emoji,
            native: resolved.native,
            match: asciiResult.ascii,
            source: "ascii",
          });
        }
        position += asciiResult.ascii.length;
        matched = true;
      }
    }

    if (!matched) {
      textBuffer += input[position];
      position += 1;
    }
  }

  flushText();
  return tokens;
}
