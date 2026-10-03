import { extensions } from '@wix/astro/builders'
import { LAYOUT } from '@wix/react-component-schema';
import { withEditorElementDefaults } from '@wix/react-component-utils';
import merge from 'deepmerge';
import { editorElement } from './electric-lightning-logo.generated';
import { defaultProps } from './electric-lightning-logo.props';
import componentUrl from './component.tsx?url';
import componentPreviewUrl from './component.preview.tsx?url';

const editorElementWithDefaults = withEditorElementDefaults(
  editorElement,
  defaultProps
);

export default extensions.editorReactComponent({
  id: 'b68afbdb-8ff3-4663-bba2-619694a200a4',
  type: 'glowing_logo.ElectricLightningLogo',
  displayName: 'Electric Lightning Logo',
  description: 'Your logo traced in animated electric lightning, with glowing strands, leaping arcs and a hover charge. Use it as a striking hero or brand mark on dark or light sections.',
  editorElement: merge(
    editorElementWithDefaults,
    {
      layout: {
        resizeDirection: LAYOUT.RESIZE_DIRECTION.horizontalAndVertical,
        contentResizeDirection: LAYOUT.CONTENT_RESIZE_DIRECTION.none,
      },
    }
  ),
  installation: {
    initialSize: {
      width: {
        sizingType: LAYOUT.SIZING_TYPE.pixels,
        pixels: 600,
      },
      height: {
        sizingType: LAYOUT.SIZING_TYPE.pixels,
        pixels: 400,
      },
    },
    staticContainer: 'HOMEPAGE',
  },
  resources: {
    client: {
      componentUrl,
    },
    editor: {
      componentUrl: componentPreviewUrl,
    },
  },
});
