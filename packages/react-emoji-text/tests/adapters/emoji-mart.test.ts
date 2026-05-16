import { describe, expect, it } from 'vitest';
import emojiMartData from '@emoji-mart/data';
import { fromEmojiMart } from '../../src/adapters/emoji-mart';

describe('fromEmojiMart', () => {
  it('passes through valid @emoji-mart/data', () => {
    const result = fromEmojiMart(emojiMartData);
    expect(result.emojis).toBeDefined();
    expect(result.aliases).toBeDefined();
    expect(result.categories).toBeDefined();
  });

  it('returns data conforming to EmojiData shape', () => {
    const result = fromEmojiMart(emojiMartData);
    const wave = result.emojis['wave'];
    expect(wave).toBeDefined();
    expect(wave.id).toBe('wave');
    expect(wave.skins.length).toBeGreaterThan(0);
    expect(wave.skins[0].unified).toBeDefined();
    expect(wave.skins[0].native).toBeDefined();
  });

  it('throws on missing emojis field', () => {
    expect(() => fromEmojiMart({ aliases: {}, categories: [] })).toThrow(
      'expected "emojis", "aliases", and "categories"',
    );
  });

  it('throws on missing aliases field', () => {
    expect(() => fromEmojiMart({ emojis: {}, categories: [] })).toThrow(
      'expected "emojis", "aliases", and "categories"',
    );
  });

  it('throws on missing categories field', () => {
    expect(() => fromEmojiMart({ emojis: {}, aliases: {} })).toThrow(
      'expected "emojis", "aliases", and "categories"',
    );
  });

  it('throws on null input', () => {
    expect(() => fromEmojiMart(null)).toThrow();
  });
});
