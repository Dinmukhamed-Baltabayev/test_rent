const postForm = document.getElementById("postListingForm");
const accessHintEl = document.getElementById("postAccessHint");
const postSuccessEl = document.getElementById("postSuccess");
const postNowBtn = document.getElementById("postNowBtn");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const cancelPostBtn = document.getElementById("cancelPostBtn");
const postCityEl = document.getElementById("postCity");
const postDistrictEl = document.getElementById("postDistrict");
const postLatitudeEl = document.getElementById("postLatitude");
const postLongitudeEl = document.getElementById("postLongitude");
const postLocationTextEl = document.getElementById("postLocationText");
const postMapPickerEl = document.getElementById("postMapPicker");
const listingSwitcherEl = document.getElementById("listingSwitcher");
const listingSwitcherTitleEl = document.getElementById("listingSwitcherTitle");
const listingLibraryEl = document.getElementById("listingLibrary");
const listingLibraryListEl = document.getElementById("listingLibraryList");
const listingLibraryEmptyEl = document.getElementById("listingLibraryEmpty");
const viewDraftsBtn = document.getElementById("viewDraftsBtn");
const viewPostedBtn = document.getElementById("viewPostedBtn");
const viewNewBtn = document.getElementById("viewNewBtn");
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=900&q=80";
const DEFAULT_PICKER_COORDS = { lat: 47.4979, lng: 19.0402 };
const DRAFTS_KEY = "nestlyLandlordDrafts";
const POSTS_KEY = "nestlyLandlordPosts";
let activeLibraryView = "drafts";
let currentPageView = "new";
let expandedPostedListingId = null;
let pickerMap = null;
let pickerMarker = null;
let cityLookupTimer = null;
const cityLookupCache = new Map();

function structurePostFormSections() {
  if (!postForm || postForm.dataset.groupedSections === "true") {
    return;
  }

  const nodes = Array.from(postForm.children);
  const sectionStarts = nodes
    .map((node, index) => node.classList.contains("section-kicker") ? index : -1)
    .filter((index) => index >= 0);

  if (!sectionStarts.length) {
    return;
  }

  const fragment = document.createDocumentFragment();

  sectionStarts.forEach((startIndex, sectionIndex) => {
    const endIndex = sectionIndex + 1 < sectionStarts.length
      ? sectionStarts[sectionIndex + 1]
      : nodes.length;

    const section = document.createElement("section");
    section.className = "post-form-section field-span-4";

    const title = nodes[startIndex];
    title.classList.add("post-form-section-title");
    section.appendChild(title);

    const body = document.createElement("div");
    body.className = "post-form-section-grid";

    for (let index = startIndex + 1; index < endIndex; index += 1) {
      body.appendChild(nodes[index]);
    }

    section.appendChild(body);
    fragment.appendChild(section);
  });

  postForm.replaceChildren(fragment);
  postForm.dataset.groupedSections = "true";
}

function getCoordinateValue(el, fallback) {
  const raw = String(el?.value ?? "").trim();
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function updateLocationReadout(lat, lng) {
  if (!postLocationTextEl) {
    return;
  }

  postLocationTextEl.textContent = `Selected coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function setPickedCoordinates(lat, lng, recenter = true) {
  const safeLat = Number.isFinite(Number(lat)) ? Number(lat) : DEFAULT_PICKER_COORDS.lat;
  const safeLng = Number.isFinite(Number(lng)) ? Number(lng) : DEFAULT_PICKER_COORDS.lng;

  if (postLatitudeEl) {
    postLatitudeEl.value = safeLat.toFixed(6);
  }

  if (postLongitudeEl) {
    postLongitudeEl.value = safeLng.toFixed(6);
  }

  updateLocationReadout(safeLat, safeLng);

  if (pickerMap && pickerMarker && window.L) {
    pickerMarker.setLatLng([safeLat, safeLng]);
    if (recenter) {
      pickerMap.setView([safeLat, safeLng], pickerMap.getZoom());
    }
  }
}

function resetPickerToDefault() {
  setPickedCoordinates(DEFAULT_PICKER_COORDS.lat, DEFAULT_PICKER_COORDS.lng, true);
}

function initLocationPicker() {
  if (!postMapPickerEl) {
    return;
  }

  if (!window.L) {
    if (postLocationTextEl) {
      postLocationTextEl.textContent = "Map picker could not load. Default coordinates will be used.";
    }
    resetPickerToDefault();
    return;
  }

  if (pickerMap) {
    setTimeout(() => {
      pickerMap.invalidateSize();
    }, 0);
    return;
  }

  const initialLat = getCoordinateValue(postLatitudeEl, DEFAULT_PICKER_COORDS.lat);
  const initialLng = getCoordinateValue(postLongitudeEl, DEFAULT_PICKER_COORDS.lng);

  pickerMap = window.L.map(postMapPickerEl, { zoomControl: true }).setView([initialLat, initialLng], 13);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(pickerMap);

  pickerMarker = window.L.marker([initialLat, initialLng], { draggable: true }).addTo(pickerMap);

  pickerMap.on("click", (event) => {
    setPickedCoordinates(event.latlng.lat, event.latlng.lng, false);
  });

  pickerMarker.on("dragend", () => {
    const point = pickerMarker.getLatLng();
    setPickedCoordinates(point.lat, point.lng, false);
  });

  setPickedCoordinates(initialLat, initialLng, false);
  setTimeout(() => {
    pickerMap.invalidateSize();
  }, 0);
}

async function geocodeCityTarget(city, district) {
  const cityRaw = String(city || "").trim();
  if (!cityRaw) {
    return null;
  }

  const districtRaw = String(district || "").trim();
  const q = districtRaw ? `${cityRaw}, ${districtRaw}` : cityRaw;
  const cacheKey = q.toLowerCase();
  if (cityLookupCache.has(cacheKey)) {
    return cityLookupCache.get(cacheKey);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!Array.isArray(data) || !data.length) {
      cityLookupCache.set(cacheKey, null);
      return null;
    }

    const first = data[0];
    const result = {
      lat: Number(first.lat),
      lng: Number(first.lon)
    };

    if (!Number.isFinite(result.lat) || !Number.isFinite(result.lng)) {
      cityLookupCache.set(cacheKey, null);
      return null;
    }

    cityLookupCache.set(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

function scheduleCityMapNavigation() {
  if (!pickerMap) {
    return;
  }

  const city = postCityEl?.value || "";
  const district = postDistrictEl?.value || "";
  if (!String(city).trim()) {
    return;
  }

  if (cityLookupTimer) {
    window.clearTimeout(cityLookupTimer);
  }

  cityLookupTimer = window.setTimeout(async () => {
    const location = await geocodeCityTarget(city, district);
    if (!location) {
      return;
    }

    setPickedCoordinates(location.lat, location.lng, true);
    if (pickerMap.getZoom() < 12) {
      pickerMap.setZoom(12);
    }
  }, 450);
}

function applyInitialViewFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  if (!view) {
    currentPageView = "new";
    return;
  }

  if (view === "posted") {
    currentPageView = "posted";
    activeLibraryView = "posted";
    return;
  }

  if (view === "drafts") {
    currentPageView = "drafts";
    activeLibraryView = "drafts";
    return;
  }

  if (view === "new" && postForm) {
    currentPageView = "new";
    activeLibraryView = "new";
    postForm.reset();
    if (postSuccessEl) {
      postSuccessEl.hidden = true;
    }
    populateFeatureChecks([]);
    const titleEl = document.getElementById("postTitle");
    if (titleEl) {
      titleEl.focus();
    }
  }
}

function applyPageViewState() {
  const landlord = typeof isLandlord === "function" && isLandlord();
  const listOnlyView = currentPageView === "posted" || currentPageView === "drafts";

  if (postForm) {
    postForm.hidden = !landlord || listOnlyView;
  }

  if (listingSwitcherEl) {
    listingSwitcherEl.hidden = !landlord;
  }

  if (listingLibraryEl) {
    listingLibraryEl.hidden = !landlord || !listOnlyView;
  }
}

function getInputValue(id, fallback = "") {
  const el = document.getElementById(id);
  return el ? el.value.trim() : fallback;
}

function getInputNumber(id, fallback = 0) {
  const value = Number(getInputValue(id, ""));
  return Number.isFinite(value) ? value : fallback;
}

function getInputBoolean(id, fallback = false) {
  const value = getInputValue(id, fallback ? "true" : "false").toLowerCase();
  return value === "true";
}

function getCheckedFeatures() {
  return Array.from(document.querySelectorAll("input[name='postFeature']:checked"))
    .map((item) => item.value)
    .filter(Boolean);
}

function getTodayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function updatePostingAccess() {
  if (!postForm || !accessHintEl) {
    return;
  }

  const loggedIn = typeof isLoggedIn === "function" && isLoggedIn();
  const landlord = typeof isLandlord === "function" && isLandlord();

  if (!loggedIn) {
    postForm.hidden = true;
    accessHintEl.hidden = false;
    accessHintEl.textContent = "Log in with landlord account (landlord / demo123) to access posting options.";
    return;
  }

  if (!landlord) {
    postForm.hidden = true;
    if (listingLibraryEl) {
      listingLibraryEl.hidden = true;
    }
    accessHintEl.hidden = false;
    accessHintEl.textContent = "This is renter account access. Switch to landlord / demo123 for posting options.";
    return;
  }

  accessHintEl.hidden = false;
  if (currentPageView === "posted") {
    accessHintEl.textContent = "This listing is already posted. Full editing is locked to protect published data. To change details, create a new draft from this listing.";
  } else if (currentPageView === "drafts") {
    accessHintEl.textContent = "Landlord mode active. Viewing saved drafts.";
  } else {
    accessHintEl.textContent = "Landlord mode active. Create a new listing.";
  }

  applyPageViewState();
}

function loadListingStore(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveListingEntry(key, entry) {
  const store = loadListingStore(key);
  store.push(entry);
  localStorage.setItem(key, JSON.stringify(store));
}

function updateEditActionState() {
  if (postNowBtn) {
    postNowBtn.hidden = false;
  }

  if (saveDraftBtn) {
    saveDraftBtn.hidden = false;
  }
}

function populateFeatureChecks(features) {
  const selected = new Set(Array.isArray(features) ? features : []);
  document.querySelectorAll("input[name='postFeature']").forEach((input) => {
    input.checked = selected.has(input.value);
  });
}

function setSelectValue(selectId, value, fallback = "") {
  const el = document.getElementById(selectId);
  if (!el) {
    return;
  }

  const candidate = value ?? fallback;
  const hasOption = Array.from(el.options).some((option) => option.value === String(candidate));
  el.value = hasOption ? String(candidate) : String(fallback);
}

function loadListingIntoForm(entry) {
  if (!postForm || !entry) {
    return;
  }

  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) {
      el.value = value ?? "";
    }
  };

  setValue("postImage1", entry.images?.[0] || "");
  setValue("postImage2", entry.images?.[1] || "");
  setValue("postImage3", entry.images?.[2] || "");
  setSelectValue("postOwnership", entry.ownership, "owner");
  setValue("postTitle", entry.title || "");
  setValue("postCity", entry.city || "");
  setValue("postDistrict", entry.district || "");
  setSelectValue("postPurpose", entry.purpose, "rent");
  setSelectValue("postContract", entry.rentType || "long", "long");
  setSelectValue("postContractLabel", entry.contractLabel || "", "");
  setSelectValue("postStatus", entry.status || "available", "available");
  setValue("postAvailableFrom", entry.availableFrom || "");
  setValue("postPrice", entry.priceFt || "");
  setValue("postCommunityFee", entry.communityFeeFt || "");
  setValue("postDeposit", entry.depositFt || "");
  setValue("postUtilities", entry.utilitiesEstimateFt || "");
  setSelectValue("postType", entry.type || "studio", "studio");
  setSelectValue("postFlatType", entry.flatType || "Brick", "Brick");
  setValue("postSize", entry.size || "");
  setValue("postFloorNumber", entry.floorNumber ?? "");
  setSelectValue("postElevator", String(Boolean(entry.elevator)), "false");
  setSelectValue("postBedrooms", String(entry.bedrooms ?? entry.rooms ?? 0), "0");
  setSelectValue("postBathrooms", String(entry.bathrooms ?? 1), "1");
  setSelectValue("postCondition", entry.condition || "Good condition", "Good condition");
  setSelectValue("postHeatingType", entry.heatingType || "Central heating", "Central heating");
  setSelectValue("postFurnishing", entry.furnishing || "Furnished", "Furnished");
  setSelectValue("postFurnished", String(Boolean(entry.furnished)), "false");
  setValue("postDescription", entry.description || "");
  setValue("postLatitude", Number.isFinite(Number(entry.lat)) ? Number(entry.lat).toFixed(6) : "");
  setValue("postLongitude", Number.isFinite(Number(entry.lng)) ? Number(entry.lng).toFixed(6) : "");
  populateFeatureChecks(entry.features);
  if (Number.isFinite(Number(entry.lat)) && Number.isFinite(Number(entry.lng))) {
    setPickedCoordinates(Number(entry.lat), Number(entry.lng), true);
  } else {
    resetPickerToDefault();
  }
  toggleRentalFields();
}

function openDraftForEditing(entry) {
  currentPageView = "new";
  updatePostingAccess();
  updateEditActionState();
  loadListingIntoForm(entry);
  showPostMessage("Draft loaded. You can edit all details now.");

  const titleEl = document.getElementById("postTitle");
  if (titleEl) {
    titleEl.focus();
  }
}

function getLibraryData(view) {
  return view === "posted" ? loadListingStore(POSTS_KEY) : loadListingStore(DRAFTS_KEY);
}

function formatStatusLabel(status) {
  if (status === "rented") {
    return "Rented out";
  }

  if (status === "sold") {
    return "Sold";
  }

  return "Available";
}

function updatePostedListingStatus(listingId, nextStatus) {
  const items = loadListingStore(POSTS_KEY);
  const targetId = Number(listingId);
  const index = items.findIndex((item) => Number(item?.id) === targetId);
  if (index === -1) {
    return false;
  }

  items[index] = {
    ...items[index],
    status: nextStatus
  };

  localStorage.setItem(POSTS_KEY, JSON.stringify(items));
  return true;
}

function deleteListingById(key, listingId) {
  const targetId = Number(listingId);
  const items = loadListingStore(key);
  const nextItems = items.filter((item) => Number(item?.id) !== targetId);
  if (nextItems.length === items.length) {
    return false;
  }

  localStorage.setItem(key, JSON.stringify(nextItems));
  return true;
}

function updateLibraryTabState() {
  if (!viewDraftsBtn || !viewPostedBtn || !viewNewBtn) {
    return;
  }

  const isNewView = currentPageView === "new";
  if (listingSwitcherTitleEl) {
    listingSwitcherTitleEl.textContent = isNewView ? "New listing" : "My listings";
  }
  viewDraftsBtn.classList.toggle("is-active", !isNewView && activeLibraryView === "drafts");
  viewPostedBtn.classList.toggle("is-active", !isNewView && activeLibraryView === "posted");
  viewNewBtn.classList.toggle("is-active", currentPageView === "new");
}

function formatFt(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "N/A";
  }

  return `${amount.toLocaleString("hu-HU")} Ft`;
}

function formatPrice(entry) {
  const ft = formatFt(entry.priceFt);
  return entry.purpose === "sale" ? ft : `${ft}/mo`;
}

function formatRentType(entry) {
  const size = Number.isFinite(Number(entry.size)) ? `${entry.size} m2` : "Size N/A";
  const bedroomCount = Number.isFinite(Number(entry.bedrooms))
    ? Number(entry.bedrooms)
    : Number.isFinite(Number(entry.rooms))
      ? Number(entry.rooms)
      : null;
  const bedroomText = bedroomCount === null
    ? "Bedrooms N/A"
    : `${bedroomCount} bedroom${bedroomCount === 1 ? "" : "s"}`;

  let contractText = "For sale";
  if (entry.purpose === "rent") {
    contractText = entry.rentType === "short" ? "Short-term" : "Long-term";
  }

  return `${bedroomText}  ·  ${contractText}  ·  ${size}`;
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

function mapSrc(lat, lng) {
  const safeLat = Number.isFinite(Number(lat)) ? Number(lat) : 0;
  const safeLng = Number.isFinite(Number(lng)) ? Number(lng) : 0;
  const pad = 0.01;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${safeLng - pad}%2C${safeLat - pad}%2C${safeLng + pad}%2C${safeLat + pad}&layer=mapnik&marker=${safeLat}%2C${safeLng}`;
}

function detailsMarkup(entry) {
  const images = Array.isArray(entry.images) && entry.images.length
    ? entry.images.slice(0, 3)
    : [DEFAULT_IMAGE];

  const statusValue = entry.status || "available";

  return `
    <div class="card-details-inner">
      <div class="photo-row">
        ${images
          .map(
            (image, index) => `
            <button type="button" class="photo-thumb" data-index="${index}" aria-label="Listing photo ${index + 1}">
              <img src="${image}" alt="${entry.title || "Listing"} photo ${index + 1}">
            </button>
          `
          )
          .join("")}
      </div>

      <p class="details-ownership">Posted by: ${entry.ownership === "organization" ? "Organization" : "Direct owner"}</p>

      <h5 class="section-kicker">Financial Information</h5>
      <ul class="details-list">
        <li><span>Monthly rent/Price</span><strong>${formatFt(entry.priceFt)}</strong></li>
        <li><span>Community Fee</span><strong>${formatFt(entry.communityFeeFt)}</strong></li>
        <li><span>Deposit</span><strong>${Number(entry.depositFt) > 0 ? formatFt(entry.depositFt) : "Not required"}</strong></li>
        <li><span>Utilities estimate</span><strong>${formatFt(entry.utilitiesEstimateFt)}</strong></li>
      </ul>

      <h5 class="section-kicker">Physical Characteristics</h5>
      <ul class="details-list">
        <li><span>Property type</span><strong>${entry.type === "shared" ? "Flat (shared)" : entry.type === "apartment" ? "Flat" : "Studio flat"}</strong></li>
        <li><span>Flat type</span><strong>${entry.flatType || "N/A"}</strong></li>
        <li><span>Size</span><strong>${Number.isFinite(Number(entry.size)) ? `${entry.size} m2` : "N/A"}</strong></li>
        <li><span>Floor number</span><strong>${entry.floorNumber ?? "N/A"}</strong></li>
        <li><span>Elevator</span><strong>${entry.elevator ? "Yes" : "No"}</strong></li>
        <li><span>Bedrooms</span><strong>${entry.bedrooms ?? entry.rooms ?? "N/A"}</strong></li>
        <li><span>Bathrooms</span><strong>${entry.bathrooms ?? "N/A"}</strong></li>
        <li><span>Condition</span><strong>${entry.condition || "N/A"}</strong></li>
      </ul>

      <h5 class="section-kicker">Utilities & Features</h5>
      <ul class="details-list">
        <li><span>Heating type</span><strong>${entry.heatingType || "N/A"}</strong></li>
        <li><span>Equipment/Furnishing</span><strong>${entry.furnishing || (entry.furnished ? "Furnished" : "Unfurnished")}</strong></li>
        <li><span>Features</span><strong>${Array.isArray(entry.features) && entry.features.length ? entry.features.join(", ") : "N/A"}</strong></li>
      </ul>

      <h5 class="section-kicker">Description</h5>
      <p class="details-text">${entry.description || "No description provided."}</p>

      <div class="map-wrap">
        <iframe title="Location map" src="${mapSrc(entry.lat, entry.lng)}" loading="lazy"></iframe>
      </div>

      <p class="small">Map point is approximate for draft version.</p>

      <div class="landlord-card-actions">
        <label class="small">Status
          <select class="listing-status-select" data-role="status-select">
            <option value="available" ${statusValue === "available" ? "selected" : ""}>Available</option>
            <option value="rented" ${statusValue === "rented" ? "selected" : ""}>Rented out</option>
            <option value="sold" ${statusValue === "sold" ? "selected" : ""}>Sold</option>
          </select>
        </label>
        <button type="button" class="btn ghost small-btn" data-role="save-status">Save status</button>
        <button type="button" class="btn ghost small-btn danger-action" data-role="delete-listing">Delete</button>
      </div>
    </div>
  `;
}

function renderListingLibrary() {
  if (!listingLibraryEl || !listingLibraryListEl || !listingLibraryEmptyEl) {
    return;
  }

  const landlord = typeof isLandlord === "function" && isLandlord();
  if (!landlord) {
    listingLibraryEl.hidden = true;
    return;
  }

  applyPageViewState();

  const listOnlyView = currentPageView === "posted" || currentPageView === "drafts";
  if (!listOnlyView) {
    listingLibraryListEl.innerHTML = "";
    listingLibraryEmptyEl.hidden = true;
    updateLibraryTabState();
    return;
  }

  const data = getLibraryData(activeLibraryView)
    .slice()
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

  listingLibraryListEl.innerHTML = "";
  listingLibraryEmptyEl.hidden = data.length > 0;
  listingLibraryEmptyEl.textContent =
    activeLibraryView === "posted"
      ? "No posted listings yet."
      : "No saved drafts yet.";

  data.forEach((entry) => {
    const item = document.createElement("li");

    const purpose = entry.purpose === "sale" ? "For sale" : "For rent";

    if (activeLibraryView === "drafts") {
      item.className = "thread-item listing-library-item";
      const meta = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = entry.title || "Untitled listing";
      const subtitle = document.createElement("p");
      subtitle.className = "small";
      subtitle.textContent = `${entry.city || "N/A"} · ${purpose}`;
      meta.appendChild(title);
      meta.appendChild(subtitle);

      const actions = document.createElement("div");
      actions.className = "listing-library-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn ghost small-btn";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        openDraftForEditing(entry);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn ghost small-btn danger-action";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const confirmed = window.confirm(
          "Are you sure you want to delete this draft? This action cannot be undone."
        );
        if (!confirmed) {
          return;
        }

        const ok = deleteListingById(DRAFTS_KEY, entry.id);
        if (ok) {
          showPostMessage("Draft deleted.");
          renderListingLibrary();
        }
      });

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      item.appendChild(meta);
      item.appendChild(actions);
      item.style.cursor = "pointer";
      item.addEventListener("click", (event) => {
        const target = event.target;
        if (target instanceof Element && target.closest("button, a, input, select, textarea")) {
          return;
        }

        openDraftForEditing(entry);
      });
      listingLibraryListEl.appendChild(item);
      return;
    }

    item.className = "listing-card landlord-listing-card landlord-listing-compact";

    const image = document.createElement("img");
    image.className = "listing-image";
    image.src = Array.isArray(entry.images) && entry.images.length ? entry.images[0] : DEFAULT_IMAGE;
    image.alt = `${entry.title || "Listing"} preview`;

    const content = document.createElement("div");
    content.className = "listing-content";

    const row = document.createElement("div");
    row.className = "listing-row";

    const title = document.createElement("h4");
    title.className = "listing-title";
    title.textContent = entry.title || "Untitled listing";

    const price = document.createElement("p");
    price.className = "listing-price";
    price.textContent = formatPrice(entry);

    row.appendChild(title);
    row.appendChild(price);

    const metaRow = document.createElement("div");
    metaRow.className = "listing-meta-row";

    const subtitle = document.createElement("p");
    subtitle.className = "listing-subtitle";
    subtitle.textContent = `${entry.city || "N/A"} · ${entry.district || "N/A"}`;

    const postedDate = document.createElement("p");
    postedDate.className = "listing-posted-date";
    postedDate.textContent = formatPostedDate(entry.postedDate);

    metaRow.appendChild(subtitle);
    metaRow.appendChild(postedDate);

    const rentType = document.createElement("p");
    rentType.className = "listing-rent-type";
    rentType.textContent = formatRentType(entry);

    const statusBadge = document.createElement("p");
    statusBadge.className = "card-available";
    statusBadge.textContent = `Status: ${formatStatusLabel(entry.status)}`;
    statusBadge.classList.toggle("is-unavailable", entry.status === "rented" || entry.status === "sold");

    const detailsActions = document.createElement("div");
    detailsActions.className = "details-actions";

    const viewDetailsBtn = document.createElement("button");
    viewDetailsBtn.type = "button";
    viewDetailsBtn.className = "btn ghost view-details";
    const isExpanded = Number(expandedPostedListingId) === Number(entry.id);
    viewDetailsBtn.textContent = isExpanded ? "Hide details" : "View details";
    viewDetailsBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const clickedId = Number(entry.id);
      expandedPostedListingId = expandedPostedListingId === clickedId ? null : clickedId;
      renderListingLibrary();
    });

    item.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest("button, a, input, select, textarea, iframe")) {
        return;
      }

      const clickedId = Number(entry.id);
      expandedPostedListingId = expandedPostedListingId === clickedId ? null : clickedId;
      renderListingLibrary();
    });

    detailsActions.appendChild(viewDetailsBtn);

    const detailsHost = document.createElement("div");
    detailsHost.className = "card-details";

    if (isExpanded) {
      detailsHost.classList.add("open");
      item.classList.add("is-expanded");
      detailsHost.innerHTML = detailsMarkup(entry);

      const saveStatusBtn = detailsHost.querySelector('[data-role="save-status"]');
      const statusSelect = detailsHost.querySelector('[data-role="status-select"]');
      const deletePostedBtn = detailsHost.querySelector('[data-role="delete-listing"]');

      if (saveStatusBtn && statusSelect) {
        saveStatusBtn.addEventListener("click", (event) => {
          event.stopPropagation();
          const ok = updatePostedListingStatus(entry.id, statusSelect.value);
          if (ok) {
            showPostMessage(`Status updated to ${formatStatusLabel(statusSelect.value)}.`);
            renderListingLibrary();
          }
        });
      }

      if (deletePostedBtn) {
        deletePostedBtn.addEventListener("click", (event) => {
          event.stopPropagation();
          const confirmed = window.confirm(
            "Are you sure you want to delete this posted listing? This action cannot be undone."
          );
          if (!confirmed) {
            return;
          }

          const ok = deleteListingById(POSTS_KEY, entry.id);
          if (ok) {
            if (Number(expandedPostedListingId) === Number(entry.id)) {
              expandedPostedListingId = null;
            }
            showPostMessage("Posted listing deleted.");
            renderListingLibrary();
          }
        });
      }
    }

    content.appendChild(row);
    content.appendChild(metaRow);
    content.appendChild(rentType);
    content.appendChild(statusBadge);
    content.appendChild(detailsActions);
    content.appendChild(detailsHost);

    item.appendChild(image);
    item.appendChild(content);

    listingLibraryListEl.appendChild(item);
  });

  updateLibraryTabState();
}

function buildListingPayload(mode) {
  const purpose = getInputValue("postPurpose", "rent");
  const imageCandidates = [
    getInputValue("postImage1", ""),
    getInputValue("postImage2", ""),
    getInputValue("postImage3", "")
  ].filter(Boolean);

  return {
    id: Date.now(),
    title: getInputValue("postTitle", ""),
    ownership: getInputValue("postOwnership", "owner"),
    purpose,
    rentType: purpose === "rent" ? getInputValue("postContract", "long") : null,
    contractLabel: purpose === "rent" ? getInputValue("postContractLabel", "") : "",
    postedDate: mode === "post" ? getTodayISODate() : "",
    status: getInputValue("postStatus", "available"),
    availableFrom: getInputValue("postAvailableFrom", ""),
    city: getInputValue("postCity", ""),
    district: getInputValue("postDistrict", ""),
    type: getInputValue("postType", "studio"),
    price: 0,
    priceFt: getInputNumber("postPrice", 0),
    communityFeeFt: getInputNumber("postCommunityFee", 0),
    depositFt: getInputNumber("postDeposit", 0),
    utilitiesEstimateFt: getInputNumber("postUtilities", 0),
    rooms: getInputNumber("postBedrooms", 0),
    size: getInputNumber("postSize", 0),
    flatType: getInputValue("postFlatType", "N/A"),
    floorNumber: getInputNumber("postFloorNumber", 0),
    elevator: getInputBoolean("postElevator", false),
    bedrooms: getInputNumber("postBedrooms", 0),
    bathrooms: getInputNumber("postBathrooms", 1),
    condition: getInputValue("postCondition", "N/A"),
    heatingType: getInputValue("postHeatingType", "N/A"),
    furnishing: getInputValue("postFurnishing", "N/A"),
    features: getCheckedFeatures(),
    furnished: getInputBoolean("postFurnished", false),
    lat: getCoordinateValue(postLatitudeEl, DEFAULT_PICKER_COORDS.lat),
    lng: getCoordinateValue(postLongitudeEl, DEFAULT_PICKER_COORDS.lng),
    images: imageCandidates.length ? imageCandidates : [DEFAULT_IMAGE],
    description: getInputValue("postDescription", ""),
    createdAt: Date.now(),
    mode
  };
}
function toggleRentalFields() {
  const purpose = getInputValue("postPurpose", "rent");
  const contractEl = document.getElementById("postContract");
  const contractLabelEl = document.getElementById("postContractLabel");
  const isRent = purpose === "rent";

  if (contractEl) {
    contractEl.disabled = !isRent;
  }

  if (contractLabelEl) {
    contractLabelEl.disabled = !isRent;
    if (!isRent) {
      contractLabelEl.value = "";
    }
  }
}

function showPostMessage(text) {
  if (!postSuccessEl) {
    return;
  }

  postSuccessEl.hidden = false;
  postSuccessEl.textContent = text;
}

function validatePostingAccess() {
  const landlord = typeof isLandlord === "function" && isLandlord();
  if (!landlord) {
    updatePostingAccess();
    return false;
  }

  return true;
}

if (postForm) {
  structurePostFormSections();
  applyInitialViewFromQuery();
  initLocationPicker();
  if (!getInputValue("postLatitude", "") || !getInputValue("postLongitude", "")) {
    resetPickerToDefault();
  }

  const purposeEl = document.getElementById("postPurpose");
  if (purposeEl) {
    purposeEl.addEventListener("change", toggleRentalFields);
  }

  if (postCityEl) {
    postCityEl.addEventListener("change", scheduleCityMapNavigation);
    postCityEl.addEventListener("blur", scheduleCityMapNavigation);
  }

  if (postDistrictEl) {
    postDistrictEl.addEventListener("change", scheduleCityMapNavigation);
    postDistrictEl.addEventListener("blur", scheduleCityMapNavigation);
  }

  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", () => {
      if (!validatePostingAccess()) {
        return;
      }

      if (!postForm.reportValidity()) {
        return;
      }

      const payload = buildListingPayload("draft");
      saveListingEntry(DRAFTS_KEY, payload);
      showPostMessage("Draft saved locally.");
      renderListingLibrary();
    });
  }

  if (postNowBtn) {
    postNowBtn.addEventListener("click", () => {
      if (!validatePostingAccess()) {
        return;
      }

      if (!postForm.reportValidity()) {
        return;
      }

      const payload = buildListingPayload("post");
      saveListingEntry(POSTS_KEY, payload);
      showPostMessage("Listing posted locally for demo. Posted date was assigned automatically.");
      renderListingLibrary();
    });
  }

  if (cancelPostBtn) {
    cancelPostBtn.addEventListener("click", () => {
      postForm.reset();
      toggleRentalFields();
      resetPickerToDefault();
      if (postSuccessEl) {
        postSuccessEl.hidden = true;
      }

      currentPageView = "posted";
      activeLibraryView = "posted";
      updatePostingAccess();
      updateEditActionState();
      renderListingLibrary();
    });
  }

  if (viewDraftsBtn) {
    viewDraftsBtn.addEventListener("click", () => {
      currentPageView = "drafts";
      activeLibraryView = "drafts";
      updatePostingAccess();
      updateEditActionState();
      renderListingLibrary();
    });
  }

  if (viewPostedBtn) {
    viewPostedBtn.addEventListener("click", () => {
      currentPageView = "posted";
      activeLibraryView = "posted";
      updatePostingAccess();
      updateEditActionState();
      renderListingLibrary();
    });
  }

  if (viewNewBtn) {
    viewNewBtn.addEventListener("click", () => {
      currentPageView = "new";
      activeLibraryView = "new";
      if (postForm) {
        postForm.reset();
      }
      if (postSuccessEl) {
        postSuccessEl.hidden = true;
      }
      populateFeatureChecks([]);
      resetPickerToDefault();
      toggleRentalFields();
      updatePostingAccess();
      updateEditActionState();
      renderListingLibrary();

      const titleEl = document.getElementById("postTitle");
      if (titleEl) {
        titleEl.focus();
      }
    });
  }

  toggleRentalFields();
  updateEditActionState();
  renderListingLibrary();
}

function onLoginSuccess() {
  updatePostingAccess();
  renderListingLibrary();
}

function onLogoutSuccess() {
  if (postSuccessEl) {
    postSuccessEl.hidden = true;
  }
  updatePostingAccess();
  renderListingLibrary();
}

updatePostingAccess();
renderListingLibrary();
