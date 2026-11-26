# Germle – Spieldesign

> Ein tägliches Entdeckungsspiel über Mikroben. Ziel: **alle Bakterien, Archaeen, Pilze und Viren im Codex zu entdecken.**

Gemeinsame Grundregeln für alle Vorschläge:

| Regel | Umsetzung |
|---|---|
| **3 Versuche pro Tag** | 3 „Proben“ pro Tag. Reset um Mitternacht (lokale Zeit). |
| **Gratisversuch** | Ein **Gratis-Meter** füllt sich mit jeder Entdeckung. Bei 5 Entdeckungen gibt es 1 Gratisprobe (max. 3 lagerbar). Zusätzlich: 3 Tage Streak = 1 Gratisprobe. |
| **Petrischale** | Die zentrale Bühne: Proben werden darin untersucht, Kolonien wachsen sichtbar. |
| **Biohazard-Alarm** | Wenn die Kolonie die Petrischale zerstört (Integrität = 0) → Sirene, rotes Blinken, ☣ – **Game Over** für diese Probe. Die Mikrobe entkommt und bleibt unentdeckt. |
| **Gilden** | Jede Mikrobe gehört zu einer ökologischen Gilde (Nitrifizierer, Sulfatreduzierer, Eisenoxidierer, Methanogene …). Vollständige Gilden = Sammelset-Bonus. |
| **Nährböden** | Jede Mikrobe hat ihre Energie-/Nährstoffquelle (Ammonium, Nitrat, Eisen(II), Sulfat, Methan, Licht, Holz …). Viren haben ihre Wirtszelle als „Nährboden“. |

---

## Der Dopaminzyklus (gilt für alle Varianten)

```
  Erwartung ──► Handlung ──► variable Belohnung ──► Fortschritt ──► Verknappung ──► (morgen) Erwartung
  "Welche       Probe          Seltenheit:           XP, Level,        nur 3 Proben,     Countdown,
   Mikrobe      analysieren,   Häufig … Legendär     Codex-%, Gilden-  Gratis-Meter      Streak 🔥
   heute?"      raten          + Konfetti/Glow        sets, Gratis-     fast voll …
                                                      Meter
```

1. **Trigger** – Täglicher Countdown, Streak-Flamme, „Gratis-Meter 4/5“ (Near-Miss: nur noch 1 Entdeckung!).
2. **Handlung** – Kurze Runde (1–3 Minuten), sofort verständliches Feedback (grün/gelb/grau).
3. **Variable Belohnung** – Gewichtete Zufallsziehung: häufige Mikroben kommen öfter, eine **legendäre** (z. B. *Thiomargarita magnifica*) ist ein seltener Glücksmoment mit Gold-Glow.
4. **Investition** – Codex füllt sich, Gilden-Sets werden komplett, Laborlevel steigt (Praktikant → Nobelpreisträger), Errungenschaften schalten frei (55 Stück in vier Stufen – jede zeigt ihren Fortschritt, damit immer eine sichtbar kurz vor dem Ziel steht).
5. **Verknappung** – Nur 3 Proben. Wer verliert, sieht den Biohazard-Alarm – Spannung und Revanche-Wunsch für morgen.
6. **Teilen** – Wordle-artiges Emoji-Ergebnis (🟩🟨⬛ / ☣️) zum Kopieren.

---

## Vorschlag 1 – „Germle Daily: Identifikation“ ✅ *implementiert*

**Idee:** Eine unbekannte Probe liegt in der Petrischale. Durch Raten und Nährboden-Tests wird sie identifiziert – wie Wordle, aber mit Eigenschaften statt Buchstaben.

**Coreloop (pro Probe):**
1. Fundort-Hinweis erscheint (z. B. „Probe aus: Extrem-Biotop“).
2. Spieler rät eine Mikrobe **oder** setzt einen **Nährboden-Test** (z. B. Eisen(II)) – starkes / schwaches / kein Wachstum.
3. Jede Rate zeigt 7 Spalten: Typ · Gilde · Nährboden · O₂ · Temperatur · Habitat · Form – 🟩 Treffer, 🟨 nah dran, ⬛ falsch.
4. Jede falsche Aktion lässt die Kolonie wachsen und die Schale reißen (7 Integritätspunkte).
5. Richtig → Entdeckung, XP, Konfetti. Integrität 0 → **☣ BIOHAZARD ALARM**.

**Warum süchtig:** Kurze Runden, Deduktion, sichtbare Bedrohung, Sammeltrieb.

---

## Vorschlag 2 – „Winogradsky-Säule“ (Kreislauf-Puzzle)

**Idee:** Eine Glassäule mit Schichten (Wasser → oxisch → Übergangszone → Sediment). Spieler setzen Mikroben aus ihrer Sammlung in die richtigen Schichten, sodass Stoffkreisläufe (N, S, Fe, C) geschlossen werden.

**Coreloop:** Tagesrätsel „Schließe den Schwefelkreislauf mit 4 Gilden“ → Mikroben platzieren → Simulation läuft 10 Sekunden → Säule färbt sich (grüne Schwefelbakterien, Purpurbakterien, schwarzes FeS) → Punkte.
**Biohazard:** Falsche Platzierung → giftiges H₂S staut sich, Säule platzt → Alarm.
**Dopamin:** Farbenprächtige Schichtbildung als Belohnung, neue Mikroben schalten neue Rätsel frei.

---

## Vorschlag 3 – „Expeditions-Probe“ (Gacha + Mikroskop)

**Idee:** Jeden Tag 3 Proben aus wechselnden Biomen (Moor, Tiefsee-Schlot, Salzsee, Permafrost, Kläranlage, Darm). Die Probe wird ausgestrichen, Kolonien wachsen – dann per Mikroskop-Minispiel (Fokus drehen, Färbung wählen: Gram, Ziehl-Neelsen) identifiziert.

**Coreloop:** Biom wählen → Agar/Nährboden wählen (Eisen-Agar, Nitrat-Medium, Sediment-Extrakt) → wachsen lassen → Kolonie picken → mikroskopieren → Codex-Eintrag.
**Biohazard:** Falscher Nährboden + zu lange Inkubation → Überwucherung → Alarm.
**Dopamin:** Klassische Lootbox-Spannung beim „Aufdecken“ der Kolonie, Biom-Rotation erzeugt FOMO („Tiefsee nur am Wochenende“).

---

## Vorschlag 4 – „Containment“ (Reaktionsspiel)

**Idee:** Eine aggressive Mikrobe wächst in Echtzeit in der Petrischale. Der Spieler muss sie identifizieren und mit dem passenden Gegenmittel stoppen: Phage (gegen Bakterien), Antimykotikum (Pilze), Antikörper/Virustatikum (Viren), Hitze, Salz, Sauerstoffentzug (gegen Anaerobier).

**Coreloop:** 60-Sekunden-Runde → Hinweise sammeln (Farbe, Geruch, Form) → Gegenmittel ziehen → Kombo-Punkte.
**Biohazard:** Kolonie erreicht den Rand → Alarm, Labor wird abgeriegelt.
**Dopamin:** Adrenalin, Highscore-Liste, tägliche „Ausbruch des Tages“-Challenge.

---

## Vorschlag 5 – „Biofilm-Imperium“ (Idle/Merge)

**Idee:** Spieler züchten ein Konsortium. Mikroben derselben Gilde verschmelzen (Merge) zu stärkeren Kolonien; Gilden-Kombos (Anammox + Nitrifizierer, Methanogene + Methanotrophe) erzeugen Synergien.

**Coreloop:** 3 tägliche Inokulationen → Merge-Board → Ressourcen (ATP) sammeln → neue Nährböden freischalten (Licht → Eisen → Schwefel → Methan) → seltene Mikroben erscheinen.
**Biohazard:** Zu viele Pathogene im Board → Kontaminations-Meter voll → Alarm, Board wird teilweise sterilisiert.
**Dopamin:** Ständig steigende Zahlen, Offline-Fortschritt, Kombos.

---

## Empfehlung

**Vorschlag 1** ist am stärksten als täglicher Coreloop (klar, kurz, teilbar) und lässt sich später mit Elementen aus **3** (Biome/Nährboden-Wahl) und **2** (Gilden-Kreisläufe als Wochen-Event) erweitern.

## Datenbank

`js/data.js` enthält eine kuratierte Auswahl wissenschaftlich korrekt benannter Mikroben mit Gilde, Nährboden, Sauerstoffbedarf, Temperaturbereich, Habitat, Form, Seltenheit und Fakt.

Hinweis: „Alle“ bekannten Arten ist nicht realistisch abbildbar – es sind über 20.000 Bakterien- und Archaeenarten, über 150.000 Pilzarten und über 14.000 Virusarten offiziell beschrieben (und Millionen unbeschriebene). Die Datenbank deckt deshalb gezielt **jede wichtige Gilde und jeden Nährbodentyp** ab und lässt sich über das einfache Array-Format beliebig erweitern. Gefährliche Hochrisiko-Erreger sind bewusst nicht enthalten.
