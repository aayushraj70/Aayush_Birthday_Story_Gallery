const photos = Array.from({ length: 46 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    id: i + 1,
    number: n,
 src: `${i + 1}.jpeg`,
    label: `IMAGE ${n}`
  };
});

const galleryGrid = document.getElementById("galleryGrid");
const emptyState = document.getElementById("emptyState");
const favCount = document.getElementById("favCount");
const viewer = document.getElementById("viewer");
const viewerPhoto = document.getElementById("viewerPhoto");
const viewerLabel = document.getElementById("viewerLabel");
const viewerNumber = document.getElementById("viewerNumber");
const viewerFav = document.getElementById("viewerFav");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");

let favourites = JSON.parse(localStorage.getItem("aayushBirthdayFavourites") || "[]");
let currentIndex = 0;
let activeFilter = "all";
let touchStartX = 0;

function isFavourite(id) {
  return favourites.includes(id);
}

function saveFavourites() {
  localStorage.setItem("aayushBirthdayFavourites", JSON.stringify(favourites));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function renderGallery() {
  const visible = activeFilter === "favourites"
    ? photos.filter(p => isFavourite(p.id))
    : photos;

  galleryGrid.innerHTML = "";

  visible.forEach((photo, visibleIndex) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.animationDelay = `${Math.min(visibleIndex * 45, 450)}ms`;

    const heart = isFavourite(photo.id) ? "♥" : "♡";
    card.innerHTML = `
      <div class="card-media" data-id="${photo.id}">
        <div class="card-number">${photo.number}</div>
        <button class="card-heart ${isFavourite(photo.id) ? "active" : ""}" aria-label="Favourite photo ${photo.number}">${heart}</button>
        <img src="${photo.src}" alt="Birthday photo ${photo.number}" loading="lazy"
             onerror="this.style.display='none'">
        <div class="placeholder">
          <span>${photo.label}</span>
          <small>add your photo here</small>
        </div>
      </div>
      <div class="card-meta">
        <small>STORY PHOTO ${photo.number}</small>
        <button class="card-open">Open ↗</button>
      </div>
    `;

    const media = card.querySelector(".card-media");
    const heartButton = card.querySelector(".card-heart");

    media.addEventListener("click", (e) => {
      if (!e.target.closest(".card-heart")) openViewer(photo.id);
    });

    heartButton.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavourite(photo.id);
    });

    galleryGrid.appendChild(card);
  });

  favCount.textContent = favourites.length;
  emptyState.style.display = visible.length ? "none" : "block";
}

function toggleFavourite(id) {
  if (isFavourite(id)) {
    favourites = favourites.filter(x => x !== id);
    showToast("Removed from favourites");
  } else {
    favourites.push(id);
    showToast("Added to favourites ♥");
  }

  saveFavourites();
  renderGallery();

  if (viewer.classList.contains("active")) updateViewer();
}

function openViewer(id) {
  currentIndex = photos.findIndex(p => p.id === id);
  updateViewer();
  viewer.classList.add("active");
  viewer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeViewer() {
  viewer.classList.remove("active");
  viewer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function updateViewer() {
  const photo = photos[currentIndex];
  viewerNumber.textContent = photo.number;
  viewerLabel.textContent = photo.label;
  viewerFav.textContent = isFavourite(photo.id) ? "♥" : "♡";
  viewerFav.classList.toggle("active", isFavourite(photo.id));
  progressBar.style.width = `${((currentIndex + 1) / photos.length) * 100}%`;

  viewerPhoto.innerHTML = `
    <img src="${photo.src}" alt="Birthday photo ${photo.number}" onerror="this.style.display='none'">
    <div class="viewer-placeholder">
      <span>${photo.label}</span>
      <small>Add your image to ${photo.src}</small>
    </div>
  `;
}

function nextPhoto() {
  currentIndex = (currentIndex + 1) % photos.length;
  updateViewer();
}

function prevPhoto() {
  currentIndex = (currentIndex - 1 + photos.length) % photos.length;
  updateViewer();
}

document.getElementById("viewerClose").addEventListener("click", closeViewer);
document.getElementById("nextBtn").addEventListener("click", nextPhoto);
document.getElementById("prevBtn").addEventListener("click", prevPhoto);

viewerFav.addEventListener("click", () => {
  toggleFavourite(photos[currentIndex].id);
});

document.getElementById("randomBtn").addEventListener("click", () => {
  openViewer(photos[Math.floor(Math.random() * photos.length)].id);
});

document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderGallery();
  });
});

document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  document.getElementById("themeBtn").textContent = dark ? "☀" : "☾";
  localStorage.setItem("aayushBirthdayTheme", dark ? "dark" : "light");
});

if (localStorage.getItem("aayushBirthdayTheme") === "dark") {
  document.body.classList.add("dark");
  document.getElementById("themeBtn").textContent = "☀";
}

document.getElementById("topBtn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("shareBtn").addEventListener("click", async () => {
  const url = window.location.href;
  try {
    if (navigator.share) {
      await navigator.share({
        title: "Aayush's Birthday Gallery",
        text: "Pick a photo for my birthday story 🎂",
        url
      });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast("Gallery link copied");
    } else {
      showToast("Copy this page link to share");
    }
  } catch (_) { }
});

document.getElementById("saveBtn").addEventListener("click", () => {
  const photo = photos[currentIndex];
  const a = document.createElement("a");
  a.href = photo.src;
  a.download = `aayush-birthday-${photo.number}.jpg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast(`Saving photo ${photo.number}`);
});

document.addEventListener("keydown", (e) => {
  if (!viewer.classList.contains("active")) return;
  if (e.key === "Escape") closeViewer();
  if (e.key === "ArrowRight") nextPhoto();
  if (e.key === "ArrowLeft") prevPhoto();
});

viewer.addEventListener("click", (e) => {
  if (e.target === viewer) closeViewer();
});

viewer.addEventListener("touchstart", e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

viewer.addEventListener("touchend", e => {
  const delta = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(delta) < 45) return;
  delta < 0 ? nextPhoto() : prevPhoto();
}, { passive: true });

renderGallery();
