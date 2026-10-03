import React from "react";
import { C, TEXT } from "./tokens";

/** Small redraws of the WDS pieces the panel uses (SidePanel.Section, FormField, Slider, FillPreview, InfoIcon). */

export function InfoIcon({ active = false, target }: { active?: boolean; target?: string }) {
  const color = active ? C.blue : C.muted;
  return (
    <span
      data-target={target}
      style={{ display: "inline-flex", width: 20, height: 20, borderRadius: 10, border: `1.5px solid ${color}`, color, fontSize: 13, fontWeight: 700, alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontStyle: "italic", boxSizing: "border-box", background: active ? C.blueTint : "transparent" }}
    >
      i
    </span>
  );
}

export function SectionHeader({ title, top }: { title: string; top: number }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, height: 52, background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, padding: "0 28px", boxSizing: "border-box" }}>
      <span style={{ fontFamily: TEXT, fontSize: 18, fontWeight: 700, color: C.ink }}>{title}</span>
      <InfoIcon />
    </div>
  );
}

export function FieldLabel({ label, value, top, infoActive = false, infoTarget }: { label: string; value?: string; top: number; infoActive?: boolean; infoTarget?: string }) {
  return (
    <div style={{ position: "absolute", left: 28, right: 28, top, height: 24, display: "flex", alignItems: "center", gap: 8, fontFamily: TEXT }}>
      <span style={{ fontSize: 18, color: C.ink, fontWeight: 500 }}>{label}</span>
      <InfoIcon active={infoActive} target={infoTarget} />
      <span style={{ flex: 1 }} />
      {value !== undefined && <span style={{ fontSize: 17, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{value}</span>}
    </div>
  );
}

export function SliderRow({ label, value, fraction, top, active = false }: { label: string; value: string; fraction: number; top: number; active?: boolean }) {
  const x = 28 + fraction * (440 - 56);
  return (
    <>
      <FieldLabel label={label} value={value} top={top} />
      <div style={{ position: "absolute", left: 28, width: 440 - 56, top: top + 44 - 3, height: 6, borderRadius: 3, background: C.border }} />
      <div style={{ position: "absolute", left: 28, width: x - 28, top: top + 44 - 3, height: 6, borderRadius: 3, background: C.blue }} />
      <div
        style={{ position: "absolute", left: x - 12, top: top + 44 - 12, width: 24, height: 24, borderRadius: 12, background: C.white, border: `3px solid ${C.blue}`, boxSizing: "border-box", boxShadow: active ? `0 0 0 8px ${C.blueTint}` : "0 1px 3px rgba(22,45,61,0.25)" }}
      />
    </>
  );
}

export function Swatch({ fill, top, target, focused = false }: { fill: string; top: number; target?: string; focused?: boolean }) {
  return (
    <div
      data-target={target}
      style={{ position: "absolute", left: 28, top, width: 56, height: 34, borderRadius: 6, background: fill, border: `1px solid ${C.border}`, boxShadow: focused ? `0 0 0 3px ${C.blueTint}, 0 0 0 4px ${C.blue}` : undefined }}
    />
  );
}
