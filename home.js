// Select HTML elements
const memorialsContainer = document.getElementById("memorials");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const createButton = document.getElementById("create-new");
const modal = document.getElementById("create-modal");
const closeModalBtn = document.querySelector(".modal-close");
const cancelModalBtn = document.querySelector(".modal-cancel");
const form = document.getElementById("create-form");

// Backend URL (DEPLOYED SERVER)
const API_BASE = 'https://memorial-website-k2m7.onrender.com';

// Load data from backend
async function loadMemorials() {
  try {
    const res = await fetch(`${API_BASE}/memorials`);
    if (!res.ok) throw new Error('Failed to load');
    const data = await res.json();
    console.log("Initial memorials loaded:", data);
    return data;
  } catch (err) {
    console.error('Load error:', err);
    return [];
  }
}

// Save new memorial to backend
async function saveMemorial(newMemorial) {
  try {
    const res = await fetch(`${API_BASE}/memorials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMemorial)
    });
    if (!res.ok) throw new Error('Failed to save');
    const data = await res.json();
    console.log("Added new memorial:", data);
    return data;
  } catch (err) {
    console.error('Save error:', err);
    alert("Error saving memorial!");
    return null;
  }
}

// Delete memorial from backend
async function deleteMemorial(id) {
  console.log("deleteMemorial called with ID:", id);
  if (!id) return alert("Invalid ID!");

  const confirmed = confirm("Are you sure you want to delete this person?");
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/memorials/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    const updatedList = await loadMemorials();
    renderMemorials(updatedList);
  } catch (err) {
    console.error('Delete error:', err);
    alert("Error deleting memorial!");
  }
}

// Search memorials
async function searchMemorials() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return renderMemorials(await loadMemorials());

  try {
    const res = await fetch(`${API_BASE}/memorials/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Failed to search');
    renderMemorials(await res.json());
  } catch {
    alert("Error searching memorials!");
  }
}

// Render UI
function renderMemorials(list) {
  memorialsContainer.innerHTML = "";
  if (list.length === 0) {
    memorialsContainer.innerHTML = `<p style="text-align:center;color:#6b7280;margin-top:20px;">No results found.</p>`;
    return;
  }

  list.forEach((m) => {
    const card = document.createElement("div");
    card.className = "memorial-card";
    card.innerHTML = `
      <div class="card-header">
        <h3>${m.name}</h3>
        <button class="delete-btn" data-id="${m.id}" title="Delete">🗑️</button>
      </div>
      <p class="dates">${formatDate(m.birth)} – ${formatDate(m.death)}</p>
      <p class="brief">${m.bio}</p>
      <a href="detail.html?id=${m.id}" class="view-link">View Details</a>
    `;
    memorialsContainer.appendChild(card);
  });

  memorialsContainer.removeEventListener('click', handleDeleteClick);
  memorialsContainer.addEventListener('click', handleDeleteClick);
}

function handleDeleteClick(e) {
  if (e.target.classList.contains("delete-btn")) {
    deleteMemorial(e.target.dataset.id);
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("person-name").value.trim();
  const birth = document.getElementById("birth-date").value.trim();
  const death = document.getElementById("death-date").value.trim();
  const bio = document.getElementById("brief-bio").value.trim();
  if (!name || !birth || !death || !bio) return alert("Please fill all fields!");

  const saved = await saveMemorial({ name, birth, death, bio });
  if (saved) {
    closeModal();
    renderMemorials(await loadMemorials());
  }
}

function openModal() { modal.setAttribute("aria-hidden", "false"); }
function closeModal() { modal.setAttribute("aria-hidden", "true"); form.reset(); }
function formatDate(dateStr) { return dateStr ? new Date(dateStr).toISOString().split('T')[0] : ''; }

createButton.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
form.addEventListener("submit", handleFormSubmit);
searchButton.addEventListener("click", searchMemorials);
searchInput.addEventListener("keyup", (e) => e.key === "Enter" && searchMemorials());

async function init() { renderMemorials(await loadMemorials()); }
init();
