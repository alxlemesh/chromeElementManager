// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'addHighlight') {
    addToStorage('highlights', message.data);
  } else if (message.action === 'addRemoved') {
    addToStorage('removed', message.data);
  } else if (message.action === 'removeHighlight') {
    removeFromStorage('highlights', message.index);
  } else if (message.action === 'removeRemoved') {
    removeFromStorage('removed', message.index);
  } else if (message.action === 'clearAll') {
    clearStorage(message.type);
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked for tab:', tab.id);

  chrome.tabs.sendMessage(tab.id, { action: 'toggleMenu' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending message:', chrome.runtime.lastError.message);
      console.log('Try refreshing the page or reloading the extension');
    } else {
      console.log('Menu toggle message sent successfully', response);
    }
  });
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
  chrome.storage.local.get(['highlights', 'removed'], (result) => {
    if (!result.highlights) {
      chrome.storage.local.set({ highlights: [] });
    }
    if (!result.removed) {
      chrome.storage.local.set({ removed: [] });
    }
  });
});
