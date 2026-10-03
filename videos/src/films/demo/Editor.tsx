import React from "react";
import { swapIn } from "../../kit/move";
import { CUES } from "./cues";
import { HERO, SITE, SITE_NAV, TOPBAR, WIDGET, WINDOW, worldTransform } from "./layout";
import { Panel } from "./Panel";
import { C, DISPLAY, TEXT } from "./tokens";

/** A simplified Wix Editor around the widget: top bar, the site page, the selected widget and the settings panel. */
export function Editor({ t }: { t: number }) {
  const v = swapIn(t, CUES.editorIn - 0.18, CUES.pushIn + 0.35, 0.18, 0.35);
  if (!v.visible) return null;
  const selected = swapIn(t, CUES.editorIn + 0.2, CUES.pushIn, 0.18, 0.15);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: v.opacity, filter: v.filter }}>
      <div style={{ position: "absolute", inset: 0, ...worldTransform(t) }}>
        <div style={{ position: "absolute", left: WINDOW.x, top: WINDOW.y, width: WINDOW.w, height: WINDOW.h, borderRadius: 16, overflow: "hidden", background: C.surface, boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: TOPBAR, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 28, padding: "0 24px", fontFamily: TEXT, fontSize: 17, color: C.ink }}>
            <span style={{ display: "flex", gap: 7 }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <span key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
              ))}
            </span>
            <span style={{ fontWeight: 500 }}>Page: Home ▾</span>
            <span style={{ flex: 1 }} />
            <span style={{ color: C.muted }}>Preview</span>
            <span style={{ background: C.blue, color: C.white, borderRadius: 18, padding: "7px 22px", fontWeight: 500 }}>Publish</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: SITE.x, top: SITE.y, width: SITE.w, height: WINDOW.y + WINDOW.h - SITE.y, background: C.white, overflow: "hidden", borderRadius: "6px 6px 0 0" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: SITE_NAV, display: "flex", alignItems: "center", padding: "0 40px", gap: 36, fontFamily: TEXT, fontSize: 17, color: C.ink }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, letterSpacing: 5 }}>VOLTRA</span>
            <span style={{ flex: 1 }} />
            <span>Studio</span>
            <span>Work</span>
            <span>Contact</span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: SITE_NAV, height: HERO.h, background: C.stage }} />
        </div>
        {selected.visible && (
          <div style={{ position: "absolute", left: WIDGET.x, top: WIDGET.y, width: WIDGET.w, height: WIDGET.h, border: `2px solid ${C.blue}`, boxSizing: "border-box", opacity: selected.opacity, zIndex: 3 }}>
            <span style={{ position: "absolute", left: -2, top: -34, background: C.blue, color: C.white, fontFamily: TEXT, fontSize: 16, fontWeight: 500, padding: "5px 12px", borderRadius: "6px 6px 0 0" }}>Electric Logo</span>
          </div>
        )}
        <Panel t={t} />
      </div>
    </div>
  );
}
