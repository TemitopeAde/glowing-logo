// This file wires your component with its default props and exports it for use by the extension.
// Please do not modify the structure or logic of this file

import { withDefaults } from '@wix/react-component-utils';
import Component from './electric-lightning-logo';
import { defaultProps } from './electric-lightning-logo.props';

const ElectricLightningLogo = withDefaults(
  Component,
  defaultProps
);

export default ElectricLightningLogo;
