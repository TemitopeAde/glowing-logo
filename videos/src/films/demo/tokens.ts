import { loadFont as loadDisplay } from "@remotion/google-fonts/WixMadeforDisplay";
import { loadFont as loadText } from "@remotion/google-fonts/WixMadeforText";

export const DISPLAY = loadDisplay("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily;
export const TEXT = loadText("normal", { weights: ["400", "500", "700"], subsets: ["latin"] }).fontFamily;

/** Hex only: anything that animates goes through interpolateColors. */
export const C = {
  stage: "#0b0614",
  stageText: "#f4ecff",
  stageMuted: "#b9a7d6",
  // Wix Design System
  ink: "#162d3d",
  muted: "#7a92a5",
  border: "#dfe5eb",
  surface: "#f0f4f7",
  white: "#ffffff",
  blue: "#116dff",
  bluePressed: "#0f5fe0",
  blueTint: "#e7f0ff",
  success: "#25a55a",
  tooltip: "#162d3d",
} as const;
