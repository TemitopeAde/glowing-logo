import React, { useLayoutEffect, useRef } from "react";
import { Mesh, Program, Renderer, Texture, Triangle, type OGLRenderingContext } from "ogl";
import { ARCS, PULSES } from "../../../src/extensions/site/widgets/electric-logo/lib/constants";
import { fragment, vertex } from "../../../src/extensions/site/widgets/electric-logo/lib/shaders";
import type { Spark, TracedShape } from "../../../src/extensions/site/widgets/electric-logo/lib/trace";
import { place, smooth } from "./place";
import type { ShapeId, Shapes } from "./shapes";

/**
 * Frame-driven twin of the widget's ElectricLogo engine (src/extensions/.../lib/engine.ts).
 * Same shader and tracer; the clock, arcs, hover and pulses come in as props instead of from
 * requestAnimationFrame and Math.random, so each frame is a pure function of film time.
 */
export interface ElectricFrame {
  width: number;
  height: number;
  from: ShapeId;
  to: ShapeId;
  morph: number;
  presence: number;
  time: number;
  scale: number;
  color: string;
  glowColor: string;
  intensity: number;
  glow: number;
  thickness: number;
  strands: number;
  bend: number;
  crackle: number;
  flicker: number;
  fill: number;
  cursorRadius: number;
  cursorIntensity: number;
  hover: { x: number; y: number; power: number };
  sparks: Spark[];
  pulses: { x: number; y: number; age: number }[];
}

const hexToRgb = (hex: string): number[] => {
  const n = Number.parseInt(hex.replace("#", "").slice(0, 6), 16);
  return Number.isNaN(n) ? [1, 1, 1] : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/** interpolateColors returns rgba(); the shader wants hex-like triples. */
const colorToRgb = (color: string): number[] => {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m?.[1]) return hexToRgb(color);
  return m[1].split(",").slice(0, 3).map((v) => Number.parseFloat(v) / 255);
};

interface Gl {
  renderer: Renderer;
  mesh: Mesh;
  uniforms: Record<string, { value: unknown }>;
  textures: Record<ShapeId, { field: Texture; glow: Texture }>;
}

const makeTextures = (gl: OGLRenderingContext, shape: TracedShape) => {
  const gl2 = gl as unknown as WebGL2RenderingContext;
  const base = { type: gl.FLOAT, minFilter: gl.LINEAR, magFilter: gl.LINEAR, generateMipmaps: false, flipY: false, unpackAlignment: 1 };
  return {
    field: new Texture(gl, { ...base, image: shape.field, width: shape.width, height: shape.height, internalFormat: gl2.R16F, format: gl2.RED }),
    glow: new Texture(gl, { ...base, image: shape.glow, width: shape.glowWidth, height: shape.glowHeight, internalFormat: gl2.RG16F, format: gl2.RG }),
  };
};

const createGl = (host: HTMLDivElement, shapes: Shapes): Gl => {
  const renderer = new Renderer({ dpr: 1, alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });
  const gl = renderer.gl;
  if (!renderer.isWebgl2) throw new Error("ElectricCanvas needs WebGL2 (render with --gl=angle).");
  gl.clearColor(0, 0, 0, 0);
  gl.canvas.style.display = "block";
  host.appendChild(gl.canvas);
  const textures = {
    bolt: makeTextures(gl, shapes.bolt),
    voltra: makeTextures(gl, shapes.voltra),
    app: makeTextures(gl, shapes.app),
  };
  const uniforms: Record<string, { value: unknown }> = {
    tFieldFrom: { value: textures.bolt.field },
    tGlowFrom: { value: textures.bolt.glow },
    tFieldTo: { value: textures.bolt.field },
    tGlowTo: { value: textures.bolt.glow },
  };
  for (const name of ["uMapFrom", "uSizeFrom", "uMapTo", "uSizeTo"]) uniforms[name] = { value: [0, 0, 1, 1] };
  for (const name of ["uMorph", "uUnit", "uTime", "uPresence", "uHoverRadius", "uPulseBoost", "uFlash", "uIntensity", "uGlow", "uThickness", "uStrands", "uBend", "uCrackle", "uFlicker", "uFill", "uInk"])
    uniforms[name] = { value: 0 };
  uniforms.uResolution = { value: [1, 1] };
  uniforms.uHover = { value: [0, 0, 0] };
  uniforms.uColor = { value: [1, 1, 1] };
  uniforms.uGlowColor = { value: [1, 1, 1] };
  uniforms.uPulses = { value: new Array<number>(PULSES * 4).fill(0) };
  uniforms.uArcEnds = { value: new Array<number>(ARCS * 4).fill(0) };
  uniforms.uArcShape = { value: new Array<number>(ARCS * 4).fill(0) };
  const mesh = new Mesh(gl, {
    geometry: new Triangle(gl),
    program: new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false }),
  });
  return { renderer, mesh, uniforms, textures };
};

const set = (gl: Gl, name: string, value: unknown) => {
  const uniform = gl.uniforms[name];
  if (uniform) uniform.value = value;
};

const draw = (gl: Gl, shapes: Shapes, f: ElectricFrame) => {
  const width = Math.max(1, Math.round(f.width));
  const height = Math.max(1, Math.round(f.height));
  gl.renderer.setSize(width, height);
  const to = shapes[f.to];
  const from = shapes[f.from];
  const near = place(to, f.scale, width, height);
  const far = place(from, f.scale, width, height);
  const unit = f.morph < 1 ? far.unit + (near.unit - far.unit) * smooth(f.morph) : near.unit;

  set(gl, "tFieldTo", gl.textures[f.to].field);
  set(gl, "tGlowTo", gl.textures[f.to].glow);
  set(gl, "tFieldFrom", gl.textures[f.from].field);
  set(gl, "tGlowFrom", gl.textures[f.from].glow);
  set(gl, "uMapTo", [near.ox, near.oy, near.fit, to.glowOffset]);
  set(gl, "uSizeTo", [to.width, to.height, to.glowWidth, to.glowHeight]);
  set(gl, "uMapFrom", [far.ox, far.oy, far.fit, from.glowOffset]);
  set(gl, "uSizeFrom", [from.width, from.height, from.glowWidth, from.glowHeight]);
  set(gl, "uResolution", [width, height]);
  set(gl, "uMorph", f.morph);
  set(gl, "uUnit", unit);
  set(gl, "uTime", f.time);
  set(gl, "uPresence", f.presence);
  set(gl, "uHover", [f.hover.x, f.hover.y, f.hover.power * f.cursorIntensity]);
  set(gl, "uHoverRadius", f.cursorRadius);

  const arcEnds = new Array<number>(ARCS * 4).fill(0);
  const arcShape = new Array<number>(ARCS * 4).fill(0);
  f.sparks.slice(0, ARCS).forEach((spark, i) => {
    const o = i * 4;
    const k = (f.time - spark.born) / spark.life;
    arcEnds[o] = near.ox + spark.ax * near.fit;
    arcEnds[o + 1] = near.oy + spark.ay * near.fit;
    arcEnds[o + 2] = near.ox + spark.bx * near.fit;
    arcEnds[o + 3] = near.oy + spark.by * near.fit;
    arcShape[o] = spark.bow * near.fit;
    arcShape[o + 1] = Math.sin(Math.PI * Math.min(1, Math.max(0, k))) * f.presence;
    arcShape[o + 2] = spark.seed;
  });
  set(gl, "uArcEnds", arcEnds);
  set(gl, "uArcShape", arcShape);

  const pulses = new Array<number>(PULSES * 4).fill(0);
  let boost = 0;
  let flash = 0;
  f.pulses.slice(-PULSES).forEach((pulse, i) => {
    pulses[i * 4] = pulse.x;
    pulses[i * 4 + 1] = pulse.y;
    pulses[i * 4 + 2] = pulse.age;
    pulses[i * 4 + 3] = 1;
    boost = Math.max(boost, Math.exp(-pulse.age * 1.7));
    flash += Math.exp(-pulse.age * 7);
  });
  set(gl, "uPulses", pulses);
  set(gl, "uPulseBoost", boost);
  set(gl, "uFlash", flash);

  set(gl, "uColor", colorToRgb(f.color));
  set(gl, "uGlowColor", colorToRgb(f.glowColor));
  set(gl, "uIntensity", f.intensity);
  set(gl, "uGlow", f.glow);
  set(gl, "uThickness", f.thickness);
  set(gl, "uStrands", Math.max(1, Math.min(6, Math.round(f.strands))));
  set(gl, "uBend", f.bend);
  set(gl, "uCrackle", f.crackle);
  set(gl, "uFlicker", f.flicker);
  set(gl, "uFill", f.fill);
  set(gl, "uInk", 0);
  gl.renderer.render({ scene: gl.mesh });
};

export function ElectricCanvas({ shapes, frame, style }: { shapes: Shapes; frame: ElectricFrame; style?: React.CSSProperties }) {
  const host = useRef<HTMLDivElement>(null);
  const gl = useRef<Gl | null>(null);
  useLayoutEffect(() => {
    if (!host.current) return;
    gl.current ??= createGl(host.current, shapes);
    draw(gl.current, shapes, frame);
  });
  return <div ref={host} style={{ position: "absolute", ...style }} />;
}
