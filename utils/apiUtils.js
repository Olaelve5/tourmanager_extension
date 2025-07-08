async function fetchAllManagerTransfers(fantasyTeamIds, round) {
  const results = {};
  const teamsToFetch = [];

  // Check if we have cached data for any team
  fantasyTeamIds.forEach((teamId) => {
    const cached = getCachedTransfers(teamId, round);
    if (cached) {
      results[teamId] = cached;
    } else {
      teamsToFetch.push(teamId);
    }
  });

  if (teamsToFetch.length === 0) {
    console.log("✅ All data from cache!");
    return results;
  }

  // Create all promises at once
  const promises = teamsToFetch.map(async (teamId) => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "fetchManagerTransfers",
        fantasyTeamId: teamId,
        round: round,
      });

      if (response.success) {
        // Cache the response
        setCachedTransfers(teamId, round, response.data);
        return { teamId, data: response.data };
      } else {
        console.error(
          `❌ Failed to fetch data for team ${teamId}:`,
          response.error
        );
        if (response.error.includes("status: 429")) {
          return {
            teamId,
            data: {
              gameweekTransfers: "Rate limit exceeded",
              totalTransfers: "Rate limit exceeded",
            },
          };
        }

        return {
          teamId,
          data: { gameweekTransfers: "?", totalTransfers: "?" },
        };
      }
    } catch (error) {
      console.error(`❌ Error fetching team ${teamId}:`, error);
      return { teamId, data: { gameweekTransfers: "?", totalTransfers: "?" } };
    }
  });

  // Wait for all requests to complete
  const responses = await Promise.all(promises);

  // Convert to results object
  responses.forEach(({ teamId, data }) => {
    results[teamId] = data;
  });

  console.log("✅ All transfers fetched!");
  return results;
}
