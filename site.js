'use strict';
/* 字體大小切換（記住選擇） */
(() => {
  const KEY = 'jiaosu.textSize', root = document.documentElement;
  const set = n => { root.dataset.size = n; for (const b of document.querySelectorAll('[data-size]')) if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', String(b.dataset.size === String(n))); try { localStorage.setItem(KEY, n); } catch { /* 無 storage */ } };
  let n = '2'; try { n = localStorage.getItem(KEY) || '2'; } catch { /* 無 storage */ }
  set(n);
  for (const b of document.querySelectorAll('button[data-size]')) b.addEventListener('click', () => set(b.dataset.size));
})();
