import type { Token } from '../core/types';

function tokenKeyBase(token: Token): string {
  switch (token.type) {
    case 'text':
      return `text:${token.value}`;
    case 'unknown':
      return `unknown:${token.match}`;
    case 'emoji':
      return [
        'emoji',
        token.emoji.id,
        token.source,
        token.shortcode ?? '',
        token.match,
        token.native,
      ].join(':');
  }
}

export function createTokenKeyFactory() {
  const seen = new Map<string, number>();

  return (token: Token) => {
    const base = tokenKeyBase(token);
    const occurrence = seen.get(base) ?? 0;
    seen.set(base, occurrence + 1);
    return occurrence === 0 ? base : `${base}:${occurrence}`;
  };
}
