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
const customModal = document.getElementById("customModal");
const modalInput = document.getElementById("modalInput");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const modalOkBtn = document.getElementById("modalOkBtn");

const confirmModal = document.getElementById("confirmModal");
const confirmModalTitle = document.getElementById("confirmModalTitle");
const confirmModalDesc = document.getElementById("confirmModalDesc");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");
const confirmOkBtn = document.getElementById("confirmOkBtn");
if (themeToggleBtn) {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  themeToggleBtn.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

  themeToggleBtn.addEventListener("click", () => {
    let theme = document.documentElement.getAttribute('data-theme') || 'light';
    let newTheme = theme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    themeToggleBtn.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    trackEvent('theme_toggled', { theme: newTheme });
  });
}

let currentUser = null;
let currentFields = [];
let currentLinks = {};
let activeField = null;
let searchQuery = "";

const searchClearBtn = document.getElementById("searchClearBtn");
const linkCountEl = document.getElementById("linkCount");

let searchTimeout;
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase();
    if (searchClearBtn) {
      searchClearBtn.classList.toggle("visible", searchQuery.length > 0);
    }
    renderAllFields();
    
    // Tracking search
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (searchQuery.length > 1) trackEvent('search_performed', { query: searchQuery });
    }, 1000);
  });
}

if (searchClearBtn) {
  searchClearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    searchClearBtn.classList.remove("visible");
    renderAllFields();
    searchInput.focus();
  });
}

const showPromptModal = () => {
  return new Promise((resolve) => {
    const modalUrlInput = document.getElementById("modalUrlInput");
    modalInput.value = "";
    if (modalUrlInput) modalUrlInput.value = "";
    customModal.classList.add("show");
    setTimeout(() => modalInput.focus(), 50);
    
    const cleanup = () => {
      customModal.classList.remove("show");
      modalOkBtn.removeEventListener("click", handleOk);
      modalCancelBtn.removeEventListener("click", handleCancel);
      modalInput.removeEventListener("keydown", handleKey);
      if (modalUrlInput) modalUrlInput.removeEventListener("keydown", handleKey);
    };

    const handleOk = () => {
      cleanup();
      resolve({ name: modalInput.value, url: modalUrlInput ? modalUrlInput.value : "" });
    };
    const handleCancel = () => {
      cleanup();
      resolve(null);
    };
    const handleKey = (e) => {
      if (e.key === "Enter") handleOk();
      if (e.key === "Escape") handleCancel();
    };

    modalOkBtn.addEventListener("click", handleOk);
    modalCancelBtn.addEventListener("click", handleCancel);
    modalInput.addEventListener("keydown", handleKey);
    if (modalUrlInput) modalUrlInput.addEventListener("keydown", handleKey);
  });
};

const showConfirmModal = (title, description) => {
  return new Promise((resolve) => {
    if(title) confirmModalTitle.textContent = title;
    if(description) confirmModalDesc.textContent = description;
    confirmModal.classList.add("show");
    
    setTimeout(() => confirmCancelBtn.focus(), 50);

    const cleanup = () => {
      confirmModal.classList.remove("show");
      confirmOkBtn.removeEventListener("click", handleOk);
      confirmCancelBtn.removeEventListener("click", handleCancel);
      document.removeEventListener("keydown", handleKey);
    };

    const handleOk = () => {
      cleanup();
      resolve(true);
    };
    const handleCancel = () => {
      cleanup();
      resolve(false);
    };
    const handleKey = (e) => {
      if (confirmModal.classList.contains("show")) {
        if (e.key === "Enter") handleOk();
        if (e.key === "Escape") handleCancel();
      }
    };

    confirmOkBtn.addEventListener("click", handleOk);
    confirmCancelBtn.addEventListener("click", handleCancel);
    document.addEventListener("keydown", handleKey);
  });
};

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

  // Show shimmer placeholder, then swap to favicon once loaded
  const shimId = `fav_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  setTimeout(() => {
    const el = document.getElementById(shimId);
    if (!el) return;
    const img = new Image();
    img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    img.style.cssText = "width:16px;height:16px;border-radius:2px;vertical-align:middle;display:inline-block;";
    img.onload = () => { if (el) el.replaceWith(img); };
    img.onerror = () => { if (el) el.outerHTML = '<i class="fas fa-link"></i>'; };
  }, 10);
  return `<span id="${shimId}" class="favicon-shimmer"></span>`;
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
    trackEvent('login', { method: 'google', email: user.email });

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
  
  // Update link count badge
  if (linkCountEl) {
    const total = currentFields.length;
    linkCountEl.textContent = total > 0 ? `${total} link${total !== 1 ? 's' : ''}` : '';
  }
  
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
    activeField = null;
  }

  // Render Bubbles with staggered animation
  displayFields.forEach((fieldName, index) => {
    const bubble = document.createElement("button");
    bubble.classList.add("bubble");
    if (fieldName === activeField) bubble.classList.add("active");
    bubble.style.animationDelay = `${index * 35}ms`;
    
    bubble.innerHTML = `${getIconHTML(fieldName, currentLinks[fieldName])} <span class="bubble-text" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">${fieldName}</span>`;
    
    bubble.addEventListener("click", () => {
      activeField = fieldName;
      renderAllFields();
      trackEvent('link_selected', { name: fieldName });
    });
    bubblesArea.appendChild(bubble);
  });

  // Render Active Field Row or Empty State
  if (activeField) {
    renderActiveRow(activeField, currentLinks[activeField] || "");
  } else {
    if (searchQuery) {
      activeFieldArea.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-search"></i></div>
          <div class="empty-state-title">No matches found</div>
          <div class="empty-state-desc">No links match "${searchQuery}".<br>Try a different search.</div>
        </div>`;
    } else {
      activeFieldArea.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-link"></i></div>
          <div class="empty-state-title">No links yet</div>
          <div class="empty-state-desc">Add your first link to start<br>building your collection.</div>
          <button class="btn-add-link" onclick="document.getElementById('addHeaderBtn').click()">
            <i class="fas fa-plus"></i> Add Link
          </button>
        </div>`;
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
      trackEvent('link_saved', { name: fieldName });
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
      trackEvent('link_copied', { name: fieldName });
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
    const isConfirmed = await showConfirmModal("Delete Link", `Are you sure you want to delete "${fieldName}"?`);
    if (!isConfirmed) return;
    deleteBtn.disabled = true;
    try {
      await deleteFieldFromFirestore(currentUser.uid, fieldName);
      currentFields = currentFields.filter((f) => f !== fieldName);
      delete currentLinks[fieldName];
      activeField = null; // Forces recalculation of activeField
      renderAllFields();
      trackEvent('link_deleted', { name: fieldName });
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
  const result = await showPromptModal();
  if (!result || !result.name || !result.name.trim()) return;

  let fieldName = result.name.trim();
  let fieldUrl = (result.url || "").trim();

  // Smartly extract domain if user mistakenly pasted a full URL as the name
  if (fieldName.startsWith("http://") || fieldName.startsWith("https://")) {
    // If they pasted a URL as the name and left URL blank, use it as the URL too
    if (!fieldUrl) fieldUrl = fieldName;
    try {
      const urlObj = new URL(fieldName);
      let host = urlObj.hostname.replace(/^www\./i, "");
      let parts = host.split('.');
      let cleanName = parts.length > 1 ? parts[parts.length - 2] : parts[0];
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
    currentLinks[fieldName] = fieldUrl;
    activeField = fieldName;

    // If a URL was provided, save it immediately
    if (fieldUrl) {
      await saveLinkToFirestore(currentUser.uid, fieldName, fieldUrl);
    }

    renderAllFields();
    showToast(fieldName + " added ✓");
    trackEvent('link_added', { name: fieldName, has_url: !!fieldUrl });
  } catch (error) {
    showToast("Failed to add field. Try again.");
  }
};

// Handle all 'Add Link' buttons (Header and Empty State) via delegation
document.addEventListener("click", (e) => {
  if (e.target.closest(".btn-add-link")) {
    handleAddClick();
  }
});

// ===== Sign Out =====
signOutBtn.addEventListener("click", () => {
  trackEvent('logout');
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
