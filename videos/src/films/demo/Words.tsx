import React from "react";
import { Easing } from "remotion";
import { swapIn } from "../../kit/move";
import { clamp01 } from "../../kit/time";
import { CAPTIONS, CUES } from "./cues";
import { C, DISPLAY, TEXT } from "./tokens";

const land = Easing.bezier(0.22, 1, 0.36, 1);

/** One caption line in a fixed band above the editor window; blur-swaps between lines. */
export function Captions({ t }: { t: number }) {
  return (
    <>
      {CAPTIONS.map((line) => {
        const v = swapIn(t, line.from - 0.18, line.to, 0.18, 0.22);
        if (!v.visible) return null;
        return (
          <div key={line.text} style={{ position: "absolute", left: 0, right: 0, top: 46, height: 72, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 500, fontSize: 54, color: C.stageText, letterSpacing: -0.5, opacity: v.opacity, filter: v.filter }}>
            {line.text}
          </div>
        );
      })}
    </>
  );
}

/** A word that blurs in from 16 px, rises 36 px and lands in 0.3 s; it holds its slot before landing. */
function Word({ t, at, children, style }: { t: number; at: number; children: React.ReactNode; style?: React.CSSProperties }) {
  const k = land(clamp01((t - at) / 0.3));
  return <span style={{ display: "inline-block", opacity: k, filter: k < 1 ? `blur(${(1 - k) * 16}px)` : undefined, translate: `0 ${(1 - k) * 36}px`, ...style }}>{children}</span>;
}

export function Lockup({ t }: { t: number }) {
  if (t < CUES.lockupIn - 0.1) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 664, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26, fontFamily: DISPLAY, fontWeight: 700, fontSize: 124, color: C.stageText, letterSpacing: -2, lineHeight: 1 }}>
        <Word t={t} at={CUES.lockupIn}>Electric</Word>
        <Word t={t} at={CUES.lockupIn + 0.5}>Logo</Word>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: TEXT, fontSize: 36, color: C.stageMuted }}>
        <Word t={t} at={CUES.ctaIn}>Available on the</Word>
        <Word t={t} at={CUES.ctaIn + 0.5} style={{ color: C.stageText, fontWeight: 700 }}>
          Wix App Market
        </Word>
      </div>
    </div>
  );
}
