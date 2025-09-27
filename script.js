const form = document.querySelector("#log-form");
const listEl = document.querySelector("#log-list");
const summaryEl = document.querySelector("#hours-summary");
const customerFilter = document.querySelector("#customer-filter");
const template = document.querySelector("#log-row-template");

const STORAGE_KEY = "consultant-logs";

let entries = [];

function loadEntries() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("Kunde inte läsa sparade poster", error);
    return [];
  }
}

function saveEntries(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Kunde inte spara poster", error);
  }
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function calculateDuration(start, end) {
  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = end.split(":").map(Number);

  const startDate = new Date();
  startDate.setHours(startHours, startMinutes, 0, 0);

  const endDate = new Date();
  endDate.setHours(endHours, endMinutes, 0, 0);

  let diff = (endDate - startDate) / 1000 / 60 / 60; // in hours

  if (diff < 0) {
    diff += 24;
  }

  return diff;
}

function formatHours(hours) {
  return `${hours.toFixed(1).replace(".", ",")} timmar`;
}

function renderSummary(data) {
  const total = data.reduce((sum, entry) => sum + entry.duration, 0);
  summaryEl.textContent = formatHours(total);
}

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

    const removeButton = row.querySelector("[data-action=remove]");
    removeButton.addEventListener("click", () => {
      entries = entries.filter((item) => item.id !== entry.id);
      saveEntries(entries);
      refresh();
    });

    listEl.appendChild(clone);
  });
}

function refresh(filterValue = customerFilter.value) {
  renderFilterOptions(entries);

  const filteredEntries = filterValue
    ? entries.filter((entry) => entry.client === filterValue)
    : entries;

  renderEntries(filteredEntries);
  renderSummary(filteredEntries);
}

function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(form);

  const client = formData.get("client").trim();
  const date = formData.get("date");
  const startTime = formData.get("start-time");
  const endTime = formData.get("end-time");
  const workType = formData.get("work-type");
  const notes = formData.get("notes").trim();

  if (!client || !date || !startTime || !endTime || !workType) {
    return;
  }

  const duration = calculateDuration(startTime, endTime);

  if (duration <= 0) {
    alert("Sluttiden måste vara senare än starttiden.");
    return;
  }

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

function initFilter(entries) {
  customerFilter.addEventListener("change", (event) => {
    refresh(event.target.value);
  });
}

function bootstrap() {
  entries = loadEntries();
  renderFilterOptions(entries);
  renderEntries(entries);
  renderSummary(entries);

  form.addEventListener("submit", handleFormSubmit);
  form.addEventListener("reset", () => {
    summaryEl.textContent = "0,0 timmar";
  });

  initFormListeners();
  initFilter(entries);
}

document.addEventListener("DOMContentLoaded", bootstrap);
