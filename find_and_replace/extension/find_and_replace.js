(function () {
    try {
        if (window._srRun) return;
        window._srRun = 1;

        function mkDlg() {
            var d = document, o = d.createElement('div');
            o.id = '__sr_modal__';
            var s = o.style;
            s.position = 'fixed';
            s.inset = '0';
            s.zIndex = '2147483647';
            s.background = 'rgba(0,0,0,.35)';

            var b = d.createElement('div'), bs = b.style;
            bs.position = 'absolute';
            bs.top = '50%';
            bs.left = '50%';
            bs.transform = 'translate(-50%,-50%)';
            bs.background = '#111';
            bs.color = '#fff';
            bs.padding = '16px';
            bs.border = '1px solid #444';
            bs.borderRadius = '8px';
            bs.width = 'min(90vw,480px)';
            bs.font = '14px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif';

            var ttl = d.createElement('div');
            ttl.textContent = 'Search & Replace in comments';
            ttl.style.fontWeight = '600';
            ttl.style.marginBottom = '10px';

            function row(lbl, ph) {
                var r = d.createElement('div');
                r.style.marginBottom = '10px';
                var l = d.createElement('div');
                l.textContent = lbl;
                l.style.marginBottom = '4px';
                var i = d.createElement('input');
                i.type = 'text';
                i.placeholder = ph;
                i.style.cssText = 'width:100%;padding:6px;border:1px solid #555;border-radius:6px;background:#181818;color:#eee;';
                r.appendChild(l);
                r.appendChild(i);
                return { r: r, i: i };
            }

            var r1 = row('Search', 'Text to find');
            var r2 = row('Replace', 'Replacement');

            var act = d.createElement('div');
            act.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;margin-top:6px';

            function btn(t) {
                var x = d.createElement('button');
                x.textContent = t;
                var xs = x.style;
                xs.all = 'unset';
                xs.background = '#2b2b2b';
                xs.border = '1px solid #555';
                xs.borderRadius = '6px';
                xs.padding = '6px 12px';
                xs.cursor = 'pointer';
                x.onmouseenter = function () { xs.background = '#333'; };
                x.onmouseleave = function () { xs.background = '#2b2b2b'; };
                return x;
            }

            var bc = btn('Cancel');
            var bo = btn('OK');

            act.appendChild(bc);
            act.appendChild(bo);
            b.appendChild(ttl);
            b.appendChild(r1.r);
            b.appendChild(r2.r);
            b.appendChild(act);
            o.appendChild(b);
            d.body.appendChild(o);
            setTimeout(function () { r1.i.focus(); }, 0);

            return { ov: o, find: r1.i, rep: r2.i, ok: bo, cancel: bc };
        }

        function rm(n) {
            try { n.remove(); }
            catch (_) { if (n && n.parentNode) n.parentNode.removeChild(n); }
        }

        function hov(el) {
            if (!el) return;
            ['pointerover', 'pointerenter', 'mouseover', 'mouseenter'].forEach(function (t) {
                try { el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window })); } catch (_) {}
            });
        }

        function wait(cond, ms, iv, onOk, onTo) {
            var end = Date.now() + ms;
            (function loop() {
                var r = null;
                try { r = cond(); } catch (_) { r = null; }
                if (r) { if (onOk) onOk(r); return; }
                if (Date.now() < end) setTimeout(loop, iv);
                else if (onTo) onTo();
            })();
        }

        function setVal(el, val) {
            try {
                var pr = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
                var d = Object.getOwnPropertyDescriptor(pr, 'value');
                if (d && d.set) d.set.call(el, val); else el.value = val;
            } catch (_) { el.value = val; }
            try { el.focus(); } catch (_) {}
            try { el.dispatchEvent(new Event('input', { bubbles: true, composed: true })); } catch (_) {}
            try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch (_) {}
        }

        function grp(n) {
            return n.closest('.timeline-comment-group,.timeline-comment,.js-comment-container,.js-minimizable-comment,.review-comment,.comment-holder,.js-comment,.comment');
        }

        function details(g) {
            return g.querySelector('.timeline-comment-actions details') || g.querySelector('details');
        }

        function editBtn(g) {
            return g.querySelector('.js-comment-edit-button');
        }

        function taIn(g) {
            var a = g.querySelectorAll('textarea.js-comment-field,textarea.comment-form-textarea,textarea');
            for (var i = 0; i < a.length; i++) {
                var t = a[i];
                if (t && t.offsetParent !== null) return t;
            }
            return null;
        }

        function isVis(el) {
            return !!(el && el.offsetParent !== null);
        }

        function pickSubmit(g, ta) {
            var container = g.closest('.timeline-comment-group') || g;
            var subs = [].slice.call(container.querySelectorAll('button[type=submit],input[type=submit]')).filter(isVis);
            var upd = subs.find(function (b) {
                var t = (b.innerText || b.value || b.textContent || '').trim().toLowerCase();
                return t.indexOf('update comment') >= 0;
            });
            if (upd) return upd;
            if (subs[0]) return subs[0];
            var f = (ta && ta.closest('form')) || (g.querySelector('form'));
            if (f) return f.querySelector('button[type=submit],input[type=submit]');
            return null;
        }

        function listCandidates(g, ta) {
            var out = [];
            var grpEl = g.closest('.timeline-comment-group') || g;
            out = out.concat([].slice.call(grpEl.querySelectorAll('button[type=submit],input[type=submit]')));
            out = out.concat([].slice.call(g.querySelectorAll('.js-comment-update,.js-save-edit,.js-comment-save-edit')));
            var f = (ta && ta.closest('form')) || (g.querySelector('form'));
            if (f) out = out.concat([].slice.call(f.querySelectorAll('button[type=submit],input[type=submit]')));
            var more = [].slice.call(g.querySelectorAll('button'));
            for (var i = 0; i < more.length; i++) {
                var t = (more[i].innerText || more[i].textContent || '').trim().toLowerCase();
                if (t.indexOf('update comment') >= 0 || t === 'update') out.push(more[i]);
            }
            var seen = new Set(), u = [];
            for (var j = 0; j < out.length; j++) { if (!seen.has(out[j])) { seen.add(out[j]); u.push(out[j]); } }
            return u;
        }

        function tryClickUpdate(g, ta) {
            var btn = pickSubmit(g, ta), ok = false;
            if (btn && isVis(btn) && !btn.disabled) {
                try { ['pointerdown', 'mousedown', 'click'].forEach(function (evt) { btn.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window })); }); ok = true; }
                catch (e1) { try { btn.click(); ok = true; } catch (e2) {} }
            }
            if (!ok) {
                var c = listCandidates(g, ta);
                for (var k = 0; k < c.length; k++) {
                    var b2 = c[k];
                    if (isVis(b2) && !b2.disabled) { try { b2.click(); ok = true; break; } catch (e3) {} }
                }
            }
            if (!ok) {
                var f = (ta && ta.closest('form')) || (g.querySelector('form'));
                if (f) { try { if (f.requestSubmit) { f.requestSubmit(); ok = true; } else { f.submit(); ok = true; } } catch (e4) {} }
            }
            return ok;
        }

        function openEditor(body, cb) {
            var g = grp(body);
            if (!g) { cb(new Error('no-group')); return; }
            try { g.scrollIntoView({ block: 'center' }); } catch (_) {}
            var det = details(g);
            if (!det) { cb(new Error('no-details')); return; }
            var menu = g.querySelector('details-menu');
            var s = det.querySelector('summary');
            hov(det); hov(s); hov(menu);
            if (menu && menu.getAttribute('src')) { try { fetch(menu.getAttribute('src'), { credentials: 'same-origin' }); } catch (_) {} }
            try { (s || det).click(); } catch (_) {}
            wait(function () {
                var ed = editBtn(g);
                if (ed && !ed.disabled) { try { ed.click(); } catch (_) {} return ed; }
                return null;
            }, 4000, 120, function () { }, function () { });
            wait(function () { return taIn(g); }, 9000, 120, function (ta) { cb(null, { g: g, ta: ta }); }, function () { cb(new Error('editor-timeout')); });
        }

        var dlg = mkDlg();

        dlg.cancel.onclick = function () {
            rm(dlg.ov);
            window._srRun = 0;
        };

        dlg.ok.onclick = function () {
            var F = dlg.find.value || '';
            var R = dlg.rep.value || '';
            if (!F) { rm(dlg.ov); window._srRun = 0; return; }
            rm(dlg.ov);

            var bodies = [].slice.call(document.querySelectorAll('div.comment-body,td.comment-body'));
            var targets = bodies.filter(function (b) {
                var t = b.innerText || b.textContent || '';
                return t.indexOf(F) >= 0;
            });
            if (!targets.length) { alert('No matches'); window._srRun = 0; return; }

            var i = 0;
            (function next() {
                if (i >= targets.length) { window._srRun = 0; return; }
                var body = targets[i++];
                openEditor(body, function (err, ctx) {
                    if (err) { setTimeout(next, 200); return; }
                    var ta = ctx.ta;
                    var after = (ta.value || '').split(F).join(R);
                    setVal(ta, after);
                    setTimeout(function () {
                        var ok = tryClickUpdate(ctx.g, ta);
                        if (!ok) {
                            wait(function () {
                                var b = pickSubmit(ctx.g, ta);
                                return b && isVis(b) && !b.disabled ? b : null;
                            }, 5000, 150, function (b) { try { b.click(); } catch (_) {} });
                        }
                        wait(function () {
                            var open = taIn(ctx.g);
                            return !open || open.offsetParent === null;
                        }, 8000, 150, function () { setTimeout(next, 200); }, function () { setTimeout(next, 200); });
                    }, 150);
                });
            })();
        };
    } catch (e) {
        try { alert('Error: ' + e.message); } catch (_) {}
        window._srRun = 0;
    }
})();


