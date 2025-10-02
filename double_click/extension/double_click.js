javascript:(function(){
    try{
        if(window.__dbl_to_edit__)return;window.__dbl_to_edit__=true;
        function fireHover(el){
            if(!el)return;
            var evs=['pointerover','pointerenter','mouseover','mouseenter'];
            for(var i=0;i<evs.length;i++){
                try{ el.dispatchEvent(new MouseEvent(evs[i],{bubbles:true,cancelable:true,view:window})); }catch(_){}
            }
        }
        function waitForEditAndClick(group, ms){
            var end = Date.now() + ms;
            (function poll(){
                var btn = group.querySelector('.js-comment-edit-button');
                if(btn && !btn.disabled){ try{ btn.click(); }catch(_){ } return; }
                if(Date.now() < end){ setTimeout(poll, 150); }
            })();
        }
        function activateAndEdit(body){
            var group=body.closest('.timeline-comment-group');
            if(!group)return;
            var det=group.querySelector('details');
            var menu=group.querySelector('details-menu');
            if(!det)return;
            var sum=det.querySelector('summary');
            fireHover(det); fireHover(sum); fireHover(menu);
            if(menu && menu.getAttribute('src')){ try{ fetch(menu.getAttribute('src'),{credentials:'same-origin'}).catch(function(){}); }catch(_){ } }
            try{ (sum||det).click(); }catch(_){}
            setTimeout(function(){ waitForEditAndClick(group, 5000); }, 200);
        }
        function handler(e){
            var body=e.target && e.target.closest && e.target.closest('div.comment-body, td.comment-body');
            if(!body)return;
            e.preventDefault();
            activateAndEdit(body);
        }
        document.addEventListener('dblclick',handler,true);
    }catch(e){}
})();

