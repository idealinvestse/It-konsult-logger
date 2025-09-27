---
trigger: always_on
---

# Coding Guidelines - IT-Konsult Tidrapport

Detta dokument definierar kodningsriktlinjer och standarder för IT-Konsult Tidrapport-projektet. Alla utvecklare och AI-assistenter som arbetar med projektet ska följa dessa riktlinjer.

## Allmänna Principer

### 1. Kodkvalitet
- **Läsbarhet först**: Kod ska vara självförklarande och lätt att förstå
- **KISS-principen**: Keep It Simple, Stupid - undvik onödig komplexitet
- **DRY-principen**: Don't Repeat Yourself - undvik kodduplicering
- **Konsistens**: Följ etablerade mönster i kodbasen

### 2. Språk och Kommentarer
- **Kod**: Skriv på engelska (variabelnamn, funktionsnamn, etc.)
- **Kommentarer**: Skriv på svenska för bättre förståelse
- **Användargränssnitt**: Allt användarsynligt text ska vara på svenska
- **Dokumentation**: Skriv på svenska i README och andra dokument

## JavaScript-Riktlinjer

### 1. Syntax och Formatering

```javascript
// Använd const för värden som inte ändras, let för variabler
const API_URL = "https://api.example.com";
let currentUser = null;

// Funktionsdeklarationer med beskrivande namn
function calculateWorkingHours(startTime, endTime) {
  // Implementering här
}

// Arrow functions för korta callbacks
const sortedEntries = entries.sort((a, b) => a.date.localeCompare(b.date));
```

### 2. Namnkonventioner
- **Variabler och funktioner**: camelCase (`userName`, `calculateTotal`)
- **Konstanter**: SCREAMING_SNAKE_CASE (`STORAGE_KEY`, `MAX_ENTRIES`)
- **DOM-element**: camelCase med beskrivande suffix (`submitBtn`, `clientInput`)
- **CSS-klasser**: kebab-case (`form-field`, `btn-primary`)

### 3. Funktioner
- Håll funktioner små och fokuserade (max 20-30 rader)
- En funktion ska göra en sak och göra den bra
- Använd beskrivande namn som förklarar vad funktionen gör

```javascript
// Bra: Beskrivande namn och tydligt syfte
function validateTimeEntry(startTime, endTime) {
  if (!startTime || !endTime) {
    return { isValid: false, error: "Både start- och sluttid krävs" };
  }
  
  const duration = calculateDuration(startTime, endTime);
  if (duration <= 0) {
    return { isValid: false, error: "Sluttid måste vara senare än starttid" };
  }
  
  return { isValid: true };
}
```

### 4. Felhantering
- Använd try-catch för operationer som kan misslyckas
- Logga fel till konsolen med beskrivande meddelanden
- Visa användarvänliga felmeddelanden

```javascript
function saveToLocalStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Kunde inte spara data till localStorage:", error);
    alert("Ett fel uppstod när data skulle sparas. Försök igen.");
  }
}
```

### 5. DOM-manipulation
- Cachelagra DOM-referenser i början av filen
- Använd semantiska HTML-element
- Separera logik från presentation

```javascript
// Cachelagra DOM-element
const form = document.querySelector("#log-form");
const entriesList = document.querySelector("#entries-list");

// Använd event delegation för dynamiskt innehåll
entriesList.addEventListener("click", (event) => {
  if (event.target.matches("[data-action='delete']")) {
    handleDeleteEntry(event.target.dataset.entryId);
  }
});
```

## HTML-Riktlinjer

### 1. Struktur och Semantik
- Använd semantiska HTML5-element (`<main>`, `<section>`, `<article>`, etc.)
- Korrekt heading-hierarki (h1 → h2 → h3)
- Använd `<form>` för alla användarinmatningar

### 2. Tillgänglighet
- Alla formulärfält ska ha associerade `<label>`-element
- Använd `aria-*` attribut där det behövs
- Säkerställ att sidan fungerar med tangentbord

```html
<div class="form-field">
  <label for="client-name">Kund</label>
  <input 
    type="text" 
    id="client-name" 
    name="client" 
    required 
    aria-describedby="client-help"
  />
  <small id="client-help">Ange kundens namn eller företag</small>
</div>
```

### 3. CSS-klasser
- Använd BEM-metodologi för komplexa komponenter
- Håll klassnamn beskrivande och konsekventa

```html
<!-- BEM-exempel -->
<div class="time-entry">
  <div class="time-entry__header">
    <h3 class="time-entry__title">Konsultation</h3>
  </div>
  <div class="time-entry__content">
    <p class="time-entry__duration time-entry__duration--highlighted">2,5 timmar</p>
  </div>
</div>
```

## CSS-Riktlinjer

### 1. Organisation
- Använd CSS-variabler för färger, typsnitt och spacing
- Gruppera relaterade stilar tillsammans
- Kommentera komplexa eller ovanliga CSS-regler

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  
  --font-family-base: 'Inter', sans-serif;
  --font-size-base: 16px;
  --line-height-base: 1.5;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
}
```

### 2. Responsiv Design
- Mobile-first approach
- Använd flexbox och CSS Grid för layout
- Testa på olika skärmstorlekar

```css
/* Mobile first */
.form-grid {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: 1fr;
}

/* Tablet och större */
@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Filstruktur och Organisation

### 1. Projektstruktur
```
it-konsult-logger/
├── index.html              # Huvudsida
├── script.js               # Huvudlogik
├── styles.css              # Stilar
├── README.md               # Projektdokumentation
├── coding-guidelines.md    # Denna fil
└── assets/                 # Statiska filer (om behövs)
    ├── images/
    └── icons/
```

### 2. Kodorganisation i JavaScript
- Gruppera relaterad funktionalitet tillsammans
- Använd kommentarer för att dela upp sektioner
- Håll globala variabler till minimum

```javascript
// ============================================
// GLOBALA VARIABLER OCH KONSTANTER
// ============================================
const STORAGE_KEY = "consultant-logs";
let entries = [];

// ============================================
// DATAHANTERING
// ============================================
function loadEntries() { /* ... */ }
function saveEntries(data) { /* ... */ }

// ============================================
// UI-RENDERING
// ============================================
function renderEntries(data) { /* ... */ }
function renderSummary(data) { /* ... */ }

// ============================================
// EVENT HANDLERS
// ============================================
function handleFormSubmit(event) { /* ... */ }
function handleDeleteEntry(entryId) { /* ... */ }
```

## Testning och Kvalitetssäkring

### 1. Manuell Testning
- Testa alla funktioner efter varje ändring
- Kontrollera på olika webbläsare (Chrome, Firefox, Safari, Edge)
- Testa responsivitet på olika skärmstorlekar

### 2. Kodgranskning
- Granska all kod innan den läggs till i projektet
- Kontrollera att riktlinjerna följs
- Säkerställ att koden är välkommenterad

### 3. Prestanda
- Minimera DOM-manipulationer
- Använd event delegation för många element
- Optimera bilder och andra resurser

## Git och Versionshantering

### 1. Commit-meddelanden
- Skriv på svenska
- Använd imperativ form ("Lägg till", "Fixa", "Uppdatera")
- Var beskrivande men koncis

```
Lägg till backup-funktionalitet för tidsposter

- Implementera exportToJSON för att spara data
- Lägg till importFromJSON för att återställa data
- Uppdatera UI med backup/återställ-knappar
```

### 2. Branching
- Använd feature branches för nya funktioner
- Håll commits små och fokuserade
- Testa innan du mergar till main

## Säkerhet och Prestanda

### 1. Datasäkerhet
- Validera all användarinmatning
- Sanitera data innan den sparas
- Använd HTTPS för externa API-anrop

### 2. Prestanda
- Lazy loading för stora dataset
- Debounce för sökfunktioner
- Minimera re-rendering av DOM

## Framtida Utveckling

### 1. Moduläritet
- Förbered för uppdelning i moduler
- Separera business logic från UI-logik
- Gör koden testbar

### 2. API-integration
- Designa för framtida backend-integration
- Använd async/await för asynkrona operationer
- Implementera proper error handling för nätverksanrop

---

**Viktigt**: Dessa riktlinjer är levande dokument som kan uppdateras när projektet växer. All kod som läggs till ska följa dessa standarder för att säkerställa kodkvalitet och maintainability.
