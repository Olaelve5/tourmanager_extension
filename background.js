console.log("🚀 [TourManager] Background service worker loaded");

const API_BASE = "https://vm-fantasyapi-production.up.railway.app";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 [TourManager] Background received message:", request.action);

  if (request.action === "fetchSquadTransfers") {
    fetchSquadTransfers(request.squadId, request.token)
      .then((data) => {
        console.log("✅ [TourManager] Fetch success for squad:", request.squadId, data);
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        console.error("❌ [TourManager] Fetch failed for squad:", request.squadId, error.message);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }
});

async function fetchSquadTransfers(squadId, token) {
  const url = `${API_BASE}/squad/view/${squadId}/log`;
  console.log("🌐 [TourManager] Fetching squad log:", url);

  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });
  console.log("🌐 [TourManager] Response status:", response.status);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log("🌐 [TourManager] Squad log data - transfers:", data.transfers);

  const transfers = data.transfers || {};
  return {
    usedTotal: transfers.usedTotal || 0,
    remaining: transfers.remaining || 0,
    budget: transfers.budget || 0,
    byRoundNumber: transfers.byRoundNumber || {},
  };
}
