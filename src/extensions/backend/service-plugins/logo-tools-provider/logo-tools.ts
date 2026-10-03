import { auth } from '@wix/essentials';
import { files } from '@wix/media';
import {
  ATTRIBUTES,
  DEFAULT_SETTINGS,
  RANGES,
  type ElectricLogoSettings,
  type NumberKey,
} from '../../../site/widgets/electric-logo/settings';

export type Payload = Record<string, unknown> | undefined;

const LOGO_FOLDER = '/electric-logo';
const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

const elevatedImportFile = auth.elevate(files.importFile);

const readString = (payload: Payload, key: string) => {
  const value = payload?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

const normalizeHex = (value: string | undefined) => {
  if (!value || !HEX.test(value)) return undefined;
  let hex = value.replace('#', '').toLowerCase();
  if (hex.length === 3) hex = hex.replace(/./g, (c) => c + c);
  return `#${hex}`;
};

const mixHex = (a: string, b: string, amount: number) => {
  const channel = (hex: string, i: number) => Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2]
    .map((i) => Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * amount).toString(16).padStart(2, '0'))
    .join('')}`;
};

/** Where each setting lives in the Electric Logo widget's settings panel. */
const PANEL_SECTION: Record<keyof ElectricLogoSettings, string> = {
  logoSrc: 'Logo',
  scale: 'Logo',
  theme: 'Colors & style',
  color: 'Colors & style',
  glowColor: 'Colors & style',
  backgroundColor: 'Colors & style',
  strands: 'Lightning',
  thickness: 'Lightning',
  bend: 'Lightning',
  crackle: 'Lightning',
  arcs: 'Lightning',
  intensity: 'Glow & light',
  glow: 'Glow & light',
  fill: 'Glow & light',
  flicker: 'Glow & light',
  speed: 'Animation',
  interactive: 'Interaction',
  cursorIntensity: 'Interaction',
  cursorRadius: 'Interaction',
};

const NON_NUMERIC_HELP: Partial<Record<keyof ElectricLogoSettings, { label: string; description: string }>> = {
  logoSrc: { label: 'Logo image', description: 'The image the lightning traces. Upload in the panel, paste a URL, or import one with the import-logo tool. SVGs and transparent PNGs trace best.' },
  theme: { label: 'Render style', description: 'Dark draws the lightning as emitted light for dark backgrounds; Light draws crisp electric ink for light backgrounds.' },
  color: { label: 'Core color', description: 'Colour of the hot core of every strand.' },
  glowColor: { label: 'Glow color', description: 'Colour of the glow around the strands, the bloom and the interior fill.' },
  backgroundColor: { label: 'Background', description: 'Widget background. Pair a dark background with the Dark style and a light one with the Light style.' },
  interactive: { label: 'Pointer interaction', description: 'Hovering charges the lightning around the cursor; clicking sends a ripple and a burst of arcs.' },
};

export const explainSettings = (payload: Payload) => {
  const only = readString(payload, 'setting');
  const keys = (Object.keys(DEFAULT_SETTINGS) as Array<keyof ElectricLogoSettings>).filter(
    (key) => !only || key.toLowerCase() === only.toLowerCase() || ATTRIBUTES[key] === only.toLowerCase(),
  );
  if (only && keys.length === 0) {
    throw new Error(`Unknown setting "${only}". Known settings: ${Object.keys(DEFAULT_SETTINGS).join(', ')}.`);
  }
  return {
    settings: keys.map((key) => {
      const range = key in RANGES ? RANGES[key as NumberKey] : undefined;
      const text = NON_NUMERIC_HELP[key];
      return {
        key,
        label: range?.label ?? text?.label ?? key,
        description: range?.tooltip ?? text?.description ?? '',
        panelSection: PANEL_SECTION[key],
        defaultValue: DEFAULT_SETTINGS[key],
        ...(range ? { min: range.min, max: range.max, step: range.step, unit: range.unit ?? '' } : {}),
      };
    }),
    whereToChange:
      'In the Wix Editor, select the Electric Logo widget and open its Settings panel (sections: Logo, Colors & style, Lightning, Glow & light, Animation, Interaction). The Electric Lightning Logo component exposes the same options in the Inspector, with Core Color and Glow Color under its design settings.',
  };
};

type Mood = 'calm' | 'balanced' | 'intense';

const MOODS: Record<Mood, Partial<Record<NumberKey, number>>> = {
  calm: { strands: 2, thickness: 1.2, bend: 0.4, crackle: 0.8, arcs: 0.3, intensity: 0.9, glow: 0.9, fill: 0.1, flicker: 0.2, speed: 1.2 },
  balanced: {},
  intense: { strands: 6, thickness: 2, bend: 1.1, crackle: 3, arcs: 3, intensity: 1.4, glow: 1.5, fill: 0.15, flicker: 0.9, speed: 4.5 },
};

export const recommendStyle = (payload: Payload) => {
  const primary = normalizeHex(readString(payload, 'primaryColor'));
  if (!primary) throw new Error('primaryColor is required as a hex colour such as "#7c3aed".');
  const secondary = normalizeHex(readString(payload, 'secondaryColor'));
  const background = readString(payload, 'background') === 'light' ? 'light' : 'dark';
  const moodInput = readString(payload, 'mood');
  const mood: Mood = moodInput === 'calm' || moodInput === 'intense' ? moodInput : 'balanced';

  const numbers = Object.fromEntries(
    (Object.keys(RANGES) as Array<NumberKey>).map((key) => {
      const { min, max } = RANGES[key];
      const value = MOODS[mood][key] ?? DEFAULT_SETTINGS[key];
      return [key, Math.min(max, Math.max(min, value))];
    }),
  ) as Record<NumberKey, number>;

  const dark = background === 'dark';
  return {
    settings: {
      ...numbers,
      theme: dark ? 'dark' : 'light',
      // On dark, the core reads as white-hot light; on light, it stays saturated like ink.
      color: dark ? mixHex(primary, '#ffffff', 0.72) : mixHex(primary, '#000000', 0.15),
      glowColor: secondary ?? primary,
      backgroundColor: dark ? mixHex(primary, '#000000', 0.93) : '#ffffff',
    },
    mood,
    howToApply:
      'Open the Electric Logo widget Settings panel in the Wix Editor and set each value in its section, or set the matching props on the Electric Lightning Logo component. Use Render style "Light" only on a light background.',
  };
};

export const importLogo = async (payload: Payload) => {
  const url = readString(payload, 'url');
  if (!url) throw new Error('url is required: a public link to the logo image.');
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('url must be a valid absolute URL.');
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('url must use http or https.');
  }
  const displayName = readString(payload, 'displayName');

  const { file } = await elevatedImportFile(parsed.href, {
    mediaType: 'IMAGE',
    filePath: LOGO_FOLDER,
    ...(displayName ? { displayName: displayName.slice(0, 200) } : {}),
  });
  if (!file) throw new Error('The Media Manager did not return the imported file.');
  return {
    fileId: file._id,
    url: file.url,
    displayName: file.displayName,
    operationStatus: file.operationStatus,
    nextStep:
      'The image is in the Media Manager under /electric-logo. It may take a few seconds to finish processing. Then paste the URL into the Electric Logo widget panel (Logo → Or image URL), or choose it as the Logo of the Electric Lightning Logo component.',
  };
};
