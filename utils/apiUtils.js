const API_BASE = "https://vm-fantasyapi-production.up.railway.app";

function getToken() {
  return localStorage.getItem("token");
}

async function fetchLeaderboardData(leagueId, page = 1) {
  const url = `${API_BASE}/leagues/${leagueId}/leaderboard?page=${page}&limit=30&sortBy=total`;
  console.log("🌐 [TourManager] Fetching leaderboard:", url);

  const token = getToken();
  console.log("🔑 [TourManager] Token:", token ? `found (length: ${token.length})` : "NOT FOUND");

  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { headers, credentials: "include" });
    console.log("🌐 [TourManager] Leaderboard response status:", response.status);

    if (!response.ok) {
      console.error("❌ [TourManager] Leaderboard API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("🌐 [TourManager] Leaderboard data keys:", Object.keys(data));
    return data;
  } catch (error) {
    console.error("❌ [TourManager] Leaderboard fetch error:", error);
    return null;
  }
}

async function fetchAllManagerTransfers(squadIds, round) {
  console.log("📡 [TourManager] fetchAllManagerTransfers called with", squadIds.length, "squads, round:", round);
  const results = {};
  const teamsToFetch = [];
  const token = getToken();

  squadIds.forEach((squadId) => {
    const cached = getCachedTransfers(squadId, round);
    if (cached) {
      results[squadId] = cached;
    } else {
      teamsToFetch.push(squadId);
    }
  });

  if (teamsToFetch.length === 0) {
    console.log("✅ [TourManager] All data from cache!");
    return results;
  }

  console.log("📡 [TourManager] Need to fetch", teamsToFetch.length, "squads");

  const promises = teamsToFetch.map(async (squadId) => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "fetchSquadTransfers",
        squadId: squadId,
        token: token,
      });

      if (response && response.success) {
        setCachedTransfers(squadId, round, response.data);
        return { squadId, data: response.data };
      } else {
        console.error("❌ [TourManager] Failed for squad", squadId, ":", response?.error);
        return { squadId, data: null };
      }
    } catch (error) {
      console.error("❌ [TourManager] Error fetching squad", squadId, ":", error);
      return { squadId, data: null };
    }
  });

  const responses = await Promise.all(promises);
  responses.forEach(({ squadId, data }) => {
    results[squadId] = data;
  });

  console.log("✅ [TourManager] All transfers fetched!");
  return results;
}
