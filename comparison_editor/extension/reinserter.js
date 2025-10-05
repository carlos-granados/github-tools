// reinserter.js
(() => {
    function makeLine(text) {
        const div = document.createElement('div');
        div.className = 'cm-line';
        div.setAttribute('dir', 'auto');
        div.textContent = text;
        return div;
    }

    function setHeaderScore(headerEl, newScoreText) {
        if (!headerEl) return;
        headerEl.textContent = `### Score: ${newScoreText}`;
    }

    function replaceComments(parent, commentEls, afterEl, newCommentTexts) {
        if (!parent) return;

        // Remove existing comment lines
        for (const el of commentEls) {
            if (el && el.parentNode === parent) parent.removeChild(el);
        }

        // Insert new comment lines before 'afterEl' (or append if null)
        const frag = document.createDocumentFragment();
        for (const t of newCommentTexts) {
            frag.appendChild(makeLine(t));
        }
        parent.insertBefore(frag, afterEl);
    }

    // expose API
    window.EditorReinsert = {
        setHeaderScore,
        replaceComments,
    };
})();
