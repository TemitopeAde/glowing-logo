import { move, type Rect } from "../../kit/move";
import { critical, track } from "../../kit/spring";
import { CUES } from "./cues";

export const W = 1920;
export const H = 1080;
export const FULL: Rect = { x: 0, y: 0, w: W, h: H };

/** Editor window floating on the stage, leaving a caption band above it. */
export const WINDOW: Rect = { x: 80, y: 150, w: 1760, h: 850 };
export const TOPBAR = 56;
export const PANEL: Rect = { x: WINDOW.x + WINDOW.w - 440, y: WINDOW.y + TOPBAR, w: 440, h: WINDOW.h - TOPBAR };
export const PANEL_HEADER = 64;
export const SITE: Rect = { x: 120, y: WINDOW.y + TOPBAR + 24, w: PANEL.x - 40 - 120, h: WINDOW.h };
export const SITE_NAV = 64;
export const HERO: Rect = { x: SITE.x, y: SITE.y + SITE_NAV, w: SITE.w, h: WINDOW.y + WINDOW.h - SITE.y - SITE_NAV };
/** The widget as placed on the editor canvas (world coordinates). */
export const WIDGET: Rect = { x: HERO.x + 40, y: HERO.y + 30, w: HERO.w - 80, h: HERO.h - 60 };
/** Preview mode for the interaction scene: the editor falls away and the widget fills the stage. */
export const PREVIEW: Rect = { x: 160, y: 150, w: 1600, h: 900 };
/** Final lockup: the lightning sits above the wordmark. */
export const LOCKUP_WIDGET: Rect = { x: 0, y: -150, w: W, h: H };

/** Panel content y-positions (content space, before scroll). */
export const P = {
  logoTitle: 0,
  logoPreview: { y: 92, h: 120 },
  uploadButton: { y: 228, h: 44 },
  uploadStatus: 286,
  urlLabel: 330,
  urlInput: { y: 360, h: 40 },
  scaleSlider: 424,
  colorsTitle: 512,
  themeToggle: 572,
  coreColor: 650,
  glowColor: 734,
  bgColor: 818,
  lightningTitle: 920,
  strands: 980,
  thickness: 1056,
  bend: 1132,
  crackle: 1208,
  arcs: 1284,
  glowTitle: 1372,
  intensity: 1432,
  glowSlider: 1508,
} as const;

export const FIELD_X = 28;
export const FIELD_W = PANEL.w - 56;
/** Slider rows: label line, then the track this far below the row top. */
export const SLIDER_TRACK_OFFSET = 44;
export const SWATCH = { w: 56, h: 34, offset: 34 };

const scrollSpring = critical(9);

export function panelScroll(t: number) {
  return track(
    t,
    [
      [0, 0],
      [CUES.scrollColors, 470],
      [CUES.scrollLightning, 888],
    ],
    scrollSpring,
  );
}

/** Screen-space point of a panel content coordinate (world → camera applied separately). */
export const panelPoint = (t: number, x: number, contentY: number) => ({
  x: PANEL.x + x,
  y: PANEL.y + PANEL_HEADER + contentY - panelScroll(t),
});

/** World → screen. This cut has no camera moves (preview mode replaced the push-in), so it is the identity. */
export const project = (_t: number, x: number, y: number) => ({ x, y });
export const projectRect = (_t: number, r: Rect): Rect => r;
export const worldTransform = (_t: number) => ({});

const glide = { stiffness: 120, damping: 20 };

/** The traveler: full stage → editor canvas → preview on the stage → the lockup. */
export function widgetRect(t: number): Rect {
  const intoEditor = projectRect(t, move(t, CUES.toEditor, FULL, WIDGET, glide));
  const preview = move(t, CUES.pushIn, intoEditor, PREVIEW, glide);
  return move(t, CUES.toStage, preview, LOCKUP_WIDGET, glide);
}
