# Linkaro Privacy Policy

Last updated: 2026-04-09

## Overview
Linkaro is a browser extension that helps users save and organize links. This policy explains what data is processed, why it is processed, and how users can control it.

## Data We Process

### Account & Authentication
- Account identity data from Google/Firebase Authentication (email address and account identifier).
- Sign-in method used (Google or email/password).

### User-Provided Link Data
- Link names entered by the user (for example "GitHub", "TikTok").
- Link URLs and categories assigned by the user.
- Pin state and custom ordering set by the user.
- Category names created by the user.

### Local Extension Preferences
- Theme preference (light/dark mode).
- Category accordion open/closed state.
- Search and UI interaction state.

### Anonymous Analytics Telemetry
Linkaro collects anonymous usage analytics to understand how the product is used and to help improve it. The following is tracked:

**Events tracked (no personal identifiers are sent):**
- Session start and end events.
- Sign-in method used (Google or email/password) — no email addresses are transmitted.
- When links are added, saved, deleted, selected, or copied — link names are NOT sent.
- When tabs are saved, including duplicates and failures.
- When categories are changed or links are reordered/pinned.
- When search is performed — search text is NOT sent; only the query length and number of results are tracked.
- When theme is toggled (light or dark).
- When the add-link modal or keyboard shortcut is used.

**Per-event context (common parameters, no identifiers):**
- Total number of links in the user's library.
- Number of pinned links.
- Number of categories in use.
- Whether custom ordering has been applied.

**Never tracked:**
- No email addresses, usernames, or account identifiers.
- No link URLs, link names, or category names.
- No search query text.
- No authentication tokens, passwords, or secrets.
- No clipboard content.

**Aggregate usage data stored in Firestore:**
- Daily active usage timestamps per user (for DAU/WAU metrics).
- Counter increments per event type (for aggregate funnels).
- Total link count per user (for usage distribution metrics).

## How Data Is Used
- Account identity data is used to authenticate users and associate their link library with their account.
- User-provided link data is used solely to deliver the core extension functionality: saving, syncing, organizing, searching, and copying links.
- Anonymous telemetry is used to understand product usage patterns and improve the extension.
- Aggregate usage data is used for basic product metrics (for example, how many links users save on average).

## What We Do Not Do
- We do not sell personal data.
- We do not use user data for advertising.
- We do not profile users beyond basic product usage metrics.
- We do not share individual user data with third parties.

## Third-Party Processors
- **Firebase Authentication and Cloud Firestore** (Google) — used as infrastructure for user authentication and data storage.
- **Google Analytics Measurement Protocol** — used to receive anonymous usage events.

## Data Retention
- User data is retained while the account is active.
- Users can delete all their link data at any time by deleting individual links or signing out and contacting support.
- Analytics data is retained per Google Analytics data retention settings.

## Security
- The extension follows Manifest V3 (MV3) and uses a restrictive Content Security Policy.
- Remote script execution is disabled; all extension code runs locally.
- Permissions are limited to those strictly needed for core functionality: identity (sign-in), activeTab (save current tab), storage (local preferences), and favicon (icon rendering).

## User Controls
- Users can delete individual links at any time.
- Users can sign out and remove their account data at any time.
- To request deletion of all data associated with your account, contact the developer.

## Changes to This Policy
This policy may be updated from time to time. The "Last updated" date at the top reflects the most recent revision.

## Contact
- Developer: Parth Panchal
- Project: Linkaro
- GitHub: github.com/parthpanchal123/Linkaro
