chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["find_and_replace.js"]
        });
    } catch (err) {
        console.error("Injection failed:", err);
    }
});
