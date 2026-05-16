import type { EmojiData } from './types';

const CURATED_ASCII: Record<string, string> = {
  ':)': 'slightly_smiling_face',
  ':-)': 'slightly_smiling_face',
  ':(': 'slightly_frowning_face',
  ':-(': 'slightly_frowning_face',
  ';)': 'wink',
  ';-)': 'wink',
  ':P': 'stuck_out_tongue',
  ':-P': 'stuck_out_tongue',
  ':p': 'stuck_out_tongue',
  ':-p': 'stuck_out_tongue',
  ':D': 'grinning',
  ':-D': 'grinning',
  '<3': 'heart',
  ':|': 'neutral_face',
  ':-|': 'neutral_face',
  ':/': 'confused',
  ':-/': 'confused',
  ":'(": 'cry',
  ':O': 'open_mouth',
  ':-O': 'open_mouth',
  ':o': 'open_mouth',
  ':-o': 'open_mouth',
  '>:(': 'angry',
  'B)': 'sunglasses',
  'B-)': 'sunglasses',
};

export function buildAsciiIndex(data: EmojiData): Map<string, string> {
  const index = new Map<string, string>();

  for (const [ascii, emojiId] of Object.entries(data.aliases)) {
    if (/^[^a-zA-Z0-9]/.test(ascii) && ascii.length <= 4) {
      index.set(ascii, emojiId);
    }
  }

  for (const [ascii, emojiId] of Object.entries(CURATED_ASCII)) {
    if (!index.has(ascii) && data.emojis[emojiId]) {
      index.set(ascii, emojiId);
    }
  }

  return index;
}

export function buildAsciiCandidates(asciiIndex: Map<string, string>): string[] {
  return Array.from(asciiIndex.keys()).sort((first, second) => second.length - first.length);
}

const BOUNDARY_BEFORE = /(?:^|[\s\n])$/;
const BOUNDARY_AFTER = /^(?:[\s\n]|$)/;

export function matchAscii(
  input: string,
  position: number,
  asciiIndex: Map<string, string>,
  asciiCandidates = buildAsciiCandidates(asciiIndex),
): { ascii: string; emojiId: string } | undefined {
  const before = input.slice(0, position);
  if (position > 0 && !BOUNDARY_BEFORE.test(before)) {
    return undefined;
  }

  for (const ascii of asciiCandidates) {
    if (!input.startsWith(ascii, position)) continue;

    const after = input.slice(position + ascii.length);
    if (BOUNDARY_AFTER.test(after)) {
      const emojiId = asciiIndex.get(ascii);
      if (emojiId) {
        return { ascii, emojiId };
      }
    }
  }

  return undefined;
}
