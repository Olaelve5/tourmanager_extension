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

    if (transfersData && linkElements[index]) {
      const href = linkElements[index].getAttribute("href");
      const matches = href?.match(/\/dashboard\/\d+\/(\d+)/);
      const teamId = matches?.[1];

      if (teamId && transfersData[teamId]) {
        const { gameweekTransfers, totalTransfers } = transfersData[teamId];

        // Handle rate limit exceeded or error states
        if (
          (typeof totalTransfers === "string" &&
            totalTransfers.includes("Rate")) ||
          (typeof gameweekTransfers === "string" &&
            gameweekTransfers.includes("Rate"))
        ) {
          changesCell.textContent = "rate limit exceeded";
          changesCell.style.color = "orange";
          return;
        }

        changesCell.textContent = `${totalTransfers} (${gameweekTransfers})`;
      } else {
        changesCell.textContent = "- (-)"; // Error state
      }
    } else {
      changesCell.textContent = "laster..."; // Loading state
    }
  });
}


