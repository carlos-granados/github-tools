// panel.js
(() => {
    if (window.EditorPanel) return;

    const TAB_TITLES = ['Expert <=> A1', 'Expert <=> A2', 'A1 <=> A2'];
    const VALID_SCORES = ['AA', 'A', 'BB', 'B'];

    const { styles, el, colors } = window.EditorPanelStyles;

    /**
     * Adds consistent hover/active behavior to a button.
     */
    function attachHoverPress(btn, baseColor, hoverColor, activeColor) {
        btn.style.background = baseColor;

        let hovering = false;

        btn.addEventListener('mouseenter', () => {
            hovering = true;
            btn.style.background = hoverColor;
        });

        btn.addEventListener('mouseleave', () => {
            hovering = false;
            btn.style.background = baseColor;
        });

        btn.addEventListener('mousedown', () => {
            btn.style.background = activeColor;
        });

        btn.addEventListener('mouseup', (e) => {
            const r = btn.getBoundingClientRect();
            const inside =
                e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
            btn.style.background = hovering && inside ? hoverColor : baseColor;
        });

        btn.addEventListener('blur', () => {
            btn.style.background = hovering ? hoverColor : baseColor;
        });
    }

    function createOverlay() {
        const overlay = el('div', styles.overlay, {
            id: 'comparison-comments-editor-overlay',
            role: 'dialog',
            'aria-modal': 'true',
        });

        const bar = el('div', styles.topBar);
        const title = el('div', styles.title, { text: 'Comparison Comments Editor' });

        const btns = el('div', styles.btnWrap);

        // --- Top right buttons ---
        const btnCancel = el('button', styles.btnCancel, { text: 'Cancel' });
        const btnSave = el('button', styles.btnSave, { text: 'Save' });

        // Apply hover/press effects (colors moved to panel_styles.js)
        attachHoverPress(btnCancel, colors.bg, colors.cancelHover, colors.cancelActive);
        attachHoverPress(btnSave, colors.save, colors.saveHover, colors.saveActive);

        btns.append(btnCancel, btnSave);
        bar.append(title, btns);

        const tabsRow = el('div', styles.tabsRow);
        const contentFrame = el('div', styles.contentFrame);
        const panels = el('div', styles.panels);
        contentFrame.appendChild(panels);

        overlay.append(bar, tabsRow, contentFrame);

        return { overlay, btnCancel, btnSave, tabsRow, panels, contentFrame };
    }

    function open({ blocks, onSave, onCancel }) {
        const existing = document.getElementById('comparison-comments-editor-overlay');
        if (existing) existing.remove();

        const { overlay, btnCancel, btnSave, tabsRow, panels, contentFrame } = createOverlay();

        const validateScore = (v) => VALID_SCORES.includes((v || '').trim().toUpperCase());

        // Build tabs & comments
        window.EditorComments.buildTabs({
            blocks,
            tabsRow,
            panels,
            contentFrame,
            tabTitles: TAB_TITLES,
            validateScore,
            attachHoverPress, // pass helper so comment buttons can use it
        });

        const cleanup = () => {
            overlay.remove();
            document.removeEventListener('keydown', escHandler, true);
        };

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                e.preventDefault();
                try {
                    onCancel?.();
                } finally {
                    cleanup();
                }
            }
        };

        btnCancel.addEventListener('click', () => {
            try {
                onCancel?.();
            } finally {
                cleanup();
            }
        });

        btnSave.addEventListener('click', () => {
            try {
                const { updatedScores, updatedComments } = window.EditorComments.collect();
                onSave?.({ updatedScores, updatedComments });
            } finally {
                cleanup();
            }
        });

        document.addEventListener('keydown', escHandler, true);
        document.body.appendChild(overlay);
    }

    window.EditorPanel = { open };
})();

























