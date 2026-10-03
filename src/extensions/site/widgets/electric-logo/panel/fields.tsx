import React, { type FC } from 'react';
import { inputs } from '@wix/editor';
import {
  Box,
  FillPreview,
  FormField,
  SegmentedToggle,
  SidePanel,
  Slider,
  Text,
  TextButton,
  ToggleSwitch
} from '@wix/design-system';
import { RANGES, type NumberKey, type Theme } from '../settings';

const formatNumber = (value: number, step: number, unit = '') => {
  const decimals = step >= 1 ? 0 : String(step).split('.')[1]?.length ?? 2;
  return `${value.toFixed(decimals)}${unit}`;
};

interface SliderFieldProps {
  field: NumberKey;
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export const SliderField: FC<SliderFieldProps> = ({ field, value, disabled = false, onChange }) => {
  const { label, tooltip, min, max, step, unit } = RANGES[field];
  return (
    <SidePanel.Field>
      <FormField
        label={label}
        infoContent={tooltip}
        suffix={
          <Text size="small" secondary>
            {formatNumber(value, step, unit)}
          </Text>
        }
      >
        <Slider
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          displayMarks={false}
          ariaLabelForHandle={label}
          formatValue={(v) => formatNumber(v, step, unit)}
          onChange={(next) => {
            if (typeof next === 'number') onChange(next);
          }}
        />
      </FormField>
    </SidePanel.Field>
  );
};

interface ColorFieldProps {
  label: string;
  tooltip: string;
  value: string;
  onChange: (value: string) => void;
  onReset?: () => void;
}

export const ColorField: FC<ColorFieldProps> = ({ label, tooltip, value, onChange, onReset }) => (
  <SidePanel.Field>
    <FormField
      label={label}
      infoContent={tooltip}
      suffix={
        onReset ? (
          <TextButton size="small" onClick={onReset}>
            Reset
          </TextButton>
        ) : undefined
      }
    >
      <Box width="48px" height="30px">
        <FillPreview
          fill={value}
          aria-label={`Choose ${label.toLowerCase()}`}
          onClick={() =>
            inputs
              .selectColor(value, {
                onChange: (next) => {
                  if (next) onChange(next);
                }
              })
              .catch((error: unknown) => console.error(`Failed to open color picker for ${label}:`, error))
          }
        />
      </Box>
    </FormField>
  </SidePanel.Field>
);

interface ToggleFieldProps {
  label: string;
  tooltip: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ToggleField: FC<ToggleFieldProps> = ({ label, tooltip, checked, onChange }) => (
  <SidePanel.Field>
    <FormField label={label} infoContent={tooltip} labelPlacement="left" stretchContent={false}>
      <ToggleSwitch size="small" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </FormField>
  </SidePanel.Field>
);

interface ThemeFieldProps {
  value: Theme;
  onChange: (value: Theme) => void;
}

export const ThemeField: FC<ThemeFieldProps> = ({ value, onChange }) => (
  <SidePanel.Field>
    <FormField
      label="Render style"
      infoContent="Dark renders the lightning as emitted light for dark backgrounds. Light renders crisp electric ink with a white-hot core for light backgrounds."
    >
      <SegmentedToggle
        size="small"
        selected={value}
        onClick={(_event, next) => onChange(next === 'light' ? 'light' : 'dark')}
      >
        <SegmentedToggle.Button value="dark">Dark</SegmentedToggle.Button>
        <SegmentedToggle.Button value="light">Light</SegmentedToggle.Button>
      </SegmentedToggle>
    </FormField>
  </SidePanel.Field>
);
