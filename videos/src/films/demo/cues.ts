import { at, type Grid } from "../../kit/time";

/** Silent film: planned on a 120 BPM grid. One beat is 0.5 s, one bar 2 s. */
export const GRID: Grid = { bpm: 120, firstBeat: 0, pickupBeats: 0, beatsPerBar: 4 };
export const b = (bar: number, beat = 1, fraction = 0) => at(GRID, bar, beat, fraction);

export const BARS = 18;
export const DURATION = b(BARS + 1);

export const CUES = {
  // Opening: the bolt ignites full screen.
  ignite: b(1),
  // Magic move into the Wix Editor canvas.
  toEditor: b(2, 2),
  editorIn: b(2, 2, 0.4),
  // Upload flow.
  uploadHover: b(3, 2),
  uploadClick: b(3, 3),
  uploadStart: b(3, 4),
  uploadDone: b(5, 1),
  logoSwap: b(5, 2),
  morphToVoltra: b(5, 2, 0.5),
  // Colors.
  scrollColors: b(6, 1),
  tooltipShow: b(6, 3),
  tooltipHide: b(7, 2),
  coreClick: b(7, 2, 0.5),
  corePick: b(7, 3, 0.5),
  glowClick: b(7, 4),
  glowPick: b(8, 1),
  // Lightning sliders.
  scrollLightning: b(8, 2),
  strandsDrag: b(8, 4),
  strandsRelease: b(9, 2),
  crackleDrag: b(9, 3),
  crackleRelease: b(10, 1),
  arcsDrag: b(10, 2),
  arcsRelease: b(10, 4),
  // Interaction: push in, hover, strike.
  pushIn: b(11, 1),
  hoverStart: b(11, 3),
  strike1: b(12, 3),
  strike2: b(13, 1, 0.5),
  // Ending.
  toStage: b(14, 1),
  morphToApp: b(14, 3),
  lockupIn: b(15, 3),
  ctaIn: b(16, 3),
  end: b(BARS + 1),
} as const;

/** One caption per scene, swapped on calm beats. */
export const CAPTIONS: { from: number; to: number; text: string }[] = [
  { from: b(1, 2), to: b(3, 1), text: "Your logo, charged with lightning." },
  { from: b(3, 1), to: b(5, 2), text: "Upload any mark." },
  { from: b(5, 2), to: b(6, 1), text: "It traces itself." },
  { from: b(6, 1), to: b(8, 2), text: "Make it yours." },
  { from: b(8, 2), to: b(11, 1), text: "Tune every strand, live." },
  { from: b(11, 1), to: b(14, 1), text: "Hover to charge. Click to strike." },
];
