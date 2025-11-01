// ---- HTML elementlerini seçelim ----
const memorialsContainer = document.getElementById("memorials");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const createButton = document.getElementById("create-new");
const modal = document.getElementById("create-modal");
const closeModalBtn = document.querySelector(".modal-close");
const cancelModalBtn = document.querySelector(".modal-cancel");
const form = document.getElementById("create-form");

// ---- LocalStorage'dan veri yükleme ----
let memorials = JSON.parse(localStorage.getItem("memorials")) || [];
console.log("Initial memorials loaded:", memorials); // DEBUG: Başlangıç verilerini logla

// ---- Migration: ID'siz öğelere ID ata (eski veriler için) ----
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

// Migration'ı uygula
migrateMemorials();

// ---- LocalStorage'a kaydetme ----
function saveMemorials() {
  console.log("Saving memorials to LocalStorage:", memorials); // DEBUG: Kaydetme öncesi array'i logla
  localStorage.setItem("memorials", JSON.stringify(memorials));
}

// ---- Kartları render et ----
function renderMemorials(list) {
  console.log("Rendering memorials with list:", list); // DEBUG: Render edilecek listeyi logla
  memorialsContainer.innerHTML = "";

  if (list.length === 0) {
    memorialsContainer.innerHTML = `<p style="text-align:center;color:#6b7280;margin-top:20px;">Sonuç bulunamadı.</p>`;
    console.log("No results, showing empty message"); // DEBUG: Boş liste durumunda
    return;
  }

  list.forEach((m, index) => {
    const card = document.createElement("div");
    card.className = "memorial-card";
    card.innerHTML = `
      <div class="card-header">
        <h3>${m.name}</h3>
        <div class="card-actions">
          <button class="delete-btn" data-id="${m.id || 'no-id'}" title="Sil">🗑️</button>
        </div>
      </div>
      <p class="dates">${m.birth} – ${m.death}</p>
      <p class="brief">${m.bio}</p>
    `;
    memorialsContainer.appendChild(card);
  });

  console.log("Rendered", list.length, "cards. Delete buttons count:", document.querySelectorAll(".delete-btn").length); // DEBUG: Render sonrası buton sayısını logla
  // Her kartın ID'sini logla (gizlilik için sadece ilk 2'sini)
  console.log("Sample IDs in rendered cards:", list.slice(0, 2).map(m => m.id));
}

// ---- Yeni kişi ekleme ----
function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("person-name").value.trim();
  const birth = document.getElementById("birth-date").value.trim();
  const death = document.getElementById("death-date").value.trim();
  const bio = document.getElementById("brief-bio").value.trim();

  if (!name || !birth || !death || !bio) {
    alert("Lütfen tüm alanları doldurun!");
    return;
  }

  const newMemorial = {
    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name,
    birth,
    death,
    bio,
  };

  console.log("Adding new memorial:", newMemorial); // DEBUG: Yeni eklenen objeyi logla
  memorials.push(newMemorial);
  saveMemorials();
  closeModal();
  renderMemorials(memorials);
}

// ---- Silme ----
function deleteMemorial(id) {
  console.log("deleteMemorial called with ID:", id); // DEBUG: Fonksiyon çağrıldığında ID'yi logla
  console.log("Current memorials before delete:", memorials); // DEBUG: Silme öncesi array

  if (!id || id === 'undefined' || id === 'no-id') {
    console.error("Invalid ID for deletion:", id, "- Aborting!"); // DEBUG: Geçersiz ID kontrolü
    alert("Hata: Silinecek öğenin ID'si geçersiz. Veritabanını temizleyip yeniden deneyin.");
    return;
  }

  const confirmed = confirm("Bu kişiyi silmek istediğine emin misin?");
  console.log("User confirmed delete:", confirmed); // DEBUG: Onay durumunu logla
  if (!confirmed) return;

  // id eşleşmesi string olarak yapılır
  const beforeLength = memorials.length;
  memorials = memorials.filter((m) => {
    const shouldKeep = m.id !== id;
    if (!shouldKeep) console.log("Deleting memorial with ID:", m.id, "Name:", m.name); // DEBUG: Silinecek öğeyi logla
    return shouldKeep;
  });
  const afterLength = memorials.length;
  console.log("Memorials after filter - before:", beforeLength, "after:", afterLength); // DEBUG: Uzunluk değişikliğini logla

  saveMemorials();
  renderMemorials(memorials);
}

// ---- Arama ----
function searchMemorials() {
  const q = searchInput.value.trim().toLowerCase();
  console.log("Searching for:", q); // DEBUG: Arama sorgusunu logla
  const filtered = memorials.filter((m) =>
    m.name.toLowerCase().includes(q)
  );
  console.log("Filtered results:", filtered); // DEBUG: Filtreli listeyi logla
  renderMemorials(filtered);
}

// ---- Modal kontrolü ----
function openModal() {
  modal.setAttribute("aria-hidden", "false");
  console.log("Modal opened"); // DEBUG: Modal açılışını logla
}
function closeModal() {
  // FOCUS TEMİZLEME: Ana sayfaya focus taşı (aria-hidden sorununu çözer)
  document.body.focus(); // Veya document.activeElement?.blur(); kullanabilirsin
  modal.setAttribute("aria-hidden", "true");
  form.reset();
  console.log("Modal closed and form reset"); // DEBUG: Modal kapanışını logla
}

// ---- Event Listeners ----
createButton.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
form.addEventListener("submit", handleFormSubmit);
searchButton.addEventListener("click", searchMemorials);
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchMemorials();
});

// ---- Silme için Event Delegation (Tüm container'a ekle, dinamik butonlar için güvenli) ----
memorialsContainer.addEventListener("click", (e) => {
  console.log("Container clicked on:", e.target); // DEBUG: Tıklanan elementi logla
  console.log("Target classes:", e.target.classList); // DEBUG: Class'ları logla
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    console.log("Delete button clicked, ID:", id); // DEBUG: Buton tıklanınca ID'yi logla
    if (!id || id === 'undefined') console.error("No/Invalid ID found on delete button!"); // DEBUG: ID yoksa hata logla
    deleteMemorial(id);
  }
});

// ---- Başlangıçta kartları yükle ----
renderMemorials(memorials);