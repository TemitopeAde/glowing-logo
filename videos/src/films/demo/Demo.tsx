import React from "react";
import { AbsoluteFill } from "remotion";
import { UserCursor } from "../../kit/cursor";
import { TargetLog } from "../../kit/debug";
import { swapIn } from "../../kit/move";
import { useTime } from "../../kit/time";
import { ElectricCanvas, type ElectricFrame } from "../../electric/ElectricCanvas";
import { useShapes, type Shapes } from "../../electric/shapes";
import { CUES } from "./cues";
import { Editor } from "./Editor";
import { widgetRect } from "./layout";
import { snapshotAt } from "./sim";
import { cursor, presenceAt, settingsAt, shapeAt, strikes } from "./timeline";
import { C } from "./tokens";
import { Captions, Lockup } from "./Words";

const frameAt = (shapes: Shapes, t: number): ElectricFrame => {
  const s = settingsAt(t);
  const shape = shapeAt(t);
  const rect = widgetRect(t);
  const snap = snapshotAt(shapes, t);
  const pulses = strikes
    .filter((strike) => t >= strike && t - strike < 2)
    .map((strike) => {
      const c = cursor(strike);
      const r = widgetRect(strike);
      return { x: c.x - r.x, y: c.y - r.y, age: t - strike };
    });
  return {
    width: rect.w,
    height: rect.h,
    ...shape,
    presence: presenceAt(t),
    time: snap.time,
    scale: s.scale,
    color: s.color,
    glowColor: s.glowColor,
    intensity: s.intensity,
    glow: s.glow,
    thickness: s.thickness,
    strands: s.strands,
    bend: s.bend,
    crackle: s.crackle,
    flicker: s.flicker,
    fill: s.fill,
    cursorRadius: s.cursorRadius,
    cursorIntensity: s.cursorIntensity,
    hover: snap.hover,
    sparks: snap.sparks,
    pulses,
  };
};

export type DemoProps = { fps: number; debug: boolean };

export function ElectricLogoDemo({ debug }: DemoProps) {
  const t = useTime();
  const shapes = useShapes();
  const rect = widgetRect(t);
  const c = cursor(t);
  const showCursor = swapIn(t, CUES.editorIn + 0.3, CUES.toStage + 0.3, 0, 0.2);
  return (
    <AbsoluteFill style={{ background: C.stage, overflow: "hidden" }}>
      <Editor t={t} />
      {shapes && <ElectricCanvas shapes={shapes} frame={frameAt(shapes, t)} style={{ left: rect.x, top: rect.y, zIndex: 2 }} />}
      <Captions t={t} />
      <Lockup t={t} />
      {showCursor.visible && (
        <div style={{ position: "absolute", inset: 0, opacity: showCursor.opacity, zIndex: 20 }}>
          <UserCursor x={c.x} y={c.y} squash={c.squash} />
        </div>
      )}
      {debug && <TargetLog />}
    </AbsoluteFill>
  );
}
