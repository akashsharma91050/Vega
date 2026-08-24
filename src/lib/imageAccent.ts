import {cache, getColors} from 'react-native-image-colors';
import {mixHex} from '../theme/seeds';

const IMAGE_COLOR_FALLBACK = '#FFFFFF';
const accentCache = new Map<string, Promise<string>>();

export const clearImageAccentCache = (): void => {
  accentCache.clear();
};

export const scoreHexColor = (hex?: string): number => {
  if (!hex || typeof hex !== 'string') return -1;
  const clean = hex.trim();
  if (!clean.startsWith('#') || clean.length < 7) return -1;
  if (clean.toUpperCase() === IMAGE_COLOR_FALLBACK.toUpperCase()) return -1;

  const red = parseInt(clean.slice(1, 3), 16);
  const green = parseInt(clean.slice(3, 5), 16);
  const blue = parseInt(clean.slice(5, 7), 16);
  if (isNaN(red) || isNaN(green) || isNaN(blue)) return -1;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const saturation = max ? (max - min) / max : 0;
  const brightness = max / 255;

  // Filter out dark muddy colors, near-white washed out colors, or gray/monochrome
  if (brightness < 0.14 || brightness > 0.96 || saturation < 0.12) {
    return -1;
  }

  // Exact desktop weighting: high saturation + target brightness ~0.62
  return 1 + saturation * 5 + (1 - Math.abs(brightness - 0.62)) * 3;
};

export const selectImageAccent = (
  imageColors: Awaited<ReturnType<typeof getColors>>,
): string | undefined => {
  let rawCandidates: (string | undefined)[] = [];

  if (imageColors.platform === 'android') {
    rawCandidates = [
      imageColors.vibrant,
      imageColors.dominant,
      imageColors.darkVibrant,
      imageColors.lightVibrant,
      imageColors.muted,
      imageColors.darkMuted,
      imageColors.lightMuted,
      imageColors.average,
    ];
  } else if (imageColors.platform === 'ios') {
    rawCandidates = [
      imageColors.primary,
      imageColors.secondary,
      imageColors.detail,
      imageColors.background,
    ];
  } else {
    rawCandidates = [
      (imageColors as any).vibrant,
      (imageColors as any).dominant,
      (imageColors as any).darkVibrant,
      (imageColors as any).lightVibrant,
      (imageColors as any).muted,
    ];
  }

  const validCandidates = rawCandidates.filter(
    (c): c is string =>
      typeof c === 'string' &&
      c.toUpperCase() !== IMAGE_COLOR_FALLBACK.toUpperCase(),
  );

  if (validCandidates.length === 0) return undefined;

  const scored = validCandidates
    .map(hex => ({hex, score: scoreHexColor(hex)}))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored[0].hex;
  }

  return validCandidates[0];
};

export const extractImageAccent = async (
  imageUri: string,
  cacheKey: string,
): Promise<string | undefined> => {
  try {
    const imageColors = await getColors(imageUri, {
      cache: true,
      fallback: IMAGE_COLOR_FALLBACK,
      key: cacheKey,
      pixelSpacing: 8,
    });
    const accent = selectImageAccent(imageColors);
    if (!accent) {
      cache.removeItem(cacheKey);
    }
    return accent;
  } catch {
    cache.removeItem(cacheKey);
    return undefined;
  }
};

export const getImageAccent = (
  imageUri: string | undefined,
  fallback: string,
): Promise<string> => {
  if (!imageUri) {
    return Promise.resolve(fallback);
  }

  const cached = accentCache.get(imageUri);
  if (cached) {
    return cached;
  }

  const accent = extractImageAccent(
    imageUri,
    `shared-image-accent-v2:${imageUri}`,
  ).then(extractedColor =>
    extractedColor ? mixHex(extractedColor, '#FFFFFF', 0.35) : fallback,
  );

  accentCache.set(imageUri, accent);
  return accent;
};
