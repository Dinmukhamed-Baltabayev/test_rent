const postForm = document.getElementById("postListingForm");
const accessHintEl = document.getElementById("postAccessHint");
const postSuccessEl = document.getElementById("postSuccess");
const postNowBtn = document.getElementById("postNowBtn");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const cancelPostBtn = document.getElementById("cancelPostBtn");
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=900&q=80";

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
    accessHintEl.hidden = false;
    accessHintEl.textContent = "This is renter account access. Switch to landlord / demo123 for posting options.";
    return;
  }

  postForm.hidden = false;
  accessHintEl.hidden = false;
  accessHintEl.textContent = "Landlord mode active. Save draft is local demo only.";
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
    lat: 0,
    lng: 0,
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
  const purposeEl = document.getElementById("postPurpose");
  if (purposeEl) {
    purposeEl.addEventListener("change", toggleRentalFields);
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
      saveListingEntry("nestlyLandlordDrafts", payload);
      showPostMessage("Draft saved locally.");
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
      saveListingEntry("nestlyLandlordPosts", payload);
      showPostMessage("Listing posted locally for demo. Posted date was assigned automatically.");
    });
  }

  if (cancelPostBtn) {
    cancelPostBtn.addEventListener("click", () => {
      postForm.reset();
      toggleRentalFields();
      if (postSuccessEl) {
        postSuccessEl.hidden = true;
      }
    });
  }

  toggleRentalFields();
}

function onLoginSuccess() {
  updatePostingAccess();
}

function onLogoutSuccess() {
  if (postSuccessEl) {
    postSuccessEl.hidden = true;
  }
  updatePostingAccess();
}

updatePostingAccess();
