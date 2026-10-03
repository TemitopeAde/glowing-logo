import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { ElectricCanvas } from "./electric/ElectricCanvas";
import { useShapes, type ShapeId } from "./electric/shapes";

/** A still of a mark in its own lightning: the app icon and the widget thumbnail are rendered from the real effect. */
export function ElectricStill({ shape = "app", time = 7.3, scale = 0.6, radius = 0.22 }: { shape?: ShapeId; time?: number; scale?: number; radius?: number }) {
  const { width, height } = useVideoConfig();
  const shapes = useShapes();
  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <AbsoluteFill style={{ background: "#0b0614", borderRadius: Math.min(width, height) * radius, overflow: "hidden" }}>
        {shapes && (
          <ElectricCanvas
            shapes={shapes}
            style={{ left: 0, top: 0 }}
            frame={{
              width,
              height,
              from: shape,
              to: shape,
              morph: 1,
              presence: 1,
              time,
              scale,
              color: "#ecc7ff",
              glowColor: "#ad6dff",
              intensity: 1.1,
              glow: 1.15,
              thickness: Math.max(1.5, width / 420),
              strands: 4,
              bend: 0.6,
              crackle: 1.5,
              flicker: 0,
              fill: 0.18,
              cursorRadius: 100,
              cursorIntensity: 0,
              hover: { x: 0, y: 0, power: 0 },
              sparks: [],
              pulses: [],
            }}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
