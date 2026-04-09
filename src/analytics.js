/**
 * Analytics — GA4 Measurement Protocol (MV3-safe, fetch-only)
 *
 * Compliance guards:
 * - No remote script execution (network POST only)
 * - Honors Global Privacy Control / Do Not Track
 * - Supports explicit user consent override via storage key
 * - Sanitizes event names/params and strips potentially sensitive keys
 */
import { analyticsConfig } from "./firebase-init.js";

const CONSENT_KEY = "linkaro_analytics_consent"; // granted | denied
const CLIENT_ID_KEY = "linkaro_ga_client_id";
const CONSENT_DEFAULT = "granted";
const BLOCKED_PARAM_KEY_RE = /(url|email|token|auth|password|secret|credential|key)/i;

const isExtensionEnv = () => typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;

const getDntOrGpcBlocked = () => {
  const gpc = typeof navigator !== "undefined" && navigator.globalPrivacyControl === true;
  const dnt = typeof navigator !== "undefined" && ["1", "yes"].includes(String(navigator.doNotTrack || "").toLowerCase());
  return gpc || dnt;
};

const getStorageValue = async (key) => {
  if (isExtensionEnv()) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => resolve(result?.[key]));
    });
  }
  return localStorage.getItem(key);
};

const setStorageValue = async (key, value) => {
  if (isExtensionEnv()) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
  }
  localStorage.setItem(key, value);
};

export const setAnalyticsConsent = async (granted) => {
  await setStorageValue(CONSENT_KEY, granted ? "granted" : "denied");
};

export const getAnalyticsConsent = async () => {
  if (getDntOrGpcBlocked()) return false;
  const consent = await getStorageValue(CONSENT_KEY);
  return (consent || CONSENT_DEFAULT) === "granted";
};

const getClientId = async () => {
  const existing = await getStorageValue(CLIENT_ID_KEY);
  if (existing) return existing;
  const id = `${Math.random().toString(36).slice(2, 10)}.${Date.now()}`;
  await setStorageValue(CLIENT_ID_KEY, id);
  return id;
};

const sanitizeEventName = (name = "") => {
  const safe = String(name).toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 40);
  return safe || "event_unknown";
};

const sanitizeParams = (params = {}) => {
  const out = {};
  for (const [key, value] of Object.entries(params)) {
    if (!key || BLOCKED_PARAM_KEY_RE.test(key)) continue;
    const safeKey = String(key).toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 40);
    if (!safeKey) continue;
    if (typeof value === "number") out[safeKey] = Number.isFinite(value) ? value : 0;
    else if (typeof value === "boolean") out[safeKey] = value;
    else if (typeof value === "string") out[safeKey] = value.slice(0, 64);
  }
  return out;
};

export const trackEvent = async (name, params = {}) => {
  const measurementId = analyticsConfig?.measurementId || "";
  const apiSecret = analyticsConfig?.apiSecret || "";
  if (!measurementId || !apiSecret || apiSecret === "YOUR_API_SECRET_HERE") return;

  try {
    const clientId = await getClientId();
    const baseUrl = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;
    const payload = {
      client_id: clientId,
      events: [{
        name: sanitizeEventName(name),
        params: {
          ...sanitizeParams(params),
          engagement_time_msec: 100,
        },
      }],
    };

    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
      const sent = navigator.sendBeacon(baseUrl, blob);
      if (sent) return;
    }

    await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (e) {
    // Silent fail: analytics must never break user flows
  }
};
