# Category Accordion Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform vertically bloated category link lists into interactive nested CSS Grid accordions using saved localStorage states.

**Architecture:** We will replace the native category `<h3>` titles with styled buttons enclosing text and caret icons. Clicking them will invert their saved `localStorage` open/closed state. `bubbles-container` divs will use `grid-template-rows: 0fr` switching to `1fr` to provide elegant CSS expansions.

**Tech Stack:** Vanilla JavaScript, HTML5 LocalStorage, CSS3 Grid.

---

### Task 1: Initialize Accordion Local Storage State Utilities

**Files:**
- Modify: `c:\Users\parth\Projects\Linkaro\app.js`

- [ ] **Step 1: Add utility logic to load accordion state**
Add these global state handlers near line 55 (below `let searchQuery = "";`):

```javascript
const getCategoryStates = () => {
  try {
    const data = localStorage.getItem('linkaro_category_state');
    return data ? JSON.parse(data) : {};
  } catch(e) { return {}; }
};

const toggleCategoryState = (cat) => {
  const states = getCategoryStates();
  // If not previously saved, default to true, so toggling makes it false
  const currentState = states.hasOwnProperty(cat) ? states[cat] : true;
  states[cat] = !currentState;
  localStorage.setItem('linkaro_category_state', JSON.stringify(states));
  return states[cat];
};

const isCategoryOpen = (cat) => {
  if (cat === "Pinned") return true; // Always true
  const states = getCategoryStates();
  return states.hasOwnProperty(cat) ? states[cat] : false;
};
```

- [ ] **Step 2: Commit**

```bash
git add app.js
git commit -m "feat: add category accordion localStorage state utilities"
```

### Task 2: Inject UI Headers and Toggle Interactivity

**Files:**
- Modify: `c:\Users\parth\Projects\Linkaro\app.js`

- [ ] **Step 1: Update the rendering of pinned fields**

Replace the line `groupEl.innerHTML = '<h3 class="category-title"><i class="fas fa-thumbtack"></i> Pinned</h3>';` around line 390 with:

```javascript
    groupEl.innerHTML = `<button class="category-header" disabled style="cursor: default;">
      <span><i class="fas fa-thumbtack"></i> Pinned</span>
    </button>`;
```
*(Pinned category shouldn't collapse per the spec)*

- [ ] **Step 2: Update the rendering of standard category headers**

Replace the line `groupEl.innerHTML = '<h3 class="category-title">${cat}</h3>';` inside the `Object.keys(categoryGroups)` loop around line 403 with:

```javascript
    const isOpen = isCategoryOpen(cat);
    groupEl.innerHTML = `<button class="category-header">
      <span>${cat}</span>
      <i class="fas fa-chevron-${isOpen ? 'down' : 'right'}"></i>
    </button>`;
```

- [ ] **Step 3: Setup grid wrapper container & click handlers for categories**

In the loop, before `bubblesArea.appendChild(groupEl);`:
Currently it is:
```javascript
    const container = document.createElement("div");
    makeContainerSortable(container, cat);
    categoryGroups[cat].forEach((fieldName) => {
      container.appendChild(createBubble(fieldName, globalIndex++));
    });
    groupEl.appendChild(container);
```

Modify this entire block to inject a wrapper for smooth grid animations:

```javascript
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
      headerBtn.querySelector(".fa-chevron-down, .fa-chevron-right").className = \`fas fa-chevron-\${newState ? 'down' : 'right'}\`;
      if (newState) {
        gridWrapper.classList.remove("collapsed");
      } else {
        gridWrapper.classList.add("collapsed");
      }
    });
```

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: render interactive UI accordions for categories"
```

### Task 3: CSS Implementations & Animation Logic

**Files:**
- Modify: `c:\Users\parth\Projects\Linkaro\style.css`

- [ ] **Step 1: Add new styles**
Append the following CSS to `style.css` (or replace the `.category-title` block):

```css
/* Category Headers */
.category-header {
  width: 100%;
  background: transparent;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
}

.category-header:hover:not([disabled]) {
  background: rgba(148, 163, 184, 0.1);
  color: var(--text-primary);
}

.category-header i {
  font-size: 11px;
}

/* Category Grid Accordion Implementation */
.bubbles-grid-wrapper {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bubbles-grid-wrapper.collapsed {
  grid-template-rows: 0fr;
}

.bubbles-container {
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 8px;
}
```

- [ ] **Step 2: Cleanup `style.css`**
Remove `.bubbles-container` duplicate definition containing old flex settings if it conflicts. Also delete `.category-title` since it is deprecated.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "style: implement CSS grid accordion transition mechanics"
```
