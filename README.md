# Click Highlighter & Remover

A Chrome extension that allows you to highlight or remove elements on any webpage with a simple click. All your changes are saved and automatically restored when you revisit the page.

## Features

- **In-Page Menu**: Beautiful menu appears in bottom-left corner when you click the extension icon
- **Click to Highlight**: Mark important elements with a yellow highlight
- **Click to Remove**: Hide unwanted elements from any webpage
- **Live Preview**: See what element you're hovering over in the menu before clicking
- **Mode Indicator**: Always know which mode is active (Highlight/Remove/Stop)
- **Save Toggle**: Checkbox to control whether changes are saved to memory (checked by default)
- **Persistent Memory**: All changes saved and restored automatically when checkbox is enabled
- **Organized Lists**: View all your highlighted and removed elements in separate tabs
- **Per-Page Display**: Only shows elements from the current page in the lists
- **Easy Management**: Remove individual items or clear all at once

## Installation

### Load as Unpacked Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top right corner
3. Click "Load unpacked" button
4. Select the `clickToRemoveHiglight` folder
5. The extension should now appear in your extensions list

### Pin the Extension

1. Click the puzzle piece icon in Chrome's toolbar
2. Find "Click Highlighter & Remover" in the list
3. Click the pin icon to keep it visible in your toolbar

## How to Use

### Opening the Menu

1. Click the extension icon in your Chrome toolbar
2. A menu will slide up from the bottom-left corner of the page
3. **Alternative**: Press `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac) to toggle the menu
4. Click the × button or click the extension icon again to close it

### Highlighting Elements

1. Open the menu by clicking the extension icon
2. **Check the checkbox**: Make sure "Remember changes (save to memory)" is checked if you want to save permanently
3. Click the "Highlight" button in the menu
4. The mode indicator will show "Highlight Mode"
5. Hover over any element on the page:
   - You'll see a yellow outline around the element
   - The menu will preview the element text
   - The menu shows "Click to highlight this element"
6. Click the element to highlight it:
   - If checkbox is **checked**: Element is saved and appears in the "Highlighted" tab
   - If checkbox is **unchecked**: Element is only highlighted until you refresh the page
7. Click "Stop" when you're done

### Removing Elements

1. Open the menu by clicking the extension icon
2. **Check the checkbox**: Make sure "Remember changes (save to memory)" is checked if you want to save permanently
3. Click the "Remove" button in the menu
4. The mode indicator will show "Remove Mode"
5. Hover over any element on the page:
   - You'll see a red outline around the element
   - The menu will preview the element text
   - The menu shows "Click to remove this element"
6. Click the element to remove it from the page:
   - If checkbox is **checked**: Element is saved and appears in the "Removed" tab
   - If checkbox is **unchecked**: Element is only hidden until you refresh the page
7. Click "Stop" when you're done

### Using Without Saving (Temporary Mode)

1. Open the menu
2. **Uncheck** "Remember changes (save to memory)"
3. Now you can highlight or remove elements temporarily
4. Changes will only last until you refresh the page
5. Great for testing or one-time cleanup

### Managing Your Changes

1. Open the menu by clicking the extension icon
2. Switch between "Highlighted" and "Removed" tabs to see your saved items
3. Each item shows:
   - The text content of the element
   - The CSS selector used to identify it
4. **Click the × button** next to any item to:
   - Remove it from memory (storage)
   - Remove the visual effect from the page (unhighlight or restore visibility)
5. **Click "Clear All"** to:
   - Remove all items on the current page from memory
   - Remove all visual effects from the current page

### Automatic Restoration

- When you visit a page where you've highlighted or removed elements, they will automatically be restored
- This works across browser sessions - close Chrome and reopen it, your changes persist
- Only elements from the current page are shown in the menu lists
- All your saved elements are remembered in Chrome's storage

## Files Structure

```
clickToRemoveHiglight/
├── manifest.json          # Extension configuration
├── content.js            # In-page menu and interaction logic
├── content.css           # Menu styling and visual effects
├── background.js         # Background service worker for storage
├── icons/                # Extension icons
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
├── create-icons.js       # Icon generator script
├── generate-icons.html   # HTML-based icon generator
└── README.md            # This file
```

## Technical Details

- **Storage**: Uses Chrome's `chrome.storage.local` API to persist data
- **Selectors**: Generates unique CSS selectors for each element using classes, IDs, and nth-child positions
- **Modes**: Three modes - highlight, remove, and stop (normal browsing)
- **Visual Feedback**:
  - Hover effects show which element will be affected before clicking
  - Live preview in menu shows element text while hovering
  - Mode indicator always displays current mode
- **In-Page UI**: Menu slides in/out from bottom-left corner with smooth animation
- **Cross-Page**: Works on any website (requires appropriate permissions)

## Privacy

- All data is stored locally in your browser using Chrome's storage API
- No data is sent to any external servers
- No tracking or analytics
- Your highlighted and removed elements stay on your device

## Troubleshooting

**Menu not appearing when clicking extension icon:**
- **First**: Try the keyboard shortcut `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac)
- **Refresh the page**: After installing or updating the extension, refresh the page
- **Check browser console**:
  1. Press F12 to open DevTools
  2. Go to Console tab
  3. Look for any error messages
  4. If you see "Error sending message", refresh the page
- **Reload the extension**:
  1. Go to `chrome://extensions/`
  2. Find "Click Highlighter & Remover"
  3. Click the reload icon 🔄
  4. Refresh your webpage
- **Check extension is enabled**: Make sure it's ON in `chrome://extensions/`
- **Check service worker**:
  1. Go to `chrome://extensions/`
  2. Click "service worker" link under the extension
  3. Check for errors in the console

**Elements not being restored:**
- The page structure may have changed since you saved the element
- Try removing the old entry and adding it again

**Can't click on an element:**
- Make sure you've activated highlight or remove mode (not Stop)
- Some elements may be covered by others - try zooming in
- Make sure you're not clicking on the menu itself

**Extension not working:**
- Refresh the page after installing the extension
- Check that the extension is enabled in `chrome://extensions/`
- Some Chrome internal pages block extensions for security

## Development

To modify the extension:

1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## License

Free to use and modify for personal projects.
