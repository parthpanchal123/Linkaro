/**
 * Linkaro — Main Application
 * Depends on: firebase-config.js, firebase-db.js
 */

// DOM References
const bubblesArea = document.getElementById("bubblesArea");
const activeFieldArea = document.getElementById("activeFieldArea");
const signOutBtn = document.getElementById("signOutBtn");
const userEmailEl = document.getElementById("userEmail");
const loadingEl = document.getElementById("loading");
const toastEl = document.getElementById("toast");
const searchInput = document.getElementById("searchInput");

let currentUser = null;
let currentFields = [];
let currentLinks = {};
let activeField = null;
let searchQuery = "";

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderAllFields();
  });
}

// ===== Icon Map & Dynamic Fetcher =====
const getIconHTML = (fieldName, url) => {
  const knownFA = {
    github: "fab fa-github",
    linkedin: "fab fa-linkedin",
    twitter: "fab fa-twitter",
    portfolio: "fas fa-globe",
    email: "fas fa-envelope",
    gmail: "fab fa-google",
    dev: "fab fa-dev",
    dribbble: "fab fa-dribbble",
    instagram: "fab fa-instagram",
    youtube: "fab fa-youtube",
    facebook: "fab fa-facebook",
    reddit: "fab fa-reddit",
    tiktok: "fab fa-tiktok",
    twitch: "fab fa-twitch",
    discord: "fab fa-discord",
    medium: "fab fa-medium",
    figma: "fab fa-figma",
    slack: "fab fa-slack",
    x: "fab fa-twitter",
    snapchat: "fab fa-snapchat",
    pinterest: "fab fa-pinterest"
  };

  const lower = fieldName.toLowerCase();
  
  if (knownFA[lower]) {
    return `<i class="${knownFA[lower]}"></i>`;
  }

  // Ensure we have a valid domain to query Google Favicon
  let domain = lower.replace(/[^a-z0-9]/g, "") + ".com";
  if (url && url.startsWith("http")) {
    try {
      domain = new URL(url).hostname;
    } catch(e) {}
  }

  return `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=32" style="width:16px;height:16px;border-radius:2px;vertical-align:middle;margin-right:0px;display:inline-block;" onerror="this.outerHTML='<i class=\\'fas fa-link\\'></i>'" />`;
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
    currentLinks = data.links || {};

    // Auto-migrate 'Email' to 'Gmail' across the database automatically
    if (currentFields.includes("Email")) {
      const idx = currentFields.indexOf("Email");
      currentFields[idx] = "Gmail";
      currentLinks["Gmail"] = currentLinks["Email"] || "";
      delete currentLinks["Email"];
      
      const docRef = db.collection("users").doc(user.uid);
      await docRef.set({
        fields: currentFields,
        links: currentLinks
      }, { merge: true });
    }

    renderAllFields();
  } catch (error) {
    console.error("Failed to load data:", error);
    showToast("Failed to load links. Check your connection.");
  } finally {
    showLoading(false);
  }
});

// ===== Rendering =====
const renderAllFields = () => {
  bubblesArea.innerHTML = "";
  activeFieldArea.innerHTML = "";
  
  let displayFields = currentFields;
  if (searchQuery) {
    displayFields = currentFields.filter((fieldName) => {
      const matchName = fieldName.toLowerCase().includes(searchQuery);
      const url = currentLinks[fieldName] || "";
      const matchUrl = url.toLowerCase().includes(searchQuery);
      return matchName || matchUrl;
    });
  }

  if (displayFields.length > 0) {
    if (!displayFields.includes(activeField)) {
      if (displayFields.includes("Gmail")) activeField = "Gmail";
      else activeField = displayFields[0];
    }
  } else {
    activeField = null; // deselect if filtered out to zero
  }

  // Render Bubbles
  displayFields.forEach((fieldName) => {
    const bubble = document.createElement("button");
    bubble.classList.add("bubble");
    if (fieldName === activeField) bubble.classList.add("active");
    
    bubble.innerHTML = `${getIconHTML(fieldName, currentLinks[fieldName])} <span class="bubble-text" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">${fieldName}</span>`;
    
    bubble.addEventListener("click", () => {
      activeField = fieldName;
      renderAllFields();
    });
    bubblesArea.appendChild(bubble);
  });

  // Add Button Bubble
  const addBtn = document.createElement("button");
  addBtn.classList.add("bubble", "bubble-add");
  addBtn.innerHTML = `<i class="fas fa-plus"></i> New Link`;
  addBtn.addEventListener("click", handleAddClick);
  bubblesArea.appendChild(addBtn);

  // Render Active Field Row
  if (activeField) {
    renderActiveRow(activeField, currentLinks[activeField] || "");
  } else {
    if (searchQuery) {
      activeFieldArea.innerHTML = `<div class="info-bar" style="margin-top:20px;">No matches found for "${searchQuery}"</div>`;
    } else {
      activeFieldArea.innerHTML = `<div class="info-bar" style="margin-top:20px;">No links yet. Add one above!</div>`;
    }
  }
};

const renderActiveRow = (fieldName, fieldValue) => {
  activeFieldArea.innerHTML = "";
  
  const row = document.createElement("div");
  row.classList.add("field-row");
  row.setAttribute("data-field", fieldName);

  // Icon Wrapper
  const iconWrapper = document.createElement("span");
  iconWrapper.classList.add("field-icon");
  iconWrapper.innerHTML = getIconHTML(fieldName, fieldValue);

  // Input
  const input = document.createElement("input");
  input.setAttribute("placeholder", "https://url-for-" + fieldName);
  input.setAttribute("type", "text");
  input.setAttribute("id", "field-" + fieldName);
  input.value = fieldValue;

  const inputGroup = document.createElement("div");
  inputGroup.classList.add("field-input-group");
  inputGroup.appendChild(iconWrapper);
  inputGroup.appendChild(input);

  // Save button
  const saveBtn = document.createElement("button");
  saveBtn.classList.add("btn-save");
  saveBtn.innerHTML = '<i class="fas fa-check"></i> Save';
  saveBtn.title = "Save";
  saveBtn.addEventListener("click", async () => {
    const url = input.value.trim();
    
    if (!url) {
      showToast("Link cannot be empty! ❌");
      input.focus();
      return;
    }

    saveBtn.disabled = true;
    try {
      await saveLinkToFirestore(currentUser.uid, fieldName, url);
      currentLinks[fieldName] = url;
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
  copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
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
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
  deleteBtn.title = "Delete field";
  deleteBtn.addEventListener("click", async () => {
    if (!confirm('Delete "' + fieldName + '"?')) return;
    deleteBtn.disabled = true;
    try {
      await deleteFieldFromFirestore(currentUser.uid, fieldName);
      currentFields = currentFields.filter((f) => f !== fieldName);
      delete currentLinks[fieldName];
      activeField = null; // Forces recalculation of activeField
      renderAllFields();
      showToast(fieldName + " deleted");
    } catch (error) {
      showToast("Failed to delete. Try again.");
      deleteBtn.disabled = false;
    }
  });

  const actionGroup = document.createElement("div");
  actionGroup.classList.add("field-actions");
  
  const rightActions = document.createElement("div");
  rightActions.style.display = "flex";
  rightActions.style.gap = "8px";
  rightActions.style.marginLeft = "auto";
  
  rightActions.appendChild(copyBtn);
  rightActions.appendChild(saveBtn);
  
  actionGroup.appendChild(deleteBtn);
  actionGroup.appendChild(rightActions);

  row.appendChild(inputGroup);
  row.appendChild(actionGroup);
  activeFieldArea.appendChild(row);
};

// ===== Add New Field =====
const handleAddClick = async () => {
  let fieldName = prompt("Enter a link name (e.g. Github, TikTok):");
  if (!fieldName || !fieldName.trim()) return;

  fieldName = fieldName.trim();

  // Smartly extract domain if user mistakenly pasted a full URL
  if (fieldName.startsWith("http://") || fieldName.startsWith("https://")) {
    try {
      const urlObj = new URL(fieldName);
      let host = urlObj.hostname.replace(/^www\./i, "");
      let parts = host.split('.');
      let cleanName = parts.length > 1 ? parts[parts.length - 2] : parts[0];
      // Check for two-part TLDs like .co.uk
      if (['co', 'com', 'org', 'net', 'edu', 'gov'].includes(cleanName.toLowerCase()) && parts.length > 2) {
          cleanName = parts[parts.length - 3];
      }
      fieldName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    } catch (e) {}
  }

  if (currentFields.includes(fieldName)) {
    showToast("This field already exists!");
    return;
  }

  try {
    await addFieldToFirestore(currentUser.uid, fieldName);
    currentFields.push(fieldName);
    currentLinks[fieldName] = "";
    activeField = fieldName;
    renderAllFields();
    showToast(fieldName + " added ✓");
  } catch (error) {
    showToast("Failed to add field. Try again.");
  }
};

// ===== Sign Out =====
signOutBtn.addEventListener("click", () => {
  auth.signOut();
});

// ===== Helpers =====
const showLoading = (show) => {
  loadingEl.style.display = show ? "flex" : "none";
  bubblesArea.style.display = show ? "none" : "flex";
  activeFieldArea.style.display = show ? "none" : "flex";
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
