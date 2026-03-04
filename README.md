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
Die Karte befindet sich im Ordner `dist`. Um sie zu nutzen:

### Manuelle Installation der Karte
1. Kopiere `dist/fridge-assistant-card.js` in deinen `www` Ordner von Home Assistant (z.B. `/config/www/`).
2. Füge die Ressource in Home Assistant hinzu: 
   - Gehe zu **Einstellungen → Dashboards → Drei Punkte (oben rechts) → Ressourcen**.
   - URL: `/local/fridge-assistant-card.js`
   - Typ: `JavaScript-Modul`

### Benutzung
Füge eine neue Karte zu deinem Dashboard hinzu:
```yaml
type: custom:fridge-assistant-card
entity: sensor.dein_kuehlschrank_sensor
title: Mein Vorrat
```
