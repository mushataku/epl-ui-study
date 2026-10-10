// 学習デモ用：編集モード/お試しモードの切り替え＋保存。どのページでも <script src="/epl-ui-study/mode-toggle.js"></script> を
// </body> の直前に1行足すだけで同じ機能が使える（部品化）。
(function () {
  const isEdit = new URLSearchParams(location.search).get('mode') === 'edit';
  // 保存先の /api/save はローカルの save_server.py にしか無い（GitHub Pages では編集はできても保存できない）
  const canSave = ['127.0.0.1', 'localhost'].includes(location.hostname);
  document.body.classList.add(isEdit ? 'mode-edit' : 'mode-view');
  if (canSave) document.body.classList.add('can-save');

  const main = document.querySelector('main');
  if (main) main.contentEditable = isEdit ? 'true' : 'false';

  // ページの JS（type=module＝このスクリプトより後に走る）が実行時に足す属性・style を保存で焼き込まないよう、
  // 読み込み時点の属性を控え、保存時は属性だけ控えに戻して文字の編集だけを書き戻す
  const originalAttrs = new Map();
  if (main) {
    main.querySelectorAll('*').forEach(el => {
      originalAttrs.set(el, Array.from(el.attributes, a => [a.name, a.value]));
    });
  }
  // Astro の ClientRouter はリンクを横取りして body だけ差し替える＝このスクリプトが再実行されずモード表示が消える。
  // ページ内リンクは通常の読み込みにする（控えを取った後に足すので保存には混ざらない）
  if (main) main.querySelectorAll('a[href]').forEach(a => a.setAttribute('data-astro-reload', ''));

  function pristineMainHtml() {
    const clone = main.cloneNode(true);
    const live = main.querySelectorAll('*');
    const copied = clone.querySelectorAll('*');
    live.forEach((el, i) => {
      const attrs = originalAttrs.get(el);
      if (!attrs) return;
      const c = copied[i];
      Array.from(c.attributes).forEach(a => c.removeAttribute(a.name));
      attrs.forEach(([name, value]) => c.setAttribute(name, value));
    });
    return clone.innerHTML;
  }

  const style = document.createElement('style');
  style.textContent = `
    .mode-badge{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2000;
      font-size:11px;padding:4px 12px;border-radius:999px;font-weight:700;pointer-events:none}
    body.mode-edit .mode-badge{background:#ff4f8b;color:#fff}
    body.mode-view .mode-badge{background:#333;color:#fff}
    .mode-toggle{position:fixed;bottom:20px;left:20px;z-index:2000;background:#fff;color:#333;
      border:1px solid #ccc;border-radius:999px;padding:10px 18px;font-size:13px;font-weight:700;
      text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.15)}
    #save-btn{display:none;position:fixed;bottom:20px;right:20px;z-index:2000;
      background:#ff4f8b;color:#fff;border:none;border-radius:999px;padding:12px 22px;
      font-size:14px;font-weight:700;box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer}
    body.mode-edit.can-save #save-btn{display:inline-block}
    body.mode-edit main{outline:2px dashed transparent;transition:.15s}
    body.mode-edit main:hover{outline-color:#ff6fa5}
    body.mode-edit main:focus{outline:2px solid #ff4f8b}
    #save-toast{position:fixed;bottom:70px;right:20px;z-index:2000;background:#222;color:#fff;
      padding:8px 16px;border-radius:8px;font-size:13px;opacity:0;transition:opacity .3s;pointer-events:none}
  `;
  document.head.appendChild(style);

  const badge = document.createElement('div');
  badge.className = 'mode-badge';
  badge.id = 'mode-badge';
  document.body.appendChild(badge);

  const toggle = document.createElement('a');
  toggle.className = 'mode-toggle';
  toggle.id = 'mode-toggle';
  toggle.setAttribute('data-astro-reload', '');
  document.body.appendChild(toggle);

  const saveBtn = document.createElement('button');
  saveBtn.id = 'save-btn';
  saveBtn.textContent = '💾 保存';
  document.body.appendChild(saveBtn);

  const toast = document.createElement('div');
  toast.id = 'save-toast';
  toast.textContent = '保存しました';
  document.body.appendChild(toast);

  const url = new URL(location.href);
  if (isEdit) {
    badge.textContent = canSave ? '✏️ 編集モード（全文編集可）' : '✏️ 編集モード（公開版は保存なし）';
    toggle.textContent = '👀 お試しモードを見る';
    url.searchParams.delete('mode');
  } else {
    badge.textContent = '👀 お試しモード（読むだけ・編集不可）';
    toggle.textContent = '✏️ 編集モードへ';
    url.searchParams.set('mode', 'edit');
  }
  toggle.href = url.pathname + url.search;

  saveBtn.addEventListener('click', async () => {
    const mainHtml = pristineMainHtml();
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({path: location.pathname, main_html: mainHtml})
    });
    toast.textContent = res.ok ? '保存しました' : '保存に失敗しました';
    toast.style.opacity = 1;
    setTimeout(() => toast.style.opacity = 0, 1500);
  });
})();
