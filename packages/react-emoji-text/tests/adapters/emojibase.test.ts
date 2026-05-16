import { describe, expect, it } from 'vitest';
import { fromEmojibase } from '../../src/adapters/emojibase';
import type {
  EmojibaseCompactEmoji,
  EmojibaseEmoji,
  EmojibaseShortcodes,
} from '../../src/adapters/types';
import { tokenize } from '../../src/core/tokenize';

function createFullEmojis(): EmojibaseEmoji[] {
  return [
    {
      label: 'waving hand',
      hexcode: '1F44B',
      emoji: '\u{1F44B}',
      text: '',
      type: 1,
      order: 186,
      group: 1,
      subgroup: 16,
      version: 0.6,
      skins: [
        {
          label: 'waving hand: light skin tone',
          hexcode: '1F44B-1F3FB',
          emoji: '\u{1F44B}\u{1F3FB}',
          text: '',
          type: 1,
          order: 187,
          group: 1,
          subgroup: 16,
          version: 1,
          tone: 1,
        },
        {
          label: 'waving hand: medium-light skin tone',
          hexcode: '1F44B-1F3FC',
          emoji: '\u{1F44B}\u{1F3FC}',
          text: '',
          type: 1,
          order: 188,
          group: 1,
          subgroup: 16,
          version: 1,
          tone: 2,
        },
        {
          label: 'waving hand: medium skin tone',
          hexcode: '1F44B-1F3FD',
          emoji: '\u{1F44B}\u{1F3FD}',
          text: '',
          type: 1,
          order: 189,
          group: 1,
          subgroup: 16,
          version: 1,
          tone: 3,
        },
        {
          label: 'waving hand: medium-dark skin tone',
          hexcode: '1F44B-1F3FE',
          emoji: '\u{1F44B}\u{1F3FE}',
          text: '',
          type: 1,
          order: 190,
          group: 1,
          subgroup: 16,
          version: 1,
          tone: 4,
        },
        {
          label: 'waving hand: dark skin tone',
          hexcode: '1F44B-1F3FF',
          emoji: '\u{1F44B}\u{1F3FF}',
          text: '',
          type: 1,
          order: 191,
          group: 1,
          subgroup: 16,
          version: 1,
          tone: 5,
        },
      ],
    },
    {
      label: 'grinning face',
      hexcode: '1F600',
      emoji: '\u{1F600}',
      text: '',
      type: 1,
      order: 1,
      group: 0,
      subgroup: 0,
      version: 1,
    },
    {
      label: 'winking face',
      hexcode: '1F609',
      emoji: '\u{1F609}',
      text: '',
      type: 1,
      order: 10,
      group: 0,
      subgroup: 0,
      version: 0.6,
      emoticon: ';)',
    },
    {
      label: 'grinning face with smiling eyes',
      hexcode: '1F604',
      emoji: '\u{1F604}',
      text: '',
      type: 1,
      order: 4,
      group: 0,
      subgroup: 0,
      version: 0.6,
      emoticon: ':D',
    },
  ];
}

function createCompactEmojis(): EmojibaseCompactEmoji[] {
  return [
    {
      label: 'waving hand',
      hexcode: '1F44B',
      unicode: '\u{1F44B}',
      order: 186,
      group: 1,
      tags: ['wave', 'hand'],
      skins: [
        {
          label: 'waving hand: light skin tone',
          hexcode: '1F44B-1F3FB',
          unicode: '\u{1F44B}\u{1F3FB}',
          order: 187,
          group: 1,
        },
      ],
    },
    {
      label: 'grinning face',
      hexcode: '1F600',
      unicode: '\u{1F600}',
      order: 1,
      group: 0,
    },
  ];
}

function createShortcodes(): EmojibaseShortcodes {
  return {
    '1F44B': 'wave',
    '1F600': ['grinning', 'grinning_face'],
    '1F609': 'wink',
    '1F604': 'smile',
  };
}

describe('fromEmojibase', () => {
  describe('basic transformation', () => {
    it('produces valid EmojiData from full format', () => {
      const result = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      expect(result.emojis).toBeDefined();
      expect(result.aliases).toBeDefined();
      expect(result.categories).toBeDefined();
    });

    it('uses first shortcode as emoji ID', () => {
      const result = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      expect(result.emojis['wave']).toBeDefined();
      expect(result.emojis['wave'].id).toBe('wave');
      expect(result.emojis['wave'].name).toBe('waving hand');
    });

    it('falls back to hexcode as ID when no shortcodes provided', () => {
      const result = fromEmojibase(createFullEmojis());
      expect(result.emojis['1F44B']).toBeDefined();
      expect(result.emojis['1F44B'].id).toBe('1F44B');
    });

    it('maps tags to keywords', () => {
      const emojis: EmojibaseEmoji[] = [
        {
          label: 'waving hand',
          hexcode: '1F44B',
          emoji: '\u{1F44B}',
          text: '',
          type: 1,
          version: 0.6,
          tags: ['wave', 'hand', 'hello'],
        },
      ];
      const result = fromEmojibase(emojis);
      expect(result.emojis['1F44B'].keywords).toEqual(['wave', 'hand', 'hello']);
    });

    it('defaults to empty keywords when tags are missing', () => {
      const emojis: EmojibaseEmoji[] = [
        {
          label: 'grinning face',
          hexcode: '1F600',
          emoji: '\u{1F600}',
          text: '',
          type: 1,
          version: 1,
        },
      ];
      const result = fromEmojibase(emojis);
      expect(result.emojis['1F600'].keywords).toEqual([]);
    });
  });

  describe('shortcode merging', () => {
    it('maps extra shortcodes as aliases on the entry', () => {
      const result = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      expect(result.emojis['grinning'].aliases).toEqual(['grinning_face']);
    });

    it('adds extra shortcodes to the top-level aliases record', () => {
      const result = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      expect(result.aliases['grinning_face']).toBe('grinning');
    });

    it('does not create aliases entry for single shortcode', () => {
      const result = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      expect(result.emojis['wave'].aliases).toBeUndefined();
    });
  });

  describe('skin tone mapping', () => {
    it('includes base skin as first entry', () => {
      const result = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      const wave = result.emojis['wave'];
      expect(wave.skins[0]).toEqual({
        unified: '1F44B',
        native: '\u{1F44B}',
      });
    });

    it('produces all 6 skin tone variants (base + 5 tones)', () => {
      const result = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      const wave = result.emojis['wave'];
      expect(wave.skins).toHaveLength(6);
      expect(wave.skins[1]).toEqual({
        unified: '1F44B-1F3FB',
        native: '\u{1F44B}\u{1F3FB}',
      });
      expect(wave.skins[5]).toEqual({
        unified: '1F44B-1F3FF',
        native: '\u{1F44B}\u{1F3FF}',
      });
    });

    it('produces single skin for emoji without variants', () => {
      const result = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      const grinning = result.emojis['grinning'];
      expect(grinning.skins).toHaveLength(1);
      expect(grinning.skins[0]).toEqual({
        unified: '1F600',
        native: '\u{1F600}',
      });
    });
  });

  describe('compact format', () => {
    it('produces valid EmojiData from compact format', () => {
      const result = fromEmojibase(createCompactEmojis(), { shortcodes: createShortcodes() });
      expect(result.emojis['wave']).toBeDefined();
      expect(result.emojis['wave'].skins[0].native).toBe('\u{1F44B}');
    });

    it('reads unicode field for native character', () => {
      const result = fromEmojibase(createCompactEmojis(), { shortcodes: createShortcodes() });
      expect(result.emojis['wave'].skins[0].native).toBe('\u{1F44B}');
      expect(result.emojis['wave'].skins[1].native).toBe('\u{1F44B}\u{1F3FB}');
    });

    it('handles compact skin tones', () => {
      const result = fromEmojibase(createCompactEmojis(), { shortcodes: createShortcodes() });
      const wave = result.emojis['wave'];
      expect(wave.skins).toHaveLength(2);
    });
  });

  describe('category grouping', () => {
    it('groups emojis by group integer into named categories', () => {
      const result = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      const categoryIds = result.categories.map((category) => category.id);
      expect(categoryIds).toContain('people-body');
      expect(categoryIds).toContain('smileys-emotion');
    });

    it('assigns emojis to correct categories', () => {
      const result = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      const peoplebody = result.categories.find((category) => category.id === 'people-body');
      expect(peoplebody?.emojis).toContain('wave');
    });

    it('uses fallback name for unknown group numbers', () => {
      const emojis: EmojibaseEmoji[] = [
        {
          label: 'test',
          hexcode: 'ABCD',
          emoji: 'X',
          text: '',
          type: 1,
          version: 1,
          group: 99,
        },
      ];
      const result = fromEmojibase(emojis);
      const category = result.categories.find((category) => category.id === 'group-99');
      expect(category).toBeDefined();
      expect(category?.emojis).toContain('ABCD');
    });
  });

  describe('emoticon/ASCII aliases', () => {
    it('maps string emoticon to aliases', () => {
      const result = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      expect(result.aliases[';)']).toBe('wink');
      expect(result.aliases[':D']).toBe('smile');
    });

    it('maps array emoticons to aliases', () => {
      const emojis: EmojibaseEmoji[] = [
        {
          label: 'face with tongue',
          hexcode: '1F61B',
          emoji: '\u{1F61B}',
          text: '',
          type: 1,
          version: 0.6,
          group: 0,
          emoticon: [':p', ':P'],
        },
      ];
      const shortcodes: EmojibaseShortcodes = { '1F61B': 'stuck_out_tongue' };
      const result = fromEmojibase(emojis, { shortcodes });
      expect(result.aliases[':p']).toBe('stuck_out_tongue');
      expect(result.aliases[':P']).toBe('stuck_out_tongue');
    });
  });

  describe('round-trip with tokenizer', () => {
    it('tokenizes shortcodes from emojibase adapter output', () => {
      const data = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      const tokens = tokenize('hello :wave:', { data });
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: 'text', value: 'hello ' });
      expect(tokens[1]).toMatchObject({
        type: 'emoji',
        source: 'shortcode',
        shortcode: 'wave',
      });
    });

    it('tokenizes unicode from emojibase adapter output', () => {
      const data = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      const tokens = tokenize('hello \u{1F44B}', { data });
      expect(tokens).toHaveLength(2);
      expect(tokens[1]).toMatchObject({
        type: 'emoji',
        source: 'unicode',
        native: '\u{1F44B}',
      });
    });

    it('tokenizes ASCII emoticons from emojibase adapter output', () => {
      const data = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      const tokens = tokenize('hello ;)', { data, ascii: true });
      expect(tokens).toHaveLength(2);
      expect(tokens[1]).toMatchObject({
        type: 'emoji',
        source: 'ascii',
      });
    });

    it('tokenizes alias shortcodes from emojibase adapter output', () => {
      const data = fromEmojibase(createFullEmojis(), { shortcodes: createShortcodes() });
      const tokens = tokenize(':grinning_face:', { data });
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({
        type: 'emoji',
        source: 'shortcode',
        shortcode: 'grinning_face',
      });
    });
  });

  describe('integration with real emojibase-data', () => {
    it('transforms real emojibase-data/en/data.json', async () => {
      const emojis = (await import('emojibase-data/en/data.json')).default;
      const shortcodes = (await import('emojibase-data/en/shortcodes/emojibase.json')).default;
      const data = fromEmojibase(emojis, { shortcodes });

      expect(Object.keys(data.emojis).length).toBeGreaterThan(1000);
      expect(data.categories.length).toBeGreaterThan(0);

      const tokens = tokenize('hello :wave: world \u{1F600}', { data });
      expect(tokens).toHaveLength(4);
      expect(tokens[1]).toMatchObject({ type: 'emoji', shortcode: 'wave' });
      expect(tokens[3]).toMatchObject({ type: 'emoji', source: 'unicode' });
    });

    it('transforms real emojibase-data/en/compact.json', async () => {
      const emojis = (await import('emojibase-data/en/compact.json')).default;
      const shortcodes = (await import('emojibase-data/en/shortcodes/emojibase.json')).default;
      const data = fromEmojibase(emojis, { shortcodes });

      expect(Object.keys(data.emojis).length).toBeGreaterThan(1000);

      const tokens = tokenize(':wave:', { data });
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({ type: 'emoji', shortcode: 'wave' });
    });
  });
});
