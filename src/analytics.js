/**
 * Analytics — GA4 Measurement Protocol (MV3 safe — fetch only, no remote scripts)
 */
import { firebaseConfig } from "./firebase-init.js";

async function getClientId() {
  return new Promise((resolve) => {
    const isExtension = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;
    if (!isExtension) {
      let id = localStorage.getItem("ga_client_id");
      if (!id) {
        id = `${Math.random().toString(36).slice(2, 10)}.${Date.now()}`;
        localStorage.setItem("ga_client_id", id);
      }
      resolve(id);
      return;
    }
    chrome.storage.local.get(["ga_client_id"], (result) => {
      if (result.ga_client_id) {
        resolve(result.ga_client_id);
      } else {
        const newId = `${Math.random().toString(36).slice(2, 10)}.${Date.now()}`;
        chrome.storage.local.set({ ga_client_id: newId }, () => resolve(newId));
      }
    });
  });
}

export const trackEvent = async (name, params = {}) => {
  const MEASUREMENT_ID = firebaseConfig?.measurementId;
  const API_SECRET = firebaseConfig?.gaApiSecret;

  if (!API_SECRET || API_SECRET === "YOUR_API_SECRET_HERE") return;

  try {
    const clientId = await getClientId();
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;
    await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        client_id: clientId,
        events: [{ name, params: { ...params, engagement_time_msec: 100 } }],
      }),
    });
  } catch (err) {
    console.error("[Analytics] Error:", err);
  }
};
