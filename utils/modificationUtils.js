function modifyHeaderRow(headerRow) {
  // Don't add if already exists
  if (headerRow.querySelector("th.gwChanges")) return;

  const rankHeader = document.createElement("th");
  rankHeader.className = "gwChanges";
  rankHeader.style.fontSize = "12px";
  rankHeader.style.fontWeight = "bold";
  rankHeader.style.color = "#f0f0f093";
  rankHeader.style.textAlign = "center";
  rankHeader.style.verticalAlign = "middle";
  rankHeader.style.padding = "8px";
  rankHeader.textContent = "Bytter Brukt";

  // Find the round score column (second to last) and insert before it
  const headers = Array.from(headerRow.querySelectorAll("th"));
  // Headers: #, '', '', Lag, Manager, FerdigeSpilt, Runde X, Totalt
  // We want to insert before "Runde X" (second to last)
  const roundHeader = headers.length >= 2 ? headers[headers.length - 2] : null;
  if (roundHeader) {
    headerRow.insertBefore(rankHeader, roundHeader);
  } else {
    headerRow.appendChild(rankHeader);
  }
  console.log("📝 [TourManager] Header modified");
}

function modifyTableRows(tableElement, numEntries) {
  const tbody = tableElement.querySelector("tbody");
  if (!tbody) return;

  const rows = tbody.querySelectorAll("tr");
  rows.forEach((row) => {
    // Don't add if already exists
    if (row.querySelector("td.gwChanges")) return;

    const changesCell = document.createElement("td");
    changesCell.className = "gwChanges";
    changesCell.style.textAlign = "center";
    changesCell.style.padding = "8px";
    changesCell.style.fontSize = "14px";
    changesCell.style.fontWeight = "bold";
    changesCell.textContent = "...";

    // Insert before second-to-last cell (round score column)
    const cells = Array.from(row.querySelectorAll("td"));
    const roundCell = cells.length >= 2 ? cells[cells.length - 2] : null;
    if (roundCell) {
      row.insertBefore(changesCell, roundCell);
    } else {
      row.appendChild(changesCell);
    }
  });
}

function modifyTableRowsWithData(tableElement, entries, transfersData) {
  const tbody = tableElement.querySelector("tbody");
  if (!tbody) return;

  const rows = tbody.querySelectorAll("tr");
  console.log("📝 [TourManager] Updating", rows.length, "rows with transfer data");

  rows.forEach((row, index) => {
    let changesCell = row.querySelector("td.gwChanges");
    if (!changesCell) return;

    const entry = entries[index];
    if (!entry) {
      changesCell.textContent = "-";
      return;
    }

    const squadId = entry.squadId;
    const transferData = transfersData[squadId];

    if (transferData) {
      changesCell.innerHTML = `${transferData.usedTotal}<span style="color: gray; font-size: 0.75em;">/25</span>`;
      changesCell.title = `Brukt: ${transferData.usedTotal} / ${transferData.budget} | Gjenstår: ${transferData.remaining}`;
    } else {
      changesCell.textContent = "?";
      changesCell.style.color = "gray";
    }
  });
}
