# Chrome Web Store Compliance Checklist (Linkaro)

Last updated: 2026-04-09

## 1) Permissions and Host Access
- [x] Keep extension permissions minimal: `identity`, `activeTab`, `storage`, `favicon`.
- [x] Avoid `<all_urls>` and broad host permissions.
- [x] Host permissions limited to Firebase/Google API endpoints required by auth/storage flows.

Current permission rationale:
- `identity`: Google sign-in via `chrome.identity`.
- `activeTab`: save current active tab URL/title.
- `storage`: persist local settings/state.
- `favicon`: Chrome-provided `_favicon` endpoint for icon rendering.

## 2) Remote Code and CSP
- [x] No remote JavaScript execution.
- [x] Extension pages load local assets only.
- [x] CSP enforces `script-src 'self'`.

## 3) User Data and Privacy
- [x] Document collected data categories and usage in privacy policy.
- [ ] Publish hosted privacy policy URL and add it to Chrome Web Store listing.
- [ ] Complete Chrome Web Store data disclosure form to match actual behavior.

Analytics disclosure note:
- If analytics is enabled, disclose anonymous telemetry collection and controls.
- Mention DNT/GPC handling and no sensitive fields in telemetry.

## 4) Security Hardening
- [x] Avoid unsafe string interpolation for user-controlled values in `innerHTML`.
- [x] Escape rendered user-controlled text in UI templates.

## 5) Listing and Disclosure Accuracy
- [ ] Ensure listing description matches current implementation.
- [ ] Mention cloud sync/auth dependency on Firebase.
- [ ] Do not claim features not currently enabled.

## 6) Pre-Submission Checks
- [ ] Re-test auth login/logout and save-tab flow.
- [ ] Re-test add/edit/delete/copy/category/pin operations.
- [ ] Re-test search and quick copy interactions.
- [ ] Confirm no console CSP errors on popup/auth pages.
