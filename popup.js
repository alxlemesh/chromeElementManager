let currentMode = 'none';

// Get DOM elements
const highlightBtn = document.getElementById('highlightBtn');
const removeBtn = document.getElementById('removeBtn');
const stopBtn = document.getElementById('stopBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const highlightsList = document.getElementById('highlightsList');
const removedList = document.getElementById('removedList');
const highlightCount = document.getElementById('highlightCount');
const removedCount = document.getElementById('removedCount');
const clearHighlights = document.getElementById('clearHighlights');
const clearRemoved = document.getElementById('clearRemoved');

// Set mode and update UI
function setMode(mode) {
  currentMode = mode;

  highlightBtn.classList.remove('active');
  removeBtn.classList.remove('active');
  stopBtn.classList.remove('active');

  if (mode === 'highlight') {
    highlightBtn.classList.add('active');
  } else if (mode === 'remove') {
    removeBtn.classList.add('active');
  } else {
    stopBtn.classList.add('active');
  }

  // Send message to content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'setMode', mode: mode });
    }
  });
}

// Event listeners for mode buttons
highlightBtn.addEventListener('click', () => setMode('highlight'));
removeBtn.addEventListener('click', () => setMode('remove'));
stopBtn.addEventListener('click', () => setMode('none'));

// Tab switching
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
  });
});

// Clear all buttons
clearHighlights.addEventListener('click', () => {
  if (confirm('Clear all highlighted elements?')) {
    chrome.runtime.sendMessage({ action: 'clearAll', type: 'highlights' });
    loadLists();
  }
});

clearRemoved.addEventListener('click', () => {
  if (confirm('Clear all removed elements?')) {
    chrome.runtime.sendMessage({ action: 'clearAll', type: 'removed' });
    loadLists();
  }
});

// Format timestamp
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// Truncate text
function truncateText(text, maxLength = 50) {
  if (!text) return 'No text';
  text = text.trim().replace(/\s+/g, ' ');
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Create list item
function createListItem(item, index, type) {
  const div = document.createElement('div');
  div.className = 'list-item';

  const hostname = new URL(item.url).hostname;

  div.innerHTML = `
    <div class="item-content">
      <div class="item-text">${truncateText(item.text)}</div>
      <div class="item-meta">
        <span class="item-host">${hostname}</span>
        <span class="item-date">${formatDate(item.timestamp)}</span>
      </div>
      <div class="item-selector" title="${item.selector}">${item.selector}</div>
    </div>
    <button class="btn-delete" data-index="${index}" data-type="${type}">×</button>
  `;

  // Delete button
  const deleteBtn = div.querySelector('.btn-delete');
  deleteBtn.addEventListener('click', () => {
    const action = type === 'highlights' ? 'removeHighlight' : 'removeRemoved';
    chrome.runtime.sendMessage({ action: action, index: index });
    setTimeout(loadLists, 100);
  });

  return div;
}

// Load and display lists
function loadLists() {
  chrome.storage.local.get(['highlights', 'removed'], (result) => {
    const highlights = result.highlights || [];
    const removed = result.removed || [];

    // Update counts
    highlightCount.textContent = highlights.length;
    removedCount.textContent = removed.length;

    // Display highlights
    highlightsList.innerHTML = '';
    if (highlights.length === 0) {
      highlightsList.innerHTML = '<p class="empty-state">No highlighted elements yet</p>';
    } else {
      highlights.reverse().forEach((item, index) => {
        const actualIndex = highlights.length - 1 - index;
        highlightsList.appendChild(createListItem(item, actualIndex, 'highlights'));
      });
    }

    // Display removed
    removedList.innerHTML = '';
    if (removed.length === 0) {
      removedList.innerHTML = '<p class="empty-state">No removed elements yet</p>';
    } else {
      removed.reverse().forEach((item, index) => {
        const actualIndex = removed.length - 1 - index;
        removedList.appendChild(createListItem(item, actualIndex, 'removed'));
      });
    }
  });
}

// Initialize
setMode('none');
loadLists();

// Listen for storage changes
chrome.storage.onChanged.addListener(() => {
  loadLists();
});
