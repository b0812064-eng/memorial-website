// ---- Elementleri seç ----
const detailContent = document.getElementById("detail-placeholder");
const backButton = document.getElementById("back-button");

// ---- LocalStorage'dan veri yükle ----
let memorials = JSON.parse(localStorage.getItem("memorials")) || [];

// ---- URL'den ID al ----
function getMemorialId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// ---- Detay render et ----
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

  detailContent.innerHTML = `
    <article class="detail-hero">
      <h1>${memorial.name}</h1>
      <p class="dates-large">${memorial.birth} – ${memorial.death}</p>
      <!-- Placeholder Photo -->
      <div class="photo-placeholder">
        <img src="https://via.placeholder.com/400x300/6c5ce7/ffffff?text=Photo" alt="${memorial.name} Photo" style="width: 100%; max-width: 400px; border-radius: 12px;">
        <small>(Photo not uploaded – To be added in the future)</small>
      </div>
    </article>
    <section class="detail-bio">
      <h2>Life Story</h2>
      <p>${memorial.bio}</p>
      <!-- In the future: Timeline, Messages -->
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

  backButton.style.display = "block"; // Show back button
  console.log("Detail rendered for:", memorial.name);
}

// ---- Back butonu eventi ----
backButton.addEventListener("click", () => {
  window.location.href = "index.html";
});

// ---- Başlangıç: ID al ve render et ----
const id = getMemorialId();
console.log("Loading detail for ID:", id);

if (id) {
  const memorial = memorials.find(m => m.id === id);
  renderDetail(memorial);
} else {
  renderDetail(null); // Show error
}