(function(){
    try{
        if(window._ghcp3) return; window._ghcp3=1;

        function w(c,t,i,ok,to){var e=Date.now()+t;(function p(){var r;try{r=c()}catch(_){r=null}if(r){ok&&ok(r);return}if(Date.now()<e)setTimeout(p,i);else to&&to()})()}
        function grp(n){return n.closest('.timeline-comment-group,.timeline-comment,.js-comment-container,.js-minimizable-comment,.review-comment,.comment-holder,.js-comment,.comment')}
        function det(g){return g.querySelector('.timeline-comment-actions details')||g.querySelector('details')}
        function ed(g){return g.querySelector('.js-comment-edit-button')}
        function ta(g){var a=g.querySelectorAll('textarea.js-comment-field,textarea.comment-form-textarea,textarea');for(var i=0;i<a.length;i++){var t=a[i];if(t&&t.offsetParent!==null)return t}return null}
        function can(g){var b=g.querySelector('.js-comment-cancel-button,.js-comment-cancel');if(b)return b;var L=[].slice.call(g.querySelectorAll('button,a'));for(var i=0;i<L.length;i++){var x=(L[i].innerText||L[i].textContent||'').trim().toLowerCase();if(x==='cancel'||x.indexOf('cancel')>=0)return L[i]}return null}
        function clk(b){if(!b||b.disabled)return false;try{['pointerdown','mousedown','click'].forEach(function(e){b.dispatchEvent(new MouseEvent(e,{bubbles:true,cancelable:true,view:window}))});return true}catch(_){try{b.click();return true}catch(__){}}return false}
        function open(body,cb){
            var g=grp(body); if(!g){cb(new Error('no-group'));return}
            try{g.scrollIntoView({block:'center'})}catch(_){}
            var d=det(g); if(!d){cb(new Error('no-details'));return}
            var s=d.querySelector('summary'); try{(s||d).click()}catch(_){}
            w(function(){var b=ed(g);if(b&&!b.disabled){try{b.click()}catch(_){ }return b}return null},4000,120,function(){},function(){});
            w(function(){return ta(g)},9000,120,function(t){cb(null,{g:g,ta:t})},function(){cb(new Error('editor-timeout'))});
        }
        function clip(txt){
            if(navigator.clipboard&&navigator.clipboard.writeText){return navigator.clipboard.writeText(txt).catch(function(){})}
            return new Promise(function(res){
                var t=document.createElement('textarea'); t.value=txt;
                t.style.position='fixed'; t.style.top='0'; t.style.left='0'; t.style.width='1px'; t.style.height='1px'; t.style.opacity='0';
                document.body.appendChild(t); t.focus(); t.select();
                try{document.execCommand('copy')}catch(_){}
                document.body.removeChild(t); res();
            });
        }
        function addBtn(body){
            var g=grp(body); if(!g)return;
            var r=g.querySelector('.comment-reactions'); if(!r)return;
            if(r.querySelector('._ghcp_btn'))return;

            var sp=document.createElement('span');
            sp.style.flex='1 1 auto'; sp.style.minWidth='8px';

            var b=document.createElement('button');
            b.className='_ghcp_btn'; b.textContent='Copy';
            b.style.all='unset'; b.style.cursor='pointer'; b.style.padding='4px 8px';
            b.style.border='1px solid #000'; b.style.borderRadius='6px';
            b.style.background='#fff'; b.style.color='#000'; b.style.lineHeight='1.2';
            b.style.marginInlineStart='8px';
            b.onmouseenter=function(){b.style.background='#f2f2f2'}; b.onmouseleave=function(){b.style.background='#fff'};

            b.addEventListener('click',function(e){
                e.preventDefault(); e.stopPropagation();
                open(body,function(err,ctx){
                    if(err)return;
                    clip(ctx.ta.value||'').then(function(){var c=can(ctx.g); if(c) clk(c);});
                });
            });

            r.appendChild(sp);
            r.appendChild(b);
        }

        [].slice.call(document.querySelectorAll('div.comment-body,td.comment-body')).forEach(addBtn);

        var mo=new MutationObserver(function(ms){
            for(var i=0;i<ms.length;i++){
                var a=ms[i].addedNodes;
                for(var j=0;j<a.length;j++){
                    var n=a[j]; if(!(n instanceof Element))continue;
                    if(n.matches&&n.matches('div.comment-body,td.comment-body')) addBtn(n);
                    else if(n.querySelectorAll){
                        var f=n.querySelectorAll('div.comment-body,td.comment-body');
                        if(f&&f.length)[].forEach.call(f,addBtn);
                    }
                }
            }
        });
        mo.observe(document.body,{childList:true,subtree:true});
    }catch(e){
        try{alert('Error: '+e.message)}catch(_){}
    }
})();

