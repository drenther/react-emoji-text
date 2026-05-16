import type { EmojiData } from '../core/types';

export function fromEmojiMart(data: unknown): EmojiData {
  const record = data as Record<string, unknown>;
  if (!record.emojis || !record.aliases || !record.categories) {
    throw new Error(
      'Invalid @emoji-mart/data: expected "emojis", "aliases", and "categories" fields',
    );
  }
  return data as EmojiData;
}
