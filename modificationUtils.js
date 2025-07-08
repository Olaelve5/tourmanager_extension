function modifyHeaderRow(headerRow) {
  // 5. Create a new th element for the rank column.
  const rankHeader = document.createElement("th");
  rankHeader.className = "gwChanges";
  rankHeader.style.fontSize = "15px";
  rankHeader.innerHTML = "Bytter<br>gjort";

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

function modifyTableRows(tableElement) {
  const tbody = tableElement.querySelector("tbody");

  if (!tbody) {
    console.error("Could not find the tbody element inside the table.");
    return;
  }

  const rows = tbody.querySelectorAll("tr");
  rows.forEach((row) => {
    targetTd = row.querySelector("td.gwPoints");
    const changesCell = document.createElement("td");
    changesCell.className = "gwChanges"; // Add a class for styling
    changesCell.textContent = "0 (0)"; // Default value

    if (targetTd) {
      // Insert the new cell before the gwPoints cell
      row.insertBefore(changesCell, targetTd);
      console.log("✅ Added 'Bytter gjort' cell before gwPoints in a row.");
    } else {
      // Fallback: insert at the end if target not found
      row.appendChild(changesCell);
      console.log("✅ Added 'Bytter gjort' cell at the end of a row.");
    }
  });
}

async function testApiCall() {
  try {
    console.log("🔄 Testing API call via background script...");

    // Send message to background script
    const response = await chrome.runtime.sendMessage({
      action: "fetchManagerTransfers",
      fantasyTeamId: "107887829",
    });

    if (response.success) {
      console.log("✅ API call successful via background:", response.data);
      return response.data;
    } else {
      console.error("❌ Background script error:", response.error);
      return null;
    }
  } catch (error) {
    console.error("❌ Failed to communicate with background script:", error);
    return null;
  }
}
