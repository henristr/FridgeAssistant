import os
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PLATFORMS

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up FridgeAssistant from a config entry."""
    
    # Serve the static card file
    path = os.path.dirname(__file__)
    file_path = os.path.join(path, "fridge-assistant-card.js")
    
    # Register static path (Compatibility for newer HA versions 2025.7+)
    url_path = "/fridge_assistant_static"
    if hasattr(hass.http, "async_register_static_paths"):
        from homeassistant.components.http import StaticPathConfig
        await hass.http.async_register_static_paths([
            StaticPathConfig(url_path, file_path, True)
        ])
    else:
        # Fallback for older HA versions
        hass.http.register_static_path(url_path, file_path)

    # Automatically add the Lovelace resource
    await _async_register_lovelace_resource(hass, url_path)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True

async def _async_register_lovelace_resource(hass: HomeAssistant, url: str) -> None:
    """Register the Lovelace resource automatically."""
    try:
        # Try to get the resource collection
        resources = hass.data.get("lovelace", {}).get("resources")
        if not resources:
            return

        # Check if already registered
        if any(res.get("url") == url for res in resources.async_items()):
            return

        # Register the resource
        if hasattr(resources, "async_create_item"):
            await resources.async_create_item({
                "res_type": "module",
                "url": url
            })
    except Exception as err:
        import logging
        _LOGGER = logging.getLogger(__name__)
        _LOGGER.warning("Could not auto-register Lovelace resource: %s", err)

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
