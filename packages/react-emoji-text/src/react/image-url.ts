import type { GetImageUrl, SpriteConfig } from '../core/types';

export interface ResolveImageUrlOptions {
  getImageUrl?: GetImageUrl;
  imageUrlTemplate?: string;
  sprite?: SpriteConfig;
}

function interpolateTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.split(`{${key}}`).join(value),
    template,
  );
}

export function resolveImageUrlFn({
  getImageUrl,
  sprite,
  imageUrlTemplate,
}: ResolveImageUrlOptions): GetImageUrl | undefined {
  if (getImageUrl) return getImageUrl;
  if (sprite) return undefined;
  if (!imageUrlTemplate) return undefined;

  return (_emoji, context) =>
    interpolateTemplate(imageUrlTemplate, {
      set: context.set,
      skin: String(context.skin),
      unified: context.unified,
    });
}
