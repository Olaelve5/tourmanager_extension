// Functions are defined in findElementsUtils.js and modificationUtils.js
// No need to import them here, they will be available globally.

let hasModified = false;
let shadowDOMObserverSetup = false;

function isLeaderboardPage() {
  return (
    window.location.href.includes("leaderboard") ||
    window.location.pathname.includes("leaderboard") ||
    document.querySelector("smg-leaderboard-page") !== null
  );
}

async function startModification() {
  const { headerRow, tableElement, round } = findTableElements();

  if (!headerRow || !tableElement) {
    console.error("Could not find the necessary elements to modify.");
    return false;
  }

  if (tableElement.querySelector("th.gwChanges")) {
    console.log("✅ Table already modified, skipping...");
    return true;
  }

  const userIds = getUserIds(tableElement);

  modifyHeaderRow(headerRow);
  modifyTableRows(tableElement);

  const allManagerTransfers = await fetchAllManagerTransfers(userIds, round);

  if (!allManagerTransfers) {
    console.error("❌ Failed to fetch manager transfers.");
    return false;
  }

  console.log("Fetched all manager transfers:", allManagerTransfers);

  modifyTableRows(tableElement, allManagerTransfers);

  hasModified = true;
  return true;
}

function attemptModification() {
  if (!isLeaderboardPage()) {
    return;
  }

  const intervalId = setInterval(async () => {
    const success = await startModification();
    if (success) {
      console.log("✅ Successfully modified the leaderboard.");
      clearInterval(intervalId);
      if (!shadowDOMObserverSetup) {
        setupShadowDOMObserver();
        shadowDOMObserverSetup = true;
      }
    } else {
      console.log("🔄 Retrying...");
    }
  }, 500);

  // Stop trying after 10 seconds
  setTimeout(() => clearInterval(intervalId), 10000);
}

// Initial attempt
attemptModification();

let currentUrl = window.location.href;

const observer = new MutationObserver((mutations) => {
  // Check if the URL has changed
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;

    // Reset modification flag and try again
    hasModified = false;
    shadowDOMObserverSetup = false;
    attemptModification();
  }
});

// Start the mutation observer
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Function to set up a MutationObserver for the outer shadow DOM
// This will catch changes like pagination that occur within the shadow DOM
// and trigger the modification attempt again.
function setupShadowDOMObserver() {
  const pageHost = document.querySelector("smg-leaderboard-page");
  if (pageHost && pageHost.shadowRoot) {
    console.log("Setting up outer shadow DOM observer");

    // Only observe the outer shadow DOM - this catches pagination changes
    const outerObserver = new MutationObserver((mutations) => {
      console.log("🔄 Shadow DOM mutations detected!", mutations.length);
      hasModified = false;
      attemptModification();
    });

    outerObserver.observe(pageHost.shadowRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    console.log("✅ Shadow DOM observer setup successfully");
  }
}
