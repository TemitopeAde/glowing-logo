import { interpolateColors } from "remotion";
import { cursorAt, type CursorKey } from "../../kit/cursor";
import { clamp01, progress } from "../../kit/time";
import { RANGES, type NumberKey } from "../../../../src/extensions/site/widgets/electric-logo/settings";
import { CUES } from "./cues";
import { FIELD_W, FIELD_X, P, PANEL, PANEL_HEADER, SLIDER_TRACK_OFFSET, SWATCH, panelScroll, project } from "./layout";

const smooth = (k: number) => k * k * (3 - 2 * k);

/** World point of a panel content coordinate at the scroll position in effect at time t. */
const at = (t: number, x: number, contentY: number) => ({
  x: PANEL.x + x,
  y: PANEL.y + PANEL_HEADER + contentY - panelScroll(t),
});

export const sliderX = (key: NumberKey, value: number) => {
  const { min, max } = RANGES[key];
  return PANEL.x + FIELD_X + ((value - min) / (max - min)) * FIELD_W;
};

const sliderValueAtX = (key: NumberKey, x: number) => {
  const { min, max, step } = RANGES[key];
  const raw = min + clamp01((x - PANEL.x - FIELD_X) / FIELD_W) * (max - min);
  return key === "strands" ? Math.round(raw / step) * step : raw;
};

const handle = (t: number, key: NumberKey, row: number, value: number) => ({
  x: sliderX(key, value),
  y: at(t, 0, row + SLIDER_TRACK_OFFSET).y,
});

/** Palette chips in the color popover, as offsets from the swatch. */
export const PALETTE = ["#ffffff", "#ecc7ff", "#ad6dff", "#e6fdff", "#1fa9ff", "#2ef2c1"];
export const CHIP = { size: 34, gap: 10, dx: 76, dy: -14 };
export const chipCenter = (swatchRowY: number, t: number, index: number) => {
  const swatch = at(t, FIELD_X, swatchRowY + SWATCH.offset);
  return {
    x: swatch.x + CHIP.dx + 14 + index * (CHIP.size + CHIP.gap) + CHIP.size / 2,
    y: swatch.y + CHIP.dy + 14 + CHIP.size / 2,
  };
};

const CORE_PICK = 3;
const GLOW_PICK = 4;

const DRAGS: { key: NumberKey; row: number; from: number; to: number; start: number; end: number }[] = [
  { key: "strands", row: P.strands, from: 4, to: 6, start: CUES.strandsDrag, end: CUES.strandsRelease },
  { key: "crackle", row: P.crackle, from: 1.5, to: 3.2, start: CUES.crackleDrag, end: CUES.crackleRelease },
  { key: "arcs", row: P.arcs, from: 1, to: 3, start: CUES.arcsDrag, end: CUES.arcsRelease },
];

const buildKeys = (): CursorKey[] => {
  const upload = at(CUES.uploadHover, PANEL.w / 2, P.uploadButton.y + P.uploadButton.h / 2);
  const info = at(CUES.tooltipShow, FIELD_X + 104, P.coreColor + 11);
  const core = at(CUES.coreClick, FIELD_X + SWATCH.w / 2, P.coreColor + SWATCH.offset + SWATCH.h / 2);
  const glow = at(CUES.glowClick, FIELD_X + SWATCH.w / 2, P.glowColor + SWATCH.offset + SWATCH.h / 2);
  const keys: CursorKey[] = [
    { t: 0, x: 1720, y: 1180 },
    { t: CUES.editorIn + 0.6, x: 1720, y: 1180 },
    { t: CUES.uploadHover, ...upload, world: true },
    { t: CUES.uploadClick, ...upload, world: true, click: true },
    { t: CUES.uploadClick + 0.5, x: upload.x + 150, y: upload.y + 44, world: true },
    { t: CUES.uploadDone, x: upload.x + 150, y: upload.y + 44, world: true },
    { t: CUES.tooltipShow, ...info, world: true },
    { t: CUES.coreClick, ...core, world: true, click: true },
    { t: CUES.corePick, ...chipCenter(P.coreColor, CUES.corePick, CORE_PICK), world: true, click: true },
    { t: CUES.glowClick, ...glow, world: true, click: true },
    { t: CUES.glowPick, ...chipCenter(P.glowColor, CUES.glowPick, GLOW_PICK), world: true, click: true },
  ];
  for (const drag of DRAGS) {
    const a = handle(drag.start, drag.key, drag.row, drag.from);
    const z = handle(drag.end, drag.key, drag.row, drag.to);
    const mid = (drag.start + drag.end) / 2;
    keys.push(
      { t: drag.start, ...a, world: true, click: true, release: drag.end },
      { t: mid, x: a.x + (z.x - a.x) * 0.6, y: a.y, world: true },
      { t: drag.end, ...z, world: true },
    );
  }
  keys.push(
    { t: CUES.pushIn + 0.5, x: 1500, y: 1000 },
    { t: CUES.hoverStart, x: 700, y: 470 },
    { t: CUES.hoverStart + 0.9, x: 1215, y: 455 },
    { t: CUES.hoverStart + 1.8, x: 1230, y: 760 },
    { t: CUES.strike1, x: 960, y: 335, click: true },
    { t: CUES.strike2, x: 740, y: 745, click: true },
    { t: CUES.toStage + 0.3, x: 1760, y: 1200 },
  );
  return keys;
};

const KEYS = buildKeys();

export const cursor = (t: number) => cursorAt(t, KEYS, (x, y) => project(t, x, y));

/** Inverse of `project`, so a drag can read its slider value back from the screen cursor. */
const cursorWorldX = (t: number) => {
  const { x } = cursor(t);
  const a = project(t, 0, 0);
  const b = project(t, 1, 0);
  return (x - a.x) / (b.x - a.x);
};

const dragValue = (t: number, key: NumberKey, fallback: number) => {
  const drag = DRAGS.find((d) => d.key === key);
  if (!drag) return fallback;
  if (t < drag.start) return drag.from;
  if (t >= drag.end) return drag.to;
  return sliderValueAtX(key, cursorWorldX(t));
};

export type Shape = "bolt" | "voltra" | "app";

export interface FilmSettings {
  color: string;
  glowColor: string;
  scale: number;
  intensity: number;
  glow: number;
  thickness: number;
  strands: number;
  bend: number;
  crackle: number;
  arcs: number;
  flicker: number;
  fill: number;
  speed: number;
  cursorIntensity: number;
  cursorRadius: number;
}

const blend = (t: number, start: number, length: number, from: string, to: string) =>
  interpolateColors(smooth(progress(t, start, length)), [0, 1], [from, to]);

export function settingsAt(t: number): FilmSettings {
  const toBrand = smooth(progress(t, CUES.morphToApp - 0.5, 1.2));
  const calm = (value: number, rest: number) => value + (rest - value) * toBrand;
  const core = blend(t, CUES.corePick, 0.5, "#ecc7ff", "#e6fdff");
  const glow = blend(t, CUES.glowPick, 0.5, "#ad6dff", "#1fa9ff");
  return {
    color: toBrand > 0 ? interpolateColors(toBrand, [0, 1], [core, "#ecc7ff"]) : core,
    glowColor: toBrand > 0 ? interpolateColors(toBrand, [0, 1], [glow, "#ad6dff"]) : glow,
    scale: 0.6 - 0.18 * smooth(progress(t, CUES.toStage, 1.4)),
    intensity: 1.05,
    glow: 1.1,
    thickness: 1.6,
    strands: calm(dragValue(t, "strands", 4), 4),
    bend: 0.6,
    crackle: calm(dragValue(t, "crackle", 1.5), 1.5),
    arcs: calm(dragValue(t, "arcs", 1), 1.2),
    flicker: 0.5,
    fill: 0.12,
    speed: 2.5,
    cursorIntensity: 1,
    cursorRadius: 150,
  };
}

/** The shape on screen and the morph progress into it. */
export function shapeAt(t: number): { from: Shape; to: Shape; morph: number } {
  if (t >= CUES.morphToApp) return { from: "voltra", to: "app", morph: Math.min(1, (t - CUES.morphToApp) / 1.6) };
  if (t >= CUES.morphToVoltra) return { from: "bolt", to: "voltra", morph: Math.min(1, (t - CUES.morphToVoltra) / 1.6) };
  return { from: "bolt", to: "bolt", morph: 1 };
}

export const presenceAt = (t: number) => smooth(progress(t, CUES.ignite, 1.4));

/** Upload progress 0..100, in uneven tus-chunk steps. */
export function uploadPercent(t: number) {
  const k = progress(t, CUES.uploadStart, CUES.uploadDone - CUES.uploadStart - 0.25);
  const chunks = [0, 18, 34, 52, 71, 88, 100];
  const i = Math.min(chunks.length - 2, Math.floor(k * (chunks.length - 1)));
  const local = k * (chunks.length - 1) - i;
  const a = chunks[i] ?? 0;
  const b = chunks[i + 1] ?? 100;
  return Math.round(a + (b - a) * smooth(clamp01(local)));
}

export const strikes = [CUES.strike1, CUES.strike2];
export const pickedChips = { core: CORE_PICK, glow: GLOW_PICK };
