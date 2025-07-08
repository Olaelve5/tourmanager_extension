# Tourmanager Bytter 📊

A simple browser extension that adds a "Transfers Used" column to the leaderboards on `tourmanager.no`.

## Features ✨

* **➕ Adds a new column** to the leaderboard showing transfers made.
* **🔢 Displays both current round and total transfers**.
* **⚡ Caches data** for faster loading and to help avoid API rate limits.
* **🔄 Automatically updates** when you change pages.

## Screenshots 📸

#### ❌ Without extension
<img src="https://github.com/user-attachments/assets/c933775d-33fa-4e04-af94-dd1428d2fd38" width="600">

<br>

#### ✨ With extension
<img src="https://github.com/user-attachments/assets/3a454f80-3ef2-4856-948d-72a7d1c4fa7e" width="600">


## How It Works ⚙️

This extension injects a content script into `tourmanager.no` pages. It finds the leaderboard, adds a new column, and then asks the background script to fetch transfer data from the Tourmanager API. The data is then neatly displayed for each manager.

## Installation 🚀

1.  Clone this repository.
2.  Open Chrome and go to `chrome://extensions`.
3.  Enable "Developer mode".
4.  Click "Load unpacked" and select the project folder.
5.  You're all set!

## Tech Stack 🛠️

* **JavaScript (ES6+)**
* **Chrome Extension APIs (Manifest V3)**
* **HTML & CSS**
