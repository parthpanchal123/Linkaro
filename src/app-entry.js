/**
 * app-entry.js — Module entry for Linkaro main app
 * Imports auth, db, and analytics from modular sources and exposes them globally
 * so the existing app.js (which was written as a global-scope script) works unchanged.
 */
import { auth } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "firebase/auth/web-extension";
import {
  initUserData,
  saveLinkToFirestore,
  addFieldToFirestore,
  deleteFieldFromFirestore,
  updateFieldMetadata,
  saveReorderedFields,
} from "./firebase-db.js";
import { trackEvent } from "./analytics.js";

// Expose everything as globals so the existing app.js code works without any changes
window.auth = auth;
window.onAuthStateChanged = onAuthStateChanged;
window.signOut = () => signOut(auth);
window.initUserData = initUserData;
window.saveLinkToFirestore = saveLinkToFirestore;
window.addFieldToFirestore = addFieldToFirestore;
window.deleteFieldFromFirestore = deleteFieldFromFirestore;
window.updateFieldMetadata = updateFieldMetadata;
window.saveReorderedFields = saveReorderedFields;
window.trackEvent = trackEvent;
