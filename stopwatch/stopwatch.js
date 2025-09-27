(function() {
    try {
        if (document.getElementById('cg_sw')) return;
        var d = document, b = d.body;
        var w = d.createElement('div');
        w.id = 'cg_sw';
        var s = w.style;
        s.position = 'fixed';
        s.top = '10px';
        s.right = '10px';
        s.zIndex = '2147483647';
        s.background = '#111';
        s.color = '#fff';
        s.font = '12px/1.2 sans-serif';
        s.border = '1px solid #444';
        s.borderRadius = '8px';
        s.padding = '8px 10px';
        s.display = 'flex';
        s.alignItems = 'center';
        s.gap = '8px';
        s.boxShadow = '0 4px 12px rgba(0,0,0,.35)';
        var t = d.createElement('span');
        t.textContent = '00:00:00';
        t.style.minWidth = '86px';
        t.style.textAlign = 'center';
        t.style.fontWeight = '600';
        t.style.letterSpacing = '.3px';
        function makeBtn(text, title) {
            var e = d.createElement('button');
            e.type = 'button';
            e.textContent = text;
            e.title = title || '';
            var bs = e.style;
            bs.all = 'unset';
            bs.background = '#2b2b2b';
            bs.border = '1px solid #555';
            bs.borderRadius = '6px';
            bs.padding = '4px 8px';
            bs.cursor = 'pointer';
            bs.userSelect = 'none';
            e.onmouseenter = function () { bs.background = '#333'; };
            e.onmouseleave = function () { bs.background = '#2b2b2b'; };
            return e;
        }
        var btnStart = makeBtn('▶', 'Play/Pause');
        var btnOk = makeBtn('✓', 'Add rounded minutes and reset');
        var btnClose = makeBtn('×', 'Remove stopwatch');
        w.appendChild(t);
        w.appendChild(btnStart);
        w.appendChild(btnOk);
        w.appendChild(btnClose);
        b.appendChild(w);
        var startedAt = null;
        var acc = 0;
        var tickId = null;
        function pad(n) {
            n = String(n);
            return n.length < 2 ? '0' + n : n;
        }
        function fmt(ms) {
            var s2 = Math.floor(ms / 1000);
            var h = Math.floor(s2 / 3600);
            var m = Math.floor((s2 % 3600) / 60);
            var ss = s2 % 60;
            return pad(h) + ':' + pad(m) + ':' + pad(ss);
        }
        function tick() {
            var now = Date.now();
            var elapsed = (startedAt ? now - startedAt : 0) + acc;
            t.textContent = fmt(elapsed);
        }
        function start() {
            if (startedAt !== null) return;
            startedAt = Date.now();
            tickId = setInterval(tick, 200);
            btnStart.textContent = '⏸';
        }
        function stop() {
            if (startedAt === null) return;
            acc += Date.now() - startedAt;
            startedAt = null;
            if (tickId) { clearInterval(tickId); tickId = null; }
            tick();
            btnStart.textContent = '▶';
        }
        function reset() {
            startedAt = null;
            acc = 0;
            if (tickId) { clearInterval(tickId); tickId = null; }
            tick();
            btnStart.textContent = '▶';
        }
        function findTargetInput() {
            var root = d.querySelector('div[data-tutorial-selector-id="pageCellLabelPairTotalTimeSpentMinutes"]');
            if (!root) return null;
            return root.querySelector('input[type="text"],input[type="number"],input:not([type]),textarea');
        }
        function setControlledValue(el, val) {
            try {
                var tag = el.tagName;
                var proto = tag === 'TEXTAREA' ? window.HTMLTextAreaElement && HTMLTextAreaElement.prototype : window.HTMLInputElement && HTMLInputElement.prototype;
                var desc = proto && Object.getOwnPropertyDescriptor(proto, 'value');
                if (desc && desc.set) { desc.set.call(el, val); }
                else { el.value = val; }
            } catch (_) { el.value = val; }
            try { el.dispatchEvent(new Event('input', { bubbles: true, composed: true })); } catch (_) {}
            try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch (_) {}
        }
        function addRoundedMinutesAndReset() {
            if (startedAt !== null) stop();
            var mins = Math.round(acc / 60000);
            if (mins > 0) {
                var inp = findTargetInput();
                if (!inp) {
                    alert('Target input not found inside div[data-tutorial-selector-id="pageCellLabelPairTotalTimeSpentMinutes"].');
                    reset();
                    return;
                }
                var cur = (inp.value || '').toString().trim();
                var curNum = cur === '' ? 0 : parseFloat(cur.replace(',', '.'));
                if (!isFinite(curNum)) curNum = 0;
                var next = String(curNum + mins);
                try { inp.focus(); } catch (_) {}
                try { if (inp.select) inp.select(); } catch (_) {}
                setControlledValue(inp, next);
                try { inp.blur(); } catch (_) {}
            }
            reset();
        }
        function removeWidget() {
            if (tickId) { clearInterval(tickId); tickId = null; }
            startedAt = null;
            acc = 0;
            try { w.remove(); } catch (_) { if (w.parentNode) w.parentNode.removeChild(w); }
        }
        btnStart.addEventListener('click', function () { if (startedAt === null) start(); else stop(); });
        btnOk.addEventListener('click', addRoundedMinutesAndReset);
        btnClose.addEventListener('click', removeWidget);
        tick();
    } catch (e) {
        try { alert('Stopwatch error: ' + e.message); } catch (_) {}
    }
})();
