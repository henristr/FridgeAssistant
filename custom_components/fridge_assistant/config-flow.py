import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback

DOMAIN = "fridge_assistant"


class FridgeAssistantConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(
                title="FridgeAssistant",
                data={
                    "url": user_input["url"],
                    "api_key": user_input["api_key"],
                    "user": user_input["user"],
                },
            )

        schema = vol.Schema(
            {
                vol.Required("url"): str,
                vol.Required("api_key"): str,
                vol.Required("user", default="JuFo"): str,
            }
        )
        return self.async_show_form(step_id="user", data_schema=schema)
