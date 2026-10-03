import React, { useEffect, useRef, type CSSProperties, type FC } from 'react';
import { BOLT } from './constants';
import { startEngine, type EngineSettings } from './engine';
import { traceShape, type TracedShape } from './trace';
import styles from './ElectricLogo.module.css';

export interface ElectricLogoProps extends Partial<EngineSettings> {
  src?: string;
  className?: string;
  style?: CSSProperties;
}

const DEFAULTS: EngineSettings = {
  color: '#ecc7ff',
  glowColor: '#ad6dff',
  scale: 0.7,
  intensity: 1,
  glow: 1,
  thickness: 1.5,
  strands: 4,
  bend: 0.6,
  crackle: 1.5,
  arcs: 1,
  flicker: 0.6,
  fill: 0,
  speed: 2.5,
  interactive: true,
  cursorIntensity: 0.75,
  cursorRadius: 100,
  theme: 'dark'
};

/** Traces any image's outline and animates electric strands, arcs and glow around it (React Bits ElectricLogo). */
const ElectricLogo: FC<ElectricLogoProps> = ({ src = BOLT, className = '', style, ...settings }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<EngineSettings>(DEFAULTS);
  const shapeRef = useRef<TracedShape | null>(null);

  settingsRef.current = { ...DEFAULTS, ...stripUndefined(settings) };

  useEffect(() => {
    let alive = true;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => {
      if (!alive) return;
      try {
        const traced = traceShape(image);
        if (traced) shapeRef.current = traced;
      } catch (error) {
        console.error('ElectricLogo: failed to trace logo image', error);
      }
    };
    image.onerror = () => {
      if (alive) console.error(`ElectricLogo: could not load logo image "${src}"`);
    };
    image.src = src || BOLT;
    return () => {
      alive = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [src]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    return startEngine(
      container,
      () => settingsRef.current,
      () => shapeRef.current
    );
  }, []);

  return <div ref={containerRef} className={`${styles.electricLogo} ${className}`.trim()} style={style} />;
};

const stripUndefined = (values: Partial<EngineSettings>): Partial<EngineSettings> =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));

export default ElectricLogo;
