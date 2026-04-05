# Design Spec: Auto-Save Current Tab Feature (Linkaro)

**Date:** 2026-04-05
**Topic:** Auto-Save Current Tab
**Focus:** Productivity & Speed

## 1. Overview
Allow users to save their currently active browser tab to Linkaro with a single click. This minimizes manual data entry (no typing URLs or titles) and improves overall link-saving productivity.

## 2. Technical Architecture

### 2.1 Permissions
- **Manifest V3:** Add `"activeTab"` to the `permissions` array in `manifest.json`. This grants the extension temporary access to the active tab's metadata only when the user interacts with the extension.

### 2.2 User Interface (UI)
- **Component:** A new button `#saveCurrentTabBtn` in the popup header (`link_index.html`).
- **Visuals:** 
    - Text: "Save Tab"
    - Icon: `fas fa-window-maximize`
    - Placement: Next to the existing "Add Link" button in `.app-header`.
- **CSS:** Use existing `.btn-add-link` styles for consistency but differentiate with a primary-action color or icon.

### 2.3 Application Logic (`app.js`)
- **New Handler:** `handleSaveTabBtnClick()`.
- **Flow:**
    1.  Call `chrome.tabs.query({ active: true, currentWindow: true })`.
    2.  Extract `title` and `url`.
    3.  **Clean Title:** Remove common suffixes (e.g., " | Site Name", " - YouTube").
    4.  **Auto-Logic:** 
        - Check if the URL is valid (not `chrome://`).
        - Check if the link already exists in `currentLinks`.
        - If not, save to Firebase via `saveLinkToFirestore`.
        - Add the name to `currentFields` if it's new.
    5.  **Feedback:** 
        - Show a loading spinner on the button.
        - Show a success toast "Link Saved: [Title]".
        - Re-render the UI to show the new link.

## 3. Error Handling
- **Internal Pages:** Disable or hide the button if on a `chrome://` or `edge://` URL.
- **Empty Tabs:** Ignore tabs with no title/URL.
- **Duplicate Links:** Prompt the user if they'd like to update the existing link instead of double-saving.

## 4. Testing Criteria
- [ ] Clicking "Save Tab" correctly saves the title and URL of the active webpage.
- [ ] The link appears instantly in the "Bubbles Area".
- [ ] Toast notification provides clear feedback.
- [ ] No save occurs on internal browser pages.
