# Linkaro Analytics Events

Last updated: 2026-04-09

This document defines product analytics events emitted by Linkaro.

 ## Privacy Rules
- No direct identifiers are sent (email, uid, token, password, secret).
- No raw URLs or freeform user text are sent.
- Event params are small, typed, and non-sensitive.
- Search query text is never transmitted — only query length and result count.

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

## Firestore Aggregate Counters
For baseline product metrics, Linkaro updates Firestore counters:

- `users/{uid}/usage/summary`
  - `counters.<event_name>` incremented for selected product events
  - `updatedAt`
- `users/{uid}/activity/{YYYY-MM-DD}`
  - `lastSeenAt` for daily active tracking
- `users/{uid}.stats`
  - `totalLinks`
  - `updatedAt`
