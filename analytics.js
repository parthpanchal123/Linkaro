/**
 * Linkaro Analytics — GA4 Measurement Protocol
 * Standard Google Analytics snippets don't work in Manifest V3 due to CSP.
 * This helper sends events directly via fetch to your GA4 endpoint.
 */

async function getClientId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['ga_client_id'], (result) => {
      if (result.ga_client_id) {
        resolve(result.ga_client_id);
      } else {
        const newId = `${Math.random().toString(36).slice(2, 10)}.${Date.now()}`;
        chrome.storage.local.set({ ga_client_id: newId }, () => resolve(newId));
      }
    });
  });
}

/**
 * Send an event to GA4
 * @param {string} name - Event name (e.g., 'link_added', 'search_performed')
 * @param {object} params - Key-value pair of extra info
 */
window.trackEvent = async (name, params = {}) => {
  const MEASUREMENT_ID = firebaseConfig?.measurementId;
  const API_SECRET = firebaseConfig?.gaApiSecret;

  // If no API secret is provided, just log to console to avoid errors
  if (!API_SECRET || API_SECRET === 'YOUR_API_SECRET_HERE') {
    console.warn(`[Analytics] Tracked: ${name}`, params, '(API Secret missing, not sent to GA)');
    return;
  }

  try {
    const clientId = await getClientId();
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

    await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        events: [{
          name: name,
          params: {
            ...params,
            engagement_time_msec: 100, // GA4 requirement for active sessions
          }
        }]
      })
    });
    console.log(`[Analytics] Sent: ${name}`, params);
  } catch (err) {
    console.error('[Analytics] Error:', err);
  }
};
