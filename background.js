chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchManagerTransfers") {
    fetchManagerTransfers(request.fantasyTeamId, request.round)
      .then((data) => sendResponse({ success: true, data }))
      .catch((error) => sendResponse({ success: false, error: error.message }));

    // Return true to indicate we will respond asynchronously
    return true;
  }
});

async function fetchManagerTransfers(fantasyTeamId, round) {
  const url = `https://tourmanager-game.api.scoutgg.net/fantasy_teams/${fantasyTeamId}?round=${round}`;
  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0",
        Accept: "application/json",
        "Accept-Language":
          "nb-NO,nb;q=0.9,no-NO;q=0.8,no;q=0.6,nn-NO;q=0.5,nn;q=0.4,en-US;q=0.3,en;q=0.1",
        "Content-Type": "application/json",
        Authorization: "Bearer tourmanager undefined",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        Priority: "u=4",
      },
      referrer: "https://tourmanager.no/",
      method: "GET",
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Extract transfer data
    const gameweekTransfers = data.gameweekTransfers?.length || 0;
    const totalTransfers = data.transferTotal || 0;

    return { gameweekTransfers, totalTransfers };
  } catch (error) {
    console.error(
      `❌ Failed to fetch transfers for team ${fantasyTeamId}:`,
      error
    );
    throw error;
  }
}
