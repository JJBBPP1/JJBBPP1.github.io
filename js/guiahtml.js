(function(){
  if (window.__codePreviewInit) return; window.__codePreviewInit = true;

  function detectType(text){
    if(/<\/?[a-z][\s\S]*>/i.test(text)) return 'html';
    if(/^[\s\r\n]*[.#a-zA-Z\-][^{]*\{[\s\S]*:[^}]+}/m.test(text) || /:\s*[^;\n]+;/.test(text)) return 'css';
    return 'js';
  }

  function escapeScript(s){
    return s.replace(/<\\/g, '<\\/');
  }

  function wrapForCSS(css){
    return '<!doctype html><html><head><meta charset="utf-8"><style>' + css + '</style></head><body><div class="preview-root" style="padding:0.5rem;">Elemento</div></body></html><!doctype html><html><head><meta charset="utf-8"></head><body><script>' + safe + '<\\/script></body></html>';
  }

  function makePreview(codeText){
    var type = detectType(codeText);
    var srcdoc = '';
    var sandbox = '';
    if(type === 'html'){
      srcdoc = codeText;
      sandbox = /<script[\s>]/i.test(codeText) ? 'allow-scripts' : '';
    } else if(type === 'css'){
      srcdoc = wrapForCSS(codeText);
    } else {
      srcdoc = wrapForJS(codeText);
      sandbox = 'allow-scripts';
    }
    return { srcdoc: srcdoc, sandbox: sandbox };
  }

  document.addEventListener('DOMContentLoaded', function(){
    var pres = document.querySelectorAll('pre');
    pres.forEach(function(pre){
      var code = pre.querySelector('code');
      if(!code) return;
      var text = code.innerText || code.textContent || '';

      var insertAfter = null;
      var next = pre.nextElementSibling;
      if(next && next.tagName === 'BUTTON' && /copiar/i.test(next.textContent || '')){
        insertAfter = next;
      } else {
        insertAfter = pre;
      }

      var maybe = insertAfter.nextElementSibling;
      if(maybe && maybe.classList && maybe.classList.contains('example-wrapper')) return;

      var wrap = document.createElement('div');
      wrap.className = 'example-wrapper';
      wrap.style.display = 'inline-block';
      wrap.style.marginLeft = '0.6rem';

      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'example-toggle';
      toggle.textContent = 'Mostrar ejemplo';

      var iframe = document.createElement('iframe');
      iframe.className = 'example-frame';
      iframe.setAttribute('aria-hidden','true');
      iframe.style.display = 'none';

      var preview = makePreview(text);
      iframe.srcdoc = preview.srcdoc;
      if(preview.sandbox) iframe.setAttribute('sandbox', preview.sandbox);

      toggle.addEventListener('click', function(){
        if(iframe.style.display === 'none'){
          iframe.style.display = 'block';
          iframe.setAttribute('aria-hidden','false');
          toggle.textContent = 'Ocultar ejemplo';
        } else {
          iframe.style.display = 'none';
          iframe.setAttribute('aria-hidden','true');
          toggle.textContent = 'Mostrar ejemplo';
        }
      });

      if(insertAfter !== pre){
        insertAfter.parentNode.insertBefore(wrap, insertAfter.nextSibling);
        wrap.appendChild(toggle);
        var blockWrap = document.createElement('div');
        blockWrap.className = 'example-wrapper-block';
        blockWrap.style.marginTop = '0.5rem';
        blockWrap.appendChild(iframe);
        insertAfter.parentNode.insertBefore(blockWrap, wrap.nextSibling);
      } else {
        wrap.appendChild(toggle);
        wrap.appendChild(iframe);
        pre.parentNode.insertBefore(wrap, pre.nextSibling);
      }
    });
  });
})();
