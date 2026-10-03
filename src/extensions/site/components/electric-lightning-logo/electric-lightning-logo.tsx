import React, { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import classNames from 'classnames';
import { useReducedMotion } from '@wix/react-component-utils';
import { startEngine, type EngineSettings } from '../../widgets/electric-logo/lib/engine';
import { traceShape, type TracedShape } from '../../widgets/electric-logo/lib/trace';
import styles from './electric-lightning-logo.module.css';
import { defaultProps, type ElectricLightningLogoProps } from './electric-lightning-logo.props';
import { createColorReader } from './use-css-colors';

const ARIA_LABELS = {
  playButton: 'Play animation',
  pauseButton: 'Pause animation',
  logoFallback: 'Animated electric logo',
} as const;

const PlayIcon: FC = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);

const PauseIcon: FC = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
  </svg>
);

const ElectricLightningLogo: FC<ElectricLightningLogoProps> = (props) => {
  const {
    id,
    className,
    direction,
    a11y,
    logo,
    autoPlay,
    pauseButtonVisibility,
    onClick,
    onMouseIn,
    onMouseOut,
    elementProps,
  } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<TracedShape | null>(null);
  const reducedMotion = useReducedMotion();

  const [isPlayOn, setIsPlayOn] = useState(() => (autoPlay ?? true) && !reducedMotion);
  const previousAutoPlay = useRef(autoPlay);
  useEffect(() => {
    if (previousAutoPlay.current !== autoPlay) {
      setIsPlayOn((autoPlay ?? true) && !reducedMotion);
    } else if (reducedMotion) {
      setIsPlayOn(false);
    }
    previousAutoPlay.current = autoPlay;
  }, [autoPlay, reducedMotion]);

  // The engine pulls settings every frame, so prop changes never restart the WebGL context.
  const settingsRef = useRef<Omit<EngineSettings, 'color' | 'glowColor'>>({ ...defaultProps, speed: 0 });
  settingsRef.current = {
    theme: props.theme ?? defaultProps.theme,
    scale: props.scale ?? defaultProps.scale,
    strands: props.strands ?? defaultProps.strands,
    thickness: props.thickness ?? defaultProps.thickness,
    bend: props.bend ?? defaultProps.bend,
    crackle: props.crackle ?? defaultProps.crackle,
    arcs: props.arcs ?? defaultProps.arcs,
    intensity: props.intensity ?? defaultProps.intensity,
    glow: props.glow ?? defaultProps.glow,
    fill: props.fill ?? defaultProps.fill,
    flicker: props.flicker ?? defaultProps.flicker,
    speed: isPlayOn ? props.speed ?? defaultProps.speed : 0,
    interactive: props.interactive ?? defaultProps.interactive,
    cursorIntensity: props.cursorIntensity ?? defaultProps.cursorIntensity,
    cursorRadius: props.cursorRadius ?? defaultProps.cursorRadius,
  };

  const logoUrl = logo?.url ?? defaultProps.logo.url;
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
        console.error('ElectricLightningLogo: could not trace the logo image.', error);
      }
    };
    image.onerror = () => {
      if (alive) console.error(`ElectricLightningLogo: could not load "${logoUrl}".`);
    };
    image.src = logoUrl;
    return () => {
      alive = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [logoUrl]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const readColors = createColorReader(rootRef);
    return startEngine(
      stage,
      () => {
        const colors = readColors();
        return { ...settingsRef.current, color: colors.core, glowColor: colors.glow };
      },
      () => shapeRef.current,
    );
  }, []);

  return (
    <div
      ref={rootRef}
      id={id}
      dir={direction}
      className={classNames('electric-lightning-logo', styles.root, styles.fallbackDirection, className)}
      data-pause-button-visibility={pauseButtonVisibility ?? defaultProps.pauseButtonVisibility}
      onClick={onClick}
      onMouseEnter={onMouseIn}
      onMouseLeave={onMouseOut}
    >
      <div
        ref={stageRef}
        className={styles.stage}
        role="img"
        aria-label={a11y?.ariaLabel ?? logo?.alt ?? ARIA_LABELS.logoFallback}
      />
      <button
        type="button"
        {...elementProps?.playButton}
        className={classNames('electric-lightning-logo-play-button', styles.playButton, elementProps?.playButton?.className)}
        onClick={(event) => {
          event.stopPropagation();
          setIsPlayOn((on) => !on);
        }}
        aria-label={isPlayOn ? ARIA_LABELS.pauseButton : ARIA_LABELS.playButton}
      >
        {isPlayOn ? <PauseIcon /> : <PlayIcon />}
      </button>
    </div>
  );
};

export default ElectricLightningLogo;
