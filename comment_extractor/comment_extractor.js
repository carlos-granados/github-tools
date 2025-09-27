(function() {
    try {
        var nodes = Array.prototype.slice.call(document.querySelectorAll('div.comment-body, td.comment-body'));
        if (!nodes.length) { alert('No comments found'); return; }
        var parts = [];
        for (var i = 1; i < nodes.length; i++) {
            var s = (nodes[i].innerText || nodes[i].textContent || '').trim();
            var norm = s.replace(/\s+/g, ' ').trim().toLowerCase();
            if (!s) continue;
            if (norm === 'nothing to preview') continue;
            parts.push(s);
        }
        if (!parts.length) { alert('No comments to copy'); return; }
        var withNumbers = parts.map(function(txt, idx){ return '------- Comment ' + (idx + 1) + ' -------\n' + txt; });
        var text = withNumbers.join('\n') + '\n-------';
        function fallbackCopy(t) {
            var ta = document.createElement('textarea');
            ta.value = t;
            ta.style.position = 'fixed';
            ta.style.top = '0';
            ta.style.left = '0';
            ta.style.width = '1px';
            ta.style.height = '1px';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            try { document.execCommand('copy'); } catch (_) {}
            document.body.removeChild(ta);
            alert('Copied ' + parts.length + ' comments to clipboard');
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                alert('Copied ' + parts.length + ' comments to clipboard');
            }).catch(function() {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    } catch (e) {
        alert('Error: ' + e.message);
    }
})();


