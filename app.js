/**
 * Linkaro — Main Application
 * Depends on: firebase-config.js, firebase-db.js
 */

const cleanTabTitle = (title) => {
  return title
    .replace(/ - [^-]+$/, "") // Remove " - SiteName"
    .replace(/ \| [^|]+$/, "") // Remove " | SiteName"
    .trim();
};

const inferSiteFromUrl = (url) => {
  if (!url) return "";
  try {
    const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
    let host = urlObj.hostname.replace('www.', '');
    
    // TLDs to strip for simple clean names
    const tlds = ['.com', '.org', '.net', '.edu', '.gov', '.io', '.me', '.app', '.dev', '.pk', '.in'];
    tlds.forEach(tld => {
      if (host.endsWith(tld)) host = host.slice(0, -tld.length);
    });

    const path = urlObj.pathname.split('/').filter(Boolean);
    const originalHost = urlObj.hostname.replace('www.', '');
    
    // Profiles/Products logic for major sites
    const complexSites = ['github.com', 'twitter.com', 'x.com', 'instagram.com', 'linkedin.com', 'youtube.com'];
    if (complexSites.includes(originalHost) && path.length > 0) {
      const siteName = host.charAt(0).toUpperCase() + host.slice(1);
      // Clean up common path segments like 'u/', 'p/', etc if needed, 
      // but usually the first segment is the handle.
      if (path[0] !== 'watch' && path[0] !== 'channel') {
        return `${siteName} - ${path[0]}`;
      }
    }

    return host.charAt(0).toUpperCase() + host.slice(1);
  } catch (e) { return ""; }
};

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
const searchArea = document.querySelector(".search-area");
const instructionText = document.getElementById("instructionText");
const linkCountBadge = document.querySelector(".link-count");

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
let currentMetadata = {};
let activeField = null;
let searchQuery = "";

// Category Accordion State Handlers
const getCategoryStates = () => {
  try {
    const data = localStorage.getItem('linkaro_category_state');
    return data ? JSON.parse(data) : {};
  } catch(e) { return {}; }
};

const toggleCategoryState = (cat) => {
  const states = getCategoryStates();
  const currentState = states.hasOwnProperty(cat) ? states[cat] : true;
  states[cat] = !currentState;
  localStorage.setItem('linkaro_category_state', JSON.stringify(states));
  return states[cat];
};

const isCategoryOpen = (cat) => {
  if (cat === "Pinned") return true; // Always true
  const states = getCategoryStates();
  return states.hasOwnProperty(cat) ? states[cat] : true; // Default to true if not found
};

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
      if (modalUrlInput) {
        modalUrlInput.removeEventListener("keydown", handleKey);
        modalUrlInput.removeEventListener("blur", handleUrlBlur);
      }
    };

    const handleUrlBlur = () => {
      const currentName = modalInput.value.trim();
      const currentUrl = modalUrlInput.value.trim();
      // Only infer if user hasn't manually typed a name yet
      if (!currentName && currentUrl) {
         const inferred = inferSiteFromUrl(currentUrl);
         if (inferred) {
            modalInput.value = inferred;
            // Visual feedback that the field was auto-filled
            modalInput.style.transition = "background-color 0.5s ease";
            modalInput.style.backgroundColor = "rgba(148, 163, 184, 0.15)";
            setTimeout(() => modalInput.style.backgroundColor = "", 1000);
         }
      }
    };

    const handleOk = () => {
      const name = modalInput.value.trim();
      if (!name) {
        // Validation: Shake the modal if empty
        const content = customModal.querySelector('.modal');
        if (content) {
          content.classList.remove('shake');
          void content.offsetWidth; // Trigger reflow
          content.classList.add('shake');
        }
        modalInput.focus();
        return;
      }
      cleanup();
      resolve({ name: name, url: modalUrlInput ? modalUrlInput.value.trim() : "" });
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
    if (modalUrlInput) {
      modalUrlInput.addEventListener("keydown", handleKey);
      modalUrlInput.addEventListener("blur", handleUrlBlur);
    }
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

const showSimplePromptModal = (title, description, placeholder = "Type here...") => {
  return new Promise((resolve) => {
    const pModal = document.getElementById("simplePromptModal");
    const pTitle = document.getElementById("promptModalTitle");
    const pDesc = document.getElementById("promptModalDesc");
    const pInput = document.getElementById("promptModalInput");
    const pOkBtn = document.getElementById("promptModalOkBtn");
    const pCancelBtn = document.getElementById("promptModalCancelBtn");

    if (pTitle) pTitle.textContent = title;
    if (pDesc) pDesc.textContent = description;
    if (pInput) {
      pInput.placeholder = placeholder;
      pInput.value = "";
    }

    pModal.classList.add("show");
    setTimeout(() => { if(pInput) pInput.focus(); }, 50);

    const cleanup = () => {
      pModal.classList.remove("show");
      pOkBtn.removeEventListener("click", handleOk);
      pCancelBtn.removeEventListener("click", handleCancel);
      document.removeEventListener("keydown", handleKey);
    };

    const handleOk = () => {
      const val = pInput ? pInput.value.trim() : "";
      if (!val) {
        const content = pModal.querySelector('.modal');
        if (content) {
          content.classList.remove('shake');
          void content.offsetWidth;
          content.classList.add('shake');
        }
        if (pInput) pInput.focus();
        return;
      }
      cleanup();
      resolve(val);
    };

    const handleCancel = () => {
      cleanup();
      resolve(null);
    };

    const handleKey = (e) => {
      if (pModal.classList.contains("show")) {
        if (e.key === "Enter") handleOk();
        if (e.key === "Escape") handleCancel();
      }
    };

    pOkBtn.addEventListener("click", handleOk);
    pCancelBtn.addEventListener("click", handleCancel);
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
      currentMetadata = data.metadata || {};

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
    if (total > 0) {
      linkCountEl.textContent = `${total} link${total !== 1 ? 's' : ''}`;
      linkCountEl.style.display = "inline-flex";
    } else {
      linkCountEl.textContent = "";
      linkCountEl.style.display = "none";
    }
  }
  
  let displayFields = currentFields;
  if (searchQuery) {
    displayFields = currentFields.filter((fieldName) => {
      const matchName = fieldName.toLowerCase().includes(searchQuery);
      const url = currentLinks[fieldName] || "";
      const matchUrl = url.toLowerCase().includes(searchQuery);
      
      const meta = currentMetadata[fieldName] || {};
      const cat = (meta.category || "Uncategorized").toLowerCase();
      const matchCat = cat.includes(searchQuery);
      
      return matchName || matchUrl || matchCat;
    });
  }

  const instructionText = document.getElementById("instructionText");
  if (instructionText) {
    instructionText.style.display = displayFields.length > 0 ? "flex" : "none";
  }

  if (displayFields.length > 0) {
    if (!displayFields.includes(activeField)) {
      activeField = null; // Don't auto-select initially
    }
  } else {
    activeField = null;
  }

  // Group fields
  let pinnedFields = [];
  let categoryGroups = {};

  displayFields.forEach(fieldName => {
    const meta = currentMetadata[fieldName] || {};
    if (meta.isPinned) {
      pinnedFields.push(fieldName);
    } else {
      const cat = meta.category || "Uncategorized";
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(fieldName);
    }
  });

  const createBubble = (fieldName, index) => {
    const bubble = document.createElement("button");
    bubble.classList.add("bubble");
    if (fieldName === activeField) bubble.classList.add("active");
    bubble.style.animationDelay = `${index * 15}ms`;
    bubble.setAttribute("draggable", "true");
    bubble.setAttribute("data-field-name", fieldName);
    
    bubble.innerHTML = `${getIconHTML(fieldName, currentLinks[fieldName])} <span class="bubble-text" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">${fieldName}</span>`;
    
    bubble.addEventListener("click", () => {
      activeField = fieldName;
      renderAllFields();
      trackEvent('link_selected', { name: fieldName });
    });
    return bubble;
  };

  const makeContainerSortable = (container, categoryName) => {
    container.classList.add("bubbles-container");
    container.setAttribute("data-category", categoryName);
    
    let draggedElement = null;

    container.addEventListener("dragstart", (e) => {
      if (!e.target.classList.contains("bubble")) return;
      draggedElement = e.target;
      e.target.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", e.target.getAttribute("data-field-name"));
      // Needed for Chrome/Windows dragging bug
      setTimeout(() => e.target.style.opacity = "0.5", 0); 
    });

    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const target = e.target.closest(".bubble");
      if (target && target !== draggedElement && target.parentNode === container) {
        const rect = target.getBoundingClientRect();
        const next = (e.clientX - rect.left) / (rect.right - rect.left) > 0.5;
        container.insertBefore(draggedElement, next && target.nextSibling || target);
      }
    });

    container.addEventListener("dragend", async (e) => {
      e.target.classList.remove("dragging");
      e.target.style.opacity = "1";
      if (draggedElement) {
        const newCategory = draggedElement.closest(".bubbles-container").getAttribute("data-category");
        const fieldName = draggedElement.getAttribute("data-field-name");
        
        // Re-scrape the new order from DOM
        const newFieldsOrder = [];
        document.querySelectorAll(".bubble").forEach(b => {
           let name = b.getAttribute("data-field-name");
           if(!newFieldsOrder.includes(name)) newFieldsOrder.push(name);
        });
        
        // Only elements visible are in newFieldsOrder. Merge with hidden (searched out) ones.
        // It's safer to just reorder if there's no search query
        if (!searchQuery && newFieldsOrder.length === currentFields.length) {
          currentFields = newFieldsOrder;
          await saveReorderedFields(currentUser.uid, currentFields);
          
          if (newCategory && newCategory !== "Pinned") {
            if (!currentMetadata[fieldName]) currentMetadata[fieldName] = {};
            if (currentMetadata[fieldName].category !== newCategory) {
              currentMetadata[fieldName].category = newCategory;
              await updateFieldMetadata(currentUser.uid, fieldName, { category: newCategory });
            }
          }
        }
      }
    });
  };

  let globalIndex = 0;

  if (pinnedFields.length > 0) {
    const groupEl = document.createElement("div");
    groupEl.classList.add("category-section");
    groupEl.innerHTML = `<button class="category-header" disabled style="cursor: default;">
      <span><i class="fas fa-thumbtack"></i> Pinned</span>
    </button>`;
    
    // We don't need a wrapper for Pinned since it doesn't collapse, but we use the same structure for consistency
    const gridWrapper = document.createElement("div");
    gridWrapper.classList.add("bubbles-grid-wrapper");
    
    const container = document.createElement("div");
    makeContainerSortable(container, "Pinned");
    pinnedFields.forEach((fieldName) => {
      container.appendChild(createBubble(fieldName, globalIndex++));
    });
    
    gridWrapper.appendChild(container);
    groupEl.appendChild(gridWrapper);
    bubblesArea.appendChild(groupEl);
  }

  Object.keys(categoryGroups).sort().forEach(cat => {
    const groupEl = document.createElement("div");
    groupEl.classList.add("category-section");
    const isOpen = isCategoryOpen(cat);
    groupEl.innerHTML = `<button class="category-header">
      <span>${cat}</span>
      <i class="fas fa-chevron-${isOpen ? 'down' : 'right'}"></i>
    </button>`;
    
    const gridWrapper = document.createElement("div");
    gridWrapper.classList.add("bubbles-grid-wrapper");
    if (!isOpen) gridWrapper.classList.add("collapsed");
    
    const container = document.createElement("div");
    makeContainerSortable(container, cat);
    categoryGroups[cat].forEach((fieldName) => {
      container.appendChild(createBubble(fieldName, globalIndex++));
    });
    
    gridWrapper.appendChild(container);
    groupEl.appendChild(gridWrapper);
    
    const headerBtn = groupEl.querySelector(".category-header");
    headerBtn.addEventListener("click", () => {
      const newState = toggleCategoryState(cat);
      headerBtn.querySelector("i.fa-chevron-down, i.fa-chevron-right").className = `fas fa-chevron-${newState ? 'down' : 'right'}`;
      if (newState) {
        gridWrapper.classList.remove("collapsed");
      } else {
        gridWrapper.classList.add("collapsed");
      }
    });

    bubblesArea.appendChild(groupEl);
  });

  // Render Active Field Row or Empty State
  if (activeField) {
    renderActiveRow(activeField, currentLinks[activeField] || "");
  } else {
    if (searchQuery && displayFields.length === 0) {
      activeFieldArea.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-search"></i></div>
          <div class="empty-state-title">No matches found</div>
          <div class="empty-state-desc">No links match "${searchQuery}".<br>Try a different search.</div>
        </div>`;
    } else if (currentFields.length === 0) {
      activeFieldArea.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-link"></i></div>
          <div class="empty-state-title">Your digital hub is a bit lonely...</div>
          <div class="empty-state-desc">Add your first link to start your empire.</div>
          <button class="btn-add-link" style="margin-top: 20px;">
            <i class="fas fa-plus"></i> Add First Link
          </button>
        </div>`;
    } else {
      activeFieldArea.innerHTML = "";
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

  // Close Button for the Sticky Sheet
  const closeBtn = document.createElement("button");
  closeBtn.classList.add("btn-close-editor");
  closeBtn.innerHTML = '<i class="fas fa-times"></i>';
  closeBtn.title = "Close Editor";
  closeBtn.addEventListener("click", () => {
    activeField = null;
    renderAllFields();
  });
  inputGroup.appendChild(closeBtn);

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

  const meta = currentMetadata[fieldName] || {};
  const isPinned = meta.isPinned || false;

  const pinBtn = document.createElement("button");
  pinBtn.classList.add("btn-copy"); // utilizing existing subtle styling
  pinBtn.innerHTML = isPinned ? '<i class="fas fa-thumbtack" style="opacity: 0.5;"></i> Unpin' : '<i class="fas fa-thumbtack"></i> Pin';
  pinBtn.title = isPinned ? "Unpin link" : "Pin link";
  pinBtn.addEventListener("click", async () => {
    const newState = !isPinned;
    
    if (newState) {
      const pinnedCount = Object.values(currentMetadata).filter(m => m.isPinned).length;
      if (pinnedCount >= 5) {
        showToast("Maximum of 5 pins allowed!");
        return;
      }
    }

    if (!currentMetadata[fieldName]) currentMetadata[fieldName] = {};
    const oldState = currentMetadata[fieldName].isPinned;
    currentMetadata[fieldName].isPinned = newState;
    
    try {
      await updateFieldMetadata(currentUser.uid, fieldName, { isPinned: newState });
      renderAllFields();
      showToast(newState ? "Pinned" : "Unpinned");
    } catch (e) {
      console.error(e);
      showToast("Failed to pin. Try again.");
      currentMetadata[fieldName].isPinned = oldState; // revert locally
    }
  });

  const categorySelect = document.createElement("select");
  categorySelect.classList.add("category-select");
  const categories = [...new Set(Object.values(currentMetadata).map(m => m.category).filter(Boolean))];
  if (!categories.includes("Uncategorized")) categories.push("Uncategorized");
  
  categorySelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  categorySelect.innerHTML += `<option value="__new__">+ New Category...</option>`;
  categorySelect.value = meta.category || "Uncategorized";
  
  categorySelect.addEventListener("change", async (e) => {
    let newCat = e.target.value;
    if (newCat === "__new__") {
       newCat = await showSimplePromptModal("New Category", "Enter new category name:");
       if (!newCat || !newCat.trim()) {
          categorySelect.value = meta.category || "Uncategorized";
          return;
       }
       newCat = newCat.trim();
    }
    const oldCat = currentMetadata[fieldName]?.category || "Uncategorized";
    if (!currentMetadata[fieldName]) currentMetadata[fieldName] = {};
    currentMetadata[fieldName].category = newCat;
    
    try {
      await updateFieldMetadata(currentUser.uid, fieldName, { category: newCat });
      renderAllFields();
      showToast(`Moved to ${newCat}`);
    } catch (err) {
      console.error(err);
      showToast("Failed to move category.");
      currentMetadata[fieldName].category = oldCat;
      categorySelect.value = oldCat;
    }
  });

  const optionsGroup = document.createElement("div");
  optionsGroup.classList.add("field-options-group");
  optionsGroup.style.display = "flex";
  optionsGroup.style.alignItems = "center";
  optionsGroup.style.gap = "8px";
  optionsGroup.appendChild(categorySelect);
  optionsGroup.appendChild(pinBtn);

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
  row.appendChild(optionsGroup);
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
  if (e.target.closest("#saveTabBtn")) {
    handleSaveTabBtnClick();
  }
});

const handleSaveTabBtnClick = async () => {
  if (typeof chrome === "undefined" || !chrome.tabs) {
    showToast("Extension API not available.");
    return;
  }

  const saveTabBtn = document.getElementById("saveTabBtn");
  const originalHTML = saveTabBtn.innerHTML;
  saveTabBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  saveTabBtn.style.opacity = "0.7";
  saveTabBtn.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      showToast("Could not detect active tab.");
      return;
    }

    if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:")) {
      showToast("Internal pages cannot be saved.");
      return;
    }

    const fieldName = cleanTabTitle(tab.title || "New Link");
    const fieldUrl = tab.url;

    if (currentFields.includes(fieldName)) {
      showToast(`"${fieldName}" is already saved!`);
      activeField = fieldName;
      renderAllFields();
    } else {
      await addFieldToFirestore(currentUser.uid, fieldName);
      currentFields.push(fieldName);
      currentLinks[fieldName] = fieldUrl;
      await saveLinkToFirestore(currentUser.uid, fieldName, fieldUrl);
      
      activeField = fieldName;
      renderAllFields();
      showToast(`${fieldName} saved! ✓`);
      trackEvent('link_saved_auto', { name: fieldName });
    }
  } catch (error) {
    console.error(error);
    showToast("Failed to save. Try again.");
  } finally {
    saveTabBtn.innerHTML = originalHTML;
    saveTabBtn.style.opacity = "1";
    saveTabBtn.disabled = false;
  }
};

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
  
  if (searchArea) searchArea.style.display = show ? "none" : "block";
  if (instructionText) instructionText.style.display = show ? "none" : (currentFields.length > 0 ? "flex" : "none");
  if (linkCountBadge) {
    if (show) {
      linkCountBadge.style.display = "none";
    } else if (currentFields.length > 0) {
      linkCountBadge.style.display = "inline-flex";
    } else {
      linkCountBadge.style.display = "none";
    }
  }
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

// Click Outside to Close Editor
document.addEventListener("mousedown", (e) => {
  if (!activeField) return;
  
  const isOuterClick = !e.target.closest(".active-field-area") && 
                       !e.target.closest(".bubble") &&
                       !e.target.closest(".modal-overlay") &&
                       !e.target.closest(".btn-add-link") &&
                       !e.target.closest(".btn-save-tab") &&
                       !e.target.closest(".user-bar") &&
                       !e.target.closest(".app-header") &&
                       !e.target.closest(".category-header");

  if (isOuterClick) {
    activeField = null;
    renderAllFields();
  }
});

// Escape Key to Close Editor
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const isModalOpen = document.querySelector(".modal-overlay.show");
    if (!isModalOpen && activeField) {
      activeField = null;
      renderAllFields();
    }
  }
});
