import React from "react";
import { Composition, Still, type CalculateMetadataFunction } from "remotion";
import { ElectricStill } from "./AppIcon";
import { DURATION } from "./films/demo/cues";
import { ElectricLogoDemo, type DemoProps } from "./films/demo/Demo";

const demoMetadata: CalculateMetadataFunction<DemoProps> = ({ props }) => ({
  fps: props.fps,
  durationInFrames: Math.round(DURATION * props.fps),
});

export function Root() {
  return (
    <>
      <Composition
        id="ElectricLogoDemo"
        component={ElectricLogoDemo}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={Math.round(DURATION * 60)}
        defaultProps={{ fps: 60, debug: false }}
        calculateMetadata={demoMetadata}
      />
      <Still id="AppIcon" component={ElectricStill} width={1024} height={1024} defaultProps={{ shape: "app" as const, time: 7.3, scale: 0.6, radius: 0.22 }} />
    </>
  );
}
