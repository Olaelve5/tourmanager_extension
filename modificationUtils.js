function modifyHeaderRow(headerRow) {
  // 5. Create a new th element for the rank column.
  const rankHeader = document.createElement("th");
  rankHeader.className = "gwChanges";
  rankHeader.style.fontSize = "15px";
  rankHeader.style.textAlign = "center";
  rankHeader.style.verticalAlign = "middle";
  rankHeader.innerHTML = "Bytter brukt <br> (denne runden)";

  // Find the specific th element with classes gwPoints and sortable
  const targetTh = headerRow.querySelector("th.gwPoints.sortable");

  if (targetTh) {
    headerRow.insertBefore(rankHeader, targetTh);
    console.log("✅ Added 'Bytter gjort' header before gwPoints column.");
  } else {
    // Fallback: insert at the beginning if target not found
    headerRow.insertBefore(rankHeader, headerRow.firstChild);
    console.log(
      "✅ Added 'Bytter gjort' header at the beginning (target not found)."
    );
  }
}

function modifyTableRows(tableElement, transfersData = null) {
  const tbody = tableElement.querySelector("tbody");

  if (!tbody) {
    console.error("Could not find the tbody element inside the table.");
    return;
  }

  const linkElements = tableElement.querySelectorAll(
    "ft-link[href*='/dashboard/']"
  );
  const rows = tbody.querySelectorAll("tr");

  rows.forEach((row, index) => {
    targetTd = row.querySelector("td.gwPoints");
    let changesCell = row.querySelector("td.gwChanges");

    if (!changesCell) {
      changesCell = document.createElement("td");
      changesCell.className = "gwChanges";
      changesCell.style.textAlign = "center";
    }

    if (targetTd) {
      row.insertBefore(changesCell, targetTd);
    } else {
      row.appendChild(changesCell);
    }

    changesCell.textContent = "0 (0)"; // Default value

    if (transfersData && linkElements[index]) {
      const href = linkElements[index].getAttribute("href");
      const matches = href?.match(/\/dashboard\/\d+\/(\d+)/);
      const teamId = matches?.[1];

      if (teamId && transfersData[teamId]) {
        const { gameweekTransfers, totalTransfers } = transfersData[teamId];
        changesCell.textContent = `${totalTransfers} (${gameweekTransfers})`;
      } else {
        changesCell.textContent = "- (-)"; // Error state
      }
    } else {
      changesCell.textContent = "laster..."; // Loading state
    }
  });
}

async function fetchAllManagerTransfers(fantasyTeamIds) {
  const results = {};

  // Loop outside - handle each request individually
  for (const teamId of fantasyTeamIds) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "fetchManagerTransfers",
        fantasyTeamId: teamId,
      });

      if (response.success) {
        results[teamId] = response.data;
      } else {
        console.error(
          `❌ Failed to fetch data for team ${teamId}:`,
          response.error
        );
        results[teamId] = { gameweekTransfers: "?", totalTransfers: "?" };
      }
    } catch (error) {
      console.error(`❌ Error fetching team ${teamId}:`, error);
      results[teamId] = { gameweekTransfers: "?", totalTransfers: "?" };
    }
  }

  return results;
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
