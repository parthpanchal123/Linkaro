# Linkaro Analytics Events

Last updated: 2026-04-09

This document defines product analytics events emitted by Linkaro.

## Privacy Rules
- Do not send direct identifiers (email, uid, token, secret, password).
- Do not send raw URLs or freeform user text.
- Keep event params small, typed, and non-sensitive.
- Respect consent, DNT, and GPC signals.

## Common Parameters
Most app events include these auto-attached fields:
- `total_links` (number)
- `pinned_links` (number)
- `categories_count` (number)
- `has_custom_order` (boolean)

## Session and Auth
- `session_started`
  - Params: `surface` (`popup`)
- `session_ended`
- `auth_session_active`
  - Params: `provider`
- `auth_login_success`
  - Params: `method` (`email` | `google`)
- `auth_signup_success`
  - Params: `method` (`email`)
- `auth_login_failed`
  - Params: `method`, `code`

## Link Lifecycle
- `link_added`
  - Params: `source` (`manual`), `has_url` (boolean)
- `link_saved`
  - Params: `source` (`editor` | `save_tab`)
- `link_deleted`
- `link_selected`
- `link_copied`
  - Params: `source` (`pill` | `editor`)

## Save Tab
- `save_tab_clicked`
- `save_tab_duplicate`
- `save_tab_failed`

## Organization
- `category_changed`
- `pin_toggled`
  - Params: `pinned` (boolean)
- `links_reordered`
  - Params: `in_pinned` (boolean)

## Discovery and UX
- `search_performed`
  - Params: `query_length` (number), `results_count` (number)
- `theme_toggled`
  - Params: `theme` (`light` | `dark`)
- `add_link_modal_opened`
- `add_shortcut_used`
- `link_add_failed`

## Consent Controls
- Runtime helpers are exposed globally:
  - `setAnalyticsConsent(true|false)`
  - `getAnalyticsConsent()`
- Storage key: `linkaro_analytics_consent` (`granted` | `denied`)

## Firestore Aggregate Counters
To support baseline product metrics even when telemetry is blocked by privacy signals, Linkaro also updates Firestore counters:

- `users/{uid}/usage/summary`
  - `counters.<event_name>` incremented for selected product events
  - `updatedAt`
- `users/{uid}/activity/{YYYY-MM-DD}`
  - `lastSeenAt` for daily active tracking
- `users/{uid}.stats`
  - `totalLinks`
  - `updatedAt`
