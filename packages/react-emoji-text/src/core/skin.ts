import type { EmojiEntry, SkinTone } from './types';

const SKIN_TONE_MODIFIERS: Record<string, SkinTone> = {
  '1f3fb': 2,
  '1f3fc': 3,
  '1f3fd': 4,
  '1f3fe': 5,
  '1f3ff': 6,
};

const SKIN_TONE_UNIFIED: Record<SkinTone, string> = {
  1: '',
  2: '1F3FB',
  3: '1F3FC',
  4: '1F3FD',
  5: '1F3FE',
  6: '1F3FF',
};

export function detectSkinToneFromUnified(unified: string): SkinTone | undefined {
  const normalizedUnified = unified.toLowerCase();
  for (const [modifier, tone] of Object.entries(SKIN_TONE_MODIFIERS)) {
    if (normalizedUnified.includes(modifier)) {
      return tone;
    }
  }
  return undefined;
}

export function resolveSkin(
  emoji: EmojiEntry,
  explicitSkin: SkinTone | undefined,
  defaultSkin: SkinTone | undefined,
): { native: string; skin: SkinTone | undefined } {
  const tone = explicitSkin ?? defaultSkin;

  if (!tone || tone === 1 || emoji.skins.length <= 1) {
    return {
      native: emoji.skins[0]?.native ?? '',
      skin: explicitSkin,
    };
  }

  const skinIndex = tone - 1;
  const skinEntry = emoji.skins[skinIndex] ?? emoji.skins[0];

  return {
    native: skinEntry?.native ?? emoji.skins[0]?.native ?? '',
    skin: tone,
  };
}

export function skinToneShortcodeToTone(shortcode: string): SkinTone | undefined {
  const toneMatch = /^skin-tone-([1-6])$/.test(shortcode)
    ? shortcode.charAt(shortcode.length - 1)
    : undefined;
  if (toneMatch) {
    return Number.parseInt(toneMatch, 10) as SkinTone;
  }
  return undefined;
}

export { SKIN_TONE_UNIFIED };
