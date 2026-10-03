# Electric Logo — brand kit for films

## Brief (interview, 2026-10-02)
- Plays: Wix App Market listing / landing hero, 16:9 1920×1080, **silent** — must read muted.
- Length: 30–40 s (36 s, 18 bars at a planned 120 BPM).
- Brand element: the electric lightning itself, on an original demo mark ("Voltra", fictional) and the app's own mark.
- Words: short captions in a fixed band, one line per scene.
- Transitions: magic moves — the lightning widget is the traveler (full screen → editor canvas → push-in → full screen).
- Extras: cursor interactions (upload, tooltip, color pick, slider drags, hover charge, click strike).
- Ending: app lockup — the app mark in lightning + "Electric Logo" + "Available on the Wix App Market".

## Look
| Token | Value | Source |
|---|---|---|
| Stage background | `#0b0614` | widget default `backgroundColor` (src/extensions/site/widgets/electric-logo/settings.ts) |
| Core color | `#ecc7ff` | React Bits ElectricLogo default `color` |
| Glow color | `#ad6dff` | React Bits ElectricLogo default `glowColor` |
| Recolor demo | core `#e6fdff`, glow `#1fa9ff` | film choice (shows the color pickers) |
| Editor UI | WDS: text `#162D3D`, secondary `#7A92A5`, border `#DFE5EB`, surface `#F0F4F7`, primary `#116DFF` | Wix Design System |
| UI font | Wix Madefor Text | WDS |
| Display font | Wix Madefor Display | WDS |

Effects: the lightning, glow and bloom are the product's own effect (the real shader from `lib/shaders.ts`), so they are on brand here. Nothing else glows.

## Components
| Component | Treatment | Why |
|---|---|---|
| ElectricLogo (WebGL) | frame-driven twin (`src/electric/`), imports the widget's real shader + tracer | engine runs on `requestAnimationFrame` and `Math.random` |
| Settings panel | redraw with WDS tokens | WDS SidePanel/Slider/Tooltip use their own transitions and popovers |
| Wix Editor chrome | redraw, simplified | not part of the product |

## Claims
- Does: traces any uploaded image (SVG/PNG/JPG/WebP) into animated lightning; every setting is editable in the editor panel; uploads go to the site's Media Manager; hover charges, click ripples.
- Never claim: AI, automatic logo design, performance numbers.
- Demo brand "Voltra" is fictional.
