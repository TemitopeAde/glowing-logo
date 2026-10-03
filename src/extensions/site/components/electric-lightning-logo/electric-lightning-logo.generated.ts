/**
 * THIS FILE IS AUTO-GENERATED — DO NOT EDIT.
 * It contains the `editorElement` portion of the manifest, automatically derived from your component's
 * source code, prop types, and CSS rules.
 * Update your source code and run `npx wix build && npx wix generate manifest` to regenerate it.
 * If you need to override specific manifest values (sizing, layout, etc.),
 * you can do so in electric-lightning-logo.extension.ts.
 */

import type { EditorElement } from '@wix/react-component-schema';

export const editorElement = {
  "selector": ".electric-lightning-logo",
  "displayName": "Electric Lightning Logo",
  "data": {
    "direction": {
      "displayName": "Direction",
      "dataType": "direction"
    },
    "a11y": {
      "displayName": "Accessibility",
      "dataType": "a11y",
      "a11y": {
        "attributes": [
          "ariaLabel"
        ]
      }
    },
    "logo": {
      "displayName": "Logo",
      "dataType": "image",
      "image": {
        "category": "IMAGE"
      }
    },
    "theme": {
      "displayName": "Theme",
      "dataType": "textEnum",
      "textEnum": {
        "options": [
          {
            "value": "dark",
            "displayName": "Dark"
          },
          {
            "value": "light",
            "displayName": "Light"
          }
        ]
      }
    },
    "scale": {
      "displayName": "Scale",
      "dataType": "number",
      "number": {
        "min": "0.1",
        "max": "1"
      }
    },
    "strands": {
      "displayName": "Strands",
      "dataType": "number",
      "number": {
        "min": "1",
        "max": "6"
      }
    },
    "thickness": {
      "displayName": "Thickness",
      "dataType": "number",
      "number": {
        "min": "0.5",
        "max": "5"
      }
    },
    "bend": {
      "displayName": "Bend",
      "dataType": "number",
      "number": {
        "min": "0",
        "max": "2"
      }
    },
    "crackle": {
      "displayName": "Crackle",
      "dataType": "number",
      "number": {
        "min": "0",
        "max": "4"
      }
    },
    "arcs": {
      "displayName": "Arcs",
      "dataType": "number",
      "number": {
        "min": "0",
        "max": "4"
      }
    },
    "intensity": {
      "displayName": "Intensity",
      "dataType": "number",
      "number": {
        "min": "0",
        "max": "3"
      }
    },
    "glow": {
      "displayName": "Glow",
      "dataType": "number",
      "number": {
        "min": "0",
        "max": "3"
      }
    },
    "fill": {
      "displayName": "Fill",
      "dataType": "number",
      "number": {
        "min": "0",
        "max": "1"
      }
    },
    "flicker": {
      "displayName": "Flicker",
      "dataType": "number",
      "number": {
        "min": "0",
        "max": "1"
      }
    },
    "speed": {
      "displayName": "Speed",
      "dataType": "number",
      "number": {
        "min": "0",
        "max": "8"
      }
    },
    "interactive": {
      "displayName": "Interactive",
      "dataType": "booleanValue"
    },
    "cursorIntensity": {
      "displayName": "Cursor Intensity",
      "dataType": "number",
      "number": {
        "min": "0",
        "max": "2"
      }
    },
    "cursorRadius": {
      "displayName": "Cursor Radius",
      "dataType": "number",
      "number": {
        "min": "20",
        "max": "400"
      }
    },
    "autoPlay": {
      "displayName": "Auto Play",
      "dataType": "booleanValue"
    },
    "pauseButtonVisibility": {
      "displayName": "Pause Button Visibility",
      "dataType": "textEnum",
      "textEnum": {
        "options": [
          {
            "value": "showOnHover",
            "displayName": "Show On Hover"
          },
          {
            "value": "showAlways",
            "displayName": "Show Always"
          }
        ]
      }
    },
    "onClick": {
      "displayName": "On Click",
      "dataType": "function",
      "function": {
        "parameters": [
          {
            "domEvent": "POINTER"
          }
        ]
      }
    },
    "onMouseIn": {
      "displayName": "On Mouse In",
      "dataType": "function",
      "function": {
        "parameters": [
          {
            "domEvent": "POINTER"
          }
        ]
      }
    },
    "onMouseOut": {
      "displayName": "On Mouse Out",
      "dataType": "function",
      "function": {
        "parameters": [
          {
            "domEvent": "POINTER"
          }
        ]
      }
    }
  },
  "elements": {
    "electricLightningLogoPlayButton": {
      "elementType": "inlineElement",
      "inlineElement": {
        "selector": ".electric-lightning-logo-play-button",
        "displayName": "Play Button",
        "behaviors": {
          "removable": true,
          "selectable": false
        },
        "cssProperties": {
          "color": {
            "defaultValue": "var(--icon-color)"
          },
          "background": {
            "defaultValue": "rgba(11,6,20,0.6)"
          },
          "borderTop": {
            "defaultValue": "1px solid rgba(255,255,255,0.28)"
          },
          "borderBottom": {
            "defaultValue": "1px solid rgba(255,255,255,0.28)"
          },
          "borderInlineStart": {
            "defaultValue": "1px solid rgba(255,255,255,0.28)"
          },
          "borderInlineEnd": {
            "defaultValue": "1px solid rgba(255,255,255,0.28)"
          },
          "paddingTop": {
            "defaultValue": "0"
          },
          "paddingBottom": {
            "defaultValue": "0"
          },
          "paddingInlineStart": {
            "defaultValue": "0"
          },
          "paddingInlineEnd": {
            "defaultValue": "0"
          },
          "borderStartStartRadius": {
            "defaultValue": "50%"
          },
          "borderStartEndRadius": {
            "defaultValue": "50%"
          },
          "borderEndStartRadius": {
            "defaultValue": "50%"
          },
          "borderEndEndRadius": {
            "defaultValue": "50%"
          },
          "boxShadow": {},
          "width": {},
          "height": {},
          "overflow": {},
          "mixBlendMode": {},
          "display": {
            "display": {
              "displayValues": [
                "none",
                "inlineFlex"
              ]
            }
          },
          "marginTop": {},
          "marginBottom": {},
          "marginInlineStart": {},
          "marginInlineEnd": {},
          "flexDirection": {},
          "justifyContent": {
            "defaultValue": "center"
          },
          "alignItems": {
            "defaultValue": "center"
          }
        },
        "cssCustomProperties": {
          "icon-size": {
            "displayName": "Icon Size",
            "defaultValue": "18px",
            "cssPropertyType": "length"
          },
          "icon-color": {
            "displayName": "Icon Color",
            "defaultValue": "#ffffff",
            "cssPropertyType": "color"
          }
        },
        "states": {
          "hover": {
            "displayName": "Hover",
            "className": "electric-lightning-logo-play-button--hover",
            "pseudoClass": "hover"
          },
          "disabled": {
            "displayName": "Disabled",
            "className": "electric-lightning-logo-play-button--disabled",
            "pseudoClass": "disabled"
          }
        }
      }
    }
  },
  "cssProperties": {
    "background": {
      "defaultValue": "#0b0614"
    },
    "borderTop": {},
    "borderBottom": {},
    "borderInlineStart": {},
    "borderInlineEnd": {},
    "paddingTop": {},
    "paddingBottom": {},
    "paddingInlineStart": {},
    "paddingInlineEnd": {},
    "borderStartStartRadius": {
      "defaultValue": "12px"
    },
    "borderStartEndRadius": {
      "defaultValue": "12px"
    },
    "borderEndStartRadius": {
      "defaultValue": "12px"
    },
    "borderEndEndRadius": {
      "defaultValue": "12px"
    },
    "boxShadow": {},
    "overflow": {
      "defaultValue": "hidden"
    },
    "mixBlendMode": {},
    "marginTop": {},
    "marginBottom": {},
    "marginInlineStart": {},
    "marginInlineEnd": {}
  },
  "cssCustomProperties": {
    "core-color": {
      "displayName": "Core Color",
      "defaultValue": "#ecc7ff",
      "cssPropertyType": "color"
    },
    "glow-color": {
      "displayName": "Glow Color",
      "defaultValue": "#ad6dff",
      "cssPropertyType": "color"
    }
  },
  "states": {
    "hover": {
      "displayName": "Hover",
      "className": "electric-lightning-logo--hover",
      "pseudoClass": "hover"
    }
  }
} as EditorElement;
