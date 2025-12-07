let currentMode = 'none'; // 'none', 'highlight', 'remove'
let hoveredElement = null;
let menuOpen = false;
let menuElement = null;

// Generate unique selector for an element
function getUniqueSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }

  let path = [];
  while (element.parentElement) {
    let selector = element.tagName.toLowerCase();

    if (element.className) {
      const classes = Array.from(element.classList)
        .filter(c => !c.startsWith('chr-'))
        .join('.');
      if (classes) {
        selector += `.${classes}`;
      }
    }

    let sibling = element;
    let nth = 1;
    while (sibling.previousElementSibling) {
      sibling = sibling.previousElementSibling;
      if (sibling.tagName === element.tagName) nth++;
    }

    if (nth > 1) {
      selector += `:nth-of-type(${nth})`;
    }

    path.unshift(selector);
    element = element.parentElement;
  }

  return path.join(' > ');
}

// Create the in-page menu
function createMenu() {
  const menu = document.createElement('div');
  menu.id = 'chr-menu';
  menu.className = 'chr-menu';
  menu.style.position = 'fixed';
  menu.style.setProperty('position', 'fixed', 'important');

  menu.innerHTML = `
    <div class="chr-menu-wrapper">
    <div class="chr-menu-header">
      <h3>Element Manager</h3>
      <div class="chr-header-buttons">
        <button class="chr-settings-btn" id="chr-settings-btn">⚙️</button>
        <button class="chr-close-btn" id="chr-close-menu">×</button>
      </div>
    </div>

    <div class="chr-menu-controls">
      <button class="chr-mode-btn" id="chr-highlight-btn" data-mode="highlight">
        <span class="chr-icon">🖍️</span>
        <span>Highlight</span>
      </button>
      <button class="chr-mode-btn" id="chr-remove-btn" data-mode="remove">
        <span class="chr-icon">❌</span>
        <span>Remove</span>
      </button>
    </div>

    <div class="chr-save-option">
      <label class="chr-checkbox-label">
        <input type="checkbox" id="chr-remember-checkbox" checked>
        <span>Remember changes (save to memory)</span>
      </label>
    </div>

    <div class="chr-hover-preview" id="chr-hover-preview" style="display: none;">
      <div class="chr-preview-label">Hovering:</div>
      <div class="chr-preview-text" id="chr-preview-text"></div>
      <div class="chr-preview-action" id="chr-preview-action"></div>
    </div>

    <div class="chr-tabs">
      <button class="chr-tab-btn chr-active" data-tab="highlights">
        Highlighted (<span id="chr-highlight-count">0</span>)
      </button>
      <button class="chr-tab-btn" data-tab="removed">
        Removed (<span id="chr-removed-count">0</span>)
      </button>
    </div>

    <div class="chr-tab-content">
      <div id="chr-tab-highlights" class="chr-tab-pane chr-active">
        <div class="chr-list-header">
          <button class="chr-clear-btn" id="chr-clear-highlights">Clear All</button>
        </div>
        <div class="chr-items-list" id="chr-highlights-list">
          <p class="chr-empty-state">No highlighted elements</p>
        </div>
      </div>

      <div id="chr-tab-removed" class="chr-tab-pane">
        <div class="chr-list-header">
          <button class="chr-clear-btn" id="chr-clear-removed">Clear All</button>
        </div>
        <div class="chr-items-list" id="chr-removed-list">
          <p class="chr-empty-state">No removed elements</p>
        </div>
      </div>
    </div>

    <div class="chr-footer">
      Made by Skyke with ❤️ • <a href="https://github.com/alxlemesh/chromeElementManager" target="_blank">GitHub</a>
    </div>
    </div>

    <div class="chr-settings-panel" id="chr-settings-panel" style="display: none;">
      <div class="chr-settings-header">
        <h4>Settings</h4>
        <button class="chr-settings-close" id="chr-settings-close">×</button>
      </div>
      <div class="chr-settings-content">
        <button class="chr-settings-action-btn" id="chr-export-btn">
          <span class="chr-btn-icon">📤</span>
          <span>Export Data</span>
        </button>
        <button class="chr-settings-action-btn" id="chr-import-btn">
          <span class="chr-btn-icon">📥</span>
          <span>Import Data</span>
        </button>
        <input type="file" id="chr-import-file" accept=".json" style="display: none;">
      </div>
    </div>
  `;

  document.body.appendChild(menu);
  menuElement = menu;

  // Add event listeners
  document.getElementById('chr-close-menu').addEventListener('click', () => {
    setMode('none'); // Auto-stop when closing menu
    toggleMenu();
  });
  document.getElementById('chr-highlight-btn').addEventListener('click', () => setMode('highlight'));
  document.getElementById('chr-remove-btn').addEventListener('click', () => setMode('remove'));

  // Settings panel
  document.getElementById('chr-settings-btn').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Settings button clicked');
    const panel = document.getElementById('chr-settings-panel');
    console.log('Settings panel element:', panel);
    panel.style.display = 'flex';
    console.log('Settings panel display set to flex');
  });
  document.getElementById('chr-settings-close').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('chr-settings-panel').style.display = 'none';
  });

  // Export functionality
  document.getElementById('chr-export-btn').addEventListener('click', () => {
    chrome.storage.local.get(['highlights', 'removed'], (result) => {
      const data = {
        highlights: result.highlights || [],
        removed: result.removed || [],
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `element-manager-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  // Import functionality
  document.getElementById('chr-import-btn').addEventListener('click', () => {
    document.getElementById('chr-import-file').click();
  });

  document.getElementById('chr-import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        // Ask user how to handle import
        const choice = prompt(
          'How do you want to import?\n\n' +
          '1 - Overwrite (replace all current data)\n' +
          '2 - Keep current (ignore imported data)\n' +
          '3 - Combine with current priority\n' +
          '4 - Combine with imported priority\n\n' +
          'Enter 1, 2, 3, or 4:'
        );

        if (!choice || !['1', '2', '3', '4'].includes(choice)) {
          alert('Import cancelled');
          return;
        }

        chrome.storage.local.get(['highlights', 'removed'], (result) => {
          let finalHighlights = result.highlights || [];
          let finalRemoved = result.removed || [];

          if (choice === '1') {
            // Overwrite
            finalHighlights = importedData.highlights || [];
            finalRemoved = importedData.removed || [];
          } else if (choice === '2') {
            // Keep current (do nothing)
          } else if (choice === '3') {
            // Combine - current priority
            const importedHighlights = importedData.highlights || [];
            const importedRemoved = importedData.removed || [];
            finalHighlights = [...finalHighlights, ...importedHighlights];
            finalRemoved = [...finalRemoved, ...importedRemoved];
          } else if (choice === '4') {
            // Combine - imported priority
            const importedHighlights = importedData.highlights || [];
            const importedRemoved = importedData.removed || [];
            finalHighlights = [...importedHighlights, ...finalHighlights];
            finalRemoved = [...importedRemoved, ...finalRemoved];
          }

          chrome.storage.local.set({
            highlights: finalHighlights,
            removed: finalRemoved
          }, () => {
            alert('Import successful!');
            loadLists();
            // Close settings panel
            document.getElementById('chr-settings-panel').style.display = 'none';
          });
        });
      } catch (error) {
        alert('Error importing file: ' + error.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  });

  // Tab switching
  document.querySelectorAll('.chr-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      document.querySelectorAll('.chr-tab-btn').forEach(b => b.classList.remove('chr-active'));
      document.querySelectorAll('.chr-tab-pane').forEach(p => p.classList.remove('chr-active'));
      btn.classList.add('chr-active');
      document.getElementById(`chr-tab-${targetTab}`).classList.add('chr-active');
    });
  });

  // Clear buttons
  document.getElementById('chr-clear-highlights').addEventListener('click', () => {
    if (confirm('Clear all highlighted elements on this page?')) {
      // Remove all highlights from current page
      chrome.storage.local.get(['highlights'], (result) => {
        const highlights = result.highlights || [];
        const currentUrl = window.location.href;

        highlights.forEach(item => {
          if (item.url === currentUrl) {
            try {
              const element = document.querySelector(item.selector);
              if (element) {
                element.classList.remove('chr-highlighted');
              }
            } catch (e) {
              console.error('Error removing highlight:', e);
            }
          }
        });

        // Remove from storage
        const remaining = highlights.filter(h => h.url !== currentUrl);
        chrome.storage.local.set({ highlights: remaining }, () => {
          loadLists();
        });
      });
    }
  });

  document.getElementById('chr-clear-removed').addEventListener('click', () => {
    if (confirm('Clear all removed elements on this page?')) {
      // Restore all removed elements from current page
      chrome.storage.local.get(['removed'], (result) => {
        const removed = result.removed || [];
        const currentUrl = window.location.href;

        removed.forEach(item => {
          if (item.url === currentUrl) {
            try {
              const element = document.querySelector(item.selector);
              if (element) {
                element.style.display = ''; // Restore visibility
              }
            } catch (e) {
              console.error('Error restoring element:', e);
            }
          }
        });

        // Remove from storage
        const remaining = removed.filter(r => r.url !== currentUrl);
        chrome.storage.local.set({ removed: remaining }, () => {
          loadLists();
        });
      });
    }
  });

  // Load checkbox state from storage
  chrome.storage.local.get(['rememberChanges'], (result) => {
    const rememberChanges = result.rememberChanges !== undefined ? result.rememberChanges : true;
    document.getElementById('chr-remember-checkbox').checked = rememberChanges;
  });

  // Save checkbox state on change
  document.getElementById('chr-remember-checkbox').addEventListener('change', (e) => {
    chrome.storage.local.set({ rememberChanges: e.target.checked });
  });

  loadLists();
}

// Toggle menu visibility
function toggleMenu() {
  if (!menuElement) {
    createMenu();
    menuOpen = true;
  } else {
    menuOpen = !menuOpen;
    menuElement.classList.toggle('chr-menu-open', menuOpen);

    // Auto-stop mode when closing menu
    if (!menuOpen) {
      setMode('none');
    }
  }
}

// Check if changes should be saved
function shouldSaveChanges() {
  const checkbox = document.getElementById('chr-remember-checkbox');
  return checkbox ? checkbox.checked : true; // Default to true if checkbox not found
}

// Set mode
function setMode(mode) {
  currentMode = mode;

  // Update button states
  document.querySelectorAll('.chr-mode-btn').forEach(btn => {
    btn.classList.remove('chr-active');
  });

  const previewAction = document.getElementById('chr-preview-action');

  if (mode === 'highlight') {
    document.getElementById('chr-highlight-btn').classList.add('chr-active');
    if (previewAction) {
      previewAction.textContent = 'Click to highlight this element';
      previewAction.className = 'chr-preview-action chr-action-highlight';
    }
  } else if (mode === 'remove') {
    document.getElementById('chr-remove-btn').classList.add('chr-active');
    if (previewAction) {
      previewAction.textContent = 'Click to remove this element';
      previewAction.className = 'chr-preview-action chr-action-remove';
    }
  } else {
    // mode === 'none' (stopped)
    const hoverPreview = document.getElementById('chr-hover-preview');
    if (hoverPreview) {
      hoverPreview.style.display = 'none';
    }
  }

  document.body.style.cursor = mode === 'none' ? 'default' : 'crosshair';

  if (hoveredElement) {
    hoveredElement.classList.remove('chr-hover-highlight', 'chr-hover-remove');
    hoveredElement = null;
  }
}

// Highlight effect on hover
function handleMouseOver(e) {
  if (currentMode === 'none' || !menuElement) return;

  // Don't interact with menu elements
  if (e.target.closest('#chr-menu')) return;

  e.stopPropagation();
  hoveredElement = e.target;

  if (currentMode === 'highlight') {
    hoveredElement.classList.add('chr-hover-highlight');
  } else if (currentMode === 'remove') {
    hoveredElement.classList.add('chr-hover-remove');
  }

  // Show preview in menu
  const previewDiv = document.getElementById('chr-hover-preview');
  const previewText = document.getElementById('chr-preview-text');
  previewDiv.style.display = 'block';
  previewText.textContent = hoveredElement.textContent.substring(0, 100).trim() || hoveredElement.tagName;
}

function handleMouseOut(e) {
  if (currentMode === 'none' || !menuElement) return;
  if (e.target.closest('#chr-menu')) return;

  e.stopPropagation();
  if (hoveredElement) {
    hoveredElement.classList.remove('chr-hover-highlight', 'chr-hover-remove');
    hoveredElement = null;
  }
}

function handleClick(e) {
  if (currentMode === 'none' || !menuElement) return;
  if (e.target.closest('#chr-menu')) return;

  e.preventDefault();
  e.stopPropagation();

  const element = e.target;
  const selector = getUniqueSelector(element);
  const url = window.location.href;
  const hostname = window.location.hostname;

  if (currentMode === 'highlight') {
    element.classList.remove('chr-hover-highlight');
    element.classList.add('chr-highlighted');

    // Only save to storage if checkbox is checked
    if (shouldSaveChanges()) {
      chrome.runtime.sendMessage({
        action: 'addHighlight',
        data: {
          url: url,
          hostname: hostname,
          selector: selector,
          text: element.textContent.substring(0, 100),
          timestamp: Date.now()
        }
      });
      loadLists();
    }
  } else if (currentMode === 'remove') {
    element.classList.remove('chr-hover-remove');
    element.style.display = 'none';

    // Only save to storage if checkbox is checked
    if (shouldSaveChanges()) {
      chrome.runtime.sendMessage({
        action: 'addRemoved',
        data: {
          url: url,
          hostname: hostname,
          selector: selector,
          text: element.textContent.substring(0, 100),
          timestamp: Date.now()
        }
      });
      loadLists();
    }
  }

  // Hide preview after action
  document.getElementById('chr-hover-preview').style.display = 'none';
}

// Load and display lists
function loadLists() {
  chrome.storage.local.get(['highlights', 'removed'], (result) => {
    const highlights = result.highlights || [];
    const removed = result.removed || [];
    const currentUrl = window.location.href;

    // Update counts
    document.getElementById('chr-highlight-count').textContent = highlights.filter(h => h.url === currentUrl).length;
    document.getElementById('chr-removed-count').textContent = removed.filter(r => r.url === currentUrl).length;

    // Display highlights
    const highlightsList = document.getElementById('chr-highlights-list');
    const pageHighlights = highlights.filter(h => h.url === currentUrl);

    highlightsList.innerHTML = '';
    if (pageHighlights.length === 0) {
      highlightsList.innerHTML = '<p class="chr-empty-state">No highlighted elements</p>';
    } else {
      pageHighlights.reverse().forEach((item, index) => {
        const actualIndex = highlights.indexOf(item);
        highlightsList.appendChild(createListItem(item, actualIndex, 'highlights'));
      });
    }

    // Display removed
    const removedList = document.getElementById('chr-removed-list');
    const pageRemoved = removed.filter(r => r.url === currentUrl);

    removedList.innerHTML = '';
    if (pageRemoved.length === 0) {
      removedList.innerHTML = '<p class="chr-empty-state">No removed elements</p>';
    } else {
      pageRemoved.reverse().forEach((item, index) => {
        const actualIndex = removed.indexOf(item);
        removedList.appendChild(createListItem(item, actualIndex, 'removed'));
      });
    }
  });
}

// Create list item
function createListItem(item, index, type) {
  const div = document.createElement('div');
  div.className = 'chr-list-item';

  const text = item.text.trim().replace(/\s+/g, ' ');
  const truncated = text.length > 50 ? text.substring(0, 50) + '...' : text;

  div.innerHTML = `
    <div class="chr-item-content">
      <div class="chr-item-text">${truncated || 'No text'}</div>
      <div class="chr-item-selector">${item.selector}</div>
    </div>
    <button class="chr-delete-btn" data-index="${index}" data-type="${type}">×</button>
  `;

  // Hover to highlight element on page
  div.addEventListener('mouseenter', () => {
    try {
      const element = document.querySelector(item.selector);
      if (element) {
        element.classList.add('chr-focus-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) {
      console.error('Error highlighting element:', e);
    }
  });

  div.addEventListener('mouseleave', () => {
    try {
      const element = document.querySelector(item.selector);
      if (element) {
        element.classList.remove('chr-focus-highlight');
      }
    } catch (e) {
      console.error('Error removing focus highlight:', e);
    }
  });

  const deleteBtn = div.querySelector('.chr-delete-btn');
  deleteBtn.addEventListener('click', () => {
    // Remove visual effect from page
    if (type === 'highlights') {
      try {
        const element = document.querySelector(item.selector);
        if (element) {
          element.classList.remove('chr-highlighted');
          element.classList.remove('chr-focus-highlight'); // Also remove hover highlight
        }
      } catch (e) {
        console.error('Error removing highlight:', e);
      }
    } else if (type === 'removed') {
      try {
        const element = document.querySelector(item.selector);
        if (element) {
          element.style.display = ''; // Restore visibility
          element.classList.remove('chr-focus-highlight'); // Also remove hover highlight
        }
      } catch (e) {
        console.error('Error restoring element:', e);
      }
    }

    // Remove from storage
    const action = type === 'highlights' ? 'removeHighlight' : 'removeRemoved';
    chrome.runtime.sendMessage({ action: action, index: index });
    setTimeout(loadLists, 100);
  });

  return div;
}

// Restore highlighted and removed elements on page load
function restorePageState() {
  const url = window.location.href;

  chrome.storage.local.get(['highlights', 'removed'], (result) => {
    const highlights = result.highlights || [];
    const removed = result.removed || [];

    highlights.forEach(item => {
      if (item.url === url) {
        try {
          const element = document.querySelector(item.selector);
          if (element) {
            element.classList.add('chr-highlighted');
          }
        } catch (e) {
          console.error('Invalid selector:', item.selector);
        }
      }
    });

    removed.forEach(item => {
      if (item.url === url) {
        try {
          const element = document.querySelector(item.selector);
          if (element) {
            element.style.display = 'none';
          }
        } catch (e) {
          console.error('Invalid selector:', item.selector);
        }
      }
    });
  });
}

// Listen for extension icon click
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleMenu') {
    toggleMenu();
    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async response
});

// Initialize when DOM is ready
function initialize() {
  // Create menu on page load (but keep it hidden initially)
  if (!menuElement) {
    createMenu();
    menuOpen = false; // Start closed
  }

  // Restore state
  restorePageState();
}

// Add event listeners
document.addEventListener('mouseover', handleMouseOver, true);
document.addEventListener('mouseout', handleMouseOut, true);
document.addEventListener('click', handleClick, true);

// Keyboard shortcut: Ctrl+Shift+E (or Cmd+Shift+E on Mac)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
    e.preventDefault();
    toggleMenu();
  }
});

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Listen for storage changes
chrome.storage.onChanged.addListener(() => {
  if (menuElement) {
    loadLists();
  }
});
