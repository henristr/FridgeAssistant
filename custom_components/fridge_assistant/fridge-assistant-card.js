/*
  Fridge Assistant Lovelace Card
  Version: 1.3.0
  With Visual Editor Support
*/

console.info(
  "%c FRIDGE-ASSISTANT-CARD %c 1.3.0 ",
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

  static async getConfigElement() {
    return document.createElement("fridge-assistant-card-editor");
  }

  static getStubConfig() {
    return {
      title: "Kühlschrank",
      entity: "",
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
      }
      .product-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.1));
      }
      .product-item:last-child {
        border-bottom: none;
      }
      .product-name {
        color: var(--primary-text-color);
      }
      .product-expiry {
        font-family: monospace;
        font-size: 0.95em;
      }
      .expired { color: #ef5350; font-weight: bold; }
      .warning { color: #ffa726; }
      .error-box {
        color: white;
        background: #ef5350;
        padding: 12px;
        border-radius: 8px;
        font-size: 0.9em;
      }
      .empty-state {
        text-align: center;
        color: var(--secondary-text-color);
        padding: 20px 0;
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
          <div class="error-box">
            <b>Entität nicht gefunden:</b> ${entityId || "Bitte in den Einstellungen wählen"}
          </div>
        </ha-card>
      `;
    }

    const items = [...(stateObj.attributes.liste || [])];
    items.sort((a, b) => (a.ablauf || "9999-12-31").localeCompare(b.ablauf || "9999-12-31"));

    return html`
      <ha-card>
        <div class="header">
          <div class="title">${this.config.title || "Kühlschrank"}</div>
          <div class="count">${items.length} Produkte</div>
        </div>
        <div class="list">
          ${items.length === 0
        ? html`<div class="empty-state">Keine Produkte verfügbar</div>`
        : items.map(item => this._renderItem(item))
      }
        </div>
      </ha-card>
    `;
  }

  _renderItem(item) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expiry = item.ablauf ? new Date(item.ablauf) : null;

    let statusClass = "";
    if (expiry) {
      const diffTime = expiry - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) statusClass = "expired";
      else if (diffDays <= 3) statusClass = "warning";
    }

    return html`
      <div class="product-item">
        <span class="product-name">${item.name || "Unbekannt"}</span>
        <span class="product-expiry ${statusClass}">${item.ablauf || "---"}</span>
      </div>
    `;
  }

  setConfig(config) {
    this.config = config;
  }

  getCardSize() {
    return 3;
  }
}

/* Editor Component */
class FridgeAssistantCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
    };
  }

  setConfig(config) {
    this._config = config;
  }

  get _entity() {
    return this._config.entity || "";
  }

  get _title() {
    return this._config.title || "";
  }

  render() {
    if (!this.hass) return html``;

    // Filter entities to show only sensors
    const entities = Object.keys(this.hass.states)
      .filter(eid => eid.startsWith("sensor.fridgeassistant_"))
      .sort();

    return html`
      <div class="card-config">
        <div class="option">
          <ha-select
            label="Entität (Sensor)"
            .value="${this._entity}"
            .configValue="${"entity"}"
            @selected="${this._valueChanged}"
            @closed="${(e) => e.stopPropagation()}"
            style="width: 100%; margin-bottom: 20px;"
          >
            ${entities.map(eid => html`<mwc-list-item .value="${eid}">${eid}</mwc-list-item>`)}
          </ha-select>
        </div>
        <div class="option">
          <ha-textfield
            label="Titel"
            .value="${this._title}"
            .configValue="${"title"}"
            @input="${this._valueChanged}"
            style="width: 100%;"
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) return;

    if (target.configValue) {
      this._config = {
        ...this._config,
        [target.configValue]: target.value,
      };
    }

    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  static get styles() {
    return css`
      .card-config {
        display: flex;
        flex-direction: column;
        padding: 8px;
      }
      .option {
        padding: 4px 0;
      }
    `;
  }
}

customElements.define("fridge-assistant-card", FridgeAssistantCard);
customElements.define("fridge-assistant-card-editor", FridgeAssistantCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "fridge-assistant-card",
  name: "Fridge Assistant Card",
  preview: true,
  description: "Zeigt ablaufende Produkte aus deinem Kühlschrank übersichtlich an.",
});
