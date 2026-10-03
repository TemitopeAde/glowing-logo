export type Theme = 'dark' | 'light';

export interface ElectricLogoSettings {
  logoSrc: string;
  theme: Theme;
  scale: number;
  color: string;
  glowColor: string;
  backgroundColor: string;
  strands: number;
  thickness: number;
  bend: number;
  crackle: number;
  arcs: number;
  intensity: number;
  glow: number;
  fill: number;
  flicker: number;
  speed: number;
  interactive: boolean;
  cursorIntensity: number;
  cursorRadius: number;
}

export type NumberKey = {
  [K in keyof ElectricLogoSettings]: ElectricLogoSettings[K] extends number ? K : never;
}[keyof ElectricLogoSettings];

export type ColorKey = 'color' | 'glowColor' | 'backgroundColor';

/** An empty `logoSrc` means the built-in lightning bolt. */
export const DEFAULT_SETTINGS: ElectricLogoSettings = {
  logoSrc: '',
  theme: 'dark',
  scale: 0.7,
  color: '#ecc7ff',
  glowColor: '#ad6dff',
  backgroundColor: '#0b0614',
  strands: 4,
  thickness: 1.5,
  bend: 0.6,
  crackle: 1.5,
  arcs: 1,
  intensity: 1,
  glow: 1,
  fill: 0,
  flicker: 0.6,
  speed: 2.5,
  interactive: true,
  cursorIntensity: 0.75,
  cursorRadius: 100
};

/** Widget props are HTML attributes, so every key maps to a kebab-case name. */
export const ATTRIBUTES: Record<keyof ElectricLogoSettings, string> = {
  logoSrc: 'logo-src',
  theme: 'theme',
  scale: 'scale',
  color: 'color',
  glowColor: 'glow-color',
  backgroundColor: 'background-color',
  strands: 'strands',
  thickness: 'thickness',
  bend: 'bend',
  crackle: 'crackle',
  arcs: 'arcs',
  intensity: 'intensity',
  glow: 'glow',
  fill: 'fill',
  flicker: 'flicker',
  speed: 'speed',
  interactive: 'interactive',
  cursorIntensity: 'cursor-intensity',
  cursorRadius: 'cursor-radius'
};

export interface RangeSpec {
  label: string;
  tooltip: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export const RANGES: Record<NumberKey, RangeSpec> = {
  scale: {
    label: 'Logo size',
    tooltip: 'Size of the logo as a fraction of the widget. The glow and arcs extend beyond it.',
    min: 0.1,
    max: 1,
    step: 0.05
  },
  strands: {
    label: 'Strands',
    tooltip: 'Number of filaments tracing the outline. Extra strands come and go along the edge.',
    min: 1,
    max: 6,
    step: 1
  },
  thickness: {
    label: 'Thickness',
    tooltip: 'Width of the main strand. Satellite strands are thinner, and every strand swells and thins as it flows.',
    min: 0.5,
    max: 5,
    step: 0.1,
    unit: 'px'
  },
  bend: {
    label: 'Bend',
    tooltip: 'How far the strands sway and ripple away from the outline. The main strand stays closest.',
    min: 0,
    max: 2,
    step: 0.05
  },
  crackle: {
    label: 'Crackle',
    tooltip: 'Size of the fine crinkle along every strand and arc.',
    min: 0,
    max: 4,
    step: 0.1
  },
  arcs: {
    label: 'Arc frequency',
    tooltip: 'How often short arcs leap off the edge and land further along it. 0 turns them off.',
    min: 0,
    max: 4,
    step: 0.1
  },
  intensity: {
    label: 'Intensity',
    tooltip: 'Overall brightness of the effect.',
    min: 0,
    max: 3,
    step: 0.05
  },
  glow: {
    label: 'Glow',
    tooltip: 'Strength of the halo around strands and the soft bloom around the shape.',
    min: 0,
    max: 3,
    step: 0.05
  },
  fill: {
    label: 'Inner fill',
    tooltip: 'Translucent glow inside the shape, brightest near its edges.',
    min: 0,
    max: 1,
    step: 0.05
  },
  flicker: {
    label: 'Flicker',
    tooltip: 'How much the whole effect pulses and each strand shimmers in brightness.',
    min: 0,
    max: 1,
    step: 0.05
  },
  speed: {
    label: 'Speed',
    tooltip: 'Animation speed. 0 freezes the current frame.',
    min: 0,
    max: 8,
    step: 0.1
  },
  cursorIntensity: {
    label: 'Hover charge',
    tooltip: 'How strongly the lightning charges up around the cursor. 0 turns the hover charge off.',
    min: 0,
    max: 2,
    step: 0.05
  },
  cursorRadius: {
    label: 'Hover radius',
    tooltip: 'Radius of the charged area around the cursor.',
    min: 20,
    max: 400,
    step: 5,
    unit: 'px'
  }
};

const clamp = (value: number, { min, max }: RangeSpec) => Math.min(max, Math.max(min, value));

/** Builds settings from attribute values, falling back to defaults for missing or malformed ones. */
export const parseSettings = (read: (attribute: string) => string | null | undefined): ElectricLogoSettings => {
  const text = (key: keyof ElectricLogoSettings, fallback: string) => {
    const value = read(ATTRIBUTES[key]);
    return value ? value : fallback;
  };
  const numberOf = (key: NumberKey) => {
    const value = Number.parseFloat(text(key, ''));
    return Number.isFinite(value) ? clamp(value, RANGES[key]) : DEFAULT_SETTINGS[key];
  };
  const interactive = read(ATTRIBUTES.interactive);

  const numbers = Object.fromEntries(
    (Object.keys(RANGES) as NumberKey[]).map((key) => [key, numberOf(key)])
  ) as Record<NumberKey, number>;

  return {
    ...numbers,
    logoSrc: text('logoSrc', DEFAULT_SETTINGS.logoSrc),
    theme: read(ATTRIBUTES.theme) === 'light' ? 'light' : 'dark',
    color: text('color', DEFAULT_SETTINGS.color),
    glowColor: text('glowColor', DEFAULT_SETTINGS.glowColor),
    backgroundColor: text('backgroundColor', DEFAULT_SETTINGS.backgroundColor),
    interactive: interactive ? interactive !== 'false' : DEFAULT_SETTINGS.interactive
  };
};

/** Serialises a single setting to the string form `widget.setProp` stores. */
export const serializeSetting = <K extends keyof ElectricLogoSettings>(value: ElectricLogoSettings[K]) =>
  String(value);
