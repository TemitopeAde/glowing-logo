import { Mesh, Program, Renderer, Texture, Triangle, type OGLRenderingContext } from 'ogl';
import { ARCS, PIXEL_BUDGET, PULSES } from './constants';
import { fragment, vertex } from './shaders';
import { spawnArc, type Focus, type Spark, type TracedShape } from './trace';

export interface EngineSettings {
  color: string;
  glowColor: string;
  scale: number;
  intensity: number;
  glow: number;
  thickness: number;
  strands: number;
  bend: number;
  crackle: number;
  arcs: number;
  flicker: number;
  fill: number;
  speed: number;
  interactive: boolean;
  cursorIntensity: number;
  cursorRadius: number;
  theme: 'dark' | 'light';
  onRender?: ((canvas: HTMLCanvasElement) => void) | undefined;
}

type Rgb = [number, number, number];

interface Slot {
  shape: TracedShape | null;
  field: Texture;
  glow: Texture;
}

interface Placement {
  fit: number;
  ox: number;
  oy: number;
  unit: number;
}

interface Pulse {
  x: number;
  y: number;
  born: number;
}

const hexToRgb = (hex: string): Rgb => {
  let h = String(hex || '').replace('#', '');
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  const n = Number.parseInt(h.slice(0, 6), 16);
  return Number.isNaN(n) ? [1, 1, 1] : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const smooth = (k: number) => k * k * (3 - 2 * k);

const makeSlot = (gl: OGLRenderingContext): Slot => {
  const gl2 = gl as unknown as WebGL2RenderingContext;
  const base = {
    width: 1,
    height: 1,
    type: gl.FLOAT,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    generateMipmaps: false,
    flipY: false,
    unpackAlignment: 1
  };
  return {
    shape: null,
    field: new Texture(gl, { ...base, image: new Float32Array([1000]), internalFormat: gl2.R16F, format: gl2.RED }),
    glow: new Texture(gl, { ...base, image: new Float32Array([0, 0]), internalFormat: gl2.RG16F, format: gl2.RG })
  };
};

const loadSlot = (slot: Slot, next: TracedShape) => {
  slot.shape = next;
  slot.field.image = next.field;
  slot.field.width = next.width;
  slot.field.height = next.height;
  slot.field.needsUpdate = true;
  slot.glow.image = next.glow;
  slot.glow.width = next.glowWidth;
  slot.glow.height = next.glowHeight;
  slot.glow.needsUpdate = true;
};

/**
 * Mounts the lightning renderer into `container`. Settings and the traced shape are pulled every
 * frame, so changing them never restarts the GL context. Returns a disposer.
 */
export const startEngine = (
  container: HTMLElement,
  getSettings: () => EngineSettings,
  getShape: () => TracedShape | null
): (() => void) => {
  const renderer = new Renderer({
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    alpha: true,
    premultipliedAlpha: true,
    antialias: false
  });
  const gl = renderer.gl;
  if (!renderer.isWebgl2) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    console.error('ElectricLogo: WebGL2 is not available in this browser.');
    return () => undefined;
  }
  gl.clearColor(0, 0, 0, 0);
  const canvas = gl.canvas;
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const slots: [Slot, Slot] = [makeSlot(gl), makeSlot(gl)];
  const arcEnds = new Array<number>(ARCS * 4).fill(0);
  const arcShape = new Array<number>(ARCS * 4).fill(0);
  const pulseData = new Array<number>(PULSES * 4).fill(0);
  const uniforms = {
    tFieldFrom: { value: slots[1].field },
    tGlowFrom: { value: slots[1].glow },
    tFieldTo: { value: slots[0].field },
    tGlowTo: { value: slots[0].glow },
    uMapFrom: { value: [0, 0, 1, 0] },
    uSizeFrom: { value: [1, 1, 1, 1] },
    uMapTo: { value: [0, 0, 1, 0] },
    uSizeTo: { value: [1, 1, 1, 1] },
    uMorph: { value: 1 },
    uResolution: { value: [1, 1] },
    uUnit: { value: 1 },
    uTime: { value: 0 },
    uPresence: { value: 0 },
    uHover: { value: [0, 0, 0] },
    uHoverRadius: { value: 120 },
    uPulses: { value: pulseData },
    uPulseBoost: { value: 0 },
    uFlash: { value: 0 },
    uColor: { value: [1, 1, 1] },
    uGlowColor: { value: [0.43, 0.48, 1] },
    uIntensity: { value: 1 },
    uGlow: { value: 1 },
    uThickness: { value: 1.8 },
    uStrands: { value: 3 },
    uBend: { value: 1 },
    uCrackle: { value: 1 },
    uFlicker: { value: 0.4 },
    uFill: { value: 0.5 },
    uInk: { value: 0 },
    uArcEnds: { value: arcEnds },
    uArcShape: { value: arcShape }
  };
  const mesh = new Mesh(gl, {
    geometry: new Triangle(gl),
    program: new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false })
  });

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const pointer = { x: 0, y: 0, over: false };
  const hover = { x: 0, y: 0, vx: 0, vy: 0, power: 0 };
  const sparks: Spark[] = [];
  const pulses: Pulse[] = [];
  const hues: [Rgb, Rgb] = [
    [1, 1, 1],
    [1, 1, 1]
  ];
  let target: 0 | 1 = 0;
  let pending: TracedShape | null = null;
  let morph = 1;
  let burst: { x: number; y: number } | null = null;
  let progress = 0;
  let ink = 0;
  let settled = false;
  let time = 0;
  let width = 1;
  let height = 1;
  let raf = 0;
  let last = performance.now();
  let visible = true;

  const place = (shape: TracedShape, scale: number): Placement => {
    const fit = Math.max(1e-4, Math.min((width * scale) / shape.logoWidth, (height * scale) / shape.logoHeight));
    return {
      fit,
      ox: width / 2 - (shape.pad + shape.logoWidth / 2) * fit,
      oy: height / 2 - (shape.pad + shape.logoHeight / 2) * fit,
      unit: (Math.max(shape.logoWidth, shape.logoHeight) * fit) / 100
    };
  };

  const resize = () => {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));
    renderer.setSize(width, height);
    uniforms.uResolution.value = [width, height];
  };

  /** Swaps in a newly traced shape, cross-morphing from the current one. */
  const advanceMorph = (dt: number) => {
    const incoming = getShape();
    if (incoming && incoming !== slots[target].shape) pending = incoming;
    if (pending && morph >= 1) {
      if (slots[target].shape) {
        target = target === 0 ? 1 : 0;
        morph = 0;
        sparks.length = 0;
      }
      loadSlot(slots[target], pending);
      pending = null;
    }
    if (morph < 1) morph = Math.min(1, morph + dt / (pending ? 0.3 : 1.6));
  };

  const updateHover = (s: EngineSettings, dt: number) => {
    const engaged = s.interactive && pointer.over;
    if (engaged && hover.power < 0.01) {
      hover.x = pointer.x;
      hover.y = pointer.y;
      hover.vx = 0;
      hover.vy = 0;
    }
    hover.vx += ((pointer.x - hover.x) * 120 - hover.vx * 19) * dt;
    hover.vy += ((pointer.y - hover.y) * 120 - hover.vy * 19) * dt;
    hover.x += hover.vx * dt;
    hover.y += hover.vy * dt;
    hover.power += ((engaged ? 1 : 0) - hover.power) * (1 - Math.exp(-dt / (engaged ? 0.3 : 0.55)));
  };

  const updateSparks = (s: EngineSettings, to: TracedShape, near: Placement, presence: number, dt: number) => {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const spark = sparks[i];
      if (spark && time - spark.born > spark.life) sparks.splice(i, 1);
    }
    const focus = (spot: { x: number; y: number }): Focus => ({
      x: (spot.x - near.ox) / near.fit,
      y: (spot.y - near.oy) / near.fit,
      radius: Math.max(1, s.cursorRadius) / near.fit
    });
    if (burst && morph >= 1 && s.arcs > 0) {
      for (let i = 0; i < 3 && sparks.length < ARCS; i++) {
        const spark = spawnArc(to, time, focus(burst));
        if (spark) sparks.push(spark);
      }
    }
    burst = null;
    if (!reducedMotion && presence > 0.8 && morph >= 1 && sparks.length < ARCS) {
      const chance = dt * s.speed * s.arcs;
      if (Math.random() < chance * 6 * hover.power * s.cursorIntensity) {
        const spark = spawnArc(to, time, focus(hover));
        if (spark) sparks.push(spark);
      } else if (Math.random() < chance * 2.2) {
        const spark = spawnArc(to, time, null);
        if (spark) sparks.push(spark);
      }
    }
    for (let i = 0; i < ARCS; i++) {
      const o = i * 4;
      const spark = sparks[i];
      if (!spark) {
        arcShape[o + 1] = 0;
        continue;
      }
      const k = (time - spark.born) / spark.life;
      arcEnds[o] = near.ox + spark.ax * near.fit;
      arcEnds[o + 1] = near.oy + spark.ay * near.fit;
      arcEnds[o + 2] = near.ox + spark.bx * near.fit;
      arcEnds[o + 3] = near.oy + spark.by * near.fit;
      arcShape[o] = spark.bow * near.fit;
      arcShape[o + 1] = Math.sin(Math.PI * Math.min(1, Math.max(0, k))) * presence;
      arcShape[o + 2] = spark.seed;
    }
  };

  const updatePulses = (now: number) => {
    let boost = 0;
    let flash = 0;
    for (let i = pulses.length - 1; i >= 0; i--) {
      const pulse = pulses[i];
      if (pulse && (now - pulse.born) / 1000 > 2) pulses.splice(i, 1);
    }
    for (let i = 0; i < PULSES; i++) {
      const o = i * 4;
      const pulse = pulses[i];
      if (!pulse) {
        pulseData[o + 3] = 0;
        continue;
      }
      const age = (now - pulse.born) / 1000;
      pulseData[o] = pulse.x;
      pulseData[o + 1] = pulse.y;
      pulseData[o + 2] = age;
      pulseData[o + 3] = 1;
      boost = Math.max(boost, Math.exp(-age * 1.7));
      flash += Math.exp(-age * 7);
    }
    uniforms.uPulseBoost.value = boost;
    uniforms.uFlash.value = flash;
  };

  const updateLook = (s: EngineSettings, dt: number) => {
    const targets: [Rgb, Rgb] = [hexToRgb(s.color), hexToRgb(s.glowColor)];
    const shift = settled ? 1 - Math.exp(-dt / 0.35) : 1;
    settled = true;
    hues.forEach((hue, i) => {
      const goal = targets[i === 0 ? 0 : 1];
      for (let c = 0; c < 3; c++) hue[c] = (hue[c] ?? 0) + ((goal[c] ?? 0) - (hue[c] ?? 0)) * shift;
    });
    uniforms.uColor.value = hues[0].slice();
    uniforms.uGlowColor.value = hues[1].slice();
    uniforms.uIntensity.value = s.intensity;
    uniforms.uGlow.value = s.glow;
    uniforms.uThickness.value = s.thickness;
    uniforms.uStrands.value = Math.max(1, Math.min(6, Math.round(s.strands)));
    uniforms.uBend.value = s.bend;
    uniforms.uCrackle.value = s.crackle;
    uniforms.uFlicker.value = reducedMotion ? 0 : s.flicker;
    ink += ((s.theme === 'light' ? 1 : 0) - ink) * (1 - Math.exp(-dt / 0.25));
    uniforms.uFill.value = s.fill;
    uniforms.uInk.value = ink;
  };

  const frame = (now: number) => {
    raf = 0;
    const s = getSettings();
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;

    advanceMorph(dt);
    const to = slots[target].shape;
    const fromSlot = slots[target === 0 ? 1 : 0];
    const from = morph < 1 ? fromSlot.shape : null;
    if (to) progress = Math.min(1, progress + dt / 1.4);
    const presence = smooth(progress);

    if (to) {
      const near = place(to, s.scale);
      const far = from ? place(from, s.scale) : near;
      const unit = far.unit + (near.unit - far.unit) * smooth(morph);

      updateHover(s, dt);
      time += dt * s.speed * (reducedMotion ? 0.2 : 1);
      updateSparks(s, to, near, presence, dt);
      updatePulses(now);

      uniforms.tFieldTo.value = slots[target].field;
      uniforms.tGlowTo.value = slots[target].glow;
      uniforms.tFieldFrom.value = fromSlot.field;
      uniforms.tGlowFrom.value = fromSlot.glow;
      uniforms.uMapTo.value = [near.ox, near.oy, near.fit, to.glowOffset];
      uniforms.uSizeTo.value = [to.width, to.height, to.glowWidth, to.glowHeight];
      if (from) {
        uniforms.uMapFrom.value = [far.ox, far.oy, far.fit, from.glowOffset];
        uniforms.uSizeFrom.value = [from.width, from.height, from.glowWidth, from.glowHeight];
      }
      uniforms.uMorph.value = morph;
      uniforms.uUnit.value = unit;
      uniforms.uTime.value = time;
      uniforms.uPresence.value = presence;
      uniforms.uHover.value = [hover.x, hover.y, hover.power * Math.max(0, s.cursorIntensity)];
      uniforms.uHoverRadius.value = Math.max(1, s.cursorRadius);
      updateLook(s, dt);
      renderer.render({ scene: mesh });
      s.onRender?.(canvas);
    }

    if (visible) raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (raf || !visible) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const onMove = (e: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.over = true;
  };
  const onDown = (e: PointerEvent) => {
    onMove(e);
    if (!getSettings().interactive || reducedMotion) return;
    pulses.push({ x: pointer.x, y: pointer.y, born: performance.now() });
    if (pulses.length > PULSES) pulses.shift();
    burst = { x: pointer.x, y: pointer.y };
  };
  const onLeave = () => {
    pointer.over = false;
  };
  container.addEventListener('pointermove', onMove);
  container.addEventListener('pointerdown', onDown);
  container.addEventListener('pointerleave', onLeave);
  container.addEventListener('pointercancel', onLeave);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    start();
  });
  intersectionObserver.observe(container);

  resize();
  start();

  return () => {
    visible = false;
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    container.removeEventListener('pointermove', onMove);
    container.removeEventListener('pointerdown', onDown);
    container.removeEventListener('pointerleave', onLeave);
    container.removeEventListener('pointercancel', onLeave);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.parentNode?.removeChild(canvas);
  };
};
