chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["comment_extractor.js"]
        });
    } catch (err) {
        console.error("Injection failed:", err);
    }
});
