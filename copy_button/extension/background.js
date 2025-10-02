async function injectIntoTab(tabId) {
    try {
        if (!chrome.scripting) {
            console.error("chrome.scripting is undefined. Check permissions and reload the extension.");
            return;
        }

        // Guard against double-injection: run a tiny checker first.
        await chrome.scripting.executeScript({
            target: { tabId, allFrames: false },
            func: () => {
                if (window.__bookmarkletInjected) return true;
                window.__bookmarkletInjected = true;
                return false;
            },
            world: "MAIN"
        }).then(async ([res]) => {
            // If already injected, do nothing.
            if (res && res.result === true) return;

            // Inject your bookmarklet code.
            await chrome.scripting.executeScript({
                target: { tabId, allFrames: false },
                files: ["copy_button.js"]
            });
        });

    } catch (err) {
        console.error("Injection failed:", err);
    }
}

// Fire on full navigations (new pages, reloads).
chrome.webNavigation.onCommitted.addListener((details) => {
    // Only top frame
    if (details.frameId !== 0) return;
    injectIntoTab(details.tabId);
}, {
    url: [
        { hostEquals: "github.com" },
        { hostSuffix: ".github.com" }
    ]
});

// Fire on SPA / pushState navigations (GitHub uses them extensively).
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.frameId !== 0) return;
    injectIntoTab(details.tabId);
}, {
    url: [
        { hostEquals: "github.com" },
        { hostSuffix: ".github.com" }
    ]
});

// (Optional) Keep the click-to-inject behavior as a manual fallback.
chrome.action.onClicked.addListener((tab) => {
    if (!tab?.id) return;
    injectIntoTab(tab.id);
});