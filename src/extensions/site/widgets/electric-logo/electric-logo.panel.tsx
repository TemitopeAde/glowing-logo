import React, { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';
import { widget } from '@wix/editor';
import { Accordion, Box, Button, InfoIcon, Loader, SidePanel, WixDesignSystemProvider } from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import {
  ATTRIBUTES,
  DEFAULT_SETTINGS,
  parseSettings,
  serializeSetting,
  type ElectricLogoSettings,
  type NumberKey
} from './settings';
import { ColorField, SliderField, ThemeField, ToggleField } from './panel/fields';
import { LogoField } from './panel/LogoField';

const Section: FC<{ title: string; tooltip: string; children: ReactNode }> = ({ title, tooltip, children }) => (
  <Accordion
    skin="light"
    hideShadow
    size="small"
    contentPadding="none"
    items={[
      {
        key: title,
        title,
        suffix: <InfoIcon size="small" content={tooltip} />,
        initiallyOpen: false,
        children: (
          <SidePanel.Section title={title} titleVisible={false}>
            {children}
          </SidePanel.Section>
        )
      }
    ]}
  />
);

const loadSettings = async (): Promise<ElectricLogoSettings> => {
  const keys = Object.keys(ATTRIBUTES) as (keyof ElectricLogoSettings)[];
  const values = await Promise.all(keys.map((key) => widget.getProp(ATTRIBUTES[key])));
  const byAttribute = new Map(keys.map((key, i) => [ATTRIBUTES[key], values[i]]));
  return parseSettings((attribute) => byAttribute.get(attribute));
};

const Panel: FC = () => {
  const [settings, setSettings] = useState<ElectricLogoSettings | null>(null);

  useEffect(() => {
    loadSettings()
      .then(setSettings)
      .catch((error: unknown) => {
        console.error('Failed to load Electric Logo settings:', error);
        setSettings(DEFAULT_SETTINGS);
      });
  }, []);

  const update = useCallback(<K extends keyof ElectricLogoSettings>(key: K, value: ElectricLogoSettings[K]) => {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
    widget
      .setProp(ATTRIBUTES[key], serializeSetting<K>(value))
      .catch((error: unknown) => console.error(`Failed to save ${ATTRIBUTES[key]}:`, error));
  }, []);

  const resetAll = useCallback(() => {
    const keys = Object.keys(DEFAULT_SETTINGS) as (keyof ElectricLogoSettings)[];
    keys.forEach((key) => update(key, DEFAULT_SETTINGS[key]));
  }, [update]);

  if (!settings) {
    return (
      <WixDesignSystemProvider>
        <Box align="center" verticalAlign="middle" height="100vh">
          <Loader size="small" />
        </Box>
      </WixDesignSystemProvider>
    );
  }

  const slider = (field: NumberKey, disabled = false) => (
    <SliderField field={field} value={settings[field]} disabled={disabled} onChange={(v) => update(field, v)} />
  );

  return (
    <WixDesignSystemProvider>
      <SidePanel width="300" height="100vh">
        <SidePanel.Content noPadding stretchVertically>
          <Section title="Logo" tooltip="The image whose outline the lightning traces, and how large it sits in the widget.">
            <LogoField value={settings.logoSrc} onChange={(src) => update('logoSrc', src)} />
            {slider('scale')}
          </Section>

          <Section title="Colors & style" tooltip="Strand colours, the widget background and whether the effect is drawn as light or ink.">
            <ThemeField value={settings.theme} onChange={(theme) => update('theme', theme)} />
            <ColorField
              label="Core color"
              tooltip="Colour of the hot core of every strand."
              value={settings.color}
              onChange={(v) => update('color', v)}
            />
            <ColorField
              label="Glow color"
              tooltip="Colour of the glow around the strands, the bloom and the interior fill."
              value={settings.glowColor}
              onChange={(v) => update('glowColor', v)}
            />
            <ColorField
              label="Background"
              tooltip="Widget background. Use a dark background with the Dark style and a light one with the Light style."
              value={settings.backgroundColor}
              onChange={(v) => update('backgroundColor', v)}
              onReset={() => update('backgroundColor', DEFAULT_SETTINGS.backgroundColor)}
            />
          </Section>

          <Section title="Lightning" tooltip="Shape of the electric filaments that run along the outline, and the arcs that jump off it.">
            {slider('strands')}
            {slider('thickness')}
            {slider('bend')}
            {slider('crackle')}
            {slider('arcs')}
          </Section>

          <Section title="Glow & light" tooltip="Brightness of the effect, its halo, the fill inside the shape and how much it flickers.">
            {slider('intensity')}
            {slider('glow')}
            {slider('fill')}
            {slider('flicker')}
          </Section>

          <Section title="Animation" tooltip="How fast the lightning moves. Visitors who prefer reduced motion see a slower, steadier version.">
            {slider('speed')}
          </Section>

          <Section title="Interaction" tooltip="How the lightning reacts to visitors. Hovering charges it around the cursor; clicking sends a ripple and a burst of arcs.">
            <ToggleField
              label="Pointer interaction"
              tooltip="Turn hover charging and click ripples on or off."
              checked={settings.interactive}
              onChange={(v) => update('interactive', v)}
            />
            {slider('cursorIntensity', !settings.interactive)}
            {slider('cursorRadius', !settings.interactive)}
          </Section>
        </SidePanel.Content>
        <SidePanel.Footer>
          <Button size="small" priority="secondary" fullWidth onClick={resetAll}>
            Reset all to defaults
          </Button>
        </SidePanel.Footer>
      </SidePanel>
    </WixDesignSystemProvider>
  );
};

export default Panel;
