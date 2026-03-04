# FridgeAssistant

FridgeAssistant ist eine Home Assistant Integration, die Produkte aus deiner API abruft, nach Benutzer filtert und nach Ablaufdatum sortiert.

## Features
- Filtert nach Benutzer
- Sortiert nach Ablaufdatum
- Zeigt abgelaufene Produkte rot an
- Benutzer gibt URL, API-Key und Benutzername bequem über die Benutzeroberfläche (Config Flow) ein.
- **NEU:** Inklusive Lovelace Card für eine wunderschöne Darstellung.

## Integration Installation
1. Über HACS → "Benutzerdefinierte Repositories" → Typ: **Integration**
2. Repository URL: `https://github.com/henristr/FridgeAssistant`
3. Integration installieren → Home Assistant Neustart
4. Unter **Einstellungen → Geräte & Dienste** nach "FridgeAssistant" suchen und konfigurieren.

## Lovelace Card (Fridge Assistant Card)
Die Karte wird automatisch mit der Integration installiert. Du musst sie nur noch als Ressource registrieren:

### Schritt 1: Ressource registrieren
1. Gehe zu **Einstellungen → Dashboards**.
2. Klicke oben rechts auf die drei Punkte → **Ressourcen**.
3. Klicke auf **Ressource hinzufügen**.
4. Gib folgende Daten ein:
   - **URL**: `/fridge_assistant_static`
   - **Typ**: `JavaScript-Modul`
5. Speichern und Browser neu laden (F5).

### Schritt 2: Karte nutzen
Füge eine neue Karte zu deinem Dashboard hinzu:
```yaml
type: custom:fridge-assistant-card
entity: sensor.fridgeassistant_deinname_produkte
title: Mein Kühlschrank
```
