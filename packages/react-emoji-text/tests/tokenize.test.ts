import { describe, expect, it } from 'vitest';
import { buildAsciiCandidates, buildAsciiIndex, matchAscii } from '../src/core/ascii';
import { buildIndexes } from '../src/core/indexes';
import { resolveSkin, skinToneShortcodeToTone } from '../src/core/skin';
import { tokenize } from '../src/core/tokenize';
import type { EmojiData, EmojiEntry } from '../src/core/types';

function createMockData(): EmojiData {
  return {
    emojis: {
      wave: {
        id: 'wave',
        name: 'Waving Hand',
        keywords: ['wave', 'hand'],
        skins: [
          { unified: '1F44B', native: '\u{1F44B}' },
          { unified: '1F44B-1F3FB', native: '\u{1F44B}\u{1F3FB}' },
          { unified: '1F44B-1F3FC', native: '\u{1F44B}\u{1F3FC}' },
          { unified: '1F44B-1F3FD', native: '\u{1F44B}\u{1F3FD}' },
          { unified: '1F44B-1F3FE', native: '\u{1F44B}\u{1F3FE}' },
          { unified: '1F44B-1F3FF', native: '\u{1F44B}\u{1F3FF}' },
        ],
      },
      grinning: {
        id: 'grinning',
        name: 'Grinning Face',
        keywords: ['grinning'],
        skins: [{ unified: '1F600', native: '\u{1F600}' }],
      },
      slightly_smiling_face: {
        id: 'slightly_smiling_face',
        name: 'Slightly Smiling Face',
        keywords: ['smile'],
        skins: [{ unified: '1F642', native: '\u{1F642}' }],
      },
      heart: {
        id: 'heart',
        name: 'Red Heart',
        keywords: ['love'],
        skins: [{ unified: '2764-FE0F', native: '❤️' }],
      },
    },
    aliases: {
      ':)': 'slightly_smiling_face',
      '<3': 'heart',
    },
    categories: [{ id: 'people', emojis: ['wave', 'grinning', 'slightly_smiling_face', 'heart'] }],
  };
}

describe('tokenize', () => {
  const data = createMockData();

  it('parses plain text', () => {
    const tokens = tokenize('hello world', { data });
    expect(tokens).toEqual([{ type: 'text', value: 'hello world' }]);
  });

  it('parses unicode emojis', () => {
    const tokens = tokenize('hello \u{1F44B}', { data });
    expect(tokens).toHaveLength(2);
    expect(tokens[0]).toEqual({ type: 'text', value: 'hello ' });
    expect(tokens[1]).toMatchObject({
      type: 'emoji',
      source: 'unicode',
      native: '\u{1F44B}',
    });
  });

  it('preserves explicit unicode skin tone modifiers', () => {
    const tokens = tokenize('\u{1F44B}\u{1F3FD}', { data, defaultSkin: 1 });
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({
      type: 'emoji',
      source: 'unicode',
      native: '\u{1F44B}\u{1F3FD}',
      skin: 4,
    });
  });

  it('parses shortcodes', () => {
    const tokens = tokenize('hello :wave:', { data });
    expect(tokens).toHaveLength(2);
    expect(tokens[0]).toEqual({ type: 'text', value: 'hello ' });
    expect(tokens[1]).toMatchObject({
      type: 'emoji',
      source: 'shortcode',
      shortcode: 'wave',
    });
  });

  it('applies skin tone suffixes attached to shortcodes', () => {
    const tokens = tokenize(':wave::skin-tone-3:', { data, defaultSkin: 1 });

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({
      type: 'emoji',
      match: ':wave::skin-tone-3:',
      native: '\u{1F44B}\u{1F3FC}',
      skin: 3,
    });
  });

  it('handles unknown shortcodes', () => {
    const tokens = tokenize('hello :nonexistent:', { data });
    expect(tokens).toHaveLength(2);
    expect(tokens[0]).toEqual({ type: 'text', value: 'hello ' });
    expect(tokens[1]).toEqual({
      type: 'unknown',
      shortcode: 'nonexistent',
      match: ':nonexistent:',
    });
  });

  it('parses ASCII emoticons with boundary check', () => {
    const tokens = tokenize('hello :)', { data, ascii: true });
    expect(tokens).toHaveLength(2);
    expect(tokens[0]).toEqual({ type: 'text', value: 'hello ' });
    expect(tokens[1]).toMatchObject({
      type: 'emoji',
      source: 'ascii',
    });
  });

  it('does not match ASCII in the middle of words', () => {
    const tokens = tokenize('hello:)', { data, ascii: true });
    expect(tokens).toEqual([{ type: 'text', value: 'hello:)' }]);
  });

  it('disables ASCII when ascii=false', () => {
    const tokens = tokenize('hello :)', { data, ascii: false });
    expect(tokens).toEqual([{ type: 'text', value: 'hello :)' }]);
  });

  it('parses mixed content', () => {
    const tokens = tokenize('hello :wave: world \u{1F600}', { data });
    expect(tokens).toHaveLength(4);
    expect(tokens[0]).toEqual({ type: 'text', value: 'hello ' });
    expect(tokens[1]).toMatchObject({ type: 'emoji', shortcode: 'wave' });
    expect(tokens[2]).toEqual({ type: 'text', value: ' world ' });
    expect(tokens[3]).toMatchObject({ type: 'emoji', source: 'unicode' });
  });

  it('does not reuse indexes across different data identities', () => {
    const firstData: EmojiData = {
      emojis: {
        first: {
          id: 'first',
          name: 'First',
          keywords: [],
          skins: [{ unified: '1F600', native: '\u{1F600}' }],
        },
      },
      aliases: {},
      categories: [{ id: 'test', emojis: ['first'] }],
    };
    const secondData: EmojiData = {
      emojis: {
        second: {
          id: 'second',
          name: 'Second',
          keywords: [],
          skins: [{ unified: '1F44B', native: '\u{1F44B}' }],
        },
      },
      aliases: {},
      categories: [{ id: 'test', emojis: ['second'] }],
    };

    expect(tokenize(':first:', { data: firstData })[0]).toMatchObject({
      type: 'emoji',
      shortcode: 'first',
    });
    expect(tokenize(':second:', { data: secondData })[0]).toMatchObject({
      type: 'emoji',
      shortcode: 'second',
    });
  });

  it('does not reuse cached indexes across different extra aliases', () => {
    const [withAlias] = tokenize(':hello:', { data, extraAliases: { hello: 'wave' } });
    const [withoutAlias] = tokenize(':hello:', { data });

    expect(withAlias).toMatchObject({ type: 'emoji', shortcode: 'hello' });
    expect(withoutAlias).toEqual({ type: 'unknown', shortcode: 'hello', match: ':hello:' });
  });

  it('resolves extraAliases that point to custom emoji IDs', () => {
    const customEmojis = [
      {
        id: 'custom',
        name: 'Custom',
        emojis: [
          {
            id: 'partyparrot',
            name: 'Party Parrot',
            skins: [{ src: 'https://example.com/partyparrot.gif' }],
          },
        ],
      },
    ];
    const tokens = tokenize(':dance:', {
      data,
      customEmojis,
      extraAliases: { dance: 'partyparrot' },
    });

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({
      type: 'emoji',
      shortcode: 'dance',
      source: 'custom',
    });
  });

  it('tokenizes long non-emoji text in linear time', () => {
    const longText = 'a'.repeat(50_000);
    const tokens = tokenize(longText, { data });

    expect(tokens).toEqual([{ type: 'text', value: longText }]);
  });
});

describe('skin tone', () => {
  it('resolves skin tone from shortcode suffix', () => {
    const tone = skinToneShortcodeToTone('skin-tone-3');
    expect(tone).toBe(3);
  });

  it('returns undefined for invalid skin tone shortcode', () => {
    const tone = skinToneShortcodeToTone('not-a-skin-tone');
    expect(tone).toBeUndefined();
  });

  it('resolves default skin on emoji', () => {
    const emoji: EmojiEntry = {
      id: 'wave',
      name: 'Waving Hand',
      keywords: [],
      skins: [
        { unified: '1F44B', native: '\u{1F44B}' },
        { unified: '1F44B-1F3FB', native: '\u{1F44B}\u{1F3FB}' },
        { unified: '1F44B-1F3FC', native: '\u{1F44B}\u{1F3FC}' },
      ],
    };
    const result = resolveSkin(emoji, undefined, 3);
    expect(result.native).toBe('\u{1F44B}\u{1F3FC}');
    expect(result.skin).toBe(3);
  });

  it('falls back to the base emoji when a requested skin is unavailable', () => {
    const emoji: EmojiEntry = {
      id: 'custom',
      name: 'Custom',
      keywords: [],
      skins: [{ unified: '1F600', native: '\u{1F600}' }],
    };

    const result = resolveSkin(emoji, 4, undefined);

    expect(result).toEqual({ native: '\u{1F600}', skin: 4 });
  });

  it('falls back to the base skin when a multi-skin emoji lacks the requested tone', () => {
    const emoji: EmojiEntry = {
      id: 'wave',
      name: 'Waving Hand',
      keywords: [],
      skins: [
        { unified: '1F44B', native: '\u{1F44B}' },
        { unified: '1F44B-1F3FB', native: '\u{1F44B}\u{1F3FB}' },
      ],
    };

    const result = resolveSkin(emoji, 6, undefined);

    expect(result).toEqual({ native: '\u{1F44B}', skin: 6 });
  });
});

describe('indexes', () => {
  const data = createMockData();

  it('builds unicode map', () => {
    const indexes = buildIndexes(data);
    expect(indexes.unicodeMap.get('\u{1F44B}')).toBe('wave');
    expect(indexes.unicodeMap.get('\u{1F600}')).toBe('grinning');
  });

  it('builds shortcode index', () => {
    const indexes = buildIndexes(data);
    expect(indexes.shortcodeIndex.get('wave')).toEqual({ emojiId: 'wave' });
  });

  it('indexes aliases defined directly on emoji entries', () => {
    const indexes = buildIndexes({
      ...data,
      emojis: {
        ...data.emojis,
        wave: { ...data.emojis.wave, aliases: ['hello'] },
      },
    });

    expect(indexes.shortcodeIndex.get('hello')).toEqual({ emojiId: 'wave' });
  });

  it('builds a sticky unicode regex to avoid quadratic scanning', () => {
    const indexes = buildIndexes(data);
    expect(indexes.unicodeRegex.sticky).toBe(true);
    expect(indexes.unicodeRegex.global).toBe(false);
  });

  it('includes custom emojis', () => {
    const indexes = buildIndexes(data, [
      {
        id: 'custom',
        name: 'Custom',
        emojis: [
          {
            id: 'partyparrot',
            name: 'Party Parrot',
            skins: [{ src: 'https://example.com/partyparrot.gif' }],
          },
        ],
      },
    ]);
    expect(indexes.shortcodeIndex.get('partyparrot')).toMatchObject({
      emojiId: 'partyparrot',
      isCustom: true,
    });
  });
});

describe('ascii', () => {
  const data = createMockData();

  it('builds ascii index from data aliases', () => {
    const index = buildAsciiIndex(data);
    expect(index.get(':)')).toBe('slightly_smiling_face');
    expect(index.get('<3')).toBe('heart');
  });

  it('matches ascii with boundary', () => {
    const index = buildAsciiIndex(data);
    const result = matchAscii('hello :)', 6, index);
    expect(result).toEqual({ ascii: ':)', emojiId: 'slightly_smiling_face' });
  });

  it('matches the longest ASCII candidate first', () => {
    const index = buildAsciiIndex(data);
    const result = matchAscii('hello :-)', 6, index);

    expect(result).toEqual({ ascii: ':-)', emojiId: 'slightly_smiling_face' });
  });

  it('builds longest-first ASCII candidates for repeated matching', () => {
    const index = buildAsciiIndex(data);
    const candidates = buildAsciiCandidates(index);

    expect(
      candidates.every(
        (candidate, index) => index === 0 || candidates[index - 1]!.length >= candidate.length,
      ),
    ).toBe(true);
    expect(candidates.indexOf(':-)')).toBeLessThan(candidates.indexOf(':)'));
  });

  it('matches ASCII with prebuilt candidates', () => {
    const index = buildAsciiIndex(data);
    const candidates = buildAsciiCandidates(index);

    expect(matchAscii('hello :-)', 6, index, candidates)).toEqual({
      ascii: ':-)',
      emojiId: 'slightly_smiling_face',
    });
  });

  it('rejects ascii without boundary', () => {
    const index = buildAsciiIndex(data);
    const result = matchAscii('hello:)', 5, index);
    expect(result).toBeUndefined();
  });
});
