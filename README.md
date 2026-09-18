# Fem i rad

En mobilvänlig webbversion av Fem i rad (Gomoku), byggd utan externa beroenden.

## Funktioner i första versionen

- Klassiskt 15 × 15-bräde
- Spel mot datorn med lätt, medel och svår nivå
- Lokalt tvåspelarläge på samma skärm
- Vinstkontroll i alla riktningar
- Resultaträkning under sessionen
- Responsiv design för dator, surfplatta och mobil

Renju-regler, användarkonton, permanent statistik och onlinespel planeras som kommande funktioner.

## Kör lokalt

Öppna `index.html` direkt i en webbläsare eller starta en enkel webbserver:

```bash
python -m http.server 8000
```

Öppna sedan `http://localhost:8000`.

## Publicering

Projektet är förberett för statisk publicering via GitHub Pages: **Settings → Pages → Deploy from a branch → main / root**.
