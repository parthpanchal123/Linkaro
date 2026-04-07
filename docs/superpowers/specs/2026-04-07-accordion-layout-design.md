# Design Spec: Linkaro Category Accordion Architecture

## Overview
As Linkaro scales and the user accumulates extensive links and categories, the vertical list layout introduces navigation fatigue and breaks UX scale limits. This design converts category sections into interactive collapsible accordions to solve vertical container bloat, maintaining a condensed view of all categorized links.

## Architecture & State Management
- **Persistence Mechanism:** A generic `linkaro_category_state` dictionary object serialized to browser `localStorage` will track the exact `boolean` expansion state per category key.
- **Default State Values:** Any newly created category defaults to `true` (open). The standard "Pinned" system category defaults permanently to `true` on cold loads to retain priority visual access.

## UI/UX Implementation Details (`app.js`)
- The plain DOM `<h3>` headers generating category titles will be completely stripped and swapped out for a fully interactive HTML `<button class="category-header">` node.
- Sub-elements of the header will inject semantic `fa-chevron-down` and `fa-chevron-right` FontAwesome markers bound explicitly to the state node.
- Click events attached to `.category-header` will instantly invert the tracked `localStorage` state map and trigger UI repaints or directly toggle `.collapsed` tags over `.bubbles-container` for instantaneous DOM execution.

## Animation Mechanics (`style.css`)
- Pure CSS Grid animation (`grid-template-rows: 0fr` vs `1fr`) combined with an internal nested wrapper will execute the transition to perform ultra-smooth physics-based accordion expansions overriding standard box-model heights without jank.
- Elements will receive a strict `overflow: hidden` barrier combined with `.category-header:hover` background highlights to adhere seamlessly to `ui-ux-pro-max` tactile feedback requirements. 

## Edge Cases Resolved
- **Drag & Drop:** Collapsible dimensions reduce `container.style.height` to essentially 0. Users attempting horizontal reordering into collapsed columns won't trigger the drop-targets. Mitigation accepted via alternative dropdown modification in the link editor for these instances natively.
