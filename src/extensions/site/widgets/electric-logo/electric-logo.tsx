import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import ElectricLogo from './lib/ElectricLogo';
import { ATTRIBUTES, parseSettings } from './settings';
import styles from './electric-logo.module.css';

class ElectricLogoElement extends HTMLElement {
  #root: Root | null = null;

  static get observedAttributes() {
    return Object.values(ATTRIBUTES);
  }

  connectedCallback() {
    this.style.display = 'block';
    this.style.width = '100%';
    this.style.height = '100%';
    this.#root ??= createRoot(this);
    this.render();
  }

  disconnectedCallback() {
    this.#root?.unmount();
    this.#root = null;
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    if (!this.#root) return;
    const { logoSrc, backgroundColor, ...settings } = parseSettings((name) => this.getAttribute(name));

    this.#root.render(
      <div className={styles.root} style={{ backgroundColor }}>
        <ElectricLogo {...settings} {...(logoSrc ? { src: logoSrc } : {})} />
      </div>
    );
  }
}

export default ElectricLogoElement;
