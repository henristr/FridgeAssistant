import logging
import functools
from datetime import date, datetime
import requests

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


def _format_expiry(value):
    """Return expiry dates in the format used by the integration."""
    if not value:
        return value

    text = str(value)
    try:
        return date.fromisoformat(text).strftime("%d.%m.%Y")
    except ValueError:
        try:
            return datetime.fromisoformat(text).strftime("%d.%m.%Y")
        except ValueError:
            pass
    return value


def _expiry_sort_key(product):
    """Sort ISO and localized expiry dates chronologically."""
    value = product.get("Expire")
    if not value:
        return date.max

    text = str(value)
    try:
        return date.fromisoformat(text)
    except ValueError:
        try:
            return datetime.fromisoformat(text).date()
        except ValueError:
            pass

    try:
        return datetime.strptime(text, "%d.%m.%Y").date()
    except ValueError:
        return date.max


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the OpenSmartFridge sensor from a config entry."""
    config = entry.data
    async_add_entities([OpenSmartFridgeSensor(config, entry.entry_id)], True)

class OpenSmartFridgeSensor(SensorEntity):
    """Implementation of the OpenSmartFridge sensor."""

    def __init__(self, config, entry_id):
        """Initialize the sensor."""
        self._url = f'{config["base_url"].rstrip("/")}/api/get_products_with_key'
        self._key = config["key"]
        self._attr_unique_id = entry_id
        self._attr_name = "OpenSmartFridge Produkte"
        self._attr_native_value = 0
        self._attr_extra_state_attributes = {"liste": []}
        self._attr_icon = "mdi:fridge-outline"

    async def async_update(self):
        """Update the sensor state."""
        try:
            r = await self.hass.async_add_executor_job(
                functools.partial(
                    requests.post,
                    self._url,
                    json={"key": self._key},
                    timeout=10,
                )
            )
            r.raise_for_status()
            data = r.json()

            if not isinstance(data, list):
                raise ValueError("API response is not a product list")

            products = []
            for item in data:
                product = dict(item)
                product["Expire"] = _format_expiry(product.get("Expire"))
                products.append(product)
            products.sort(key=_expiry_sort_key)
            self._attr_native_value = len(products)
            self._attr_extra_state_attributes["liste"] = products
            
        except Exception as e:
            _LOGGER.error("Fehler beim Abruf von %s: %s", self._url, e)
            self._attr_native_value = 0
            self._attr_extra_state_attributes["liste"] = []
