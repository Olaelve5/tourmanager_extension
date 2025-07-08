const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function getCachedTransfers(teamId, round) {
  try {
    const cacheKey = `transfers_${teamId}_${round}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        debugLog(`💾 Session cache hit for team ${teamId}`);
        return parsed.data;
      } else {
        // Remove expired cache
        sessionStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    debugError("Cache read error:", error);
  }
  return null;
}

function setCachedTransfers(teamId, round, data) {
  try {
    const cacheKey = `transfers_${teamId}_${round}`;
    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: data,
        timestamp: Date.now(),
      })
    );
    debugLog(`💾 Cached to session storage for team ${teamId}`);
  } catch (error) {
    debugError("Cache write error:", error);
  }
}
