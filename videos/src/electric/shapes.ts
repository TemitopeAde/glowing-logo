import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { BOLT } from "../../../src/extensions/site/widgets/electric-logo/lib/constants";
import { traceShape, type TracedShape } from "../../../src/extensions/site/widgets/electric-logo/lib/trace";

export type ShapeId = "bolt" | "voltra" | "app";
export type Shapes = Record<ShapeId, TracedShape>;

const SOURCES: Record<ShapeId, string> = {
  bolt: BOLT,
  voltra: staticFile("logos/voltra-mark.svg"),
  app: staticFile("logos/electric-logo-mark.svg"),
};

const load = (src: string) =>
  new Promise<TracedShape>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const traced = traceShape(image);
      if (traced) resolve(traced);
      else reject(new Error(`Could not trace ${src}`));
    };
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });

let cache: Promise<Shapes> | null = null;

/** Traces every logo once per page. The renderer waits for it before capturing any frame. */
export const loadShapes = () => {
  cache ??= Promise.all((Object.keys(SOURCES) as ShapeId[]).map((id) => load(SOURCES[id]).then((shape) => [id, shape] as const))).then(
    (entries) => Object.fromEntries(entries) as Shapes,
  );
  return cache;
};

export function useShapes() {
  const [shapes, setShapes] = useState<Shapes | null>(null);
  const [handle] = useState(() => delayRender("Tracing logos"));
  useEffect(() => {
    loadShapes()
      .then((value) => {
        setShapes(value);
        continueRender(handle);
      })
      .catch((error: unknown) => {
        console.error(error);
        continueRender(handle);
      });
  }, [handle]);
  return shapes;
}
