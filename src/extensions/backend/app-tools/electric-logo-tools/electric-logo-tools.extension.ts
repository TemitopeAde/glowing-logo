import { extensions } from '@wix/astro/builders'

export default extensions.appTools({
  id: '34f31a41-add0-4cb7-980d-c3abeed8d5af',
  name: 'electric-logo-tools',
  // Handled by the logo-tools-provider service plugin; methodName is the routing key.
  tools: [
    {
      methodName: 'explain-settings',
      displayName: 'Explain Electric Logo Settings',
      description:
        'Explains the Electric Logo settings: what each one does, its range, default value and which section of the settings panel it is in. Use this when the user asks what a setting like strands, crackle, bend, arcs, glow, fill, flicker, speed, hover charge or render style does, how to make the lightning thicker, calmer or brighter, or where to find an option. Optionally pass a single setting name; omit it to get every setting.',
      activated: true,
      requestSchema: {
        type: 'object',
        properties: {
          setting: {
            type: 'string',
            description: 'Optional setting key, e.g. "crackle" or "cursorRadius". Omit to list all settings.',
          },
        },
      },
      responseSchema: {
        type: 'object',
        properties: {
          settings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string' },
                label: { type: 'string' },
                description: { type: 'string' },
                panelSection: { type: 'string' },
                min: { type: 'number' },
                max: { type: 'number' },
                step: { type: 'number' },
                unit: { type: 'string' },
              },
            },
          },
          whereToChange: { type: 'string' },
        },
      },
    },
    {
      methodName: 'recommend-style',
      displayName: 'Recommend Electric Logo Style',
      description:
        'Recommends a complete Electric Logo look from brand colours: core and glow colours, background, render style and every lightning setting. Use this when the user wants the electric logo to match their brand, asks which colours or settings to use, or wants it calmer, more balanced or more intense. Requires primaryColor as a hex colour; secondaryColor, background (dark or light) and mood (calm, balanced or intense) are optional.',
      activated: true,
      requestSchema: {
        type: 'object',
        properties: {
          primaryColor: { type: 'string', description: 'Main brand colour as hex, e.g. "#7c3aed".' },
          secondaryColor: { type: 'string', description: 'Optional second brand colour as hex, used for the glow.' },
          background: { type: 'string', enum: ['dark', 'light'], description: 'The background the logo sits on. Default dark.' },
          mood: { type: 'string', enum: ['calm', 'balanced', 'intense'], description: 'How energetic the lightning should feel. Default balanced.' },
        },
        required: ['primaryColor'],
      },
      responseSchema: {
        type: 'object',
        properties: {
          settings: { type: 'object' },
          mood: { type: 'string' },
          howToApply: { type: 'string' },
        },
      },
    },
    {
      methodName: 'import-logo',
      displayName: 'Import Logo for Electric Logo',
      description:
        "Imports a logo image from a public URL into the site's Media Manager (folder /electric-logo) so it can be traced by the Electric Logo widget or component, and returns its Wix-hosted URL. Use this when the user wants to use their logo, an image from their website, or a link they paste as the electric logo. Requires url; displayName is optional.",
      activated: true,
      requestSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Public http(s) link to the logo image. SVG or transparent PNG works best.' },
          displayName: { type: 'string', description: 'Optional file name to show in the Media Manager.' },
        },
        required: ['url'],
      },
      responseSchema: {
        type: 'object',
        properties: {
          fileId: { type: 'string' },
          url: { type: 'string' },
          displayName: { type: 'string' },
          operationStatus: { type: 'string' },
          nextStep: { type: 'string' },
        },
      },
    },
  ],
});
