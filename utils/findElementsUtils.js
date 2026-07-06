function findTableElements() {
  console.log("🔎 [TourManager] findTableElements() - searching regular DOM...");

  // Look for a table element on the page
  const tables = document.querySelectorAll("table");
  console.log("🔎 [TourManager] Found", tables.length, "table(s) on page");

  if (tables.length === 0) {
    return { headerRow: null, tableElement: null };
  }

  // Use the first table (or find the leaderboard-specific one)
  let tableElement = null;
  for (const table of tables) {
    // Look for a table that has manager/team-related content
    const text = table.textContent || "";
    if (text.includes("TOTALT") || text.includes("LAG") || text.includes("MANAGER")) {
      tableElement = table;
      console.log("🔎 [TourManager] Found leaderboard table by content match");
      break;
    }
  }

  if (!tableElement) {
    tableElement = tables[0];
    console.log("🔎 [TourManager] Using first table as fallback");
  }

  const headerRow = tableElement.querySelector("thead tr") || tableElement.querySelector("tr:first-child");
  console.log("🔎 [TourManager] Header row:", !!headerRow);

  if (headerRow) {
    const headers = Array.from(headerRow.querySelectorAll("th, td")).map(el => el.textContent.trim());
    console.log("🔎 [TourManager] Headers found:", headers);
  }

  return { headerRow, tableElement };
}
