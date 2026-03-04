import os
import logging
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, Event
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED

from .const import DOMAIN, PLATFORMS

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up FridgeAssistant from a config entry."""
    
    # Serve the static card file
    path = os.path.dirname(__file__)
    file_path = os.path.join(path, "fridge-assistant-card.js")
    
    url_path = "/fridge_assistant_static"
    if hasattr(hass.http, "async_register_static_paths"):
        from homeassistant.components.http import StaticPathConfig
        await hass.http.async_register_static_paths([
            StaticPathConfig(url_path, file_path, True)
        ])
    else:
        # Fallback for older HA versions
        hass.http.register_static_path(url_path, file_path)

    # Register resource immediately AND on startup to be sure
    await _async_register_lovelace_resource(hass, url_path)
    
    async def setup_resource_on_start(event: Event) -> None:
        await _async_register_lovelace_resource(hass, url_path)
    
    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, setup_resource_on_start)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True

async def _async_register_lovelace_resource(hass: HomeAssistant, url: str) -> None:
    """Register the Lovelace resource automatically with fallback checks."""
    try:
        # 1. Try modern storage-based lovelace
        resources = None
        
        # Check standard location
        if "lovelace" in hass.data:
            resources = hass.data["lovelace"].get("resources")
        
        # 2. Check alternative location (used in some HA versions)
        if not resources and "lovelace-dashboards" in hass.data:
            resources = hass.data["lovelace-dashboards"].get("resources")

        if not resources:
            _LOGGER.debug("Lovelace resources collection not found yet (is Lovelace in YAML mode?)")
            return

        # 3. Check if already registered
        # The items can be accessed via async_items()
        exists = False
        for item in resources.async_items():
            if item.get("url") == url:
                exists = True
                break
        
        if exists:
            _LOGGER.debug("Lovelace resource %s already registered", url)
            return

        # 4. Register the resource
        if hasattr(resources, "async_create_item"):
            await resources.async_create_item({
                "res_type": "module",
                "url": url
            })
            _LOGGER.info("Successfully registered Lovelace resource: %s", url)
            
    except Exception as err:
        _LOGGER.error("Error auto-registering Lovelace resource: %s", err)

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
