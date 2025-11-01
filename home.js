// Select HTML elements
const memorialsContainer = document.getElementById("memorials");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const createButton = document.getElementById("create-new");
const modal = document.getElementById("create-modal");
const closeModalBtn = document.querySelector(".modal-close");
const cancelModalBtn = document.querySelector(".modal-cancel");
const form = document.getElementById("create-form");

// Load data from LocalStorage
let memorials = JSON.parse(localStorage.getItem("memorials")) || [];
console.log("Initial memorials loaded:", memorials); // DEBUG: Log initial data

// Migration: Assign IDs to items without IDs (for old data)
function migrateMemorials() {
  let changed = false;
  memorials = memorials.map((m) => {
    if (!m.id) {
      const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      console.log("Assigning new ID to old memorial:", m.name, "->", newId); // DEBUG: Migration log
      changed = true;
      return { ...m, id: newId };
    }
    return m;
  });
  if (changed) {
    console.log("Migration completed - saving updated memorials"); // DEBUG
    saveMemorials();
  }
}

// Apply migration
migrateMemorials();

// NEW: Add example memorials if none exist
function initExamples() {
  if (memorials.length === 0) {
    console.log("No memorials found, adding examples"); // DEBUG: Log init
    const examples = [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: "John Smith",
        birth: "1950-01-15",
        death: "2020-05-20",
        bio: "John was a dedicated teacher for 40 years, enlightening young minds. He is remembered for his love of family and nature. Rest in peace."
      },
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: "Mary Johnson",
        birth: "1965-03-10",
        death: "2022-11-12",
        bio: "Mary was a compassionate nurse who saved countless lives. Her warm smile and kindness inspired everyone around her. Forever in our hearts."
      },
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: "Robert Wilson",
        birth: "1940-07-22",
        death: "2019-09-05",
        bio: "Robert was a skilled carpenter who supported his family with pride. His stories and wise words remain unforgettable. Lights eternal."
      }
    ];
    memorials.push(...examples);
    saveMemorials();
    console.log("Examples added:", examples.map(e => e.name)); // DEBUG: Log added
  }
}

// Initialize examples
initExamples();

// Save to LocalStorage
function saveMemorials() {
  console.log("Saving memorials to LocalStorage:", memorials); // DEBUG: Log array before saving
  localStorage.setItem("memorials", JSON.stringify(memorials));
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

  list.forEach((m, index) => {
    const card = document.createElement("div");
    card.className = "memorial-card";
    card.innerHTML = `
      <div class="card-header">
        <h3>${m.name}</h3>
        <div class="card-actions">
          <button class="delete-btn" data-id="${m.id || 'no-id'}" title="Delete">🗑️</button>
        </div>
      </div>
      <p class="dates">${m.birth} – ${m.death}</p>
      <p class="brief">${m.bio}</p>
      <a href="detail.html?id=${m.id}" class="view-link">View Details</a>  <!-- NEW: Details link -->
    `;
    memorialsContainer.appendChild(card);
  });

  console.log("Rendered", list.length, "cards. Delete buttons count:", document.querySelectorAll(".delete-btn").length); // DEBUG: Log after render
  // Log sample IDs (privacy: only first 2)
  console.log("Sample IDs in rendered cards:", list.slice(0, 2).map(m => m.id));
}

// Add new person
function handleFormSubmit(e) {
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
    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name,
    birth,
    death,
    bio,
  };

  console.log("Adding new memorial:", newMemorial); // DEBUG: Log new item
  memorials.push(newMemorial);
  saveMemorials();
  closeModal();
  renderMemorials(memorials);
}

// Delete
function deleteMemorial(id) {
  console.log("deleteMemorial called with ID:", id); // DEBUG: Log on call
  console.log("Current memorials before delete:", memorials); // DEBUG: Log before delete

  if (!id || id === 'undefined' || id === 'no-id') {
    console.error("Invalid ID for deletion:", id, "- Aborting!"); // DEBUG: Invalid ID check
    alert("Error: Invalid ID for the item to delete. Try clearing the database and retrying.");
    return;
  }

  const confirmed = confirm("Are you sure you want to delete this person?");
  console.log("User confirmed delete:", confirmed); // DEBUG: Log confirmation
  if (!confirmed) return;

  // Match ID as string
  const beforeLength = memorials.length;
  memorials = memorials.filter((m) => {
    const shouldKeep = m.id !== id;
    if (!shouldKeep) console.log("Deleting memorial with ID:", m.id, "Name:", m.name); // DEBUG: Log deleted item
    return shouldKeep;
  });
  const afterLength = memorials.length;
  console.log("Memorials after filter - before:", beforeLength, "after:", afterLength); // DEBUG: Log length change

  saveMemorials();
  renderMemorials(memorials);
}

// Search
function searchMemorials() {
  const q = searchInput.value.trim().toLowerCase();
  console.log("Searching for:", q); // DEBUG: Log query
  const filtered = memorials.filter((m) =>
    m.name.toLowerCase().includes(q)
  );
  console.log("Filtered results:", filtered); // DEBUG: Log filtered list
  renderMemorials(filtered);
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
memorialsContainer.addEventListener("click", (e) => {
  console.log("Container clicked on:", e.target); // DEBUG: Log clicked element
  console.log("Target classes:", e.target.classList); // DEBUG: Log classes
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    console.log("Delete button clicked, ID:", id); // DEBUG: Log on click
    if (!id || id === 'undefined') console.error("No/Invalid ID found on delete button!"); // DEBUG: Log error
    deleteMemorial(id);
  }
});

// Load cards on start
renderMemorials(memorials);