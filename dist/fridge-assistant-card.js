/* Fridge Assistant Lovelace Card */
import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class FridgeAssistantCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static get styles() {
    return css`
      :host {
        --expired-color: #ef5350;
        --warning-color: #ffa726;
        --normal-color: var(--primary-text-color);
        --divider-color: var(--divider-color, rgba(0, 0, 0, 0.12));
      }
      ha-card {
        padding: 16px;
        border-radius: 12px;
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
        font-size: 1.25em;
        font-weight: 500;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .count {
        font-size: 0.85em;
        background: var(--secondary-background-color);
        padding: 4px 10px;
        border-radius: 20px;
        color: var(--secondary-text-color);
        font-weight: 600;
        flex-shrink: 0;
      }
      .product-list {
        display: flex;
        flex-direction: column;
      }
      .product-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      .product-item:last-child {
        border-bottom: none;
      }
      .product-name {
        font-weight: 400;
        color: var(--primary-text-color);
        padding-right: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .product-expiry {
        font-family: var(--paper-font-code1_-_font-family, monospace);
        font-size: 0.9em;
        flex-shrink: 0;
      }
      .expired {
        color: var(--expired-color);
        font-weight: bold;
      }
      .warning {
        color: var(--warning-color);
      }
      .error {
        color: var(--expired-color);
        padding: 12px;
        border: 1px dashed var(--expired-color);
        border-radius: 8px;
        background: rgba(239, 83, 80, 0.1);
        font-size: 0.9em;
      }
      .empty-state {
        text-align: center;
        color: var(--secondary-text-color);
        padding: 30px 0;
        font-style: italic;
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
          <div class="error">
            <b>Fehler:</b> Entität <code>${entityId}</code> nicht gefunden. Standby...
          </div>
        </ha-card>
      `;
    }

    const items = [...(stateObj.attributes.liste || [])];
    const sortedItems = items.sort((a, b) => {
      const dateA = a.ablauf || "9999-12-31";
      const dateB = b.ablauf || "9999-12-31";
      return dateA.localeCompare(dateB);
    });

    return html`
      <ha-card>
        <div class="header">
          <div class="title">${this.config.title || "Kühlschrank Inventar"}</div>
          <div class="count">${sortedItems.length} Produkte</div>
        </div>
        <div class="product-list">
          ${sortedItems.length === 0 
            ? html`<div class="empty-state">Keine Produkte verfügbar</div>`
            : sortedItems.map(item => this._renderProduct(item))
          }
        </div>
      </ha-card>
    `;
  }

  _renderProduct(item) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Parse date safely
    let statusClass = "";
    if (item.ablauf) {
      const expiryDate = new Date(item.ablauf);
      const diffTime = expiryDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        statusClass = "expired";
      } else if (diffDays <= 3) {
        statusClass = "warning";
      }
    }

    return html`
      <div class="product-item">
        <span class="product-name">${item.name || "Unbekanntes Produkt"}</span>
        <span class="product-expiry ${statusClass}">
          ${item.ablauf || "---"}
        </span>
      </div>
    `;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Bitte definiere eine Entität (entity: sensor.xxx)");
    }
    this.config = config;
  }

  getCardSize() {
    return Math.max(2, Math.ceil((this.hass?.states[this.config.entity]?.attributes?.liste?.length || 0) / 2));
  }
}

customElements.define("fridge-assistant-card", FridgeAssistantCard);

// Lovelace Card Picker support
window.customCards = window.customCards || [];
window.customCards.push({
  type: "fridge-assistant-card",
  name: "Fridge Assistant Card",
  preview: true,
  description: "Zeigt ablaufende Produkte aus deinem Kühlschrank übersichtlich an.",
});
