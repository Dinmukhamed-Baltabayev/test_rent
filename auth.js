// auth.js — shared authentication module
// Test accounts:
// renter: username: demo      password: demo123
// landlord: username: landlord password: demo123

const AUTH_KEY = "nestlyAuth";
const MESSAGE_STORAGE_PREFIX = "nestlyMessagesV1";
const REGISTERED_USERS_KEY = "nestlyRegisteredUsersV1";
const PROFILE_OVERRIDES_KEY = "nestlyProfileOverridesV1";
const LANDLORD_POSTS_KEY = "nestlyLandlordPosts";

const TEST_USERS = [
  {
    username: "demo",
    password: "demo123",
    name: "Demo Renter",
    role: "renter",
    email: "demo.renter@example.com",
    profile: {
      status: "studying",
      nationality: "Hungary",
      gender: "male",
      photoDataUrl: "https://i.pravatar.cc/160?img=12"
    }
  },
  {
    username: "landlord",
    password: "demo123",
    name: "Demo Landlord",
    role: "landlord",
    email: "demo.landlord@example.com",
    profile: {
      status: "working",
      nationality: "Hungary",
      gender: "female",
      photoDataUrl: "https://i.pravatar.cc/160?img=32"
    }
  }
];

let authModalMode = "login";
let signupAudience = "renter";
let profileEditing = false;

const DEMO_LANDLORD_LISTINGS = [
  {
    id: 91001,
    ownerUsername: "landlord",
    title: "Debrecen, Jokai utca - 2 bedroom flat with garden",
    ownership: "owner",
    purpose: "rent",
    rentType: "long",
    contractLabel: "12-month contract",
    postedDate: "2026-06-10",
    status: "available",
    availableFrom: "2026-10-01",
    city: "Debrecen",
    district: "Jokai utca",
    type: "apartment",
    price: 0,
    priceFt: 450000,
    communityFeeFt: 28000,
    depositFt: 900000,
    utilitiesEstimateFt: 35000,
    rooms: 3,
    size: 76,
    flatType: "New build",
    floorNumber: 1,
    elevator: false,
    bedrooms: 2,
    bathrooms: 2,
    condition: "Excellent",
    heatingType: "Individual gas",
    furnishing: "Furnished",
    features: ["Air conditioning", "Balcony", "Parking"],
    furnished: true,
    lat: 47.5315,
    lng: 21.6224,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Modern two-bedroom rental with garden access near tram line and city center. Fully equipped kitchen and AC in every room.",
    createdAt: 1760000000001,
    mode: "post"
  },
  {
    id: 91002,
    ownerUsername: "landlord",
    title: "Debrecen, Bem ter - 3 beds flat next to tramline",
    ownership: "organization",
    purpose: "rent",
    rentType: "long",
    contractLabel: "12-month contract",
    postedDate: "2026-06-08",
    status: "available",
    availableFrom: "2026-09-01",
    city: "Debrecen",
    district: "Bem ter",
    type: "apartment",
    price: 0,
    priceFt: 480000,
    communityFeeFt: 36000,
    depositFt: 960000,
    utilitiesEstimateFt: 60000,
    rooms: 3,
    size: 104,
    flatType: "Brick",
    floorNumber: 3,
    elevator: true,
    bedrooms: 3,
    bathrooms: 2,
    condition: "Recently renovated",
    heatingType: "Individual gas",
    furnishing: "Furnished",
    features: ["Air conditioning", "Balcony", "Dishwasher"],
    furnished: true,
    lat: 47.5347,
    lng: 21.6261,
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1464890100898-a385f744067f?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Spacious three-bedroom apartment near tram line with balcony and elevator. Ideal for students sharing.",
    createdAt: 1760000000002,
    mode: "post"
  },
  {
    id: 91003,
    ownerUsername: "landlord",
    title: "Debrecen, Doczy Jozsef utca - Two bedrooms near Uni",
    ownership: "owner",
    purpose: "rent",
    rentType: "long",
    contractLabel: "6-month contract",
    postedDate: "2026-06-07",
    status: "available",
    availableFrom: "2026-08-15",
    city: "Debrecen",
    district: "Doczy Jozsef utca",
    type: "apartment",
    price: 0,
    priceFt: 280000,
    communityFeeFt: 22000,
    depositFt: 560000,
    utilitiesEstimateFt: 35000,
    rooms: 3,
    size: 60,
    flatType: "Brick",
    floorNumber: 2,
    elevator: false,
    bedrooms: 2,
    bathrooms: 1,
    condition: "Good condition",
    heatingType: "Individual gas",
    furnishing: "Furnished",
    features: ["Washing machine", "Dishwasher", "Balcony"],
    furnished: true,
    lat: 47.5535,
    lng: 21.6214,
    images: [
      "https://images.unsplash.com/photo-1501876725168-00c445821c9e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Two-bedroom flat close to university campuses with practical layout and bright living room.",
    createdAt: 1760000000003,
    mode: "post"
  },
  {
    id: 91004,
    ownerUsername: "landlord",
    title: "Debrecen, Fenyes udvar - Room near Engineering Faculty",
    ownership: "owner",
    purpose: "rent",
    rentType: "short",
    contractLabel: "3-month minimum",
    postedDate: "2026-06-06",
    status: "available",
    availableFrom: "2026-08-01",
    city: "Debrecen",
    district: "Fenyes udvar",
    type: "shared",
    price: 0,
    priceFt: 100000,
    communityFeeFt: 8000,
    depositFt: 200000,
    utilitiesEstimateFt: 12000,
    rooms: 1,
    size: 10,
    flatType: "Panel",
    floorNumber: 4,
    elevator: true,
    bedrooms: 1,
    bathrooms: 1,
    condition: "Good condition",
    heatingType: "Central heating",
    furnishing: "Furnished",
    features: ["Washing machine", "Air conditioning"],
    furnished: true,
    lat: 47.5447,
    lng: 21.6405,
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Budget-friendly room in a shared flat close to Engineering Faculty and public transport.",
    createdAt: 1760000000004,
    mode: "post"
  },
  {
    id: 91005,
    ownerUsername: "landlord",
    title: "Debrecen, Vezer utca - Duplex rowhouse close to IT Services",
    ownership: "organization",
    purpose: "rent",
    rentType: "long",
    contractLabel: "12-month contract",
    postedDate: "2026-06-05",
    status: "available",
    availableFrom: "2026-09-15",
    city: "Debrecen",
    district: "Vezer utca",
    type: "apartment",
    price: 0,
    priceFt: 490000,
    communityFeeFt: 30000,
    depositFt: 980000,
    utilitiesEstimateFt: 50000,
    rooms: 4,
    size: 118,
    flatType: "New build",
    floorNumber: 0,
    elevator: false,
    bedrooms: 3,
    bathrooms: 2,
    condition: "Excellent",
    heatingType: "Individual gas",
    furnishing: "Partly furnished",
    features: ["Parking", "Balcony", "Storage room"],
    furnished: false,
    lat: 47.5653,
    lng: 21.6049,
    images: [
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Large duplex-style home for families or groups, with terrace and parking near the IT corridor.",
    createdAt: 1760000000005,
    mode: "post"
  },
  {
    id: 91006,
    ownerUsername: "landlord",
    title: "Debrecen, Egyetem sugarut - Flat for sale",
    ownership: "owner",
    purpose: "sale",
    rentType: null,
    contractLabel: "",
    postedDate: "2026-06-04",
    status: "available",
    availableFrom: "",
    city: "Debrecen",
    district: "Egyetem sugarut",
    type: "apartment",
    price: 0,
    priceFt: 54990000,
    communityFeeFt: 19000,
    depositFt: 0,
    utilitiesEstimateFt: 28000,
    rooms: 2,
    size: 58,
    flatType: "Brick",
    floorNumber: 2,
    elevator: true,
    bedrooms: 1,
    bathrooms: 1,
    condition: "Recently renovated",
    heatingType: "District heating",
    furnishing: "Partly furnished",
    features: ["Balcony", "Storage room"],
    furnished: false,
    lat: 47.5531,
    lng: 21.6268,
    images: [
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1464890100898-a385f744067f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Well-located apartment for sale near university area with strong rental potential.",
    createdAt: 1760000000006,
    mode: "post"
  }
];

function ensureDemoLandlordListings() {
  try {
    const raw = localStorage.getItem(LANDLORD_POSTS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const store = Array.isArray(existing) ? existing : [];
    const ids = new Set(store.map((item) => Number(item?.id)).filter((id) => Number.isFinite(id)));
    let changed = false;

    DEMO_LANDLORD_LISTINGS.forEach((seed) => {
      if (!ids.has(seed.id)) {
        store.push(seed);
        ids.add(seed.id);
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem(LANDLORD_POSTS_KEY, JSON.stringify(store));
    }
  } catch {
    // Ignore storage failures in restricted environments.
  }
}

ensureDemoLandlordListings();

function readRegisteredUsers() {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRegisteredUsers(users) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

function readProfileOverrides() {
  try {
    const raw = localStorage.getItem(PROFILE_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeProfileOverrides(overrides) {
  localStorage.setItem(PROFILE_OVERRIDES_KEY, JSON.stringify(overrides));
}

function getRegisteredUser(username) {
  return readRegisteredUsers().find((user) => user.username === username) || null;
}

function getProfileOverridesFor(username) {
  return readProfileOverrides()[username] || null;
}

function getBaseUser(username) {
  return TEST_USERS.find((user) => user.username === username) || getRegisteredUser(username);
}

function getResolvedUser(username) {
  const baseUser = getBaseUser(username);
  if (!baseUser) return null;

  const override = getProfileOverridesFor(username);
  return {
    ...baseUser,
    ...override,
    profile: {
      ...(baseUser.profile || {}),
      ...(override?.profile || {})
    }
  };
}

function getKnownUsers() {
  return [...TEST_USERS, ...readRegisteredUsers()];
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read the selected photo."));
    reader.readAsDataURL(file);
  });
}

function getSignupFieldElements() {
  return {
    name: document.getElementById("signupName"),
    username: document.getElementById("signupUsername"),
    password: document.getElementById("signupPassword"),
    email: document.getElementById("signupEmail"),
    status: document.getElementById("signupStatus"),
    gender: document.getElementById("signupGender"),
    nationality: document.getElementById("signupNationality"),
    photo: document.getElementById("signupPhoto")
  };
}

function clearSignupFieldHighlights() {
  Object.values(getSignupFieldElements()).forEach((field) => {
    field?.classList.remove("is-invalid");
  });
}

function highlightMissingSignupFields() {
  const fields = getSignupFieldElements();
  const missingFields = [];

  if (!fields.name?.value.trim()) missingFields.push(fields.name);
  if (!fields.username?.value.trim()) missingFields.push(fields.username);
  if (!fields.password?.value.trim()) missingFields.push(fields.password);
  if (!fields.email?.value.trim()) missingFields.push(fields.email);
  if (!fields.status?.value.trim()) missingFields.push(fields.status);
  if (!fields.gender?.value.trim()) missingFields.push(fields.gender);
  if (!fields.nationality?.value.trim()) missingFields.push(fields.nationality);
  if (!fields.photo?.files?.[0]) missingFields.push(fields.photo);

  missingFields.forEach((field) => field?.classList.add("is-invalid"));
  return missingFields.length > 0;
}

function getNationalityOptions() {
  if (typeof Intl === "undefined" || typeof Intl.DisplayNames !== "function") {
    return ["Hungary", "Austria", "Germany", "Poland", "Romania"];
  }

  const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
  const regionCodes = [
    "AF", "AL", "DZ", "AD", "AO", "AG", "AR", "AM", "AU", "AT", "AZ",
    "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BT", "BO", "BA", "BW", "BR", "BN", "BG", "BF", "BI",
    "CV", "KH", "CM", "CA", "CF", "TD", "CL", "CN", "CO", "KM", "CG", "CR", "HR", "CU", "CY", "CZ",
    "DK", "DJ", "DM", "DO",
    "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET",
    "FJ", "FI", "FR",
    "GA", "GM", "GE", "DE", "GH", "GR", "GD", "GT", "GN", "GW", "GY",
    "HT", "HN", "HU",
    "IS", "IN", "ID", "IR", "IQ", "IE", "IL", "IT",
    "JM", "JP", "JO",
    "KZ", "KE", "KI", "KW", "KG",
    "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU",
    "MG", "MW", "MY", "MV", "ML", "MT", "MR", "MU", "MX", "MD", "MC", "MN", "ME", "MA", "MZ", "MM",
    "NA", "NR", "NP", "NL", "NZ", "NI", "NE", "NG", "MK", "NO",
    "OM",
    "PK", "PA", "PG", "PY", "PE", "PH", "PL", "PT",
    "QA",
    "RO", "RU", "RW",
    "KN", "LC", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SK", "SI", "SB", "SO", "ZA", "KR", "SS", "ES", "LK", "SD", "SR", "SE", "CH", "SY",
    "TW", "TJ", "TZ", "TH", "TL", "TG", "TO", "TT", "TN", "TR", "TM",
    "UG", "UA", "AE", "GB", "US", "UY", "UZ",
    "VU",
    "VE", "VN",
    "YE", "ZM", "ZW"
  ];

  return Array.from(
    new Set(
      regionCodes
        .map((code) => displayNames.of(code))
        .filter((name) => Boolean(name))
    )
  ).sort((left, right) => left.localeCompare(right));
}

function getStatusLabel(status) {
  switch (status) {
    case "working":
      return "Working";
    case "studying":
      return "Studying";
    case "both":
      return "Studying and working";
    default:
      return "";
  }
}

function isLoggedIn() {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw).loggedIn === true : false;
  } catch {
    return false;
  }
}

function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function authLogin(username, password) {
  const user = getKnownUsers().find(
    (u) => u.username === username.trim() && u.password === password
  );
  if (!user) return false;
  const resolvedUser = getResolvedUser(user.username) || user;
  sessionStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      loggedIn: true,
      username: resolvedUser.username,
      name: resolvedUser.name,
      role: resolvedUser.role,
      email: resolvedUser.email,
      profile: resolvedUser.profile || null
    })
  );

  migrateLegacyMessagesToUser(resolvedUser.username);
  return true;
}

function registerRenterAccount({ name, username, password, email, status, nationality, gender, photoDataUrl }) {
  const trimmedName = name.trim();
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();
  const trimmedEmail = email.trim();
  const trimmedStatus = status.trim();
  const trimmedNationality = nationality.trim();
  const trimmedGender = gender.trim();

  if (!trimmedName || !trimmedUsername || !trimmedPassword || !trimmedEmail || !trimmedStatus || !trimmedNationality || !trimmedGender || !photoDataUrl) {
    return { ok: false, message: "Please fill in all renter fields." };
  }

  if (!isValidEmail(trimmedEmail)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  if (trimmedPassword.length < 6) {
    return { ok: false, message: "Password should be at least 6 characters." };
  }

  const existingUser = getKnownUsers().find(
    (user) => user.username === trimmedUsername || user.email === trimmedEmail
  );
  if (existingUser) {
    return { ok: false, message: "An account with that username or email already exists." };
  }

  const registeredUsers = readRegisteredUsers();
  const user = {
    username: trimmedUsername,
    password: trimmedPassword,
    name: trimmedName,
    email: trimmedEmail,
    role: "renter",
    profile: {
      status: trimmedStatus,
      nationality: trimmedNationality,
      gender: trimmedGender,
      photoDataUrl
    }
  };

  registeredUsers.push(user);
  writeRegisteredUsers(registeredUsers);
  const overrides = readProfileOverrides();
  delete overrides[trimmedUsername];
  writeProfileOverrides(overrides);

  sessionStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      loggedIn: true,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email,
      profile: user.profile
    })
  );

  migrateLegacyMessagesToUser(user.username);
  return { ok: true, user };
}

function updateCurrentUserProfile(updates) {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.username) {
    return { ok: false, message: "No user is currently signed in." };
  }

  const username = currentUser.username;
  const existingUser = getRegisteredUser(username) || TEST_USERS.find((user) => user.username === username) || null;
  if (!existingUser) {
    return { ok: false, message: "User account not found." };
  }

  const nextProfile = {
    status: updates.status,
    nationality: updates.nationality,
    gender: updates.gender,
    photoDataUrl: updates.photoDataUrl
  };

  const nextUser = {
    ...existingUser,
    name: updates.name,
    email: updates.email,
    profile: {
      ...(existingUser.profile || {}),
      ...nextProfile
    }
  };

  const registeredUsers = readRegisteredUsers();
  const registeredIndex = registeredUsers.findIndex((user) => user.username === username);
  if (registeredIndex >= 0) {
    registeredUsers[registeredIndex] = {
      ...registeredUsers[registeredIndex],
      name: updates.name,
      email: updates.email,
      profile: nextUser.profile
    };
    writeRegisteredUsers(registeredUsers);
    const overrides = readProfileOverrides();
    delete overrides[username];
    writeProfileOverrides(overrides);
  } else {
    const overrides = readProfileOverrides();
    overrides[username] = {
      name: updates.name,
      email: updates.email,
      profile: nextUser.profile
    };
    writeProfileOverrides(overrides);
  }

  sessionStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      loggedIn: true,
      username,
      name: nextUser.name,
      role: nextUser.role,
      email: nextUser.email,
      profile: nextUser.profile
    })
  );

  return { ok: true, user: nextUser };
}

function deleteCurrentUserAccount() {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.username) {
    return { ok: false, message: "No user is currently signed in." };
  }

  const username = currentUser.username;
  const registeredUsers = readRegisteredUsers();
  const registeredIndex = registeredUsers.findIndex((user) => user.username === username);

  if (registeredIndex >= 0) {
    registeredUsers.splice(registeredIndex, 1);
    writeRegisteredUsers(registeredUsers);
  } else {
    const overrides = readProfileOverrides();
    delete overrides[username];
    writeProfileOverrides(overrides);
  }

  sessionStorage.removeItem(AUTH_KEY);
  authLogout();
  return { ok: true };
}

function authLogout() {
  sessionStorage.removeItem(AUTH_KEY);
}

function isLandlord() {
  const user = getCurrentUser();
  return Boolean(user && user.role === "landlord");
}

function getUserMessageStorageKey() {
  if (!isLoggedIn()) {
    return null;
  }

  const user = getCurrentUser();
  if (!user || !user.username) {
    return null;
  }

  return `${MESSAGE_STORAGE_PREFIX}:${user.username}`;
}

function getMessageStorageKeyForUsername(username) {
  const safeUsername = String(username || "").trim();
  if (!safeUsername) {
    return null;
  }

  return `${MESSAGE_STORAGE_PREFIX}:${safeUsername}`;
}

function readMessageStoreForUsername(username) {
  const key = getMessageStorageKeyForUsername(username);
  if (!key) {
    return {};
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMessageStoreForUsername(username, store) {
  const key = getMessageStorageKeyForUsername(username);
  if (!key) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(store));
}

function getDemoConversationPeerUsername() {
  const user = getCurrentUser();
  if (!user?.username) {
    return null;
  }

  if (user.username === "demo") {
    return "landlord";
  }

  if (user.username === "landlord") {
    return "demo";
  }

  return null;
}

function appendSharedConversationMessage(listingId, text) {
  const user = getCurrentUser();
  if (!user?.username) {
    return null;
  }

  const safeListingId = Number(listingId);
  const safeText = String(text || "").trim();
  if (!Number.isFinite(safeListingId) || !safeText) {
    return null;
  }

  const entry = {
    sender: user.username,
    text: safeText,
    at: Date.now()
  };

  const usernames = [user.username, getDemoConversationPeerUsername()].filter(Boolean);
  usernames.forEach((username) => {
    const store = readMessageStoreForUsername(username);
    const key = String(safeListingId);
    if (!Array.isArray(store[key])) {
      store[key] = [];
    }
    store[key].push(entry);
    writeMessageStoreForUsername(username, store);
  });

  return entry;
}

function migrateLegacyMessagesToUser(username) {
  const userKey = `${MESSAGE_STORAGE_PREFIX}:${username}`;
  if (localStorage.getItem(userKey)) {
    return;
  }

  const legacy = localStorage.getItem(MESSAGE_STORAGE_PREFIX);
  if (legacy) {
    localStorage.setItem(userKey, legacy);
  }
}

// ── Modal ────────────────────────────────────────────────────────────────────

function getNationalityOptionsMarkup() {
  return getNationalityOptions().map((country) => `<option value="${country}"></option>`).join("");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setProfileEditMode(isEditing) {
  profileEditing = isEditing;
  const fields = [
    document.getElementById("profileName"),
    document.getElementById("profileEmail"),
    document.getElementById("profileStatus"),
    document.getElementById("profileGender"),
    document.getElementById("profileNationality"),
    document.getElementById("profilePhoto")
  ];

  fields.forEach((field) => {
    if (!field) return;
    field.disabled = !isEditing;
  });

  const usernameField = document.getElementById("profileUsername");
  if (usernameField) {
    usernameField.disabled = true;
  }

  const saveButton = document.getElementById("profileSaveButton");
  const editButton = document.getElementById("profileEditButton");
  const cancelButton = document.getElementById("profileCancelButton");
  const deleteButton = document.getElementById("profileDeleteButton");
  if (saveButton) saveButton.hidden = !isEditing;
  if (editButton) editButton.hidden = isEditing;
  if (cancelButton) cancelButton.hidden = !isEditing;
  if (deleteButton) deleteButton.hidden = isEditing;
}

function injectProfileModal() {
  const modal = document.createElement("div");
  modal.id = "profileModal";
  modal.className = "auth-modal";
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("role", "dialog");
  modal.hidden = true;
  modal.innerHTML = `
    <div class="auth-backdrop"></div>
    <div class="auth-dialog profile-dialog">
      <section class="auth-view profile-view">
        <h2 class="auth-title">My profile</h2>
        <p class="auth-hint">Update the details you want to keep current for matching and messaging.</p>
        <div class="profile-summary">
          <img id="profileAvatarPreview" class="profile-avatar" alt="Profile photo preview">
          <div class="profile-summary-copy">
            <p id="profileSummaryName" class="profile-summary-name"></p>
            <p id="profileSummaryMeta" class="profile-summary-meta"></p>
          </div>
        </div>
        <form id="profileForm" autocomplete="off" novalidate>
          <label class="auth-label">
            Full name
            <input id="profileName" type="text" class="auth-input" required>
          </label>
          <label class="auth-label">
            Username
            <input id="profileUsername" type="text" class="auth-input" disabled>
          </label>
          <label class="auth-label">
            Email
            <input id="profileEmail" type="email" class="auth-input" required>
          </label>
          <label class="auth-label">
            Currently working or studying
            <select id="profileStatus" class="auth-input" required>
              <option value="">Choose one</option>
              <option value="working">Working</option>
              <option value="studying">Studying</option>
              <option value="both">Studying and working</option>
            </select>
          </label>
          <label class="auth-label">
            Gender
            <select id="profileGender" class="auth-input" required>
              <option value="">Choose one</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </label>
          <label class="auth-label">
            Nationality
            <input id="profileNationality" type="text" class="auth-input" list="profileNationalityOptions" required>
          </label>
          <label class="auth-label">
            Profile photo
            <input id="profilePhoto" type="file" class="auth-input" accept="image/*">
          </label>
          <p id="profileError" class="auth-error" hidden></p>
          <div class="profile-actions">
            <button type="button" id="profileCancelButton" class="btn ghost profile-cancel" hidden>Cancel</button>
            <button type="button" id="profileEditButton" class="btn ghost auth-submit">Edit profile</button>
            <button type="submit" id="profileSaveButton" class="btn primary auth-submit" hidden>Save changes</button>
          </div>
          <button type="button" id="profileDeleteButton" class="profile-delete-button">Delete my account</button>
        </form>
        <datalist id="profileNationalityOptions">${getNationalityOptionsMarkup()}</datalist>
      </section>
      <button type="button" class="auth-close" id="profileClose" aria-label="Close">✕</button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".auth-backdrop").addEventListener("click", closeProfileModal);
  modal.querySelector("#profileClose").addEventListener("click", closeProfileModal);
  modal.querySelector("#profileEditButton").addEventListener("click", () => setProfileEditMode(true));
  modal.querySelector("#profileCancelButton").addEventListener("click", () => {
    openProfileModal();
  });
  modal.querySelector("#profileDeleteButton").addEventListener("click", () => {
    const errorEl = document.getElementById("profileError");
    const confirmed = window.confirm("Delete your account? This cannot be undone.");
    if (!confirmed) return;

    const result = deleteCurrentUserAccount();
    if (!result.ok) {
      errorEl.textContent = result.message;
      errorEl.hidden = false;
      return;
    }

    errorEl.hidden = true;
    updateAuthUI();
    closeProfileModal();
  });

  modal.querySelector("#profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!profileEditing) return;
    const errorEl = document.getElementById("profileError");
    const fields = {
      name: document.getElementById("profileName"),
      email: document.getElementById("profileEmail"),
      status: document.getElementById("profileStatus"),
      gender: document.getElementById("profileGender"),
      nationality: document.getElementById("profileNationality"),
      photo: document.getElementById("profilePhoto")
    };

    Object.values(fields).forEach((field) => field.classList.remove("is-invalid"));

    const missingFields = [];
    if (!fields.name.value.trim()) missingFields.push(fields.name);
    if (!fields.email.value.trim()) missingFields.push(fields.email);
    if (!fields.status.value.trim()) missingFields.push(fields.status);
    if (!fields.gender.value.trim()) missingFields.push(fields.gender);
    if (!fields.nationality.value.trim()) missingFields.push(fields.nationality);

    missingFields.forEach((field) => field.classList.add("is-invalid"));
    if (missingFields.length) {
      errorEl.textContent = "Please complete the highlighted fields.";
      errorEl.hidden = false;
      return;
    }

    let photoDataUrl = getCurrentUser()?.profile?.photoDataUrl || "";
    const photoFile = fields.photo.files?.[0];
    if (photoFile) {
      try {
        photoDataUrl = await readFileAsDataURL(photoFile);
      } catch (err) {
        errorEl.textContent = err.message || "Unable to read the selected photo.";
        errorEl.hidden = false;
        fields.photo.classList.add("is-invalid");
        return;
      }
    }

    const result = updateCurrentUserProfile({
      name: fields.name.value,
      email: fields.email.value,
      status: fields.status.value,
      gender: fields.gender.value,
      nationality: fields.nationality.value,
      photoDataUrl
    });

    if (!result.ok) {
      errorEl.textContent = result.message;
      errorEl.hidden = false;
      return;
    }

    errorEl.hidden = true;
    updateAuthUI();
    setProfileEditMode(false);
    openProfileModal();
  });

  return modal;
}

function openProfileModal() {
  const modal = document.getElementById("profileModal") || injectProfileModal();
  const user = getCurrentUser();
  if (!modal || !user) return;

  const resolvedUser = getResolvedUser(user.username) || user;
  const profile = resolvedUser.profile || {};

  document.getElementById("profileName").value = resolvedUser.name || "";
  document.getElementById("profileUsername").value = resolvedUser.username || "";
  document.getElementById("profileEmail").value = resolvedUser.email || "";
  document.getElementById("profileStatus").value = profile.status || "";
  document.getElementById("profileGender").value = profile.gender || "";
  document.getElementById("profileNationality").value = profile.nationality || "";
  document.getElementById("profilePhoto").value = "";
  document.getElementById("profileError").hidden = true;

  const avatar = document.getElementById("profileAvatarPreview");
  const summaryName = document.getElementById("profileSummaryName");
  const summaryMeta = document.getElementById("profileSummaryMeta");
  const photoSrc = profile.photoDataUrl || "";
  avatar.src = photoSrc || "https://via.placeholder.com/120x120.png?text=Profile";
  avatar.hidden = false;
  summaryName.textContent = resolvedUser.name || "My profile";
  summaryMeta.textContent = [resolvedUser.role, profile.nationality, getStatusLabel(profile.status)].filter(Boolean).join(" • ");

  setProfileEditMode(false);
  modal.hidden = false;
  document.body.classList.add("modal-open");
  setTimeout(() => document.getElementById("profileEditButton")?.focus(), 50);
}

function closeProfileModal() {
  const modal = document.getElementById("profileModal");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  setProfileEditMode(false);
}

function injectLoginModal() {
  const nationalityOptions = getNationalityOptions();

  const modal = document.createElement("div");
  modal.id = "loginModal";
  modal.className = "auth-modal";
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("role", "dialog");
  modal.hidden = true;
  modal.innerHTML = `
    <div class="auth-backdrop"></div>
    <div class="auth-dialog">
      <section class="auth-view" data-view="login">
        <h2 class="auth-title">Log in</h2>
        <p class="auth-hint">Test accounts: renter <strong>demo</strong> / <strong>demo123</strong>, landlord <strong>landlord</strong> / <strong>demo123</strong></p>
        <form id="loginForm" autocomplete="off" novalidate>
          <label class="auth-label">
            Username
            <input id="authUsername" type="text" class="auth-input" placeholder="demo" autocomplete="username" required>
          </label>
          <label class="auth-label">
            Password
            <input id="authPassword" type="password" class="auth-input" placeholder="••••••••" autocomplete="current-password" required>
          </label>
          <p id="authError" class="auth-error" hidden>Incorrect username or password.</p>
          <button type="submit" class="btn primary auth-submit">Log in</button>
          <button type="button" class="btn ghost auth-signup">Sign up</button>
        </form>
      </section>

      <section class="auth-view" data-view="signup" hidden>
        <h2 class="auth-title">Create account</h2>
        <p class="auth-hint">First choose what you want to do. Renter signup is ready now; listing signup comes next.</p>
        <datalist id="nationalityOptions">
          ${nationalityOptions.map((country) => `<option value="${country}"></option>`).join("")}
        </datalist>
        <div class="auth-role-grid" role="tablist" aria-label="Account type">
          <button type="button" class="auth-role-option is-active" data-signup-role="renter" aria-pressed="true">
            <span class="auth-role-label">I'm looking for accommodation</span>
            <span class="auth-role-copy">Build a renter profile and search homes.</span>
          </button>
          <button type="button" class="auth-role-option" data-signup-role="landlord" aria-pressed="false">
            <span class="auth-role-label">I want to list a place</span>
            <span class="auth-role-copy">Listing signup will be added after the renter flow.</span>
          </button>
        </div>

        <div id="signupRenterPanel" class="auth-signup-panel">
          <form id="signupForm" autocomplete="off" novalidate>
            <label class="auth-label">
              Full name
              <input id="signupName" type="text" class="auth-input" placeholder="Alex Smith" autocomplete="name" required>
            </label>
            <label class="auth-label">
              Username
              <input id="signupUsername" type="text" class="auth-input" placeholder="alex123" autocomplete="username" required>
            </label>
            <label class="auth-label">
              Password
              <input id="signupPassword" type="password" class="auth-input" placeholder="At least 6 characters" autocomplete="new-password" required>
            </label>
            <label class="auth-label">
              Email
              <input id="signupEmail" type="email" class="auth-input" placeholder="alex@example.com" autocomplete="email" required>
            </label>
            <label class="auth-label">
              Currently working or studying
              <select id="signupStatus" class="auth-input" required>
                <option value="">Choose one</option>
                <option value="working">Working</option>
                <option value="studying">Studying</option>
                <option value="both">Studying and working</option>
              </select>
            </label>
            <label class="auth-label">
              Gender
              <select id="signupGender" class="auth-input" required>
                <option value="">Choose one</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </label>
            <label class="auth-label">
              Nationality
              <input id="signupNationality" type="text" class="auth-input" placeholder="Hungary" list="nationalityOptions" autocomplete="country-name" required>
            </label>
            <label class="auth-label">
              Profile photo
              <input id="signupPhoto" type="file" class="auth-input" accept="image/*" required>
            </label>
            <p id="signupError" class="auth-error" hidden></p>
            <button type="submit" class="btn primary auth-submit">Create renter account</button>
          </form>
        </div>

        <p id="signupComingSoon" class="auth-coming-soon" hidden>Listing signup will be added next. For now, renter signup is active.</p>
        <button type="button" class="btn ghost auth-back-to-login" data-action="back-to-login">I already have an account</button>
      </section>

      <button type="button" class="auth-close" id="authClose" aria-label="Close">✕</button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".auth-signup").addEventListener("click", openSignupModal);
  document.getElementById("authClose").addEventListener("click", closeLoginModal);
  modal.querySelector(".auth-backdrop").addEventListener("click", closeLoginModal);
  modal.querySelector("[data-action='back-to-login']").addEventListener("click", openLoginModal);

  modal.querySelectorAll("[data-signup-role]").forEach((button) => {
    button.addEventListener("click", () => setSignupAudience(button.dataset.signupRole));
  });

  modal.querySelectorAll("#signupForm .auth-input").forEach((field) => {
    field.addEventListener("input", () => field.classList.remove("is-invalid"));
    field.addEventListener("change", () => field.classList.remove("is-invalid"));
  });

  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("authUsername").value;
    const password = document.getElementById("authPassword").value;
    const errorEl = document.getElementById("authError");

    if (authLogin(username, password)) {
      errorEl.hidden = true;
      closeLoginModal();
      updateAuthUI();
      if (typeof onLoginSuccess === "function") onLoginSuccess();
    } else {
      errorEl.hidden = false;
    }
  });

  document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("signupError");
    clearSignupFieldHighlights();

    if (highlightMissingSignupFields()) {
      errorEl.textContent = "Please complete the highlighted fields.";
      errorEl.hidden = false;
      return;
    }

    const photoInput = document.getElementById("signupPhoto");
    const photoFile = photoInput.files?.[0];

    let photoDataUrl = "";
    try {
      photoDataUrl = await readFileAsDataURL(photoFile);
    } catch (err) {
      errorEl.textContent = err.message || "Unable to read the selected photo.";
      errorEl.hidden = false;
      return;
    }

    const result = registerRenterAccount({
      name: document.getElementById("signupName").value,
      username: document.getElementById("signupUsername").value,
      password: document.getElementById("signupPassword").value,
      email: document.getElementById("signupEmail").value,
      status: document.getElementById("signupStatus").value,
      nationality: document.getElementById("signupNationality").value,
      gender: document.getElementById("signupGender").value,
      photoDataUrl
    });

    if (!result.ok) {
      errorEl.textContent = result.message;
      errorEl.hidden = false;
      return;
    }

    errorEl.hidden = true;
    closeLoginModal();
    updateAuthUI();
    if (typeof onLoginSuccess === "function") onLoginSuccess();
  });

  syncAuthView("login");
}

function syncAuthView(view) {
  const modal = document.getElementById("loginModal");
  if (!modal) return;
  authModalMode = view;

  const loginView = modal.querySelector("[data-view='login']");
  const signupView = modal.querySelector("[data-view='signup']");
  if (loginView) loginView.hidden = view !== "login";
  if (signupView) signupView.hidden = view !== "signup";
  if (view === "signup") {
    setSignupAudience(signupAudience);
  }
}

function setSignupAudience(role) {
  const modal = document.getElementById("loginModal");
  if (!modal) return;

  signupAudience = role === "landlord" ? "landlord" : "renter";

  modal.querySelectorAll("[data-signup-role]").forEach((button) => {
    const isActive = button.dataset.signupRole === signupAudience;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const renterPanel = document.getElementById("signupRenterPanel");
  const comingSoon = document.getElementById("signupComingSoon");
  const signupForm = document.getElementById("signupForm");

  if (renterPanel) renterPanel.hidden = signupAudience !== "renter";
  if (comingSoon) comingSoon.hidden = signupAudience !== "landlord";
  if (signupForm) signupForm.hidden = signupAudience !== "renter";
}

function openLoginModal() {
  const modal = document.getElementById("loginModal");
  if (!modal) return;
  syncAuthView("login");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  document.getElementById("authError").hidden = true;
  document.getElementById("signupError").hidden = true;
  setTimeout(() => document.getElementById("authUsername")?.focus(), 50);
}

function openSignupModal() {
  const modal = document.getElementById("loginModal");
  if (!modal) return;
  syncAuthView("signup");
  setSignupAudience("renter");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  document.getElementById("authError").hidden = true;
  document.getElementById("signupError").hidden = true;
  setTimeout(() => document.getElementById("signupName")?.focus(), 50);
}

function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  document.getElementById("authError").hidden = true;
  document.getElementById("signupError").hidden = true;
  document.getElementById("loginForm").reset();
  document.getElementById("signupForm").reset();
  setSignupAudience("renter");
  syncAuthView("login");
}

// ── Topbar UI ────────────────────────────────────────────────────────────────

function updateAuthUI() {
  const actionsEl = document.querySelector(".topbar-actions");
  if (!actionsEl) return;

  // Remove existing auth controls so we can rebuild (home-btn is preserved)
  actionsEl.querySelectorAll(".login-btn, .logout-btn, .profile-btn, .topbar-user, .post-listing-button, .post-listing-menu").forEach(
    (el) => el.remove()
  );

  const homeBtn = actionsEl.querySelector(".home-btn");
  const messagesLink = actionsEl.querySelector(".message-center-button");

  // Detach persistent controls so we can re-append in a deterministic order.
  if (homeBtn) homeBtn.remove();
  if (messagesLink) messagesLink.remove();

  if (isLoggedIn()) {
    const profileBtn = document.createElement("a");
    profileBtn.className = "btn ghost profile-btn";
    profileBtn.href = "profile.html";
    profileBtn.textContent = "My profile";

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "btn ghost logout-btn";
    logoutBtn.textContent = "Log out";
    logoutBtn.addEventListener("click", () => {
      authLogout();
      updateAuthUI();
      if (typeof onLogoutSuccess === "function") onLogoutSuccess();
    });

    const myListingLink = document.createElement("a");
    myListingLink.className = "post-listing-button";
    myListingLink.href = "post-listing.html?view=posted";
    myListingLink.setAttribute("aria-label", "Open current listings");
    myListingLink.textContent = "My listing";

    // Left side order: Home, My profile, My listing, Messages.
    if (homeBtn) actionsEl.appendChild(homeBtn);
    actionsEl.appendChild(profileBtn);

    if (isLandlord()) {
      actionsEl.appendChild(myListingLink);
    }

    if (messagesLink) {
      actionsEl.appendChild(messagesLink);
    }

    // Right side action.
    actionsEl.appendChild(logoutBtn);
  } else {
    const loginBtn = document.createElement("button");
    loginBtn.className = "btn ghost login-btn";
    loginBtn.textContent = "Log in";
    loginBtn.addEventListener("click", openLoginModal);

    if (homeBtn) actionsEl.appendChild(homeBtn);
    if (messagesLink) actionsEl.appendChild(messagesLink);

    // Keep auth action as the rightmost control in the topbar.
    actionsEl.appendChild(loginBtn);
  }
}

// ── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  ensureDemoLandlordListings();
  injectLoginModal();
  injectProfileModal();
  updateAuthUI();
});
