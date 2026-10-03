// Editor preview entry: in design mode the lightning holds still and the play/pause
// control stays visible, so site owners can edit without a running animation.

import React from 'react';
import type { ComponentProps, FC } from 'react';
import {
  useIsEditMode,
  withDefaults,
  withFallbackPlaceholder,
} from '@wix/react-component-utils';
import Component from './electric-lightning-logo';
import { defaultProps } from './electric-lightning-logo.props';

const ElectricLightningLogoPreview: FC<ComponentProps<typeof Component>> = (props) => {
  const isEditMode = useIsEditMode();
  return (
    <Component
      {...props}
      autoPlay={isEditMode ? false : props.autoPlay}
      pauseButtonVisibility={isEditMode ? 'showAlways' : props.pauseButtonVisibility}
    />
  );
};

const ElectricLightningLogoPreviewWithFallback = withFallbackPlaceholder(ElectricLightningLogoPreview, {
  requiredDataFields: ['logo'],
  rootClassName: 'electric-lightning-logo',
});

export default withDefaults(
  ElectricLightningLogoPreviewWithFallback,
  defaultProps
);
