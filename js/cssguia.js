document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('#css-guia pre').forEach(function(pre) {
    var existing = pre.nextElementSibling;
    var btn = null;
    if (existing && existing.tagName === 'BUTTON' && /copiar/i.test(existing.textContent)) {
      btn = existing;
      btn.classList.add('copy-btn');
    }
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copiar código';
      btn.style.marginTop = '8px';
      btn.style.background = '#2563eb';
      btn.style.color = '#fff';
      btn.style.border = 'none';
      btn.style.padding = '0.4rem 1rem';
      btn.style.borderRadius = '6px';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '0.95rem';
      pre.parentNode.insertBefore(btn, pre.nextSibling);
    }

    if (!btn.dataset.handlerAttached) {
      btn.addEventListener('click', function() {
        var code = pre.querySelector('code');
        if (code) {
          var text = code.innerText.replace(/\u00a0/g, ' ');
          navigator.clipboard.writeText(text);
          var original = btn.textContent;
          btn.textContent = '¡Copiado!';
          setTimeout(function() { btn.textContent = original; }, 1200);
        }
      });
      btn.dataset.handlerAttached = 'true';
    }
  });
});
