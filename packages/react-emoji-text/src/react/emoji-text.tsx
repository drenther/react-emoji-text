'use client';

import {
  Children,
  Fragment,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  createElement,
  isValidElement,
  useMemo,
} from 'react';
import type {
  CustomEmojiCategory,
  EmojiData,
  EmojiToken,
  EmojiSet,
  GetImageUrl,
  SkinTone,
  SpriteConfig,
  Token,
  TokenizeOptions,
  UnknownToken,
} from '../core/types';
import { resolveImageUrlFn } from './image-url';
import { createTokenKeyFactory } from './keys';
import { useEmojiContext } from './provider';
import type { DefaultRenderOptions } from './render';
import { isOnlyEmoji, renderTokenDefault } from './render';
import { useTokens } from './use-tokens';

interface EmojiTextBaseProps {
  as?: keyof HTMLElementTagNameMap;
  className?: string;
  emojiClassName?: string;
  onlyEmojiClassName?: string;
  ref?: Ref<HTMLElement>;
}

type EmojiTextContentProps =
  | {
      children: string;
      text?: never;
    }
  | {
      children?: ReactNode;
      text: string;
    };

export type EmojiTextProps = EmojiTextBaseProps & EmojiTextContentProps;

export type EmojiTextComponentProps = EmojiTextProps &
  Omit<HTMLAttributes<HTMLElement>, 'children'> & {
    data?: EmojiData;
    customEmojis?: CustomEmojiCategory[];
    set?: EmojiSet;
    defaultSkin?: SkinTone;
    ascii?: boolean;
    getImageUrl?: GetImageUrl;
    imageUrlTemplate?: string;
    sprite?: SpriteConfig;
    extraAliases?: Record<string, string>;
  };

export interface EmojiTextEmojiProps {
  children: (token: EmojiToken) => ReactNode;
}

export interface EmojiTextUnknownProps {
  children: (token: UnknownToken) => ReactNode;
}

interface EmojiTextSlots {
  emoji?: EmojiTextEmojiProps['children'];
  unknown?: EmojiTextUnknownProps['children'];
}

type SlotChild = ReactNode | EmojiTextEmojiProps['children'] | EmojiTextUnknownProps['children'];

function EmojiTextEmoji(_props: EmojiTextEmojiProps) {
  return null;
}

EmojiTextEmoji.displayName = 'EmojiText.Emoji';

function EmojiTextUnknown(_props: EmojiTextUnknownProps) {
  return null;
}

EmojiTextUnknown.displayName = 'EmojiText.Unknown';

function collectSlots(children: ReactNode): EmojiTextSlots {
  const slots: EmojiTextSlots = {};
  collectSlotChildren(children, slots);
  return slots;
}

function collectSlotChildren(children: ReactNode, slots: EmojiTextSlots) {
  Children.forEach(children, (child) => {
    if (!isValidElement<{ children?: SlotChild }>(child)) return;

    if (child.type === Fragment) {
      collectSlotChildren(child.props.children as ReactNode, slots);
      return;
    }

    const renderer = child.props.children;

    if (child.type === EmojiTextEmoji && typeof renderer === 'function') {
      slots.emoji = renderer as EmojiTextEmojiProps['children'];
      return;
    }

    if (child.type === EmojiTextUnknown && typeof renderer === 'function') {
      slots.unknown = renderer as EmojiTextUnknownProps['children'];
    }
  });
}

interface TokenNodeProps {
  token: Token;
  slots: EmojiTextSlots;
  defaultRenderOptions: DefaultRenderOptions;
}

function TokenNode({ token, slots, defaultRenderOptions }: TokenNodeProps) {
  if (token.type === 'emoji' && slots.emoji) {
    return slots.emoji(token);
  }

  if (token.type === 'unknown' && slots.unknown) {
    return slots.unknown(token);
  }

  return renderTokenDefault(token, defaultRenderOptions);
}

function EmojiTextRoot({
  as = 'span',
  className,
  emojiClassName,
  onlyEmojiClassName,
  ref,
  children,
  text,
  data: dataProp,
  customEmojis: customEmojisProp,
  set: setProp,
  defaultSkin: defaultSkinProp,
  ascii: asciiProp,
  getImageUrl: getImageUrlProp,
  imageUrlTemplate: imageUrlTemplateProp,
  sprite: spriteProp,
  extraAliases: extraAliasesProp,
  ...htmlProps
}: EmojiTextComponentProps) {
  const context = useEmojiContext();
  const set = setProp ?? context.config.set ?? 'native';
  const hasImageOverride =
    getImageUrlProp !== undefined || imageUrlTemplateProp !== undefined || spriteProp !== undefined;

  const resolvedGetImageUrl = useMemo(
    () =>
      hasImageOverride
        ? resolveImageUrlFn({
            getImageUrl: getImageUrlProp,
            imageUrlTemplate: imageUrlTemplateProp,
            sprite: spriteProp,
          })
        : context.resolvedGetImageUrl,
    [
      context.resolvedGetImageUrl,
      getImageUrlProp,
      hasImageOverride,
      imageUrlTemplateProp,
      spriteProp,
    ],
  );

  const tokenOverrides = useMemo<Partial<TokenizeOptions>>(
    () => ({
      ascii: asciiProp,
      customEmojis: customEmojisProp,
      data: dataProp,
      defaultSkin: defaultSkinProp,
      extraAliases: extraAliasesProp,
    }),
    [asciiProp, customEmojisProp, dataProp, defaultSkinProp, extraAliasesProp],
  );

  const sourceText = text ?? (typeof children === 'string' ? children : '');
  const slots = useMemo(() => collectSlots(children), [children]);
  const tokens = useTokens(sourceText, tokenOverrides);
  const onlyEmoji = useMemo(() => isOnlyEmoji(tokens), [tokens]);
  const defaultRenderOptions = useMemo<DefaultRenderOptions>(
    () => ({
      emojiClassName,
      getImageUrl: resolvedGetImageUrl,
      set,
      sprite: hasImageOverride ? spriteProp : context.config.sprite,
    }),
    [context.config.sprite, emojiClassName, hasImageOverride, resolvedGetImageUrl, set, spriteProp],
  );
  const createKey = createTokenKeyFactory();

  const wrapperClassName =
    [className, onlyEmoji && onlyEmojiClassName].filter(Boolean).join(' ') || undefined;

  const renderedContent = tokens.map((token) => (
    <TokenNode
      key={createKey(token)}
      token={token}
      slots={slots}
      defaultRenderOptions={defaultRenderOptions}
    />
  ));

  return createElement(as, { ...htmlProps, className: wrapperClassName, ref }, ...renderedContent);
}

export const EmojiText = Object.assign(EmojiTextRoot, {
  Emoji: EmojiTextEmoji,
  Unknown: EmojiTextUnknown,
});
