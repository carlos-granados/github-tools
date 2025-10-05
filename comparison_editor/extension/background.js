chrome.action.onClicked.addListener(async (tab) => {
    if (!tab?.id) return;
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [
                "extractor.js",
                "reinserter.js",
                "panel_styles.js",
                "panel_comments.js",
                "panel.js",
                "comparison_editor.js"
            ],
        });
    } catch (err) {
        console.error("Injection failed:", err);
    }
});