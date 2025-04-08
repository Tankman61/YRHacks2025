// background.js

/**
 * Checks the provided URL using an API.
 * If the URL is detected as distracting, it triggers a notification
 * and sends a message to the corresponding content script to display an overlay.
 *
 * @param {string} url - The URL to check.
 * @param {number} tabId - The ID of the tab in which to show the overlay.
 */
async function checkLink(url, tabId) {
    if (!url) {
      console.log('checkLink: No URL provided.');
      return;
    }
  
    console.log(`checkLink: Initiating link check for URL: ${url}`);
    const startTime = performance.now();
  
    try {
      const apiEndpoint = `http://localhost:8000/api/check?url=${encodeURIComponent(url)}`;
      console.log('checkLink: Fetching from API endpoint:', apiEndpoint);
  
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error('Network response was not OK');
  
      const data = await response.json();
      const isDistracting = data.distraction;
      const elapsed = Math.round(performance.now() - startTime);
  
      console.log('checkLink: API response data:', data, 'Elapsed time:', elapsed, 'ms');
  
      if (isDistracting) {
        // Send a desktop notification, if available
        if (chrome.notifications) {
          chrome.notifications.create('distractingNotification', {
            type: 'basic',
            // iconUrl can be omitted if you don't have an icon
            title: 'Distracting Tab Detected',
            message: `The URL ${url} is distracting! (Response Time: ${elapsed}ms)`,
            priority: 2,
          });
          console.log('checkLink: Notification sent for distracting URL:', url);
        } else {
          console.log(`Distracting URL detected: ${url} (notifications API not available)`);
        }
  
        // Send a message to the content script in the tab to display the overlay.
        if (tabId) {
          chrome.tabs.sendMessage(tabId, {
            type: "SHOW_DISTRACTING_OVERLAY",
            url: url,
            responseTime: elapsed
          });
        }
      }
    } catch (error) {
      console.error('checkLink: Error during API fetch:', error);
    }
  }
  
  // Listen for tab activation changes.
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab && tab.url) {
        console.log('Background: New active tab detected:', tab.url);
        checkLink(tab.url, activeInfo.tabId);
      }
    });
  });
  
  // Listen for tab updates (such as URL changes after a page load).
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab && tab.url) {
      console.log('Background: Tab updated with new URL:', tab.url);
      checkLink(tab.url, tabId);
    }
  });
  