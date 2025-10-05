// panel_comments.js
(() => {
    if (window.EditorComments) return;

    const { colors, styles, el } = window.EditorPanelStyles;

    function makeCommentRow({ tabIndex, index, value, scoreValue, onDelete, onScoreChange, attachHoverPress }) {
        const item = el('div', styles.commentItem);

        // #: number
        const num = el('div', styles.commentNum, {
            text: `#${index + 1}`,
            'data-role': 'num',
        });

        // Comment textarea
        const textarea = el('textarea', styles.textarea, {
            rows: '3',
            'data-comment': '1',
            'data-tab-index': String(tabIndex),
            'data-comment-index': String(index),
        });
        textarea.value = value || '';

        // Score input (numeric)
        const scoreCell = el('div', styles.scoreCell);
        const scoreInput = el('input', styles.scoreInputSmall, {
            type: 'number',
            step: '1',
            'data-score': '1',
            'data-tab-index': String(tabIndex),
            'data-score-index': String(index),
        });
        scoreInput.value = (typeof scoreValue === 'number' && !Number.isNaN(scoreValue)) ? String(scoreValue) : '0';
        scoreInput.addEventListener('input', () => onScoreChange());

        scoreCell.appendChild(scoreInput);

        // Actions (Copy / X)
        const actions = el('div', styles.actionsWrap);
        const copyBtn = el('button', styles.actionBtn, { text: 'Copy', type: 'button' });
        const delBtn = el('button', styles.deleteBtn, { text: 'X', type: 'button' });

        // Hover/press effects
        attachHoverPress(copyBtn, colors.bg, colors.plainHover, colors.plainActive);
        attachHoverPress(delBtn, colors.bg, colors.dangerHoverBg, colors.dangerActive);

        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(textarea.value || '');
        });
        delBtn.addEventListener('click', () => onDelete(item));

        actions.append(copyBtn, delBtn);
        item.append(num, textarea, scoreCell, actions);
        return item;
    }

    function buildTabs({ blocks, tabsRow, panels, contentFrame, tabTitles, validateScore, attachHoverPress }) {
        const tabButtons = [];
        const tabPanels = [];

        const updateScoreColor = (input) => {
            const ok = validateScore(input.value);
            input.style.color = ok ? colors.text : colors.danger;
        };

        const updateCommentCountColor = (label, count) => {
            label.style.color = count < 5 ? colors.danger : colors.text;
        };

        for (let i = 0; i < 3; i++) {
            const active = i === 0;

            const tabBtn = el('button', styles.tabButton(active), {
                'data-tab': String(i),
                text: tabTitles[i],
            });
            tabButtons.push(tabBtn);
            tabsRow.appendChild(tabBtn);

            const panel = el('div', styles.panel(active), { 'data-panel': String(i) });

            // Score header row (Score: [input] | Number of comments: X)
            const row = el('div', styles.headerRow);
            const left = el('div', styles.headerLeft);
            const label = el('label', styles.label, { text: 'Score:' });
            const input = el('input', styles.scoreInput, {
                type: 'text',
                'data-score-input': String(i),
            });

            const block = blocks[i];
            const initialScore = block ? block.score : '';
            const initialComments = (block && Array.isArray(block.comments)) ? block.comments : [];
            input.value = initialScore;
            updateScoreColor(input);

            let commentsCount = initialComments.length;

            const right = el('div', styles.headerRight, {
                text: `Number of comments: ${commentsCount}`,
            });
            updateCommentCountColor(right, commentsCount);

            input.addEventListener('input', () => updateScoreColor(input));

            left.append(label, input);
            row.append(left, right);
            panel.append(row);

            // Subheader with # / Comment / Score / (empty actions)
            const subheader = el('div', styles.commentSubheaderGrid);
            const numHeader = el('div', styles.commentNumHeader, { text: '#' });
            const commentHeader = el('div', styles.commentHeader, { text: 'Comment' });
            const scoreHeader = el('div', styles.scoreHeader, { text: 'Score' });
            const actionsHeader = el('div', styles.actionsHeader, { text: '' }); // placeholder to align columns
            subheader.append(numHeader, commentHeader, scoreHeader, actionsHeader);
            panel.appendChild(subheader);

            // Scrollable comments list
            const scrollBox = el('div', styles.scrollBox);
            const commentsWrap = el('div', styles.commentsWrap);
            const list = el('div', styles.commentList);

            // Running total for this tab
            const recomputeTotal = () => {
                const scores = Array.from(list.querySelectorAll('input[data-score]'))
                    .map((inp) => parseFloat(inp.value))
                    .map((n) => (Number.isFinite(n) ? n : 0));
                const total = scores.reduce((a, b) => a + b, 0);
                totalScoreLabel.textContent = `Total score: ${total}`;
            };

            const comments = initialComments;
            comments.forEach((c, idx) => {
                list.appendChild(
                    makeCommentRow({
                        tabIndex: i,
                        index: idx,
                        value: c,
                        scoreValue: 0, // default new UI scores to 0
                        onDelete,
                        onScoreChange: recomputeTotal,
                        attachHoverPress,
                    })
                );
            });

            commentsWrap.append(list);
            scrollBox.appendChild(commentsWrap);
            panel.appendChild(scrollBox);

            // Footer grid aligned to columns: ( # | comment | score | actions )
            const footer = el('div', styles.footerGrid);

            // Left cell: Add comment button (spans # + comment)
            const addCell = el('div', styles.footerAddCell);
            const addBtn = el('button', styles.addCommentBtn, { text: '+ Add comment' });
            attachHoverPress(addBtn, colors.bg, colors.plainHover, colors.plainActive);
            addCell.appendChild(addBtn);

            // Middle score column: Total label (wider in footer via styles.footerGrid)
            const totalScoreLabel = el('div', styles.totalScore, { text: 'Total score: 0' });

            // Right cell: Copy all button
            const copyCell = el('div', styles.footerCopyCell);
            const copyAllBtn = el('button', styles.copyAllBtn, { text: 'Copy all' });
            attachHoverPress(copyAllBtn, colors.bg, colors.plainHover, colors.plainActive);
            copyCell.appendChild(copyAllBtn);

            footer.append(addCell, totalScoreLabel, copyCell);
            panel.appendChild(footer);

            // Wire up add/delete/copy-all
            addBtn.addEventListener('click', () => {
                const nextIndex = list.children.length;
                list.appendChild(
                    makeCommentRow({
                        tabIndex: i,
                        index: nextIndex,
                        value: '',
                        scoreValue: 0,
                        onDelete,
                        onScoreChange: recomputeTotal,
                        attachHoverPress,
                    })
                );
                commentsCount = nextIndex + 1;
                right.textContent = `Number of comments: ${commentsCount}`;
                updateCommentCountColor(right, commentsCount);
                recomputeTotal();
                requestAnimationFrame(() => list.lastElementChild?.scrollIntoView({ block: 'nearest' }));
            });

            copyAllBtn.addEventListener('click', () => {
                const texts = Array.from(list.querySelectorAll('textarea'))
                    .map((t) => t.value.trim())
                    .filter(Boolean);
                const joined = texts.join('\n-------------\n');
                navigator.clipboard.writeText(joined);
            });

            function onDelete(rowEl) {
                rowEl.remove();
                Array.from(list.children).forEach((row, idx) => {
                    const num = row.querySelector('[data-role="num"]');
                    const ta = row.querySelector('textarea[data-comment]');
                    const score = row.querySelector('input[data-score]');
                    if (num) num.textContent = `#${idx + 1}`;
                    if (ta) ta.setAttribute('data-comment-index', String(idx));
                    if (score) score.setAttribute('data-score-index', String(idx));
                });
                commentsCount = list.children.length;
                right.textContent = `Number of comments: ${commentsCount}`;
                updateCommentCountColor(right, commentsCount);
                recomputeTotal();
            }

            // Initial total
            recomputeTotal();

            panels.appendChild(panel);
            tabPanels.push(panel);
        }

        // Tab switching
        function activate(idx) {
            tabButtons.forEach((b, i) => {
                const active = i === idx;
                Object.assign(b.style, styles.tabButton(active));
                tabPanels[i].style.display = active ? 'flex' : 'none';
            });
            contentFrame.style.borderTopLeftRadius = idx === 0 ? '0' : '8px';
        }

        activate(0);
        tabButtons.forEach((btn, i) => btn.addEventListener('click', () => activate(i)));
    }

    function collect() {
        const root = document.getElementById('comparison-comments-editor-overlay');
        const inputs = root.querySelectorAll('input[data-score-input]');
        const updatedScores = Array.from(inputs).map((inp) => inp.value ?? '');

        // NOTE: per-comment numeric scores are not being returned yet.
        // If you'd like to persist them, we can add them to this payload.
        const updatedComments = [[], [], []];
        const textareas = root.querySelectorAll('textarea[data-comment]');
        textareas.forEach((ta) => {
            const tabIdx = Number(ta.getAttribute('data-tab-index'));
            const text = ta.value ?? '';
            updatedComments[tabIdx].push(text);
        });

        return { updatedScores, updatedComments };
    }

    window.EditorComments = { buildTabs, collect };
})();















