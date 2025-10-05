// comparison_editor.js (main)
(() => {
    if (window.__comparisonEditorRunning) return;
    window.__comparisonEditorRunning = true;

    const MAX_BLOCKS = 3;

    async function run() {
        const editor = await window.EditorExtract.waitForEditor();
        if (!editor) { try { delete window.__comparisonEditorRunning; } catch {} return; }

        await window.EditorExtract.forceLoadAllLines(editor);

        // Extract original values + DOM anchors
        const blocks = window.EditorExtract.extractBlocks(editor, MAX_BLOCKS);

        // Open panel; on save, update scores and comments from inputs/textareas
        window.EditorPanel.open({
            blocks,
            onSave: ({ updatedScores, updatedComments }) => {
                for (let i = 0; i < blocks.length; i++) {
                    const b = blocks[i];

                    // Update score
                    const newScore = (updatedScores && updatedScores[i] !== undefined) ? updatedScores[i] : b.score;
                    window.EditorReinsert.setHeaderScore(b.headerEl, newScore);

                    // Update comments (replace list with textarea contents)
                    const newCommentArray = (updatedComments && Array.isArray(updatedComments[i]))
                        ? updatedComments[i]
                        : b.comments;

                    // Convert to "- COMMENT" lines
                    const newCommentTexts = newCommentArray.map(txt => `- ${txt}`);

                    window.EditorReinsert.replaceComments(b.parent, b.commentEls, b.afterEl, newCommentTexts);
                }
                try { delete window.__comparisonEditorRunning; } catch {}
            },
            onCancel: () => {
                // No changes
                try { delete window.__comparisonEditorRunning; } catch {}
            }
        });
    }

    run().catch(() => {
        try { delete window.__comparisonEditorRunning; } catch {}
    });
})();











