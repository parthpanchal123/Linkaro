# Linkaro Privacy Policy

Last updated: 2026-04-09

## Overview
Linkaro is a browser extension that helps users save and organize links. This policy explains what data is processed, why it is processed, and how users can control it.

## Data We Process
- Account identity data from Google/Firebase Authentication (for example, email address and account identifier).
- User-provided link data stored by the user (link names, URLs, categories, pin state, and ordering metadata).
- Local extension preferences (for example, theme and UI state) stored in browser storage/local storage.
- Anonymous analytics telemetry (event names and limited non-sensitive parameters) when enabled.

## How Data Is Used
- To authenticate users and keep their link library associated with their account.
- To save, sync, and display user links across sessions/devices.
- To provide extension features such as search, copy, pinning, categories, and ordering.

## What We Do Not Do
- We do not sell personal data.
- We do not use user data for advertising.

## Analytics and Controls
- Linkaro may send anonymous product analytics events to Google Analytics Measurement Protocol to improve product quality.
- Sensitive values (for example URLs, emails, auth tokens, passwords, secrets) are excluded from analytics payloads.
- Global Privacy Control (GPC) and Do Not Track (DNT) signals are respected.
- Analytics can be controlled via extension runtime setting key `linkaro_analytics_consent` (`granted` or `denied`).
- Users can toggle anonymous analytics from the extension UI.

## Data Sharing and Processors
- Firebase Authentication and Cloud Firestore (Google) are used as infrastructure providers to support authentication and data storage.

## User Controls
- Users can delete individual links in the extension UI.
- Users can sign out at any time.

## Data Retention
- Data is retained while the user account is active, unless deleted by the user.

## Security
- The extension follows Manifest V3 and restrictive Content Security Policy settings.
- Permissions are limited to those needed for core functionality.

## Contact
- Developer: Parth Panchal
- Project: Linkaro
