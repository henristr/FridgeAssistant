/*
  Fridge Assistant Lovelace Card
  Version: 1.2.0
  Diagnose: Schau in die Browser-Konsole (F12) für "FRIDGE-ASSISTANT-CARD LOADED"
*/

console.info(
  "%c FRIDGE-ASSISTANT-CARD %c 1.2.0 ",
  "color: white; background: #ef5350; font-weight: 700;",
  "color: #ef5350; background: white; font-weight: 700;"
);

import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class FridgeAssistantCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  static get styles() {
    return css`
      ha-card {
        padding: 16px;
        border-radius: var(--ha-card-border-radius, 12px);
        background: var(--ha-card-background, var(--card-background-color, white));
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
        display: block;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .title {
        font-size: 1.2em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .count {
        font-size: 0.85em;
        background: var(--secondary-background-color);
        padding: 2px 8px;
        border-radius: 10px;
        color: var(--secondary-text-color);
      }
      .product-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.1));
      }
      .product-item:last-child {
        border-bottom: none;
      }
      .product-expiry {
        font-family: monospace;
      }
      .expired { color: #ef5350; font-weight: bold; }
      .warning { color: #ffa726; }
      .error-box {
        color: white;
        background: #ef5350;
        padding: 10px;
        border-radius: 4px;
      }
    `;
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const entityId = this.config.entity;
    const stateObj = this.hass.states[entityId];

    if (!stateObj) {
      return html`
        <ha-card>
          <div class="error-box">
            Entität nicht gefunden: ${entityId}
          </div>
        </ha-card>
      `;
    }

    const items = [...(stateObj.attributes.liste || [])];
    items.sort((a, b) => (a.Expire || "9999-12-31").localeCompare(b.Expire || "9999-12-31"));

    return html`
      <ha-card>
        <div class="header">
          <div class="title">${this.config.title || "Kühlschrank"}</div>
          <div class="count">${items.length}</div>
        </div>
        <div class="list">
          ${items.length === 0
        ? html`<div style="text-align:center; padding: 20px;">Leer</div>`
        : items.map(item => this._renderItem(item))
      }
        </div>
      </ha-card>
    `;
  }

  _renderItem(item) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expiry = item.Expire ? new Date(item.Expire) : null;

    let style = "";
    if (expiry) {
      const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      if (days < 0) style = "expired";
      else if (days <= 3) style = "warning";
    }

    return html`
      <div class="product-item">
        <span>${item.Name || "Unbekannt"}</span>
        <span class="product-expiry ${style}">${this._formatExpiry(item.Expire)}</span>
      </div>
    `;
  }

  _formatExpiry(value) {
    if (!value) return "---";

    const datePart = String(value).split("T")[0];
    const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[3]}.${match[2]}.${match[1]}` : String(value);
  }

  setConfig(config) {
    if (!config.entity) throw new Error("Entity erforderlich");
    this.config = config;
  }

  getCardSize() {
    return 3;
  }
}

customElements.define("fridge-assistant-card", FridgeAssistantCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "fridge-assistant-card",
  name: "Fridge Assistant Card",
  description: "Liste der Produkte aus dem Kühlschrank",
});
