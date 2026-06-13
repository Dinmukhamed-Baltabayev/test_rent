const listings = [
  {
    id: 1,
    title: "Sunny Studio Near Uni",
    ownership: "owner",
    purpose: "rent",
    rentType: "long",
    contractLabel: "12-month contract",
    postedDate: "2026-06-12",
    status: "available",
    availableFrom: "2026-07-01",
    city: "Debrecen",
    district: "University Quarter",
    type: "studio",
    price: 420,
    priceFt: 168000,
    communityFeeFt: 18000,
    depositFt: 336000,
    utilitiesEstimateFt: 22000,
    rooms: 1,
    size: 29,
    flatType: "Brick",
    floorNumber: 2,
    elevator: true,
    bedrooms: 1,
    bathrooms: 1,
    condition: "Recently renovated",
    heatingType: "Central heating",
    furnishing: "Furnished",
    features: ["Air conditioning", "Dishwasher", "Balcony"],
    furnished: true,
    lat: 47.5546,
    lng: 21.621,
    images: [
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Compact and bright studio ideal for one student. Walking distance to campus, fully furnished, fast Wi-Fi included."
  },
  {
    id: 2,
    title: "Shared Flat, 2 Bedrooms",
    ownership: "organization",
    purpose: "rent",
    rentType: "short",
    contractLabel: "3-month minimum",
    postedDate: "2026-05-21",
    status: "rented",
    availableFrom: "2026-05-01",
    city: "Budapest",
    district: "District XI",
    type: "shared",
    price: 560,
    priceFt: 224000,
    communityFeeFt: 26000,
    depositFt: 448000,
    utilitiesEstimateFt: 30000,
    rooms: 2,
    size: 61,
    flatType: "Brick",
    floorNumber: 3,
    elevator: false,
    bedrooms: 2,
    bathrooms: 1,
    condition: "Good condition",
    heatingType: "Individual gas",
    furnishing: "Furnished",
    features: ["Balcony", "Dishwasher", "Washing machine"],
    furnished: true,
    lat: 47.473,
    lng: 19.044,
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1501876725168-00c445821c9e?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Spacious shared apartment for two students with separate bedrooms, equipped kitchen, and tram connection nearby."
  },
  {
    id: 3,
    title: "Modern One-Bedroom Apartment",
    ownership: "owner",
    purpose: "rent",
    rentType: "long",
    contractLabel: "1-year contract",
    postedDate: "2026-06-03",
    status: "available",
    availableFrom: "2026-08-01",
    city: "Vienna",
    district: "Leopoldstadt",
    type: "apartment",
    price: 760,
    priceFt: 304000,
    communityFeeFt: 32000,
    depositFt: 608000,
    utilitiesEstimateFt: 36000,
    rooms: 2,
    size: 54,
    flatType: "Brick",
    floorNumber: 4,
    elevator: true,
    bedrooms: 1,
    bathrooms: 1,
    condition: "Excellent",
    heatingType: "Central heating",
    furnishing: "Unfurnished",
    features: ["Air conditioning", "Balcony", "Parking"],
    furnished: false,
    lat: 48.214,
    lng: 16.394,
    images: [
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1464890100898-a385f744067f?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Clean modern apartment with balcony and bike storage. Suitable for a couple or one student needing extra workspace."
  },
  {
    id: 4,
    title: "Quiet Studio with Balcony",
    ownership: "organization",
    purpose: "sale",
    postedDate: "2026-04-27",
    status: "available",
    availableFrom: "2026-06-20",
    city: "Prague",
    district: "Vinohrady",
    type: "studio",
    price: 640,
    priceFt: 256000000,
    communityFeeFt: 21000,
    depositFt: 0,
    utilitiesEstimateFt: 24000,
    rooms: 1,
    size: 34,
    flatType: "Panel",
    floorNumber: 5,
    elevator: true,
    bedrooms: 1,
    bathrooms: 1,
    condition: "Recently renovated",
    heatingType: "District heating",
    furnishing: "Furnished",
    features: ["Balcony", "Air conditioning", "Storage room"],
    furnished: true,
    lat: 50.0755,
    lng: 14.4378,
    images: [
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Top-floor quiet studio with balcony and bright natural light. Includes desk, wardrobe, and washing machine."
  }
];

const MAX_VISIBLE_MESSAGES = 4;

const cardsEl = document.getElementById("cards");
const resultCountEl = document.getElementById("resultCount");
const cardTemplate = document.getElementById("cardTemplate");

const cityInput = document.getElementById("cityInput");
const priceInput = document.getElementById("priceInput");
const purposeInput = document.getElementById("purposeInput");
const typeInput = document.getElementById("typeInput");
const searchForm = document.getElementById("searchForm");
let lightboxImages = [];
let lightboxIndex = 0;
let selectedListingId = null;
let filteredListings = [...listings];
let messageStore = {};

function getActiveMessageStorageKey() {
  if (typeof getUserMessageStorageKey === "function") {
    return getUserMessageStorageKey();
  }

  return null;
}

function loadCurrentMessageStore() {
  const key = getActiveMessageStorageKey();
  messageStore = key ? loadStorageObject(key) : {};
}

function loadStorageObject(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function saveMessageStore() {
  const key = getActiveMessageStorageKey();
  if (!key) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(messageStore));
}

function getListingById(listingId) {
  return listings.find((item) => item.id === listingId);
}

function updateMessageBadge() {
  if (!isLoggedIn()) {
    messageCountBadge.textContent = "0";
    return;
  }

  const sentCount = Object.values(messageStore).reduce(
    (sum, conversation) => sum + conversation.filter((entry) => entry.sender === "you").length,
    0
  );
  messageCountBadge.textContent = String(sentCount);
}

function getInitialListingFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get("listing");
  if (!rawId) {
    return null;
  }

  const listingId = Number(rawId);
  if (!Number.isFinite(listingId)) {
    return null;
  }

  return getListingById(listingId) || null;
}

function ensureConversation(listingId) {
  if (!isLoggedIn()) {
    return [];
  }

  const key = String(listingId);

  if (!Array.isArray(messageStore[key])) {
    messageStore[key] = [];
    saveMessageStore();
  }

  return messageStore[key];
}

function addConversationMessage(listingId, sender, text) {
  const conversation = ensureConversation(listingId);
  conversation.push({ sender, text, at: Date.now() });
  saveMessageStore();
  updateMessageBadge();
}

function renderConversationLog(listingId, chatLog) {
  if (!chatLog) {
    return;
  }

  const conversation = ensureConversation(listingId);
  const visibleMessages = conversation.slice(-MAX_VISIBLE_MESSAGES);
  chatLog.innerHTML = "";

  visibleMessages.forEach((entry) => {
    const li = document.createElement("li");

    if (entry.sender === "you") {
      li.className = "me";
      li.textContent = `You: ${entry.text}`;
    } else {
      li.textContent = `Landlord: ${entry.text}`;
    }

    chatLog.appendChild(li);
  });

  chatLog.scrollTop = chatLog.scrollHeight;
}

function ensureLightbox() {
  let lightbox = document.getElementById("lightbox");
  if (lightbox) {
    return lightbox;
  }

  lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  lightbox.className = "lightbox";
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="lightbox-backdrop" data-action="close"></div>
    <div class="lightbox-dialog" role="dialog" aria-modal="true" aria-label="Image preview">
      <button type="button" class="lightbox-close" data-action="close" aria-label="Close image preview">&#x2715;</button>
      <button type="button" class="lightbox-nav prev" data-action="prev" aria-label="Previous image">&#10094;</button>
      <img id="lightboxImage" class="lightbox-image" alt="Listing photo preview">
      <button type="button" class="lightbox-nav next" data-action="next" aria-label="Next image">&#10095;</button>
    </div>
  `;

  lightbox.addEventListener("click", (event) => {
    const action = event.target.getAttribute("data-action");
    if (!action) {
      return;
    }

    if (action === "close") {
      closeLightbox();
      return;
    }

    if (action === "prev") {
      showLightboxImage(lightboxIndex - 1);
      return;
    }

    if (action === "next") {
      showLightboxImage(lightboxIndex + 1);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
      return;
    }

    if (event.key === "ArrowLeft") {
      showLightboxImage(lightboxIndex - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      showLightboxImage(lightboxIndex + 1);
    }
  });

  document.body.appendChild(lightbox);
  return lightbox;
}

function showLightboxImage(index) {
  if (!lightboxImages.length) {
    return;
  }

  const safeIndex = (index + lightboxImages.length) % lightboxImages.length;
  lightboxIndex = safeIndex;

  const lightbox = ensureLightbox();
  const imageEl = document.getElementById("lightboxImage");
  imageEl.src = lightboxImages[safeIndex];
  imageEl.alt = `Listing photo ${safeIndex + 1}`;
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  const lightbox = ensureLightbox();
  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
}

function initGalleryLightbox(images, scopeEl) {
  lightboxImages = images;
  const thumbs = scopeEl.querySelectorAll(".photo-thumb");

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const index = Number(thumb.dataset.index || 0);
      showLightboxImage(index);
    });
  });
}

function formatPrice(listing) {
  const ft = formatFt(listing.priceFt);
  return listing.purpose === "sale" ? ft : `${ft}/mo`;
}

function formatRentType(listing) {
  const size = Number.isFinite(listing.size) ? `${listing.size} m2` : "Size N/A";
  const bedroomCount = Number.isFinite(listing.bedrooms)
    ? listing.bedrooms
    : Number.isFinite(listing.rooms)
      ? listing.rooms
      : null;
  const bedroomText = bedroomCount === null
    ? "Bedrooms N/A"
    : `${bedroomCount} bedroom${bedroomCount === 1 ? "" : "s"}`;

  let contractText = "For sale";
  if (listing.purpose === "rent") {
    contractText = listing.rentType === "short" ? "Short-term" : "Long-term";
  }

  return `${size} · ${bedroomText} · ${contractText}`;
}

function formatOwnership(listing) {
  return listing.ownership === "organization" ? "Organization" : "Direct owner";
}

function formatFt(value) {
  if (!Number.isFinite(value)) {
    return "N/A";
  }

  return `${value.toLocaleString("hu-HU")} Ft`;
}

function formatPropertyType(type) {
  if (type === "shared") {
    return "Flat (shared)";
  }

  if (type === "apartment") {
    return "Flat";
  }

  return "Studio flat";
}

function canSendMessage(listing) {
  return isLoggedIn() && !isUnavailable(listing);
}

function isUnavailable(listing) {
  return listing.status === "rented" || listing.status === "sold";
}

function availabilityBadge(listing) {
  if (listing.status === "rented") {
    return { text: "Rented out", past: true };
  }

  if (listing.status === "sold") {
    return { text: "Sold", past: true };
  }

  const from = formatAvailableFrom(listing.availableFrom);
  if (from) {
    return { text: `Available from ${from}`, past: false };
  }

  return { text: "Available", past: false };
}

function formatAvailableFrom(dateStr) {
  if (!dateStr) {
    return null;
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatPostedDate(dateStr) {
  if (!dateStr) {
    return "";
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return "";
  }

  return `Posted ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

function renderCards(items) {
  cardsEl.innerHTML = "";

  if (!items.length) {
    cardsEl.innerHTML = "<p>No listings match your filters. Try a wider search.</p>";
    resultCountEl.textContent = "0 results";
    return;
  }

  items = [...items].sort((a, b) => {
    const aUnavailable = isUnavailable(a) ? 1 : 0;
    const bUnavailable = isUnavailable(b) ? 1 : 0;
    return aUnavailable - bUnavailable;
  });

  const fragment = document.createDocumentFragment();
  const leftColumn = document.createElement("div");
  leftColumn.className = "cards-column cards-column-left";
  const rightColumn = document.createElement("div");
  rightColumn.className = "cards-column cards-column-right";

  items.forEach((listing, index) => {
    const node = cardTemplate.content.cloneNode(true);
    node.querySelector(".listing-image").src = listing.images[0];
    node.querySelector(".listing-image").alt = `${listing.title} preview`;
    node.querySelector(".listing-title").textContent = listing.title;
    node.querySelector(".listing-price").textContent = formatPrice(listing);
    node.querySelector(".listing-subtitle").textContent = `${listing.city} · ${listing.district}`;
    node.querySelector(".listing-posted-date").textContent = formatPostedDate(listing.postedDate);

    const rentTypeEl = node.querySelector(".listing-rent-type");
    const rentTypeText = formatRentType(listing);
    if (rentTypeText) {
      rentTypeEl.textContent = rentTypeText;
      rentTypeEl.hidden = false;
    } else {
      rentTypeEl.hidden = true;
    }

    const cardAvailable = node.querySelector(".card-available");
    const badge = availabilityBadge(listing);
    cardAvailable.textContent = badge.text;
    cardAvailable.classList.toggle("is-unavailable", badge.past);

    const card = node.querySelector(".listing-card");
    card.dataset.listingId = String(listing.id);
    card.id = `listing-${listing.id}`;
    const detailsHost = node.querySelector(".card-details");
    const detailsButton = node.querySelector(".view-details");

    detailsButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openCardDetails(listing, card, detailsHost, detailsButton, false);
    });

    card.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest(".card-details") || target.closest("button, a, input, select, textarea, iframe")) {
        return;
      }

      openCardDetails(listing, card, detailsHost, detailsButton, false);
    });

    card.style.animationDelay = `${index * 60}ms`;
    if (index % 2 === 0) {
      leftColumn.appendChild(node);
    } else {
      rightColumn.appendChild(node);
    }
  });

  fragment.appendChild(leftColumn);
  fragment.appendChild(rightColumn);
  cardsEl.appendChild(fragment);
  resultCountEl.textContent = `${items.length} result${items.length > 1 ? "s" : ""}`;
}

function mapSrc(lat, lng) {
  const pad = 0.01;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - pad}%2C${lat - pad}%2C${lng + pad}%2C${lat + pad}&layer=mapnik&marker=${lat}%2C${lng}`;
}

function detailsMarkup(listing) {
  return `
    <div class="card-details-inner">
      <div class="photo-row">
        ${listing.images
          .slice(0, 3)
          .map(
            (image, index) => `
            <button type="button" class="photo-thumb" data-index="${index}" aria-label="Open photo ${index + 1}">
              <img src="${image}" alt="${listing.title} photo ${index + 1}">
            </button>
          `
          )
          .join("")}
      </div>

      <p class="details-ownership">Posted by: ${formatOwnership(listing)}</p>

      <h5 class="section-kicker">Financial Information</h5>
      <ul class="details-list">
        <li><span>Monthly rent/Price</span><strong>${formatFt(listing.priceFt)}</strong></li>
        <li><span>Community Fee</span><strong>${formatFt(listing.communityFeeFt)}</strong></li>
        <li><span>Deposit</span><strong>${listing.depositFt > 0 ? formatFt(listing.depositFt) : "Not required"}</strong></li>
        <li><span>Utilities estimate</span><strong>${formatFt(listing.utilitiesEstimateFt)}</strong></li>
      </ul>

      <h5 class="section-kicker">Physical Characteristics</h5>
      <ul class="details-list">
        <li><span>Property type</span><strong>${formatPropertyType(listing.type)}</strong></li>
        <li><span>Flat type</span><strong>${listing.flatType || "N/A"}</strong></li>
        <li><span>Size</span><strong>${listing.size} m2</strong></li>
        <li><span>Floor number</span><strong>${listing.floorNumber ?? "N/A"}</strong></li>
        <li><span>Elevator</span><strong>${listing.elevator ? "Yes" : "No"}</strong></li>
        <li><span>Bedrooms</span><strong>${listing.bedrooms ?? listing.rooms ?? "N/A"}</strong></li>
        <li><span>Bathrooms</span><strong>${listing.bathrooms ?? "N/A"}</strong></li>
        <li><span>Condition</span><strong>${listing.condition || "N/A"}</strong></li>
      </ul>

      <h5 class="section-kicker">Utilities & Features</h5>
      <ul class="details-list">
        <li><span>Heating type</span><strong>${listing.heatingType || "N/A"}</strong></li>
        <li><span>Equipment/Furnishing</span><strong>${listing.furnishing || (listing.furnished ? "Furnished" : "Unfurnished")}</strong></li>
        <li><span>Features</span><strong>${Array.isArray(listing.features) && listing.features.length ? listing.features.join(", ") : "N/A"}</strong></li>
      </ul>

      <h5 class="section-kicker">Description</h5>
      <p class="details-text">${listing.description}</p>

      <div class="map-wrap">
        <iframe title="Location map" src="${mapSrc(listing.lat, listing.lng)}" loading="lazy"></iframe>
      </div>

      <p class="small">Map point is approximate for draft version.</p>

      <h4>Chat with landlord</h4>
      <div class="chat-box">
        <ul class="chat-log"></ul>
        <form class="inline-form chat-form">
          <input class="chat-input" type="text" placeholder="${isUnavailable(listing) ? "Messaging unavailable for this listing" : !isLoggedIn() ? "Log in to send messages" : "Write a message..."}" ${canSendMessage(listing) ? "required" : "disabled"}>
          <button class="btn primary" type="submit" ${canSendMessage(listing) ? "" : "disabled"}>Send</button>
        </form>
      </div>
    </div>
  `;
}

function closeOpenCardDetails() {
  cardsEl.querySelectorAll(".card-details.open").forEach((openHost) => {
    openHost.classList.remove("open");
    openHost.innerHTML = "";
  });

  cardsEl.querySelectorAll(".listing-card.is-expanded").forEach((card) => {
    card.classList.remove("is-expanded");
  });

  cardsEl.querySelectorAll(".view-details").forEach((button) => {
    button.textContent = "View details";
    button.hidden = false;
  });
}

function openCardDetails(listing, cardEl, detailsHost, detailsButton, focusChat) {
  const alreadyOpen = detailsHost.classList.contains("open");
  closeOpenCardDetails();

  if (alreadyOpen) {
    return;
  }

  selectedListingId = listing.id;
  detailsHost.innerHTML = detailsMarkup(listing);
  detailsHost.classList.add("open");
  cardEl.classList.add("is-expanded");
  detailsButton.hidden = false;
  detailsButton.textContent = "Hide details";

  const chatLog = detailsHost.querySelector(".chat-log");
  const chatForm = detailsHost.querySelector(".chat-form");
  const chatInput = detailsHost.querySelector(".chat-input");
  renderConversationLog(listing.id, chatLog);

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!canSendMessage(listing)) {
      return;
    }

    const text = chatInput.value.trim();
    if (!text) {
      return;
    }

    addConversationMessage(listing.id, "you", text);
    renderConversationLog(listing.id, chatLog);
    chatInput.value = "";
  });

  initGalleryLightbox(listing.images, detailsHost);

  if (focusChat) {
    const chatBox = detailsHost.querySelector(".chat-box");
    if (chatBox) {
      chatBox.classList.add("highlight");
      setTimeout(() => chatBox.classList.remove("highlight"), 1800);
      chatInput.focus();
    }
  }

  detailsHost.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function applyFilters() {
  const cityValue = cityInput.value.trim().toLowerCase();
  const maxPriceFt = Number(priceInput.value || 0);
  const purposeValue = purposeInput.value;
  const typeValue = typeInput.value;

  filteredListings = listings.filter((listing) => {
    const cityPass = cityValue ? listing.city.toLowerCase().includes(cityValue) : true;
    const pricePass = maxPriceFt ? listing.priceFt <= maxPriceFt : true;
    const purposePass = purposeValue === "all" ? true : listing.purpose === purposeValue;
    const typePass = typeValue === "all" ? true : listing.type === typeValue;

    return cityPass && pricePass && purposePass && typePass;
  });

  renderCards(filteredListings);
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  applyFilters();
});

loadCurrentMessageStore();
updateMessageBadge();
renderCards(filteredListings);

// Re-render cards when auth state changes so chat gates update
function onLoginSuccess() {
  loadCurrentMessageStore();
  updateMessageBadge();
  renderCards(filteredListings);
}

function onLogoutSuccess() {
  loadCurrentMessageStore();
  updateMessageBadge();
  renderCards(filteredListings);
}

const deepLinkedListing = getInitialListingFromQuery();
if (deepLinkedListing) {
  setTimeout(() => {
    const card = cardsEl.querySelector(`.listing-card[data-listing-id="${deepLinkedListing.id}"]`);
    if (card) {
      const detailsHost = card.querySelector(".card-details");
      const detailsButton = card.querySelector(".view-details");
      openCardDetails(deepLinkedListing, card, detailsHost, detailsButton, true);
    }
  }, 150);
}
