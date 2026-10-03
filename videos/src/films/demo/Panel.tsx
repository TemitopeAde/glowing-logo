import React from "react";
import { Img, staticFile } from "remotion";
import { swapIn } from "../../kit/move";

import { BOLT } from "../../../../src/extensions/site/widgets/electric-logo/lib/constants";
import { RANGES, type NumberKey } from "../../../../src/extensions/site/widgets/electric-logo/settings";
import { CUES } from "./cues";
import { P, PANEL, PANEL_HEADER, panelScroll } from "./layout";
import { CHIP, PALETTE, pickedChips, settingsAt, uploadPercent } from "./timeline";
import { C, TEXT } from "./tokens";
import { FieldLabel, SectionHeader, SliderRow, Swatch } from "./ui";

const fmt = (key: NumberKey, v: number) => {
  const { step, unit = "" } = RANGES[key];
  const decimals = step >= 1 ? 0 : String(step).split(".")[1]?.length ?? 2;
  return `${v.toFixed(decimals)}${unit}`;
};
const frac = (key: NumberKey, v: number) => (v - RANGES[key].min) / (RANGES[key].max - RANGES[key].min);

function UploadBlock({ t }: { t: number }) {
  const swapped = t >= CUES.logoSwap;
  const pressed = t >= CUES.uploadClick && t < CUES.uploadClick + 0.16;
  const uploading = t >= CUES.uploadStart && t < CUES.uploadDone;
  const status = swapIn(t, CUES.uploadStart - 0.18, Infinity, 0);
  const done = t >= CUES.uploadDone;
  const preview = swapIn(t, CUES.logoSwap - 0.18, Infinity, 0);
  return (
    <>
      <FieldLabel label="Logo image" top={60} />
      <div style={{ position: "absolute", left: 28, right: 28, top: P.logoPreview.y, height: P.logoPreview.h, borderRadius: 8, background: C.stage, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Img src={BOLT} style={{ position: "absolute", width: 84, height: 84, opacity: 1 - preview.opacity }} />
        {preview.visible && <Img src={staticFile("logos/voltra-mark.svg")} style={{ position: "absolute", width: 88, height: 88, opacity: preview.opacity, filter: preview.filter }} />}
      </div>
      <div
        data-target="upload"
        style={{ position: "absolute", left: 28, right: 28, top: P.uploadButton.y, height: P.uploadButton.h, borderRadius: 22, background: pressed || uploading ? C.bluePressed : C.blue, color: C.white, fontFamily: TEXT, fontSize: 18, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", scale: pressed ? "0.98" : "1" }}
      >
        {uploading ? "Uploading…" : "Upload logo"}
      </div>
      {status.visible && (
        <div style={{ position: "absolute", left: 28, right: 28, top: P.uploadStatus, height: 24, opacity: status.opacity, filter: status.filter, fontFamily: TEXT, fontSize: 16, color: C.muted, display: "flex", alignItems: "center", gap: 10 }}>
          {done ? (
            <span style={{ color: C.success, fontWeight: 500 }}>✓ voltra-mark.svg saved to Media Manager</span>
          ) : (
            <>
              <span style={{ width: 150 }}>voltra-mark.svg</span>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.border, overflow: "hidden" }}>
                <div style={{ width: `${uploadPercent(t)}%`, height: "100%", background: C.blue }} />
              </div>
              <span style={{ width: 44, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{uploadPercent(t)}%</span>
            </>
          )}
        </div>
      )}
      <FieldLabel label="Or image URL" top={P.urlLabel} />
      <div style={{ position: "absolute", left: 28, right: 28, top: P.urlInput.y, height: P.urlInput.h, borderRadius: 6, border: `1px solid ${C.border}`, padding: "0 14px", display: "flex", alignItems: "center", fontFamily: TEXT, fontSize: 16, color: swapped ? C.ink : C.muted, overflow: "hidden", whiteSpace: "nowrap", boxSizing: "border-box" }}>
        {swapped ? "static.wixstatic.com/media/…voltra-mark.svg" : "https://…/logo.svg"}
      </div>
    </>
  );
}

function Popover({ t, row, open, pick, chip }: { t: number; row: number; open: number; pick: number; chip: number }) {
  const v = swapIn(t, open - 0.1, pick + 0.35, 0.05, 0.15);
  if (!v.visible) return null;
  const chosen = t >= pick;
  return (
    <div style={{ position: "absolute", left: 28 + CHIP.dx, top: row + 34 + CHIP.dy, padding: 14, display: "flex", gap: CHIP.gap, background: C.white, borderRadius: 10, boxShadow: "0 6px 24px rgba(22,45,61,0.22), 0 0 0 1px rgba(22,45,61,0.06)", opacity: v.opacity, filter: v.filter, zIndex: 5 }}>
      {PALETTE.map((color, i) => (
        <div key={color} data-target={`chip-${i}`} style={{ width: CHIP.size, height: CHIP.size, borderRadius: CHIP.size / 2, background: color, boxShadow: chosen && i === chip ? `0 0 0 3px ${C.white}, 0 0 0 5px ${C.blue}` : `inset 0 0 0 1px ${C.border}` }} />
      ))}
    </div>
  );
}

function Tooltip({ t }: { t: number }) {
  const v = swapIn(t, CUES.tooltipShow - 0.1, CUES.tooltipHide, 0.05, 0.15);
  if (!v.visible) return null;
  return (
    <div style={{ position: "absolute", left: 28 + 104 + 26, top: P.coreColor + 12 - 26, width: 236, padding: "10px 14px", borderRadius: 8, background: C.tooltip, color: C.white, fontFamily: TEXT, fontSize: 17, lineHeight: 1.3, opacity: v.opacity, filter: v.filter, zIndex: 6, boxSizing: "border-box" }}>
      Colour of the hot core of every strand.
      <div style={{ position: "absolute", left: -6, top: 18, width: 14, height: 14, background: C.tooltip, rotate: "45deg" }} />
    </div>
  );
}

export function Panel({ t }: { t: number }) {
  const s = settingsAt(t);
  const scroll = panelScroll(t);
  const dragging = (start: number, end: number) => t >= start && t < end;
  return (
    <div style={{ position: "absolute", left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h, background: C.white, borderLeft: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: PANEL_HEADER, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 28px", fontFamily: TEXT, fontSize: 21, fontWeight: 700, color: C.ink, boxSizing: "border-box", background: C.white, zIndex: 10 }}>
        Electric Logo Settings
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 24, fontWeight: 400, color: C.muted }}>×</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: PANEL_HEADER, height: 2000, translate: `0 ${-scroll}px` }}>
        <SectionHeader title="Logo" top={P.logoTitle} />
        <UploadBlock t={t} />
        <SliderRow label="Logo size" value={fmt("scale", 0.6)} fraction={frac("scale", 0.6)} top={P.scaleSlider} />

        <SectionHeader title="Colors & style" top={P.colorsTitle} />
        <FieldLabel label="Render style" top={P.themeToggle} />
        <div style={{ position: "absolute", left: 28, top: P.themeToggle + 34, width: 220, height: 38, borderRadius: 19, background: C.surface, display: "flex", padding: 3, boxSizing: "border-box", fontFamily: TEXT, fontSize: 16 }}>
          <div style={{ flex: 1, borderRadius: 16, background: C.white, color: C.blue, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(22,45,61,0.2)" }}>Dark</div>
          <div style={{ flex: 1, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>Light</div>
        </div>
        <FieldLabel label="Core color" top={P.coreColor} infoActive={t >= CUES.tooltipShow - 0.1 && t < CUES.tooltipHide} infoTarget="core-info" />
        <Swatch fill={s.color} top={P.coreColor + 34} target="core-swatch" focused={t >= CUES.coreClick && t < CUES.corePick + 0.35} />
        <FieldLabel label="Glow color" top={P.glowColor} />
        <Swatch fill={s.glowColor} top={P.glowColor + 34} target="glow-swatch" focused={t >= CUES.glowClick && t < CUES.glowPick + 0.35} />
        <FieldLabel label="Background" top={P.bgColor} />
        <Swatch fill={C.stage} top={P.bgColor + 34} />
        <Popover t={t} row={P.coreColor} open={CUES.coreClick} pick={CUES.corePick} chip={pickedChips.core} />
        <Popover t={t} row={P.glowColor} open={CUES.glowClick} pick={CUES.glowPick} chip={pickedChips.glow} />
        <Tooltip t={t} />

        <SectionHeader title="Lightning" top={P.lightningTitle} />
        <SliderRow label="Strands" value={fmt("strands", s.strands)} fraction={frac("strands", s.strands)} top={P.strands} active={dragging(CUES.strandsDrag, CUES.strandsRelease)} />
        <SliderRow label="Thickness" value={fmt("thickness", s.thickness)} fraction={frac("thickness", s.thickness)} top={P.thickness} />
        <SliderRow label="Bend" value={fmt("bend", s.bend)} fraction={frac("bend", s.bend)} top={P.bend} />
        <SliderRow label="Crackle" value={fmt("crackle", s.crackle)} fraction={frac("crackle", s.crackle)} top={P.crackle} active={dragging(CUES.crackleDrag, CUES.crackleRelease)} />
        <SliderRow label="Arc frequency" value={fmt("arcs", s.arcs)} fraction={frac("arcs", s.arcs)} top={P.arcs} active={dragging(CUES.arcsDrag, CUES.arcsRelease)} />

        <SectionHeader title="Glow & light" top={P.glowTitle} />
        <SliderRow label="Intensity" value={fmt("intensity", s.intensity)} fraction={frac("intensity", s.intensity)} top={P.intensity} />
        <SliderRow label="Glow" value={fmt("glow", s.glow)} fraction={frac("glow", s.glow)} top={P.glowSlider} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 72, background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 28px", zIndex: 10 }}>
        <div style={{ flex: 1, height: 42, borderRadius: 21, border: `1px solid ${C.blue}`, color: C.blue, fontFamily: TEXT, fontSize: 17, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
          Reset all to defaults
        </div>
      </div>
    </div>
  );
}
