// auth.js — shared authentication module
// Test accounts:
// renter: username: demo      password: demo123
// landlord: username: landlord password: demo123

const AUTH_KEY = "nestlyAuth";
const MESSAGE_STORAGE_PREFIX = "nestlyMessagesV1";

const TEST_USERS = [
  { username: "demo", password: "demo123", name: "Demo Renter", role: "renter" },
  { username: "landlord", password: "demo123", name: "Demo Landlord", role: "landlord" }
];

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
  const user = TEST_USERS.find(
    (u) => u.username === username.trim() && u.password === password
  );
  if (!user) return false;
  sessionStorage.setItem(
    AUTH_KEY,
    JSON.stringify({ loggedIn: true, username: user.username, name: user.name, role: user.role })
  );

  migrateLegacyMessagesToUser(user.username);
  return true;
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

function injectLoginModal() {
  const modal = document.createElement("div");
  modal.id = "loginModal";
  modal.className = "auth-modal";
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("role", "dialog");
  modal.hidden = true;
  modal.innerHTML = `
    <div class="auth-backdrop"></div>
    <div class="auth-dialog">
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
      <button type="button" class="auth-close" id="authClose" aria-label="Close">✕</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("authClose").addEventListener("click", closeLoginModal);
  modal.querySelector(".auth-backdrop").addEventListener("click", closeLoginModal);

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
}

function openLoginModal() {
  const modal = document.getElementById("loginModal");
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  setTimeout(() => document.getElementById("authUsername")?.focus(), 50);
}

function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  document.getElementById("authError").hidden = true;
  document.getElementById("loginForm").reset();
}

// ── Topbar UI ────────────────────────────────────────────────────────────────

function updateAuthUI() {
  const actionsEl = document.querySelector(".topbar-actions");
  if (!actionsEl) return;

  // Remove existing auth controls so we can rebuild
  actionsEl.querySelectorAll(".login-btn, .logout-btn, .topbar-user, .post-listing-button, .post-listing-menu").forEach(
    (el) => el.remove()
  );

  const messagesLink = actionsEl.querySelector(".message-center-button, a[href='index.html']");

  if (isLoggedIn()) {
    const user = getCurrentUser();

    const userLabel = document.createElement("span");
    userLabel.className = "topbar-user";
    userLabel.textContent = `Hi, ${user.name.split(" ")[0]}`;

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

    // Keep auth action as the rightmost control in the topbar.
    if (isLandlord()) {
      actionsEl.appendChild(myListingLink);
    }
    actionsEl.appendChild(userLabel);
    actionsEl.appendChild(logoutBtn);
  } else {
    const loginBtn = document.createElement("button");
    loginBtn.className = "btn ghost login-btn";
    loginBtn.textContent = "Log in";
    loginBtn.addEventListener("click", openLoginModal);

    // Keep auth action as the rightmost control in the topbar.
    actionsEl.appendChild(loginBtn);
  }
}

// ── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  injectLoginModal();
  updateAuthUI();
});
