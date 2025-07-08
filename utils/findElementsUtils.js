function findTableElements() {
  // 1. Find the FIRST host element on the page.
  const pageHost = document.querySelector("smg-leaderboard-page");
  if (!pageHost || !pageHost.shadowRoot) {
    console.error("Could not find <smg-leaderboard-page> or its shadowRoot.");
    return {
      headerRow: null,
      tableElement: null,
      round: 0, // Default round value, will cause error
    };
  }
  console.log("✅ Found outer host: smg-leaderboard-page");

  // Find the round
  const round = pageHost.hasAttribute("round")
    ? parseInt(pageHost.getAttribute("round"))
    : 0;
  console.log(`📊 Current round: ${round}`);

  // 2. Go inside its shadowRoot to find the target element.
  const leaderboardHost = pageHost.shadowRoot.querySelector(
    "ft-leaderboard-rank"
  );
  if (!leaderboardHost || !leaderboardHost.shadowRoot) {
    console.error(
      "Could not find <ft-leaderboard-rank> inside the first shadowRoot."
    );
    return {
      headerRow: null,
      tableElement: null,
      round: round, // Return the found round
    };
  }
  console.log("✅ Found inner host: ft-leaderboard-rank");

  // 3. Find the table element inside the shadowRoot of the leaderboard host.
  const tableElement = leaderboardHost.shadowRoot.querySelector("table");

  if (!tableElement) {
    console.error("Could not find the table element inside the shadowRoot.");
    return {
      headerRow: null,
      tableElement: null,
      round: round, // Return the found round
    };
  }

  console.log("✅ Found the table element inside the shadowRoot.");

  // 4. Find the thead element inside the table and the tr element inside the thead.
  const headerRow = tableElement.querySelector("thead tr");
  if (!headerRow) {
    console.error("Could not find the thead element inside the table.");
    return {
      headerRow: null,
      tableElement: null,
      round: round, // Return the found round
    };
  }

  return {
    headerRow: headerRow,
    tableElement: tableElement,
    round: round, // Return the found round
  };
}

function getUserIds(tableElement) {
  const userIds = [];

  if (!tableElement) {
    console.error("Could not find table to extract user IDs");
    return userIds;
  }

  // Find all ft-link elements within the table
  const linkElements = tableElement.querySelectorAll(
    "ft-link[href*='/dashboard/']"
  );

  linkElements.forEach((linkElement) => {
    const href = linkElement.getAttribute("href");
    if (href) {
      // Extract the fantasyTeamId (second number) from: /dashboard/998580/107884227
      const matches = href.match(/\/dashboard\/\d+\/(\d+)/);
      if (matches && matches[1]) {
        const fantasyTeamId = matches[1];
        userIds.push(fantasyTeamId);
      }
    }
  });

  return userIds;
}
