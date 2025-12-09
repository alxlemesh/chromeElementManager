// Function to inject content scripts using chrome.scripting API
// Used for pages that were loaded before the extension was installed
async function injectContentScripts(tabId) {
  try {
    // Inject JavaScript content script
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"],
    });

    // Inject CSS styles
    await chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ["content.css"],
    });

    console.log("Content script injected successfully, trying again...");

    // Try sending message again after injection
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { action: "toggleMenu" });
    }, 100);
  } catch (err) {
    console.error("Failed to inject content script:", err);
    console.log("Please refresh the page and try again");
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "addHighlight") {
    addToStorage("highlights", message.data);
  } else if (message.action === "addRemoved") {
    addToStorage("removed", message.data);
  } else if (message.action === "removeHighlight") {
    removeFromStorage("highlights", message.index);
  } else if (message.action === "removeRemoved") {
    removeFromStorage("removed", message.index);
  } else if (message.action === "clearAll") {
    clearStorage(message.type);
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  console.log("Extension icon clicked for tab:", tab.id);

  // Check if the page is a restricted page where content scripts can't run
  const restrictedPages = [
    "chrome://",
    "chrome-extension://",
    "edge://",
    "about:",
  ];
  const isRestricted = restrictedPages.some((prefix) =>
    tab.url?.startsWith(prefix)
  );

  if (isRestricted) {
    console.warn("Cannot run on restricted pages:", tab.url);
    // Show a notification badge or update icon
    chrome.action.setBadgeText({ text: "✕", tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444", tabId: tab.id });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "", tabId: tab.id });
    }, 2000);
    return;
  }

  // Try to send message to content script
  try {
    chrome.tabs.sendMessage(tab.id, { action: "toggleMenu" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error sending message:",
          chrome.runtime.lastError.message
        );
        console.log("Attempting to inject content script...");

        // Inject content script manually for pages loaded before extension was installed
        // This requires the 'scripting' permission
        injectContentScripts(tab.id);
      } else {
        console.log("Menu toggle message sent successfully", response);
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
  }
});

function addToStorage(type, data) {
  chrome.storage.local.get([type], (result) => {
    const items = result[type] || [];
    items.push(data);
    chrome.storage.local.set({ [type]: items });
  });
}

function removeFromStorage(type, index) {
  chrome.storage.local.get([type], (result) => {
    const items = result[type] || [];
    if (index >= 0 && index < items.length) {
      items.splice(index, 1);
      chrome.storage.local.set({ [type]: items });
    }
  });
}

function clearStorage(type) {
  chrome.storage.local.set({ [type]: [] });
}

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["highlights", "removed"], (result) => {
    if (!result.highlights) {
      chrome.storage.local.set({ highlights: [] });
    }
    if (!result.removed) {
      chrome.storage.local.set({ removed: [] });
    }
  });
});
