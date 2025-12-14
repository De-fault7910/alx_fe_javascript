let quotes = [];

/* ---------- STORAGE ---------- */

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

/* ---------- SERVER SIMULATION ---------- */

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchServerQuotes() {
  const response = await fetch(SERVER_URL);
  const data = await response.json();

  // Simulate server quotes
  return data.slice(0, 5).map(post => ({
    text: post.title,
    category: "Server"
  }));
}

async function syncWithServer() {
  const serverQuotes = await fetchServerQuotes();

  // Conflict resolution: server wins
  quotes = serverQuotes;
  saveQuotes();
  populateCategories();
  showRandomQuote();

  document.getElementById("syncStatus").textContent =
    "Data synced with server. Server data took precedence.";
}

/* ---------- PERIODIC SYNC ---------- */

setInterval(syncWithServer, 30000);

/* ---------- QUOTES ---------- */

function showRandomQuote() {
  const filtered = getFilteredQuotes();
  if (filtered.length === 0) return;

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("quoteDisplay").innerHTML =
    `"${random.text}" — ${random.category}`;

  sessionStorage.setItem("lastQuote", JSON.stringify(random));
}

/* ---------- ADD QUOTES ---------- */

function createAddQuoteForm() {
  const div = document.createElement("div");

  const text = document.createElement("input");
  text.id = "newQuoteText";
  text.placeholder = "Quote text";

  const category = document.createElement("input");
  category.id = "newQuoteCategory";
  category.placeholder = "Category";

  const btn = document.createElement("button");
  btn.textContent = "Add Quote";
  btn.addEventListener("click", addQuote);

  div.append(text, category, btn);
  document.body.appendChild(div);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;

  if (!text || !category) return;

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
}

/* ---------- CATEGORIES ---------- */

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];

  select.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  const saved = localStorage.getItem("selectedCategory");
  if (saved) select.value = saved;
}

function filterQuotes() {
  const value = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", value);
  showRandomQuote();
}

function getFilteredQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  return selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);
}

/* ---------- JSON ---------- */

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = e => {
    const imported = JSON.parse(e.target.result);
    quotes.push(...imported);
    saveQuotes();
    populateCategories();
  };
  reader.readAsText(event.target.files[0]);
}

/* ---------- EVENTS ---------- */

document.getElementById("newQuoteBtn")
  .addEventListener("click", showRandomQuote);

/* ---------- INIT ---------- */

loadQuotes();
populateCategories();
createAddQuoteForm();
showRandomQuote();
