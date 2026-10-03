import type { A11y, Direction, Image } from '@wix/editor-react-types';
import { BOLT } from '../../widgets/electric-logo/lib/constants';

export type ElectricLightningLogoProps = {
  id: string;
  className?: string;
  direction?: Direction;
  a11y?: A11y;

  /** The image whose outline the lightning traces. SVGs and transparent PNGs trace best. */
  logo?: Image;
  /** Dark draws the lightning as emitted light; light draws crisp electric ink for light backgrounds. */
  theme?: 'dark' | 'light';
  /** Size of the logo as a fraction of the component. @min 0.1 @max 1 */
  scale?: number;
  /** Number of filaments tracing the outline. @min 1 @max 6 */
  strands?: number;
  /** Width of the main strand in px. @min 0.5 @max 5 */
  thickness?: number;
  /** How far the strands sway away from the outline. @min 0 @max 2 */
  bend?: number;
  /** Size of the fine crinkle along every strand and arc. @min 0 @max 4 */
  crackle?: number;
  /** How often arcs leap off the edge. 0 turns them off. @min 0 @max 4 */
  arcs?: number;
  /** Overall brightness. @min 0 @max 3 */
  intensity?: number;
  /** Strength of the halo and bloom. @min 0 @max 3 */
  glow?: number;
  /** Translucent glow inside the shape. @min 0 @max 1 */
  fill?: number;
  /** How much the effect pulses and shimmers. @min 0 @max 1 */
  flicker?: number;
  /** Animation speed. @min 0 @max 8 */
  speed?: number;
  /** Hovering charges the lightning; clicking sends a ripple and a burst of arcs. */
  interactive?: boolean;
  /** Strength of the hover charge. @min 0 @max 2 */
  cursorIntensity?: number;
  /** Radius of the charged area around the cursor, in px. @min 20 @max 400 */
  cursorRadius?: number;

  /** Start animating on load. */
  autoPlay?: boolean;
  /** Show the play/pause button always, or only while hovering. */
  pauseButtonVisibility?: 'showAlways' | 'showOnHover';

  onClick?: (event: React.MouseEvent) => void;
  onMouseIn?: (event: React.MouseEvent) => void;
  onMouseOut?: (event: React.MouseEvent) => void;

  elementProps?: {
    playButton?: { className?: string };
  };
};

export const defaultProps = {
  logo: { url: BOLT, alt: 'Lightning bolt' },
  theme: 'dark',
  scale: 0.7,
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
  cursorRadius: 100,
  autoPlay: true,
  pauseButtonVisibility: 'showOnHover',
} as const satisfies Omit<ElectricLightningLogoProps, 'id' | 'className'>;
