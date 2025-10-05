// panel_styles.js
(() => {
    if (window.EditorPanelStyles) return;

    const colors = {
        // Base palette
        text: '#111827',
        textMuted: '#4b5563',
        border: '#e5e7eb',
        borderMid: '#d1d5db',
        bg: '#ffffff',
        bgSubtle: '#f9fafb',
        bgTabInactive: '#f3f4f6',
        danger: '#dc2626',

        // Hover/active colors
        dangerHoverBg: '#fef2f2',
        dangerActive: '#fce8e8',

        save: '#1f883d',
        saveHover: '#36b14d',
        saveActive: '#1a7533',

        cancelHover: '#f3f4f6',
        cancelActive: '#e5e7eb',

        plainHover: '#f3f4f6',
        plainActive: '#e5e7eb',
    };

    // Inject fallback hover CSS
    const HOVER_STYLE_ID = 'cce-hover-style';
    if (!document.getElementById(HOVER_STYLE_ID)) {
        const style = document.createElement('style');
        style.id = HOVER_STYLE_ID;
        style.textContent = `
      #comparison-comments-editor-overlay .cce-plain-btn:hover { background: ${colors.plainHover} !important; }
      #comparison-comments-editor-overlay .cce-add-btn:hover   { background: ${colors.plainHover} !important; }
      #comparison-comments-editor-overlay .cce-danger-btn:hover { background: ${colors.dangerHoverBg} !important; }
      #comparison-comments-editor-overlay .cce-primary:hover    { background: ${colors.saveHover} !important; border-color: ${colors.saveHover} !important; }
    `;
        document.head.appendChild(style);
    }

    // DOM helper
    function el(tag, style = {}, attrs = {}) {
        const node = document.createElement(tag);
        Object.assign(node.style, style);
        for (const [k, v] of Object.entries(attrs)) {
            if (k === 'text') node.textContent = v;
            else node.setAttribute(k, v);
        }
        return node;
    }

    // Consistent column sizing per section (separate grids)
    const COLS = {
        index: '56px',
        commentHeader: '1fr',
        commentRows: '1fr',
        score: '80px',          // halved score column
        actions: '100px',       // ⬅️ reduced by 10px (was 110px)
        addCol: '220px',        // wider "Add comment" column so text doesn't wrap
    };

    const styles = {
        overlay: {
            position: 'fixed',
            inset: '0',
            zIndex: '2147483647',
            background: colors.bg,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily:
                'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
            color: colors.text,
        },
        topBar: {
            flex: '0 0 56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            background: colors.bg,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        title: { fontSize: '16px', fontWeight: '600' },
        btnWrap: { display: 'flex', gap: '12px', marginTop: '6px', marginBottom: '6px' },
        btnCancel: {
            padding: '8px 18px',
            border: `1px solid ${colors.borderMid}`,
            borderRadius: '10px',
            background: colors.bg,
            color: colors.text,
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: '600',
            transition: 'background 120ms ease, transform 90ms ease',
        },
        btnSave: {
            padding: '8px 18px',
            border: `1px solid ${colors.save}`,
            borderRadius: '10px',
            background: colors.save,
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: '700',
            transition: 'background 120ms ease, transform 90ms ease, filter 120ms ease',
        },
        tabsRow: {
            flex: '0 0 54px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px',
            padding: '0 16px',
            background: colors.bgSubtle,
        },
        contentFrame: {
            flex: '1 1 auto',
            margin: '0 16px 16px',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            background: colors.bg,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
        },
        panels: { flex: '1 1 auto', overflow: 'hidden' },
        tabButton: (active) => ({
            appearance: 'none',
            position: 'relative',
            border: `1px solid ${colors.borderMid}`,
            borderBottom: active ? 'none' : `1px solid ${colors.borderMid}`,
            borderRadius: '8px 8px 0 0',
            background: active ? colors.bg : colors.bgTabInactive,
            padding: '10px 20px',
            cursor: 'pointer',
            fontWeight: active ? '700' : '400',
            color: active ? colors.text : colors.textMuted,
            boxShadow: active ? '0 -2px 6px rgba(0,0,0,0.05)' : 'none',
            bottom: active ? '-1px' : '0',
            zIndex: active ? '1' : '0',
        }),
        panel: (active) => ({
            display: active ? 'flex' : 'none',
            flexDirection: 'column',
            height: '100%',
            padding: '24px',
            overflow: 'hidden',
        }),

        // Fixed score/number header
        headerRow: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '16px',
            background: colors.bg,
            flex: '0 0 auto',
        },
        headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
        label: { fontWeight: '700', fontSize: '20px' },
        // Half-width header score input (was minWidth: 200px)
        scoreInput: {
            padding: '10px 12px',
            border: `1px solid ${colors.borderMid}`,
            borderRadius: '6px',
            minWidth: '100px',
            fontSize: '20px',
            textAlign: 'right',
        },
        headerRight: { fontSize: '20px', fontWeight: '700' },

        // ======== SUBHEADER (separate grid) ========
        // # | Comment | Score | Actions
        commentSubheaderGrid: {
            flex: '0 0 auto',
            display: 'grid',
            gridTemplateColumns: `${COLS.index} ${COLS.commentHeader} ${COLS.score} ${COLS.actions}`,
            fontWeight: '700',
            fontSize: '16px',
            padding: '10px 12px',
            borderBottom: `1px solid ${colors.border}`,
            background: colors.bg,
        },
        commentNumHeader: {
            textAlign: 'right',
            paddingRight: '6px',
        },
        commentHeader: {
            paddingLeft: '6px',
            minWidth: '0', // allow Comment header to shrink without pushing Score over Actions
        },
        // ⬅️ Align "Score" header to the right
        scoreHeader: {
            textAlign: 'right',
            paddingRight: '6px',
            whiteSpace: 'nowrap',
        },
        actionsHeader: {
            justifySelf: 'end',
        },

        // ======== ROWS (separate grid) ========
        scrollBox: { flex: '1 1 auto', overflow: 'auto', display: 'block' },
        commentsWrap: { paddingTop: '12px' },
        commentList: { display: 'flex', flexDirection: 'column', gap: '12px' },

        // # | comment | score | actions
        commentItem: {
            display: 'grid',
            gridTemplateColumns: `${COLS.index} ${COLS.commentRows} ${COLS.score} ${COLS.actions}`,
            alignItems: 'start',
            gap: '12px',
        },
        commentNum: {
            fontWeight: '700',
            color: '#374151',
            paddingTop: '6px',
            textAlign: 'right',
            paddingRight: '6px',
            minWidth: COLS.index,
        },
        textarea: {
            width: '100%',
            minHeight: '3em',
            resize: 'vertical',
            border: `1px solid ${colors.borderMid}`,
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '14px',
            lineHeight: '1.4',
        },
        scoreCell: {
            display: 'flex',
            alignItems: 'center',
        },
        // Fill the 80px score column and keep right-aligned
        scoreInputSmall: {
            width: '100%',
            padding: '8px 10px',
            border: `1px solid ${colors.borderMid}`,
            borderRadius: '6px',
            fontSize: '14px',
            textAlign: 'right',
        },

        actionsWrap: {
            display: 'flex',
            gap: '8px',
            alignItems: 'start',
            justifyContent: 'flex-end',
            whiteSpace: 'nowrap',
        },
        // Per-row action button (Copy) — small
        actionBtn: {
            padding: '6px 10px',
            border: `1px solid ${colors.borderMid}`,
            borderRadius: '8px',
            background: colors.bg,
            color: colors.text,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            userSelect: 'none',
            transition: 'background 120ms ease, transform 90ms ease',
        },
        // Delete "X" button
        deleteBtn: {
            padding: '6px 10px',
            border: `1px solid ${colors.borderMid}`,
            borderRadius: '8px',
            background: colors.bg,
            color: colors.danger,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '700',
            userSelect: 'none',
            transition: 'background 120ms ease, transform 90ms ease',
        },

        // ======== FOOTER (separate grid) ========
        // [Add button column (wider)] [Total (under Comment+Score, ends at score edge)] [Copy all (actions width)]
        footerGrid: {
            marginTop: '12px',
            display: 'grid',
            gridTemplateColumns: `${COLS.addCol} 1fr ${COLS.score} ${COLS.actions}`,
            alignItems: 'center',
            gap: '12px',
            flex: '0 0 auto',
        },
        footerAddCell: {
            gridColumn: '1 / span 1',
        },
        addCommentBtn: {
            padding: '10px 20px',
            border: `1px solid ${colors.borderMid}`,
            borderRadius: '10px',
            background: colors.bg,
            color: colors.text,
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '700',
            userSelect: 'none',
            whiteSpace: 'nowrap', // prevent wrapping
            transition: 'background 120ms ease, transform 90ms ease',
        },
        // Span columns 2–3 (comment+score) and right-align so it ends at score edge
        totalScore: {
            gridColumn: '2 / span 2',
            fontWeight: '700',
            fontSize: '16px',
            padding: '6px 0',
            justifySelf: 'end',
            textAlign: 'right',
            minWidth: 0,
            whiteSpace: 'nowrap',
        },
        footerCopyCell: {
            display: 'flex',
            justifyContent: 'end',
            alignItems: 'center',
        },
        copyAllBtn: {
            padding: '10px 20px',
            border: `1px solid ${colors.borderMid}`,
            borderRadius: '10px',
            background: colors.bg,
            color: colors.text,
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '700',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            transition: 'background 120ms ease, transform 90ms ease',
        },
    };

    window.EditorPanelStyles = { colors, styles, el };
})();































