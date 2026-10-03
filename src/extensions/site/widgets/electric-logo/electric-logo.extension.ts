import { extensions } from '@wix/astro/builders'

export default extensions.customElement({
  id: 'a22c84c4-981e-491b-82eb-703b07e9423b',
  name: 'Electric Logo',
  width: {
    defaultWidth: 600,
    allowStretch: true
  },
  height: {
    defaultHeight: 420
  },
  installation: {
    autoAdd: true
  },
  presets: [
    {
      id: 'b341e2ef-c1be-4564-92f0-7e543529c9b2',
      name: 'default',
      thumbnailUrl: '{{BASE_URL}}/electric-logo-thumbnail.png',
    },
  ],
  
  tagName: 'electric-logo',
  element: './extensions/site/widgets/electric-logo/electric-logo.tsx',
  settings: './extensions/site/widgets/electric-logo/electric-logo.panel.tsx',
});
