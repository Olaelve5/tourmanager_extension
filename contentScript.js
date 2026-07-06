console.log("🚀 [TourManager] Content script loaded on:", window.location.href);

let hasModified = false;
let lastEntryIds = "";
let tableObserverSetup = false;
let isRunning = false;

function isLeaguePage() {
  return window.location.pathname.includes("/leagues/");
}

function getLeagueId() {
  const match = window.location.pathname.match(/\/leagues\/([a-f0-9-]+)/);
  return match ? match[1] : null;
}

function getCurrentPage() {
  // Check the pagination span: "Side X av Y"
  const pageInfo = document.querySelector("span.page-info");
  if (pageInfo) {
    const match = pageInfo.textContent.match(/Side\s+(\d+)/);
    if (match) {
      console.log("📄 [TourManager] Detected page from span:", match[1]);
      return parseInt(match[1]);
    }
  }

  // Fallback: URL query params
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("page")) {
    return parseInt(urlParams.get("page")) || 1;
  }

  return 1;
}

async function startModification() {
  if (isRunning) return false;
  isRunning = true;

  try {
    console.log("🔧 [TourManager] startModification() called");
    const { headerRow, tableElement } = findTableElements();

    if (!headerRow || !tableElement) {
      console.warn("⚠️ [TourManager] Missing table elements");
      return false;
    }

    const leagueId = getLeagueId();
    if (!leagueId) return false;

    const page = getCurrentPage();
    console.log("📄 [TourManager] Current page:", page);

    // Fetch leaderboard data for current page
    const leaderboardData = await fetchLeaderboardData(leagueId, page);
    if (!leaderboardData) {
      console.error("❌ [TourManager] Failed to fetch leaderboard data");
      return false;
    }

    // Check if entries changed
    const currentEntryIds = leaderboardData.entries.map(e => e.squadId).join(",");
    if (currentEntryIds === lastEntryIds && tableElement.querySelector("th.gwChanges")) {
      console.log("✅ [TourManager] Same entries, already modified");
      return true;
    }
    lastEntryIds = currentEntryIds;

    console.log("📊 [TourManager] Got", leaderboardData.entries.length, "entries");

    // Remove existing gwChanges columns
    tableElement.querySelectorAll("th.gwChanges, td.gwChanges").forEach(el => el.remove());

    modifyHeaderRow(headerRow);
    modifyTableRows(tableElement);

    const squadIds = leaderboardData.entries.map(e => e.squadId);
    const round = leaderboardData.latestScoredRound;

    console.log("🔄 [TourManager] Fetching transfers for", squadIds.length, "squads");
    const allTransfers = await fetchAllManagerTransfers(squadIds, round);
    if (!allTransfers) return false;

    modifyTableRowsWithData(tableElement, leaderboardData.entries, allTransfers);
    console.log("✅ [TourManager] Done!");

    hasModified = true;
    return true;
  } finally {
    isRunning = false;
  }
}

function attemptModification() {
  if (!isLeaguePage()) return;

  let attempts = 0;
  const intervalId = setInterval(async () => {
    attempts++;
    const success = await startModification();
    if (success) {
      clearInterval(intervalId);
      setupTableObserver();
    }
  }, 500);

  setTimeout(() => clearInterval(intervalId), 10000);
}

function setupTableObserver() {
  if (tableObserverSetup) return;

  const pageInfo = document.querySelector("span.page-info");
  let lastPageText = pageInfo?.textContent || "";
  let debounceTimer = null;

  const handlePageChange = () => {
    const currentPageText = pageInfo?.textContent || "";
    if (currentPageText === lastPageText) return;
    lastPageText = currentPageText;

    // Immediately show loading state
    const { tableElement } = findTableElements();
    if (tableElement) {
      tableElement.querySelectorAll("td.gwChanges").forEach(el => el.textContent = "...");
    }

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log("🔀 [TourManager] Page changed to:", currentPageText);
      lastEntryIds = "";
      startModification();
    }, 500);
  };

  if (pageInfo) {
    const pageObserver = new MutationObserver(handlePageChange);
    pageObserver.observe(pageInfo, { characterData: true, childList: true, subtree: true });
    console.log("👁️ [TourManager] Pagination observer active");
  }

  tableObserverSetup = true;
}

// Initial attempt
attemptModification();

// Watch for SPA navigation
let currentUrl = window.location.href;
const navObserver = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    console.log("🔀 [TourManager] URL changed");
    currentUrl = window.location.href;
    hasModified = false;
    lastEntryIds = "";
    tableObserverSetup = false;
    attemptModification();
  }
});
navObserver.observe(document.body, { childList: true, subtree: true });
