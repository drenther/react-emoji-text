import { cleanup, render, screen } from '@testing-library/react';
import { createRef, isValidElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import Emoji, { toArray } from '../src/compat/index';
import { EmojiText } from '../src/react/emoji-text';
import { EmojiProvider, useEmojiContext } from '../src/react/provider';
import type { EmojiData } from '../src/core/types';

afterEach(() => cleanup());

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
    },
    aliases: {},
    categories: [{ id: 'people', emojis: ['wave'] }],
  };
}

describe('EmojiText', () => {
  const data = createMockData();

  it('renders native output without per-token DOM wrappers', () => {
    const { container } = render(
      <EmojiProvider data={data}>
        <EmojiText>hello :wave:</EmojiText>
      </EmojiProvider>,
    );

    expect(container.innerHTML).toBe('<span>hello 👋</span>');
  });

  it('throws a helpful error when used without an EmojiProvider', () => {
    function ContextReader() {
      useEmojiContext();
      return null;
    }

    expect(() => render(<ContextReader />)).toThrow(
      'useEmojiContext must be used within an EmojiProvider',
    );
  });

  it('renders unknown shortcodes unchanged by default', () => {
    const { container } = render(
      <EmojiProvider data={data}>
        <EmojiText>hello :missing:</EmojiText>
      </EmojiProvider>,
    );

    expect(container.innerHTML).toBe('<span>hello :missing:</span>');
  });

  it('forwards HTML props and refs to the selected wrapper element', () => {
    const ref = createRef<HTMLElement>();

    render(
      <EmojiProvider data={data}>
        <EmojiText as="p" data-testid="message" ref={ref} title="Greeting">
          hello :wave:
        </EmojiText>
      </EmojiProvider>,
    );

    const message = screen.getByTestId('message');
    expect(message.tagName).toBe('P');
    expect(message).toHaveAttribute('title', 'Greeting');
    expect(ref.current).toBe(message);
  });

  it('renders custom emojis as images by default', () => {
    render(
      <EmojiProvider
        data={data}
        customEmojis={[
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
        ]}
      >
        <EmojiText>:partyparrot:</EmojiText>
      </EmojiProvider>,
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/partyparrot.gif');
    expect(image).toHaveAttribute('alt', 'partyparrot');
  });

  it('falls back to the original match when a custom emoji has no image source', () => {
    const { container } = render(
      <EmojiProvider
        data={data}
        customEmojis={[
          {
            id: 'custom',
            name: 'Custom',
            emojis: [{ id: 'broken', name: 'Broken', skins: [] }],
          },
        ]}
      >
        <EmojiText>:broken:</EmojiText>
      </EmojiProvider>,
    );

    expect(container.innerHTML).toBe('<span>:broken:</span>');
  });

  it('uses per-instance image templates with the resolved skin unified', () => {
    const { container } = render(
      <EmojiProvider data={data}>
        <EmojiText set="apple" defaultSkin={3} imageUrlTemplate="/emoji/{set}/{unified}-{skin}.png">
          :wave:
        </EmojiText>
      </EmojiProvider>,
    );

    const image = screen.getByRole('img');
    expect(image.getAttribute('src')).toBe('/emoji/apple/1F44B-1F3FC-3.png');
    expect(container.firstElementChild).not.toHaveAttribute('imageUrlTemplate');
  });

  it('prefers getImageUrl over imageUrlTemplate', () => {
    render(
      <EmojiProvider data={data}>
        <EmojiText
          getImageUrl={(emoji, context) => `/custom/${emoji.id}/${context.unified}.png`}
          imageUrlTemplate="/ignored/{unified}.png"
          set="apple"
        >
          :wave:
        </EmojiText>
      </EmojiProvider>,
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', '/custom/wave/1F44B.png');
  });

  it('falls back to native rendering when an image set has no configured assets', () => {
    const { container } = render(
      <EmojiProvider data={data}>
        <EmojiText set="apple">:wave:</EmojiText>
      </EmojiProvider>,
    );

    expect(container.innerHTML).toBe('<span>👋</span>');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('uses provider image templates when the instance does not override rendering', () => {
    render(
      <EmojiProvider data={data} set="apple" imageUrlTemplate="/emoji/{set}/{unified}.png">
        <EmojiText>:wave:</EmojiText>
      </EmojiProvider>,
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', '/emoji/apple/1F44B.png');
  });

  it('does not apply onlyEmojiClassName to empty content', () => {
    const { container } = render(
      <EmojiProvider data={data}>
        <EmojiText className="message" onlyEmojiClassName="jumbo">
          {''}
        </EmojiText>
      </EmojiProvider>,
    );

    expect(container.firstElementChild).toHaveClass('message');
    expect(container.firstElementChild).not.toHaveClass('jumbo');
  });

  it('combines wrapper classes and applies emoji classes to rendered images', () => {
    const { container } = render(
      <EmojiProvider data={data}>
        <EmojiText
          className="copy"
          emojiClassName="emoji"
          imageUrlTemplate="/emoji/{unified}.png"
          onlyEmojiClassName="only"
          set="apple"
        >
          :wave:
        </EmojiText>
      </EmojiProvider>,
    );

    expect(container.firstElementChild).toHaveClass('copy', 'only');
    expect(screen.getByRole('img')).toHaveClass('emoji');
  });

  it('uses per-instance aliases for tokenization', () => {
    const { container } = render(
      <EmojiProvider data={data}>
        <EmojiText extraAliases={{ hello: 'wave' }}>:hello:</EmojiText>
      </EmojiProvider>,
    );

    expect(container.innerHTML).toBe('<span>👋</span>');
  });

  it('renders sprite config as a cropped sprite span', () => {
    render(
      <EmojiProvider data={data}>
        <EmojiText
          set="apple"
          sprite={{
            src: '/sheet.png',
            size: 20,
            columns: 4,
            sheet: { '1F44B': { x: 1, y: 2 } },
          }}
        >
          :wave:
        </EmojiText>
      </EmojiProvider>,
    );

    const emoji = screen.getByRole('img');
    expect(emoji).toHaveStyle({
      backgroundImage: 'url(/sheet.png)',
      backgroundPosition: '-20px -40px',
    });
  });

  it('resolves sprite sheet coordinates case-insensitively', () => {
    render(
      <EmojiProvider data={data}>
        <EmojiText
          set="apple"
          sprite={{
            src: '/sheet.png',
            size: 20,
            columns: 4,
            sheet: { '1f44b': { x: 2, y: 3 } },
          }}
        >
          :wave:
        </EmojiText>
      </EmojiProvider>,
    );

    expect(screen.getByRole('img')).toHaveStyle({
      backgroundPosition: '-40px -60px',
    });
  });

  it('falls back to native rendering when sprite coordinates are missing', () => {
    const { container } = render(
      <EmojiProvider data={data}>
        <EmojiText set="apple" sprite={{ src: '/sheet.png', size: 20, columns: 4, sheet: {} }}>
          :wave:
        </EmojiText>
      </EmojiProvider>,
    );

    expect(container.innerHTML).toBe('<span>👋</span>');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('returns EmojiText.Emoji slot output without adding DOM wrappers', () => {
    const { container } = render(
      <EmojiProvider data={data}>
        <EmojiText text="hello :wave:">
          <EmojiText.Emoji>
            {(token) => <strong data-testid="emoji">{token.native}</strong>}
          </EmojiText.Emoji>
        </EmojiText>
      </EmojiProvider>,
    );

    expect(container.innerHTML).toBe('<span>hello <strong data-testid="emoji">👋</strong></span>');
  });

  it('returns EmojiText.Unknown slot output for unknown shortcodes', () => {
    const { container } = render(
      <EmojiProvider data={data}>
        <EmojiText text="hello :missing:">
          <EmojiText.Unknown>
            {(token) => <code data-testid="unknown">{token.shortcode}</code>}
          </EmojiText.Unknown>
        </EmojiText>
      </EmojiProvider>,
    );

    expect(container.innerHTML).toBe(
      '<span>hello <code data-testid="unknown">missing</code></span>',
    );
  });

  it('discovers slot components inside fragments', () => {
    const { container } = render(
      <EmojiProvider data={data}>
        <EmojiText text=":wave:">
          <>
            <EmojiText.Emoji>{(token) => <em>{token.shortcode}</em>}</EmojiText.Emoji>
          </>
        </EmojiText>
      </EmojiProvider>,
    );

    expect(container.innerHTML).toBe('<span><em>wave</em></span>');
  });
});

describe('compat', () => {
  it('parses with bundled emoji data when no options are provided', () => {
    const [text, emoji] = toArray('hello 👋');

    expect(text).toBe('hello ');
    expect(isValidElement(emoji)).toBe(true);
  });

  it('returns strings and keyed React elements from toArray', () => {
    const [text, emoji] = toArray('hello :wave:', { data: createMockData() });

    expect(text).toBe('hello ');
    expect(isValidElement(emoji)).toBe(true);
    expect(isValidElement(emoji) ? emoji.key : undefined).toBeTruthy();
  });

  it('gives repeated emoji elements stable unique keys', () => {
    const [firstEmoji, text, secondEmoji] = toArray(':wave: :wave:', { data: createMockData() });

    expect(text).toBe(' ');
    expect(isValidElement(firstEmoji)).toBe(true);
    expect(isValidElement(secondEmoji)).toBe(true);
    expect(isValidElement(firstEmoji) ? firstEmoji.key : undefined).not.toBe(
      isValidElement(secondEmoji) ? secondEmoji.key : undefined,
    );
  });

  it('renders native emoji wrappers and leaves unknown shortcodes unchanged from toArray', () => {
    const { container } = render(
      <>{toArray('hello :wave: :missing:', { data: createMockData() })}</>,
    );

    expect(container.innerHTML).toBe('hello <span title="wave">👋</span> :missing:');
  });

  it('returns custom emojis as keyed images from toArray', () => {
    const [emoji] = toArray(':partyparrot:', {
      data: createMockData(),
      customEmojis: [
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
      ],
    });

    expect(isValidElement(emoji) ? emoji.key : undefined).toBeTruthy();

    render(<>{emoji}</>);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/partyparrot.gif');
    expect(image).toHaveAttribute('alt', 'partyparrot');
  });

  it('matches ASCII by default and respects the ascii option', () => {
    const data = { ...createMockData(), aliases: { ':)': 'wave' } };
    const [text, emoji] = toArray('hello :)', { data });

    expect(text).toBe('hello ');
    expect(isValidElement(emoji)).toBe(true);
    expect(toArray('hello :)', { data, ascii: false })).toEqual(['hello :)']);
  });

  it('applies onlyEmojiClassName only when the compat wrapper contains only emoji', () => {
    const { rerender } = render(
      <Emoji
        className="message"
        data-testid="message"
        onlyEmojiClassName="jumbo"
        options={{ data: createMockData() }}
        text=":wave:"
      />,
    );

    expect(screen.getByTestId('message')).toHaveClass('message', 'jumbo');

    rerender(
      <Emoji
        className="message"
        data-testid="message"
        onlyEmojiClassName="jumbo"
        options={{ data: createMockData() }}
        text="hello :wave:"
      />,
    );

    expect(screen.getByTestId('message')).toHaveClass('message');
    expect(screen.getByTestId('message')).not.toHaveClass('jumbo');
  });

  it('uses the svg prop to select an image set when assets are configured', () => {
    render(
      <Emoji
        options={{ data: createMockData(), imageUrlTemplate: '/emoji/{set}/{unified}.png' }}
        svg
        text=":wave:"
      />,
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', '/emoji/apple/1F44B.png');
  });

  it('forwards refs and HTML props to the compat wrapper', () => {
    const ref = createRef<HTMLSpanElement>();

    render(
      <Emoji
        aria-label="Greeting"
        data-testid="message"
        options={{ data: createMockData() }}
        ref={ref}
        text="hello :wave:"
      />,
    );

    const message = screen.getByTestId('message');
    expect(message).toHaveAttribute('aria-label', 'Greeting');
    expect(ref.current).toBe(message);
  });
});
