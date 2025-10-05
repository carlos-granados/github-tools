// extractor.js
(() => {
    const FIND_EDITOR_TIMEOUT_MS = 1000;
    const LOAD_ALL_LINES_MAX_MS = 4000;
    const IDLE_AFTER_SCROLL_MS = 200;
    const MAX_BLOCKS = 3;

    const ZW_REGEX = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g;
    const NBSP_REGEX = /\u00A0/g;

    const SCORE_RE = /^#{3}\s*Score\s*[:：]\s*(.+?)\s*$/i;
    const RATIONALE_RE = /^#{3}\s*Rationale\s*[:：]?\s*$/i;

    function normalizeText(s) {
        if (!s) return '';
        return s.replace(ZW_REGEX, '').replace(NBSP_REGEX, ' ').replace(/\s+/g, ' ').trim();
    }

    function getEditor() {
        return document.querySelector('.cm-content');
    }

    function getLines(container) {
        return Array.from(container.querySelectorAll('.cm-line'));
    }

    function lineText(el) {
        const raw = el.textContent || '';
        return {
            raw,
            norm: normalizeText(raw),
            ltrim: raw.replace(/^\s+/, ''),
            trim: raw.trim(),
        };
    }

    const isHeaderScore = (norm) => SCORE_RE.test(norm);
    const extractScore = (norm) => (norm.match(SCORE_RE)?.[1] || '');

    const isBlankLine = (el) => {
        const t = normalizeText(el.textContent || '');
        if (t !== '') return false;
        const html = (el.innerHTML || '').trim().toLowerCase();
        return t === '' || html === '<br>';
    };

    const isRationale = (norm) => RATIONALE_RE.test(norm);

    const isDashComment = (ltrimRaw) => /^-\s/.test(ltrimRaw.replace(NBSP_REGEX, ' ').slice(0, 4));
    const extractComment = (ltrimRaw) =>
        ltrimRaw.replace(NBSP_REGEX, ' ').replace(/^-\s+/, '').replace(/\s+$/, '');

    function countRenderedHeaders(container) {
        return getLines(container).reduce((n, el) => {
            const { norm } = lineText(el);
            return n + (isHeaderScore(norm) ? 1 : 0);
        }, 0);
    }

    function findScrollElement() {
        const cmContent = getEditor();
        const scroller =
            document.querySelector('.cm-scroller') ||
            (cmContent && cmContent.closest('.cm-editor')) ||
            cmContent?.parentElement;

        let el = scroller || cmContent || document.documentElement;
        while (el && el !== document.body && el !== document.documentElement) {
            const hasScroll = el.scrollHeight > el.clientHeight;
            const { overflowY } = getComputedStyle(el);
            if (hasScroll && (overflowY === 'auto' || overflowY === 'scroll')) return el;
            el = el.parentElement;
        }
        return document.scrollingElement || document.documentElement;
    }

    function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

    async function forceLoadAllLines(editor) {
        const scroller = findScrollElement();
        const deadline = Date.now() + LOAD_ALL_LINES_MAX_MS;
        let lastCount = -1;

        while (Date.now() < deadline) {
            scroller.scrollTop = 0;
            await sleep(50);

            scroller.scrollTop = scroller.scrollHeight;
            await sleep(IDLE_AFTER_SCROLL_MS);

            const bump = Math.max(1, Math.floor(scroller.clientHeight / 6));
            scroller.scrollTop = Math.max(0, scroller.scrollTop - bump);
            await sleep(50);
            scroller.scrollTop = scroller.scrollHeight;
            await sleep(IDLE_AFTER_SCROLL_MS);

            const count = countRenderedHeaders(editor);
            if (count >= MAX_BLOCKS) break;
            if (count === lastCount) await sleep(100);
            lastCount = count;
        }
    }

    function extractBlocks(container, maxBlocks = MAX_BLOCKS) {
        const lines = getLines(container);
        const blocks = [];

        for (let i = 0; i < lines.length && blocks.length < maxBlocks; i++) {
            const { norm } = lineText(lines[i]);
            if (!isHeaderScore(norm)) continue;

            const score = extractScore(norm);
            const headerEl = lines[i];

            // Skip blanks
            let j = i + 1;
            while (j < lines.length && isBlankLine(lines[j])) j++;

            // Optional rationale
            if (j < lines.length) {
                const { norm: maybeRat } = lineText(lines[j]);
                if (isRationale(maybeRat)) j++;
            }

            // Collect comments
            const comments = [];
            const commentEls = [];
            let k = j;
            while (k < lines.length) {
                const { ltrim } = lineText(lines[k]);
                if (!isDashComment(ltrim)) break;
                comments.push(extractComment(ltrim));
                commentEls.push(lines[k]);
                k++;
            }

            const afterEl = lines[k] || null;

            blocks.push({
                score,                 // extracted value
                comments,              // extracted strings
                headerEl,              // DOM anchor to mutate
                commentEls,            // DOM nodes to remove
                afterEl,               // insertion anchor
                parent: container,     // parent to insert into
            });

            i = k - 1;
        }

        return blocks;
    }

    async function waitForEditor() {
        const start = Date.now();
        return new Promise((resolve) => {
            const tick = () => {
                const editor = getEditor();
                if (editor || Date.now() - start > FIND_EDITOR_TIMEOUT_MS) resolve(editor || null);
                else setTimeout(tick, 50);
            };
            tick();
        });
    }

    // expose API
    window.EditorExtract = {
        waitForEditor,
        forceLoadAllLines,
        extractBlocks,
    };
})();
