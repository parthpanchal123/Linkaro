/**
 * Linkaro — Main Application
 * Depends on: firebase-config.js, firebase-db.js
 */

// DOM References
const addNewBtn = document.getElementById("addNewBtn");
const linksDiv = document.querySelector(".links-area");
const signOutBtn = document.getElementById("signOutBtn");
const userEmailEl = document.getElementById("userEmail");
const loadingEl = document.getElementById("loading");
const toastEl = document.getElementById("toast");

let currentUser = null;
let currentFields = [];

// ===== Icon Map =====
const iconsHash = {
  Github: "fab fa-github",
  Linkedin: "fab fa-linkedin",
  Twitter: "fab fa-twitter",
  Portfolio: "fas fa-globe",
  Email: "fas fa-envelope",
  Dev: "fab fa-dev",
  Dribbble: "fab fa-dribbble",
};

// ===== Auth State Listener =====
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "auth.html";
    return;
  }

  currentUser = user;
  userEmailEl.textContent = user.email;
  showLoading(true);

  try {
    const data = await initUserData(user.uid);
    currentFields = data.fields || [];
    renderAllFields(data);
  } catch (error) {
    console.error("Failed to load data:", error);
    showToast("Failed to load links. Check your connection.");
  } finally {
    showLoading(false);
  }
});

// ===== Rendering =====
const renderAllFields = (data) => {
  linksDiv.innerHTML = "";
  const fields = data.fields || [];
  const links = data.links || {};

  fields.forEach((fieldName) => {
    renderField(fieldName, links[fieldName] || "");
  });
};

const renderField = (fieldName, fieldValue) => {
  const row = document.createElement("div");
  row.classList.add("field-row");
  row.setAttribute("data-field", fieldName);

  // Icon
  const icon = document.createElement("i");
  icon.classList.add("field-icon");
  const iconClass = iconsHash[fieldName] || "fas fa-link";
  icon.classList.add(...iconClass.split(" "));

  // Input
  const input = document.createElement("input");
  input.setAttribute("placeholder", fieldName);
  input.setAttribute("type", "text");
  input.setAttribute("id", "field-" + fieldName);
  input.value = fieldValue;

  // Save button
  const saveBtn = document.createElement("button");
  saveBtn.classList.add("btn-save");
  saveBtn.innerHTML = '<i class="fas fa-check"></i>';
  saveBtn.title = "Save";
  saveBtn.addEventListener("click", async () => {
    const url = input.value;
    saveBtn.disabled = true;
    try {
      await saveLinkToFirestore(currentUser.uid, fieldName, url);
      showToast(fieldName + " saved ✓");
    } catch (error) {
      showToast("Failed to save. Try again.");
    } finally {
      saveBtn.disabled = false;
    }
  });

  // Copy button
  const copyBtn = document.createElement("button");
  copyBtn.classList.add("btn-copy");
  copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
  copyBtn.title = "Copy to clipboard";
  copyBtn.addEventListener("click", async () => {
    const url = input.value;
    if (!url) {
      showToast("No link to copy ❌");
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("Copied: " + url);
    } catch (error) {
      showToast("Clipboard permission denied.");
    }
  });

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("btn-delete");
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.title = "Delete field";
  deleteBtn.addEventListener("click", async () => {
    if (!confirm('Delete "' + fieldName + '"?')) return;
    deleteBtn.disabled = true;
    try {
      await deleteFieldFromFirestore(currentUser.uid, fieldName);
      currentFields = currentFields.filter((f) => f !== fieldName);
      row.remove();
      showToast(fieldName + " deleted");
    } catch (error) {
      showToast("Failed to delete. Try again.");
      deleteBtn.disabled = false;
    }
  });

  // Assemble row
  row.appendChild(icon);
  row.appendChild(input);
  row.appendChild(saveBtn);
  row.appendChild(copyBtn);
  row.appendChild(deleteBtn);
  linksDiv.appendChild(row);
};

// ===== Add New Field =====
addNewBtn.addEventListener("click", async () => {
  const fieldName = prompt("Enter a new field name:");
  if (!fieldName || !fieldName.trim()) return;

  const trimmed = fieldName.trim();

  if (currentFields.includes(trimmed)) {
    showToast("This field already exists!");
    return;
  }

  try {
    await addFieldToFirestore(currentUser.uid, trimmed);
    currentFields.push(trimmed);
    renderField(trimmed, "");
    showToast(trimmed + " added ✓");
  } catch (error) {
    showToast("Failed to add field. Try again.");
  }
});

// ===== Sign Out =====
signOutBtn.addEventListener("click", () => {
  auth.signOut();
});

// ===== Helpers =====
const showLoading = (show) => {
  loadingEl.style.display = show ? "flex" : "none";
  linksDiv.style.display = show ? "none" : "block";
};

let toastTimeout;
const showToast = (message) => {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2500);
};
