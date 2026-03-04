import logging
import requests
import functools

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the FridgeAssistant sensor from a config entry."""
    config = entry.data
    async_add_entities([FridgeAssistantJuFoSensor(config, entry.entry_id)], True)

class FridgeAssistantJuFoSensor(SensorEntity):
    """Implementation of the FridgeAssistant sensor."""

    def __init__(self, config, entry_id):
        """Initialize the sensor."""
        self._url = config["url"]
        self._api_key = config["api_key"]
        self._user = config["user"]
        self._attr_unique_id = f"{entry_id}_{self._user}"
        self._attr_name = f"FridgeAssistant {self._user} Produkte"
        self._attr_native_value = 0
        self._attr_extra_state_attributes = {"liste": []}
        self._attr_icon = "mdi:fridge-outline"

    async def async_update(self):
        """Update the sensor state."""
        headers = {"API-KEY": self._api_key}
        try:
            r = await self.hass.async_add_executor_job(
                functools.partial(requests.get, self._url, headers=headers, timeout=10)
            )
            r.raise_for_status()
            data = r.json()
            
            # Use user key from json response
            user_items = data.get(self._user, [])
            user_items.sort(key=lambda x: x.get("ablauf") or "9999-12-31")
            
            self._attr_native_value = len(user_items)
            self._attr_extra_state_attributes["liste"] = user_items
            
        except Exception as e:
            _LOGGER.error("Fehler beim Abruf von %s: %s", self._url, e)
            self._attr_native_value = 0
            self._attr_extra_state_attributes["liste"] = []
