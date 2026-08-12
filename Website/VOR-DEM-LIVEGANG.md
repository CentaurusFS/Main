# Vor dem Livegang

Diese Liste muss abgearbeitet sein, bevor die Seite online geht. Alles Offene
steht auf der Website selbst in Orange und in eckigen Klammern, es ist also
nicht zu übersehen.

## Rechtlich zwingend

- [ ] **Telefonnummer** im Impressum
- [ ] **Registergericht und HRB-Nummer** im Impressum
- [ ] **Umsatzsteuer-Identifikationsnummer** im Impressum
- [ ] **Berufshaftpflicht**: Versicherer und räumlicher Geltungsbereich
- [ ] **Hosting-Anbieter** mit Anschrift in der Datenschutzerklärung, dazu die
      Speicherdauer der Server-Logfiles
- [ ] **Auftragsverarbeitungsvertrag** mit dem Hoster abschließen
- [ ] **Web3Forms**: Anbieter und Anschrift in der Datenschutzerklärung
      eintragen, Auftragsverarbeitungsvertrag abschließen
- [ ] Anschrift prüfen. Auf der Seite steht Gartenstraße 14, 36088 Hünfeld.
- [ ] Beide Rechtstexte von einer Anwältin oder einem Anwalt gegenlesen lassen.
      Sie stammen aus eurem alten Stand und sind vollständig, aber ich bin
      keine Rechtsberatung.

## Technisch

- [ ] **Web3Forms-Schlüssel** eintragen. Er steht als einzige Konstante ganz
      oben in `js/contact.js`. Ohne ihn sendet das Formular nicht.
- [ ] Formular einmal echt absenden und prüfen, ob die Mail ankommt.
- [ ] Favicon ergänzen, im Moment gibt es keins.

## Inhaltlich

- [ ] **Teamtexte gegenlesen**. Sie stehen jetzt in `team.html`, jeweils zwei
      Zeilen zur beruflichen Herkunft. Prüft, ob die Formulierung so stimmt und
      ob ihr Stationen konkret benennen wollt.
- [ ] **Rollenbezeichnung** im Team prüfen, dort steht bisher „Gründer".
- [ ] **Die Zahl im Titel**: „Der Mittelstand hat noch fünf Jahre." Das ist eine
      Behauptung, die im Termin halten muss.
- [ ] **Die vier Phasen** und die **fünf Branchen** gegenlesen. Die Texte sind
      mein Vorschlag, nicht eure Freigabe. Besonders „zwei Tage im Betrieb" und
      „ein halbes Jahr später" sind Zusagen.

## Beim Ändern

Wenn du an `styles.css` oder an einer Datei in `js/` etwas änderst, zähl in
`index.html`, `team.html`, `impressum.html` und `datenschutz.html` die Nummer
hinter `?v=` hoch. Sonst sehen Besucher mit gefülltem Zwischenspeicher weiter
die alte Fassung.

## Was die Seite bewusst nicht tut

Kein Tracking, keine Analyse, keine Cookies zu Werbezwecken, keine Schriften
oder Skripte von fremden Servern. Deshalb braucht sie kein Einwilligungsbanner.
Einwilligung wird an genau einer Stelle eingeholt, nämlich vor dem Absenden des
Kontaktformulars. Im lokalen Speicher liegt nur die gewählte Sprache.
