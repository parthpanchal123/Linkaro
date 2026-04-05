# Auto-Save Current Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Save Tab" button that automatically captures the active tab's title and URL and saves it to Linkaro.

**Architecture:** 
1.  Extend the Manifest with `activeTab` permissions.
2.  Add a UI control in the popup header.
3.  Implement a handler in `app.js` that uses `chrome.tabs.query` and established Firebase save functions.

**Tech Stack:** Chrome Extension API (Manifest V3), Vanilla JavaScript, Firebase Firestore.

---

### Task 1: Permissions Update

**Files:**
- Modify: `manifest.json`

- [ ] **Step 1: Add activeTab permission**

```json
  "permissions": [
    "identity",
    "activeTab"
  ],
```

- [ ] **Step 2: Verify manifest validity**
Check that no syntax errors were introduced.

- [ ] **Step 3: Commit**

```bash
git add manifest.json
git commit -m "feat: add activeTab permission for auto-save"
```

---

### Task 2: UI Elements

**Files:**
- Modify: `link_index.html`
- Modify: `style.css`

- [ ] **Step 1: Add "Save Tab" button to link_index.html**
Place it inside the `.app-header` div, next to the `#addHeaderBtn`.

```html
<button id="saveTabBtn" class="btn-save-tab" title="Save current tab">
  <i class="fas fa-window-maximize"></i> Save Tab
</button>
```

- [ ] **Step 2: Style the new button in style.css**
Differentiate it slightly from the "+" button while keeping the theme.

```css
.btn-save-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-inverse);
  background: var(--accent-color);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.btn-save-tab:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-save-tab i {
  font-size: 11px;
}
```

- [ ] **Step 3: Verify UI render**
Ensure buttons don't overlap in the header. Adjust `.app-header` flex properties if needed.

- [ ] **Step 4: Commit**

```bash
git add link_index.html style.css
git commit -m "style: add save tab button and styling"
```

---

### Task 3: Core Logic

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Implement title cleaning function**
Add a utility at the top of `app.js` to clean up tab titles (remove site suffixes).

```javascript
const cleanTabTitle = (title) => {
  return title
    .replace(/ - [^-]+$/, "") // Remove " - SiteName"
    .replace(/ \| [^|]+$/, "") // Remove " | SiteName"
    .trim();
};
```

- [ ] **Step 2: Implement handleSaveTabBtnClick**
Handle the Chrome API query and link saving.

```javascript
const handleSaveTabBtnClick = async () => {
  if (!chrome.tabs) {
    showToast("Chrome API not available.");
    return;
  }

  const saveTabBtn = document.getElementById("saveTabBtn");
  const originalHTML = saveTabBtn.innerHTML;
  saveTabBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  saveTabBtn.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      showToast("Could not detect active tab.");
      return;
    }

    if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
      showToast("Internal pages cannot be saved.");
      return;
    }

    const fieldName = cleanTabTitle(tab.title || "New Link");
    const fieldUrl = tab.url;

    if (currentFields.includes(fieldName)) {
      showToast("This link name already exists!");
      // Option: Auto-suffix name if exists
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
    showToast("Failed to save tab.");
  } finally {
    saveTabBtn.innerHTML = originalHTML;
    saveTabBtn.disabled = false;
  }
};
```

- [ ] **Step 3: Register event listener**
Add the listener at the end of the script where other buttons are handled.

```javascript
const saveTabBtn = document.getElementById("saveTabBtn");
if (saveTabBtn) {
  saveTabBtn.addEventListener("click", handleSaveTabBtnClick);
}
```

- [ ] **Step 4: Verify logic consistency**
Check that `addFieldToFirestore` and `saveLinkToFirestore` are used exactly as expected (matched against `firebase-db.js`).

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: implement auto-save tab logic"
```

---

### Task 4: Final Polishing & Testing

- [ ] **Step 1: Check Dark Mode styling**
Ensure the new button looks correct in dark mode using `:root[data-theme="dark"]` styles in `style.css`.

- [ ] **Step 2: Manual checklist**
- Button exists in header.
- Clicking on a regular site (e.g. GitHub) saves it instantly.
- Clicking on a chrome internal page shows an error toast.
- Spinner shows during the save operation.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: final polish for auto-save tab feature"
```
