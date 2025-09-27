// Globala variabler för DOM-element och datahantering
// Hämtar referenser till viktiga HTML-element
const form = document.querySelector("#log-form");
const listEl = document.querySelector("#log-list");
const summaryEl = document.querySelector("#hours-summary");
const customerFilter = document.querySelector("#customer-filter");
const template = document.querySelector("#log-row-template");
const exportBtn = document.querySelector("#export-btn");
const importBtn = document.querySelector("#import-btn");
const importFile = document.querySelector("#import-file");
const sortSelect = document.querySelector("#sort-select");

// Konstant för localStorage-nyckel
const STORAGE_KEY = "consultant-logs";

// Array för att hålla alla loggade poster
let entries = [];

// ID för post som redigeras, null om ingen redigering
let editingId = null;

// Laddar sparade poster från localStorage
function loadEntries() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("Kunde inte läsa sparade poster", error);
    return [];
  }
}

// Sparar poster till localStorage
function saveEntries(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Kunde inte spara poster", error);
  }
}

// Genererar ett unikt ID för varje post
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Beräknar tidslängd mellan start och slut i timmar
function calculateDuration(start, end) {
  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = end.split(":").map(Number);

  const startDate = new Date();
  startDate.setHours(startHours, startMinutes, 0, 0);

  const endDate = new Date();
  endDate.setHours(endHours, endMinutes, 0, 0);

  let diff = (endDate - startDate) / 1000 / 60 / 60; // in hours

  if (diff < 0) {
    diff += 24; // Hanterar över midnatt
  }

  return diff;
}

// Formaterar timmar till svensk notation
function formatHours(hours) {
  return `${hours.toFixed(1).replace(".", ",")} timmar`;
}

// Exporterar poster till CSV-fil
function exportToCSV(data) {
  if (data.length === 0) {
    alert("Inga poster att exportera.");
    return;
  }

  // CSV header
  const headers = ["Kund", "Datum", "Typ", "Starttid", "Sluttid", "Timmar", "Anteckningar"];
  let csvContent = headers.join(",") + "\n";

  // Lägg till varje post
  data.forEach(entry => {
    const row = [
      `"${entry.client}"`,
      entry.date,
      `"${entry.workType}"`,
      entry.startTime,
      entry.endTime,
      entry.duration.toFixed(2).replace(".", ","),
      `"${entry.notes || ""}"`
    ];
    csvContent += row.join(",") + "\n";
  });

  // Skapa blob och download-länk
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "tidrapport.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Importerar poster från CSV-fil
function importFromCSV(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const csvText = e.target.result;
    const lines = csvText.split("\n").filter(line => line.trim() !== "");
    
    if (lines.length < 2) {
      alert("CSV-filen är tom eller ogiltig.");
      return;
    }
    
    // Första raden är header, hoppa över
    const dataLines = lines.slice(1);
    const importedEntries = [];
    
    dataLines.forEach(line => {
      // Enkel CSV-parser, hanterar citat
      const columns = parseCSVLine(line);
      if (columns.length >= 7) {
        const [client, date, workType, startTime, endTime, hoursStr, notes] = columns;
        const duration = parseFloat(hoursStr.replace(",", "."));
        
        if (client && date && workType && startTime && endTime && !isNaN(duration)) {
          importedEntries.push({
            id: generateId(),
            client: client.replace(/^"|"$/g, ""),
            date,
            startTime,
            endTime,
            workType: workType.replace(/^"|"$/g, ""),
            notes: notes ? notes.replace(/^"|"$/g, "") : "",
            duration
          });
        }
      }
    });
    
    if (importedEntries.length === 0) {
      alert("Inga giltiga poster hittades i CSV-filen.");
      return;
    }
    
    // Lägg till importerade poster
    entries = [...entries, ...importedEntries];
    saveEntries(entries);
    refresh();
    alert(`${importedEntries.length} poster importerades.`);
  };
  reader.readAsText(file);
}

// Hjälpfunktion för att parse CSV-rad
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Uppdaterar sammanfattning av totala timmar
function renderSummary(data) {
  const total = data.reduce((sum, entry) => sum + entry.duration, 0);
  summaryEl.textContent = formatHours(total);
}

// Uppdaterar filteralternativ för kunder
function renderFilterOptions(data) {
  const previousValue = customerFilter.value;
  const options = new Set(data.map((entry) => entry.client));
  customerFilter.innerHTML = '<option value="">Alla</option>';
  options.forEach((client) => {
    const option = document.createElement("option");
    option.value = client;
    option.textContent = client;
    customerFilter.appendChild(option);
  });
  if (options.has(previousValue)) {
    customerFilter.value = previousValue;
  }
}

// Renderar listan av loggade poster
function renderEntries(data) {
  listEl.innerHTML = "";
  data.forEach((entry) => {
    const clone = template.content.cloneNode(true);
    const row = clone.querySelector("tr");

    const timeLabel = `${entry.startTime} - ${entry.endTime}`;

    const cells = row.querySelectorAll("td");
    cells[0].textContent = entry.client;
    cells[1].textContent = entry.date;
    cells[2].textContent = entry.workType;
    cells[3].textContent = timeLabel;
    cells[4].textContent = entry.duration.toFixed(2).replace(".", ",");
    cells[5].textContent = entry.notes || "-";

    // Lägg till event listener för ta bort-knappen
    const removeButton = row.querySelector("[data-action=remove]");
    removeButton.addEventListener("click", () => {
      if (confirm("Är du säker på att du vill ta bort denna post?")) {
        entries = entries.filter((item) => item.id !== entry.id);
        saveEntries(entries);
        refresh();
      }
    });

    // Lägg till event listener för redigeringsknappen
    const editButton = row.querySelector("[data-action=edit]");
    editButton.addEventListener("click", () => {
      startEditing(entry);
    });

    listEl.appendChild(clone);
  });
}

// Uppdaterar hela vyn (filter, sortera, lista, sammanfattning)
function refresh(filterValue = customerFilter.value, sortValue = sortSelect.value) {
  renderFilterOptions(entries);

  let filteredEntries = filterValue
    ? entries.filter((entry) => entry.client === filterValue)
    : [...entries];

  // Sortera
  filteredEntries = sortEntries(filteredEntries, sortValue);

  renderEntries(filteredEntries);
  renderSummary(filteredEntries);
}

// Sorterar poster baserat på vald sortering
function sortEntries(data, sortBy) {
  const sorted = [...data];
  switch (sortBy) {
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    case 'hours-desc':
      return sorted.sort((a, b) => b.duration - a.duration);
    case 'hours-asc':
      return sorted.sort((a, b) => a.duration - b.duration);
    case 'client-asc':
      return sorted.sort((a, b) => a.client.localeCompare(b.client));
    case 'client-desc':
      return sorted.sort((a, b) => b.client.localeCompare(a.client));
    default:
      return sorted;
  }
}

// Hanterar formulärinskick för att lägga till eller uppdatera post
function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(form);

  const client = formData.get("client").trim();
  const date = formData.get("date");
  const startTime = formData.get("start-time");
  const endTime = formData.get("end-time");
  const workType = formData.get("work-type");
  const notes = formData.get("notes").trim();

  // Validering
  if (!client || !date || !startTime || !endTime || !workType) {
    return;
  }

  const duration = calculateDuration(startTime, endTime);

  if (duration <= 0) {
    alert("Sluttiden måste vara senare än starttiden.");
    return;
  }

  if (editingId) {
    // Uppdatera befintlig post
    const index = entries.findIndex(entry => entry.id === editingId);
    if (index !== -1) {
      entries[index] = {
        ...entries[index],
        client,
        date,
        startTime,
        endTime,
        workType,
        notes,
        duration,
      };
      saveEntries(entries);
      cancelEditing();
      refresh();
    }
  } else {
    // Skapa ny post
    entries.push({
      id: generateId(),
      client,
      date,
      startTime,
      endTime,
      workType,
      notes,
      duration,
    });

    saveEntries(entries);
    form.reset();
    refresh();
  }
}

// Startar redigering av en post
function startEditing(entry) {
  editingId = entry.id;
  // Fyll formuläret med befintliga värden
  form.client.value = entry.client;
  form.date.value = entry.date;
  form["start-time"].value = entry.startTime;
  form["end-time"].value = entry.endTime;
  form["work-type"].value = entry.workType;
  form.notes.value = entry.notes;
  
  // Uppdatera knapptext och sammanfattning
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = "Uppdatera";
  
  // Uppdatera sammanfattning
  const duration = calculateDuration(entry.startTime, entry.endTime);
  summaryEl.textContent = formatHours(duration);
  
  // Fokusera på klientfältet
  form.client.focus();
  
  // Lägg till avbryt-knapp om inte finns
  let cancelBtn = form.querySelector("#cancel-edit");
  if (!cancelBtn) {
    cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.id = "cancel-edit";
    cancelBtn.className = "btn btn-secondary";
    cancelBtn.textContent = "Avbryt";
    cancelBtn.addEventListener("click", cancelEditing);
    form.querySelector(".form-actions").appendChild(cancelBtn);
  }
}

// Avbryter redigering
function cancelEditing() {
  editingId = null;
  form.reset();
  
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = "Lägg till";
  
  const cancelBtn = form.querySelector("#cancel-edit");
  if (cancelBtn) {
    cancelBtn.remove();
  }
  
  summaryEl.textContent = "0,0 timmar";
}

// Initierar lyssnare för realtidsuppdatering av timmar i formuläret
function initFormListeners() {
  const startInput = form.querySelector("#start-time");
  const endInput = form.querySelector("#end-time");

  function updatePreview() {
    const start = startInput.value;
    const end = endInput.value;
    if (!start || !end) {
      summaryEl.textContent = "0,0 timmar";
      return;
    }

    const duration = calculateDuration(start, end);
    if (duration <= 0) {
      summaryEl.textContent = "0,0 timmar";
      return;
    }

    summaryEl.textContent = formatHours(duration);
  }

  startInput.addEventListener("change", updatePreview);
  endInput.addEventListener("change", updatePreview);
}

// Initierar kundfilter och sortering
function initFilter(entries) {
  customerFilter.addEventListener("change", (event) => {
    refresh(event.target.value);
  });
  sortSelect.addEventListener("change", (event) => {
    refresh(customerFilter.value, event.target.value);
  });
}

// Huvudfunktion som startar appen
function bootstrap() {
  entries = loadEntries();
  renderFilterOptions(entries);
  renderEntries(entries);
  renderSummary(entries);

  form.addEventListener("submit", handleFormSubmit);
  form.addEventListener("reset", () => {
    summaryEl.textContent = "0,0 timmar";
    if (editingId) {
      cancelEditing();
    }
  });

  initFormListeners();
  initFilter(entries);

  exportBtn.addEventListener("click", () => {
    exportToCSV(entries);
  });

  importBtn.addEventListener("click", () => {
    importFile.click();
  });

  importFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      importFromCSV(file);
      importFile.value = ""; // Återställ för att tillåta samma fil igen
    }
  });
}

// Starta appen när DOM är laddad
document.addEventListener("DOMContentLoaded", bootstrap);
