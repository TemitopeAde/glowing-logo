import type { RefObject } from 'react';

const FALLBACK = { core: '#ecc7ff', glow: '#ad6dff' };
const REFRESH_EVERY = 15;

let probe: CanvasRenderingContext2D | null = null;

/** Normalises any CSS colour (named, rgb(), hsl(), #rgb) to #rrggbb using the canvas parser. */
const toHex = (value: string, fallback: string) => {
  const raw = value.trim();
  if (!raw) return fallback;
  probe ??= document.createElement('canvas').getContext('2d');
  if (!probe) return fallback;
  probe.fillStyle = fallback;
  probe.fillStyle = raw;
  const parsed = String(probe.fillStyle);
  if (parsed.startsWith('#')) return parsed;
  const channels = parsed.match(/\d+(\.\d+)?/g);
  if (!channels || channels.length < 3) return fallback;
  return `#${channels
    .slice(0, 3)
    .map((c) => Math.round(Number(c)).toString(16).padStart(2, '0'))
    .join('')}`;
};

/**
 * Reads the strand colours from the root's `--core-color` and `--glow-color`, which the editor
 * exposes as colour controls. Polled every few frames so editor changes apply live.
 */
export const createColorReader = (root: RefObject<HTMLElement>) => {
  let frame = 0;
  let cached = FALLBACK;
  return () => {
    const element = root.current;
    if (element && frame++ % REFRESH_EVERY === 0) {
      const style = getComputedStyle(element);
      cached = {
        core: toHex(style.getPropertyValue('--core-color'), FALLBACK.core),
        glow: toHex(style.getPropertyValue('--glow-color'), FALLBACK.glow),
      };
    }
    return cached;
  };
};
