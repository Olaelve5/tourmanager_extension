console.log("🟢 [TourManager] debugUtils.js loaded - FIRST content script file");

const DEBUG_MODE = true; // Set to false in production

function debugLog(...args) {
  if (DEBUG_MODE) {
    console.log("[TourManager]", ...args);
  }
}

function debugError(...args) {
  if (DEBUG_MODE) {
    console.error("[TourManager]", ...args);
  }
}
