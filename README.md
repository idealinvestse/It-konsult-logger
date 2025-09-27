# IT-Konsult Tidrapport

En enkel webbapplikation för IT-konsulter att logga och spara arbetade timmar per kund och projekt.

## Funktioner

- **Logga arbetstimmar**: Registrera kund, datum, start/sluttid, arbetstyp och anteckningar
- **Beräkning av timmar**: Automatisk beräkning av arbetade timmar med realtidsförhandsvisning
- **Filtrering**: Filtrera poster efter kund
- **Sortering**: Sortera poster efter datum, arbetade timmar eller kund
- **Redigering**: Ändra befintliga tidsposter
- **Import/Export**: Exportera till och importera från CSV-filer
- **Lokal lagring**: Data sparas i webbläsarens localStorage
- **Responsiv design**: Fungerar på desktop och mobil
- **Svenskt gränssnitt**: Anpassat för svenska användare
- **Backup/Återställning**: Spara och ladda all data till/från en JSON-fil

## Teknisk översikt

### Arkitektur

- **Frontend**: Ren HTML5, CSS3 och JavaScript (ES6+)
- **Ingen backend**: Klientbaserad applikation
- **Lagring**: localStorage API för persistens

### Filer

- `index.html`: Huvudstrukturen och användargränssnitt
- `script.js`: Applikationslogik, datahantering och DOM-manipulation
- `styles.css`: Styling med CSS-variabler och responsiv design

### Nyckelfunktioner i JavaScript

- **Datahantering**: Ladda/spara till localStorage med felhantering
- **Validering**: Klientbaserad validering av formulärdata
- **Rendering**: Dynamisk rendering av poster med templates
- **Filtrering**: Realtidsfiltrering av poster
- **Eventhantering**: Lyssnare för formulär och interaktioner

## Installation och användning

1. Klona eller ladda ner projektet
2. Öppna `index.html` i en modern webbläsare
3. Ingen ytterligare installation krävs

### Systemkrav

- Modern webbläsare med stöd för ES6+ och localStorage
- Ingen server eller backend behövs

## Utvecklingsplan

### Nuvarande version (v1.0)

- Grundläggande funktionalitet för tidrapportering
- Lokal lagring
- Responsiv design

### Planerade förbättringar

#### Kort sikt (v1.1) - Slutförd

- [x] Exportera data till CSV/Excel
- [x] Importera från CSV
- [x] Sortering av poster (datum, timmar, kund)
- [x] Redigering av befintliga poster
- [x] Bekräftelse innan borttagning

#### Medel sikt (v2.0)

- [ ] Användarautentisering och molnlagring
- [ ] Fler rapporter (veckovis, månadsvis, per kund)
- [ ] Integration med kalender-API:er
- [ ] Tema-väljare (mörkt/ljust läge)
- [x] Backup/återställning av data

#### Lång sikt (v3.0)

- [ ] Mobilapp (React Native/PWA)
- [ ] Faktureringssystem-integration
- [ ] Projektspårning med Gantt-diagram
- [ ] API för externa integrationer
- [ ] Multi-användarstöd

### Tekniska förbättringar

- [ ] Enhetstester (Jest)
- [ ] TypeScript-migration
- [ ] Byggprocess (Webpack/Vite)
- [ ] CI/CD pipeline
- [ ] Prettier/ESLint för kodkvalitet

## Bidra

1. Forka projektet
2. Skapa en feature-branch
3. Gör ändringar och testa
4. Skicka pull request

## Licens

MIT License - fritt att använda och modifiera.
