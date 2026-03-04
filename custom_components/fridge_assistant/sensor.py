import requests
import functools
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the FridgeAssistant sensor from a config entry."""
    config = entry.data
    async_add_entities([FridgeAssistantJuFoSensor(config, entry.entry_id)], True)

class FridgeAssistantJuFoSensor(Entity):
    def __init__(self, config, entry_id):
        self._config = config
        self._entry_id = entry_id
        self._url = config["url"]
        self._api_key = config["api_key"]
        self._user = config["user"]
        self._state = 0
        self._attributes = {"liste": []}
        self._attr_unique_id = f"{entry_id}_{self._user}"

    @property
    def name(self):
        return f"FridgeAssistant {self._user} Produkte"

    @property
    def state(self):
        return self._state

    @property
    def extra_state_attributes(self):
        return self._attributes

    async def async_update(self):
        """Update the sensor state."""
        headers = {"API-KEY": self._api_key}
        try:
            r = await self.hass.async_add_executor_job(
                functools.partial(requests.get, self._url, headers=headers, timeout=10)
            )
            data = r.json()
            user_items = data.get(self._user, [])
            user_items.sort(key=lambda x: x.get("ablauf") or "9999-12-31")
            self._state = len(user_items)
            self._attributes["liste"] = user_items
        except Exception as e:
            self._state = 0
            self._attributes["liste"] = []
            # We should use logger here instead of print for HACS
            import logging
            _LOGGER = logging.getLogger(__name__)
            _LOGGER.error("FridgeAssistant Sensor Fehler: %s", e)
