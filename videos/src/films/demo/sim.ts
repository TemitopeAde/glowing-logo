import { ARCS } from "../../../../src/extensions/site/widgets/electric-logo/lib/constants";
import { spawnArc, type Focus, type Spark } from "../../../../src/extensions/site/widgets/electric-logo/lib/trace";
import { place, seeded } from "../../electric/place";
import type { Shapes } from "../../electric/shapes";
import { CUES, DURATION } from "./cues";
import { widgetRect } from "./layout";
import { cursor, presenceAt, settingsAt, shapeAt, strikes } from "./timeline";

export const SIM_FPS = 60;

export interface Snapshot {
  time: number;
  hover: { x: number; y: number; power: number };
  sparks: Spark[];
}

/**
 * Replays the widget engine's per-frame state (shader clock, hover spring, arc spawning) at a fixed
 * step with a seeded RNG. Every frame of the film is then a lookup, so renders are deterministic and
 * any frame can be rendered on its own.
 */
const simulate = (shapes: Shapes): Snapshot[] => {
  const random = seeded(20261002);
  const dt = 1 / SIM_FPS;
  const steps = Math.ceil(DURATION * SIM_FPS) + 1;
  const hover = { x: 0, y: 0, vx: 0, vy: 0, power: 0 };
  let sparks: Spark[] = [];
  let time = 0;
  let lastTarget = shapeAt(0).to;
  const out: Snapshot[] = [];

  for (let i = 0; i < steps; i++) {
    const t = i * dt;
    const s = settingsAt(t);
    const { to, morph } = shapeAt(t);
    const rect = widgetRect(t);
    const shape = shapes[to];
    const near = place(shape, s.scale, rect.w, rect.h);
    if (to !== lastTarget) {
      sparks = [];
      lastTarget = to;
    }

    const c = cursor(t);
    const px = c.x - rect.x;
    const py = c.y - rect.y;
    const over = t >= CUES.hoverStart && t < CUES.toStage && px >= 0 && py >= 0 && px <= rect.w && py <= rect.h;
    if (over && hover.power < 0.01) {
      hover.x = px;
      hover.y = py;
      hover.vx = 0;
      hover.vy = 0;
    }
    if (over || hover.power > 0.001) {
      hover.vx += ((px - hover.x) * 120 - hover.vx * 19) * dt;
      hover.vy += ((py - hover.y) * 120 - hover.vy * 19) * dt;
      hover.x += hover.vx * dt;
      hover.y += hover.vy * dt;
    }
    hover.power += ((over ? 1 : 0) - hover.power) * (1 - Math.exp(-dt / (over ? 0.3 : 0.55)));

    time += dt * s.speed;
    sparks = sparks.filter((spark) => time - spark.born <= spark.life);

    const focus = (x: number, y: number): Focus => ({
      x: (x - near.ox) / near.fit,
      y: (y - near.oy) / near.fit,
      radius: Math.max(1, s.cursorRadius) / near.fit,
    });
    const struck = strikes.some((strike) => strike > t - dt && strike <= t);
    if (struck && morph >= 1 && s.arcs > 0) {
      for (let k = 0; k < 3 && sparks.length < ARCS; k++) {
        const spark = spawnArc(shape, time, focus(px, py), random);
        if (spark) sparks.push(spark);
      }
    }
    if (presenceAt(t) > 0.8 && morph >= 1 && sparks.length < ARCS) {
      const chance = dt * s.speed * s.arcs;
      if (random() < chance * 6 * hover.power * s.cursorIntensity) {
        const spark = spawnArc(shape, time, focus(hover.x, hover.y), random);
        if (spark) sparks.push(spark);
      } else if (random() < chance * 2.2) {
        const spark = spawnArc(shape, time, null, random);
        if (spark) sparks.push(spark);
      }
    }

    out.push({ time, hover: { x: hover.x, y: hover.y, power: hover.power }, sparks: sparks.slice(0, ARCS) });
  }
  return out;
};

let memo: { shapes: Shapes; snapshots: Snapshot[] } | null = null;

export const snapshotAt = (shapes: Shapes, t: number): Snapshot => {
  if (!memo || memo.shapes !== shapes) memo = { shapes, snapshots: simulate(shapes) };
  const index = Math.max(0, Math.min(memo.snapshots.length - 1, Math.round(t * SIM_FPS)));
  const snapshot = memo.snapshots[index];
  if (!snapshot) throw new Error(`No simulation snapshot at ${t}s`);
  return snapshot;
};
