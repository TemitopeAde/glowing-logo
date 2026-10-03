import type { TracedShape } from "../../../src/extensions/site/widgets/electric-logo/lib/trace";

export interface Placement {
  fit: number;
  ox: number;
  oy: number;
  unit: number;
}

/** Same fit as the widget engine's `place`: centred, `scale` of the container. */
export const place = (shape: TracedShape, scale: number, width: number, height: number): Placement => {
  const fit = Math.max(1e-4, Math.min((width * scale) / shape.logoWidth, (height * scale) / shape.logoHeight));
  return {
    fit,
    ox: width / 2 - (shape.pad + shape.logoWidth / 2) * fit,
    oy: height / 2 - (shape.pad + shape.logoHeight / 2) * fit,
    unit: (Math.max(shape.logoWidth, shape.logoHeight) * fit) / 100,
  };
};

export const smooth = (k: number) => k * k * (3 - 2 * k);

/** Deterministic PRNG (mulberry32), so every render paints the same arcs. */
export const seeded = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
