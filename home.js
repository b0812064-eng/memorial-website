// Select HTML elements
const memorialsContainer = document.getElementById("memorials");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const createButton = document.getElementById("create-new");
const modal = document.getElementById("create-modal");
const closeModalBtn = document.querySelector(".modal-close");
const cancelModalBtn = document.querySelector(".modal-cancel");
const form = document.getElementById("create-form");

// Backend URL (local development)
const API_BASE = 'http://localhost:3000';

// Load data from backend
async function loadMemorials() {
  try {
    const res = await fetch(`${API_BASE}/memorials`);
    if (!res.ok) throw new Error('Failed to load');
    const data = await res.json();
    console.log("Initial memorials loaded:", data); // DEBUG: Log initial data
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
    console.log("Added new memorial:", data); // DEBUG: Log new item
    return data;
  } catch (err) {
    console.error('Save error:', err);
    alert("Error saving memorial!");
    return null;
  }
}

// Delete memorial from backend
async function deleteMemorial(id) {
  console.log("deleteMemorial called with ID:", id); // DEBUG: Log on call

  if (!id) {
    console.error("Invalid ID for deletion:", id, "- Aborting!"); // DEBUG: Invalid ID check
    alert("Error: Invalid ID for the item to delete.");
    return;
  }

  const confirmed = confirm("Are you sure you want to delete this person?");
  console.log("User confirmed delete:", confirmed); // DEBUG: Log confirmation
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/memorials/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    console.log("Deleted memorial:", id); // DEBUG: Log deleted item
    const updatedList = await loadMemorials();
    renderMemorials(updatedList);
  } catch (err) {
    console.error('Delete error:', err);
    alert("Error deleting memorial!");
  }
}

// Search memorials from backend
async function searchMemorials() {
  const q = searchInput.value.trim().toLowerCase();
  console.log("Searching for:", q); // DEBUG: Log query
  if (!q) {
    const all = await loadMemorials();
    renderMemorials(all);
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/memorials/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Failed to search');
    const filtered = await res.json();
    console.log("Filtered results:", filtered); // DEBUG: Log filtered list
    renderMemorials(filtered);
  } catch (err) {
    console.error('Search error:', err);
    alert("Error searching memorials!");
  }
}

// Render cards
function renderMemorials(list) {
  console.log("Rendering memorials with list:", list); // DEBUG: Log list to render
  memorialsContainer.innerHTML = "";

  if (list.length === 0) {
    memorialsContainer.innerHTML = `<p style="text-align:center;color:#6b7280;margin-top:20px;">No results found.</p>`;
    console.log("No results, showing empty message"); // DEBUG: Empty list case
    return;
  }

  list.forEach((m) => {
    const card = document.createElement("div");
    card.className = "memorial-card";
    card.innerHTML = `
      <div class="card-header">
        <h3>${m.name}</h3>
        <div class="card-actions">
          <button class="delete-btn" data-id="${m.id}" title="Delete">🗑️</button>
        </div>
      </div>
      <p class="dates">${formatDate(m.birth)} – ${formatDate(m.death)}</p>
      <p class="brief">${m.bio}</p>
      <a href="detail.html?id=${m.id}" class="view-link">View Details</a>  <!-- NEW: Details link -->
    `;
    memorialsContainer.appendChild(card);
  });

  console.log("Rendered", list.length, "cards. Delete buttons count:", document.querySelectorAll(".delete-btn").length); // DEBUG: Log after render
  // Log sample IDs (privacy: only first 2)
  console.log("Sample IDs in rendered cards:", list.slice(0, 2).map(m => m.id));

  // Re-attach event delegation for delete (since dynamic)
  memorialsContainer.removeEventListener('click', handleDeleteClick); // Remove old if any
  memorialsContainer.addEventListener('click', handleDeleteClick);
}

// Delete click handler (separate for delegation)
function handleDeleteClick(e) {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    console.log("Delete button clicked, ID:", id); // DEBUG: Log on click
    if (!id) console.error("No/Invalid ID found on delete button!"); // DEBUG: Log error
    deleteMemorial(id);
  }
}

// Add new person
async function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("person-name").value.trim();
  const birth = document.getElementById("birth-date").value.trim();
  const death = document.getElementById("death-date").value.trim();
  const bio = document.getElementById("brief-bio").value.trim();

  if (!name || !birth || !death || !bio) {
    alert("Please fill all fields!");
    return;
  }

  const newMemorial = {
    name,
    birth,
    death,
    bio,
  };

  const saved = await saveMemorial(newMemorial);
  if (saved) {
    closeModal();
    const updated = await loadMemorials();
    renderMemorials(updated);
  }
}

// Modal controls
function openModal() {
  modal.setAttribute("aria-hidden", "false");
  console.log("Modal opened"); // DEBUG: Log open
}
function closeModal() {
  // FOCUS RESET: Move focus to main page (fixes aria-hidden issues)
  document.body.focus(); // Or document.activeElement?.blur();
  modal.setAttribute("aria-hidden", "true");
  form.reset();
  console.log("Modal closed and form reset"); // DEBUG: Log close
}

// Date formatting helper
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];  // YYYY-MM-DD format
}

// Event Listeners
createButton.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
form.addEventListener("submit", handleFormSubmit);
searchButton.addEventListener("click", searchMemorials);
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchMemorials();
});

// Event Delegation for Delete (safe for dynamic buttons)
memorialsContainer.addEventListener("click", handleDeleteClick);

// Initialize app
async function init() {
  const list = await loadMemorials();
  renderMemorials(list);
}
init();