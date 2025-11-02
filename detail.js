// Select HTML elements
const detailContent = document.getElementById("detail-placeholder");
const backButton = document.getElementById("back-button");

// Backend URL (DEPLOYED SERVER)
const API_BASE = 'https://memorial-website-k2m7.onrender.com';

// Get ID from URL
function getMemorialId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Load single memorial from backend
async function loadMemorial(id) {
  try {
    const res = await fetch(`${API_BASE}/memorials/${id}`);
    if (!res.ok) throw new Error('Memorial not found');
    const data = await res.json();
    console.log("Loaded detail for:", data.name);
    return data;
  } catch (err) {
    console.error('Load error:', err);
    return null;
  }
}

// Render detail
function renderDetail(memorial) {
  if (!memorial) {
    detailContent.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--muted);">
        <h2>Memorial Not Found</h2>
        <p>The memorial page you are looking for does not exist. <a href="index.html">Return to home page</a>.</p>
      </div>
    `;
    return;
  }

  const photoSrc = memorial.photo || "https://via.placeholder.com/400x300/6c5ce7/ffffff?text=Photo";
  const photoAlt = memorial.photo ? `${memorial.name} Photo` : "Default Memorial Photo";

  detailContent.innerHTML = `
    <article class="detail-hero">
      <h1>${memorial.name}</h1>
      <p class="dates-large">${formatDate(memorial.birth)} – ${formatDate(memorial.death)}</p>
      <div class="photo-placeholder">
        <img src="${photoSrc}" alt="${photoAlt}" style="width: 100%; max-width: 400px; border-radius: 12px;">
        ${!memorial.photo ? '<small>(Photo not uploaded)</small>' : ''}
      </div>
    </article>
    <section class="detail-bio">
      <h2>Life Story</h2>
      <p>${memorial.bio}</p>
      <div class="future-features">
        <h3>Upcoming Features</h3>
        <ul>
          <li>Photo Gallery</li>
          <li>Memorial Messages</li>
          <li>Timeline</li>
          <li>Sharing Options</li>
        </ul>
      </div>
    </section>
    <button class="primary-button" onclick="window.history.back();">Go Back</button>
  `;

  backButton.style.display = "block";
  console.log("Detail rendered for:", memorial.name, "with photo:", !!memorial.photo);
}

// Back button
backButton.addEventListener("click", () => {
  window.location.href = "index.html";
});

// Date formatting helper
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}

// Initialize
async function init() {
  const id = getMemorialId();
  console.log("Loading detail for ID:", id);
  if (id) {
    const memorial = await loadMemorial(id);
    renderDetail(memorial);
  } else {
    renderDetail(null);
  }
}
init();
