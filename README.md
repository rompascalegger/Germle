# Germle – Das tägliche Mikroben-Labor 🧫

Ein webbasiertes Tagesspiel für **playle.io** (`germle.playle.io`). Jeden Tag liegen 3 unbekannte Proben in der Petrischale – Bakterien, Archaeen, Pilze und Viren. Bestimme sie, bevor die Kolonie die Schale sprengt. Ziel: **den Codex komplett füllen.**

## Spielen

Kein Build, keine Abhängigkeiten: `index.html` im Browser öffnen oder lokal ausliefern:

```bash
python -m http.server 5333
```

Dann <http://localhost:5333> öffnen. Mit `?dev=1` erscheinen Testknöpfe (neuer Tag, Gratisprobe, Reset) und `window.germle` in der Konsole.

Nach Änderungen die Versionsnummer `?v=` in `index.html` erhöhen, damit Browser und GitHub Pages keine alten Dateien mischen.

## Coreloop

1. **3 Proben pro Tag**, Reset um Mitternacht (lokale Zeit).
2. Pro Probe **7 Integritätspunkte**. Jede falsche Bestimmung und jeder Nährboden-Test kostet einen.
3. **Bestimmen:** 7 Spalten Feedback – Typ, Gilde, Nährboden, O₂, Temperatur, Habitat, Form (🟩 Treffer, 🟨 gleiche Gruppe / Nachbarstufe, ⬛ falsch).
4. **Nährboden-Test:** Plättchen (Nitrat, Eisen(II), Sulfat, Methan, Licht, Holz, Wirt: Bakterium …) zeigt starkes, schwaches oder kein Wachstum.
5. **Tipps:** Der erste ist gratis, jede weitere Aktion deckt einen weiteren auf – bis zu 12. Die Kategorie ist jedes Mal zufällig (Typ, Gilde, Gildengruppe, Nährboden, Nährbodengruppe, Lebensraum, Fundort, Sauerstoff, Temperatur, Form, Seltenheit, Anfangsbuchstabe) und pro Probe fest gemischt. Ein Klick auf einen Tipp öffnet das **Lexikon**, bereits danach gefiltert – damit wird Nachschlagen zum eigentlichen Spielzug. Die Koloniefarbe ist reine Deko und verrät nichts.
6. Integrität 0 → **☣ BIOHAZARD ALARM** (Sirene, Blinken, Vibration) – Game Over für diese Probe, die Mikrobe entkommt.

## Dopaminzyklus

- **Variable Belohnung:** Ziehung gewichtet nach Seltenheit (Häufig → Legendär), legendäre Funde mit Gold-Glow und Extra-Konfetti.
- **Gratisprobe:** Gratis-Meter füllt sich mit jeder Entdeckung (5 = 1 Gratisprobe), dazu alle 3 Tage Streak eine. Max. 3 lagerbar.
- **Fortschritt:** XP, 12 Laborlevel (Praktikant:in → Nobelpreisträger:in), Gilden- und Gruppen-Sets mit Bonus-XP, Codex-Prozent, 55 Errungenschaften.
- **Verknappung & Rückkehr:** Countdown bis Mitternacht, Streak 🔥, „fast voll“-Blinken am Gratis-Meter.
- **Teilen:** Wordle-artiges Emoji-Ergebnis in die Zwischenablage.
- **Geheimnis:** Im Labor ist ein geheimer Knopf versteckt, der einmal pro Tag eine zusätzliche Probe freischaltet und sofort startet. Zwei geheime Errungenschaften hängen daran. <details><summary>Spoiler: wo?</summary>Der kleine Punkt am Ende der Fußzeile – er wird beim Darüberfahren sichtbar. Alternativ irgendwo `agar` tippen.</details>

## Lexikon & Errungenschaften

- **📚 Das Große Lexikon der Keime** – Nachschlagewerk mit allen 323 Mikroben: Steckbrief mit Gilde, Gildengruppe, Nährboden, Sauerstoffbedarf, Temperatur, Lebensraum, Form, Seltenheit und Fakt. Volltextsuche plus Filter nach Reich, Gilde, Nährboden, Lebensraum, Form, O₂, Temperatur, Seltenheit und Fundstatus (entdeckt / fehlend / entkommen), dazu sechs Sortierungen. Jeder Filter kann auch **ausschließen** („nicht Pilze“, „nicht mesophil“) – genau das, was eine ⬛-Spalte im Rateraster schon widerlegt hat; ausschließende Filter sind rot markiert. In der Suche schließt ein Minus ein Wort aus (`sediment -virus`). Der **Codex** ist die eigene Sammlung, das Lexikon das Werkzeug beim Bestimmen.
- **🏅 55 Errungenschaften** in vier Stufen (Bronze, Silber, Gold, Platin) mit Fortschrittsbalken: Reiche komplettieren, Stoffkreisläufe schließen, Seltenheiten jagen, Volltreffer, Biohazards überstehen, Streaks und Laborlevel. Freischaltungen erscheinen als Toast und werden mit Datum gespeichert; ältere Spielstände werden beim Laden nachgerechnet.

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `js/data.js` | Mikroben-Datenbank, Gilden, Nährböden, Habitate, Formen, Seltenheiten |
| `js/achievements.js` | Errungenschaften: Bedingungen als `p(S)`-Funktionen, Stufen, Fortschritt |
| `js/book.js` | Lexikon: Filter, Suche, Sortierung, Steckbriefe |
| `js/game.js` | Spiellogik ohne DOM: Tag, Proben, Vergleich, XP, Streak, Gratisproben, Teilen. Alle Balancing-Werte in `CFG` |
| `js/dish.js` | Petrischale (Canvas: Kolonien, Testplättchen, Risse, Ausbruch) und Mikroskop-Ansicht |
| `js/audio.js` | Synthetisierte Töne und Biohazard-Sirene (WebAudio) |
| `js/ui.js` | Oberfläche, Codex, Modale, Konfetti |
| `DESIGN.md` | 5 Spielkonzepte mit Coreloop und Dopaminzyklus |

Spielstand liegt in `localStorage` (`germle_v1`).

## Datenbank erweitern

Neue Zeile im Array `RAW` in `js/data.js`:

```js
['Lateinischer Name', 'Deutscher Name', 'B', 'Gilde', 'Nährboden', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 3, 'Fakt.'],
```

Typ `B`/`A`/`P`/`V`. Gilde, Nährboden, Habitat und Form müssen in den Tabellen oben in der Datei stehen – unbekannte Werte meldet die Konsole beim Laden.
