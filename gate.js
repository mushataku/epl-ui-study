// 公開版（GitHub Pages）だけに置く簡単な合言葉の画面。<head> の先頭で読み、合言葉が通るまで中身を隠す。
// ★見た目の目隠しであって鍵ではない（このファイルを読めば合言葉は分かる・repo も公開）。ローカルの save_server.py では出さない。
(function () {
  if (['127.0.0.1', 'localhost'].includes(location.hostname)) return;
  const PASS = '1234';
  const KEY = 'epl-gate-ok';
  try { if (localStorage.getItem(KEY) === '1') return; } catch (e) {}

  const hide = document.createElement('style');
  hide.id = 'gate-hide';
  hide.textContent = 'body>*:not(#gate){display:none!important}';
  document.head.appendChild(hide);

  function show() {
    const box = document.createElement('div');
    box.id = 'gate';
    box.innerHTML =
      '<form style="position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#fff;z-index:9999;font-family:sans-serif">' +
      '<div style="font-size:15px;font-weight:700;color:#333">パスワードを入れてください</div>' +
      '<input type="password" inputmode="numeric" autocomplete="off" style="font-size:20px;padding:10px 14px;width:180px;text-align:center;border:1px solid #ccc;border-radius:8px">' +
      '<button type="submit" style="background:#e8579a;color:#fff;border:none;border-radius:999px;padding:10px 28px;font-size:15px;font-weight:700">開く</button>' +
      '<div class="gate-err" style="color:#d33;font-size:13px;min-height:1em"></div>' +
      '</form>';
    document.body.appendChild(box);
    const input = box.querySelector('input');
    const err = box.querySelector('.gate-err');
    input.focus();
    box.querySelector('form').addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (input.value === PASS) {
        try { localStorage.setItem(KEY, '1'); } catch (e) {}
        box.remove();
        hide.remove();
      } else {
        err.textContent = 'パスワードが違います';
        input.value = '';
        input.focus();
      }
    });
  }
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
})();
