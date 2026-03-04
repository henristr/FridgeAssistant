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
    if hasattr(hass.http, "async_register_static_paths"):
        from homeassistant.components.http import StaticPathConfig
        await hass.http.async_register_static_paths([
            StaticPathConfig("/fridge_assistant_static", file_path, True)
        ])
    else:
        # Fallback for older HA versions
        hass.http.register_static_path("/fridge_assistant_static", file_path)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
