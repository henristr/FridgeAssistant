# FridgeAssistant

FridgeAssistant ist eine Home Assistant Integration, die Produkte aus deiner API abruft, nach Benutzer filtert und nach Ablaufdatum sortiert.

# Dokumentation:
https://docs.henristr.de/share/67ql3pqwwj/p/smart-fridge-installation-iKotdAW5TP

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
Die Karte wird automatisch mit der Integration installiert und registriert. Du musst nichts weiter tun!

### Benutzung
Füge eine neue Karte zu deinem Dashboard hinzu:
1. Gehe in den Dashboard-Bearbeitungsmodus (Drei Punkte oben rechts → Dashboard bearbeiten).
2. Klicke auf **Karte hinzufügen**.
3. Suche nach "Fridge Assistant Card" oder wähle ganz unten **Manuell**.
4. Gib folgenden Code ein:
```yaml
type: custom:fridge-assistant-card
entity: sensor.fridgeassistant_deinname_produkte
title: Mein Kühlschrank
```

*Falls die Karte nach der Installation nicht sofort erscheint, lade die Seite im Browser einmal komplett neu (**Strg + F5**).*
