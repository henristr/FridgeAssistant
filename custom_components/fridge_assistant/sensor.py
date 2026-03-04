import requests
from datetime import datetime
from homeassistant.helpers.entity import Entity
from . import DOMAIN


def setup_platform(hass, config, add_entities, discovery_info=None):
    # holen die Konfigurationsdaten
    conf = hass.data[DOMAIN]
    add_entities([FridgeAssistantJuFoSensor(conf)])


class FridgeAssistantJuFoSensor(Entity):
    def __init__(self, conf):
        self.url = conf["url"]
        self.api_key = conf["api_key"]
        self.user = conf["user"]
        self._state = 0
        self._attributes = {"liste": []}
        self.update()

    @property
    def name(self):
        return f"FridgeAssistant {self.user} Produkte"

    @property
    def state(self):
        return self._state

    @property
    def extra_state_attributes(self):
        return self._attributes

    def update(self):
        headers = {"API-KEY": self.api_key}
        try:
            r = requests.get(self.url, headers=headers)
            data = r.json()
            user_items = data.get(self.user, [])
            user_items.sort(key=lambda x: x.get("ablauf") or "9999-12-31")
            self._state = len(user_items)
            self._attributes["liste"] = user_items
        except Exception as e:
            self._state = 0
            self._attributes["liste"] = []
            print("FridgeAssistant Sensor Fehler:", e)
