export const LOCAL_FALLBACK_ICON = '/placeholder.svg';

export function buildCdnIconUrl(itemId: string): string {
  return `https://render.albiononline.com/v1/item/${itemId}.png?size=64`;
}

