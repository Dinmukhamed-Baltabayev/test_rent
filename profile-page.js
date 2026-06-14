function profilePageStatusLabel(value) {
  if (typeof getStatusLabel === "function") {
    return getStatusLabel(value);
  }

  if (value === "working") return "Working";
  if (value === "studying") return "Studying";
  if (value === "both") return "Studying and working";
  return "";
}

function profilePageReadPhoto(file) {
  if (typeof readFileAsDataURL === "function") {
    return readFileAsDataURL(file);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read the selected photo."));
    reader.readAsDataURL(file);
  });
}

function onLogoutSuccess() {
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof isLoggedIn !== "function" || !isLoggedIn()) {
    window.location.href = "index.html";
    return;
  }

  const form = document.getElementById("profilePageForm");
  const errorEl = document.getElementById("profilePageError");
  const editButton = document.getElementById("profilePageEditButton");
  const saveButton = document.getElementById("profilePageSaveButton");
  const cancelButton = document.getElementById("profilePageCancelButton");
  const deleteButton = document.getElementById("profilePageDeleteButton");

  const fields = {
    name: document.getElementById("profilePageName"),
    username: document.getElementById("profilePageUsername"),
    email: document.getElementById("profilePageEmail"),
    status: document.getElementById("profilePageStatus"),
    gender: document.getElementById("profilePageGender"),
    nationality: document.getElementById("profilePageNationality"),
    photo: document.getElementById("profilePagePhoto")
  };

  const avatar = document.getElementById("profileAvatarPreview");
  const summaryName = document.getElementById("profileSummaryName");
  const summaryMeta = document.getElementById("profileSummaryMeta");
  const nationalityOptionsEl = document.getElementById("profileNationalityOptions");

  let editing = false;
  let currentPhoto = "";

  function getResolvedCurrentUser() {
    const current = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (!current || !current.username) {
      return null;
    }

    if (typeof getResolvedUser === "function") {
      return getResolvedUser(current.username) || current;
    }

    return current;
  }

  function setEditMode(isEditing) {
    editing = isEditing;
    fields.name.disabled = !isEditing;
    fields.email.disabled = !isEditing;
    fields.status.disabled = !isEditing;
    fields.gender.disabled = !isEditing;
    fields.nationality.disabled = !isEditing;
    fields.photo.disabled = !isEditing;
    fields.username.disabled = true;

    const photoLabel = fields.photo?.closest("label");
    if (photoLabel) {
      photoLabel.hidden = !isEditing;
    }

    if (form) {
      form.classList.toggle("is-readonly", !isEditing);
    }

    editButton.hidden = isEditing;
    saveButton.hidden = !isEditing;
    cancelButton.hidden = !isEditing;
    deleteButton.hidden = !isEditing;
  }

  function clearInvalidMarks() {
    Object.values(fields).forEach((field) => field.classList.remove("is-invalid"));
  }

  function fillFormFromUser() {
    const user = getResolvedCurrentUser();
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    const profile = user.profile || {};
    fields.name.value = user.name || "";
    fields.username.value = user.username || "";
    fields.email.value = user.email || "";
    fields.status.value = profile.status || "";
    fields.gender.value = profile.gender || "";
    fields.nationality.value = profile.nationality || "";
    fields.photo.value = "";

    currentPhoto = profile.photoDataUrl || "";
    avatar.src = currentPhoto || "https://via.placeholder.com/120x120.png?text=Profile";
    summaryName.textContent = user.name || "My profile";
    const genderLabel = profile.gender
      ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1).replace(/-/g, " ")
      : "";
    summaryMeta.textContent = [genderLabel, profile.nationality, profilePageStatusLabel(profile.status)].filter(Boolean).join(" • ");

    errorEl.hidden = true;
    clearInvalidMarks();
    setEditMode(false);
  }

  function validateEditableFields() {
    clearInvalidMarks();
    const missing = [];

    if (!fields.name.value.trim()) missing.push(fields.name);
    if (!fields.email.value.trim()) missing.push(fields.email);
    if (!fields.status.value.trim()) missing.push(fields.status);
    if (!fields.gender.value.trim()) missing.push(fields.gender);
    if (!fields.nationality.value.trim()) missing.push(fields.nationality);

    missing.forEach((field) => field.classList.add("is-invalid"));
    if (missing.length > 0) {
      errorEl.textContent = "Please complete the highlighted fields.";
      errorEl.hidden = false;
      return false;
    }

    if (typeof isValidEmail === "function" && !isValidEmail(fields.email.value)) {
      fields.email.classList.add("is-invalid");
      errorEl.textContent = "Please enter a valid email address.";
      errorEl.hidden = false;
      return false;
    }

    return true;
  }

  if (typeof getNationalityOptions === "function") {
    nationalityOptionsEl.innerHTML = getNationalityOptions()
      .map((country) => `<option value="${country}"></option>`)
      .join("");
  }

  Object.values(fields).forEach((field) => {
    if (!field) return;
    field.addEventListener("input", () => field.classList.remove("is-invalid"));
    field.addEventListener("change", () => field.classList.remove("is-invalid"));
  });

  editButton.addEventListener("click", () => {
    setEditMode(true);
    fields.name.focus();
  });

  cancelButton.addEventListener("click", () => {
    fillFormFromUser();
  });

  deleteButton.addEventListener("click", () => {
    const confirmed = window.confirm("Delete your account? This cannot be undone.");
    if (!confirmed) return;

    if (typeof deleteCurrentUserAccount !== "function") {
      errorEl.textContent = "Account deletion is not available.";
      errorEl.hidden = false;
      return;
    }

    const result = deleteCurrentUserAccount();
    if (!result.ok) {
      errorEl.textContent = result.message || "Unable to delete account.";
      errorEl.hidden = false;
      return;
    }

    window.location.href = "index.html";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!editing) return;

    if (!validateEditableFields()) {
      return;
    }

    const newPhoto = fields.photo.files?.[0];
    let nextPhoto = currentPhoto;

    if (newPhoto) {
      try {
        nextPhoto = await profilePageReadPhoto(newPhoto);
      } catch (err) {
        fields.photo.classList.add("is-invalid");
        errorEl.textContent = err.message || "Unable to read the selected photo.";
        errorEl.hidden = false;
        return;
      }
    }

    if (typeof updateCurrentUserProfile !== "function") {
      errorEl.textContent = "Profile update is not available.";
      errorEl.hidden = false;
      return;
    }

    const result = updateCurrentUserProfile({
      name: fields.name.value,
      email: fields.email.value,
      status: fields.status.value,
      gender: fields.gender.value,
      nationality: fields.nationality.value,
      photoDataUrl: nextPhoto
    });

    if (!result.ok) {
      errorEl.textContent = result.message || "Unable to update profile.";
      errorEl.hidden = false;
      return;
    }

    if (typeof updateAuthUI === "function") {
      updateAuthUI();
    }

    fillFormFromUser();
  });

  fillFormFromUser();
});
