'use strict';
/* 字體大小切換（記住選擇） */
(() => {
  const KEY = 'jiaosu.textSize', root = document.documentElement;
  const set = n => { root.dataset.size = n; for (const b of document.querySelectorAll('button[data-size]')) b.setAttribute('aria-pressed', String(b.dataset.size === String(n))); try { localStorage.setItem(KEY, n); } catch { /* 無 storage */ } };
  let n = '2'; try { n = localStorage.getItem(KEY) || '2'; } catch { /* 無 storage */ }
  set(n);
  for (const b of document.querySelectorAll('button[data-size]')) b.addEventListener('click', () => set(b.dataset.size));
})();

/* 手機選單：開合、點連結後收起、Esc 關閉 */
(() => {
  const btn = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  if (!btn || !nav) return;
  const open = v => { btn.setAttribute('aria-expanded', String(v)); document.body.classList.toggle('nav-open', v); };
  btn.addEventListener('click', () => open(btn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', e => { if (e.target.closest('a')) open(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { open(false); btn.focus(); } });
})();

/* 目前位置：捲動時標示所在區塊；回到頁首按鈕 */
(() => {
  const links = new Map([...document.querySelectorAll('#nav a')].map(a => [a.getAttribute('href').slice(1), a]));
  const secs = [...links.keys()].map(id => document.getElementById(id)).filter(Boolean);
  const top = document.querySelector('.to-top');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      for (const e of es) if (e.isIntersecting) for (const [id, a] of links) { const on = id === e.target.id; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }
    }, { rootMargin: '-40% 0px -55% 0px' });
    secs.forEach(s => io.observe(s));
  }
  const onScroll = () => { if (top) top.hidden = scrollY < 600; };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();

/* 農曆：今日農曆與近期節日（使用瀏覽器內建中國曆，不需外部資料） */
(() => {
  let fmt;
  try { fmt = new Intl.DateTimeFormat('zh-TW-u-ca-chinese', { month: 'long', day: 'numeric', timeZone: 'Asia/Taipei' }); } catch { return; }
  if (!fmt.resolvedOptions().calendar?.startsWith('chinese')) return;
  const MONTH = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const DAY = d => d <= 10 ? '初' + '一二三四五六七八九十'[d - 1] : d < 20 ? '十' + '一二三四五六七八九'[d - 11] : d === 20 ? '二十' : d < 30 ? '廿' + '一二三四五六七八九'[d - 21] : '三十';
  const lunar = date => {
    const p = Object.fromEntries(fmt.formatToParts(date).map(x => [x.type, x.value]));
    const name = p.month.replace('閏', '').replace('冬月', '十一月').replace('臘月', '十二月');
    const leap = /閏/.test(p.month), m = MONTH.indexOf(name) + 1, d = Number(p.day);
    return { m, d, leap, text: (leap ? '閏' : '') + MONTH[m - 1] + DAY(d) };
  };
  const ymd = d => new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short', timeZone: 'Asia/Taipei' }).format(d);
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Taipei' })); today.setHours(12, 0, 0, 0);
  const t = lunar(today);
  const el = document.getElementById('today');
  if (el) { el.textContent = `今天 ${ymd(today)}・農曆${t.text}${t.d === 1 || t.d === 15 ? '（初一十五，宜上香祈福）' : ''}`; el.hidden = false; }

  /* 節日：農曆月日（神明聖誕依民間通行日期，待本宮確認） */
  const FEASTS = [
    [1, 1, '春節・新春祈福', '新年開廟，祈求闔家平安。'],
    [1, 9, '玉皇上帝聖誕', '天公生。'],
    [1, 15, '元宵・上元天官大帝聖誕', '元宵節，點燈祈福。'],
    [2, 2, '福德正神聖誕', '土地公生。'],
    [3, 23, '天上聖母聖誕', '媽祖聖誕，各地友宮與信眾前來祝壽。', true],
    [5, 5, '端午節', ''],
    [7, 15, '中元節', '中元普渡。'],
    [8, 15, '中秋節', ''],
    [9, 9, '天上聖母得道紀念日', '重陽，媽祖羽化昇天之日。', true],
    [12, 24, '送神', '恭送眾神上天述職。']
  ];
  /* 從今天起逐日往後找 400 天，取最近 5 個節日 */
  const found = [], seen = new Set();
  for (let i = 0; i < 400 && found.length < 5; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    const l = lunar(d); if (l.leap) continue;
    for (const f of FEASTS) if (f[0] === l.m && f[1] === l.d && !seen.has(f[2])) { seen.add(f[2]); found.push({ d, l, f, days: i }); }
  }
  const list = document.getElementById('events');
  if (!list || !found.length) return;
  list.replaceChildren(...found.map(({ d, l, f, days }) => {
    const li = document.createElement('li'); li.className = 'event' + (f[4] ? ' major' : '');
    const when = days === 0 ? '就是今天' : days === 1 ? '明天' : `還有 ${days} 天`;
    li.innerHTML = `<span class="ev-date"><b></b><small></small></span><div><h3></h3><p class="ev-when"></p><p class="ev-desc"></p></div>`;
    li.querySelector('b').textContent = l.text.replace(/^(.+月)/, '$1\u200b');
    li.querySelector('small').textContent = ymd(d);
    li.querySelector('h3').textContent = f[2];
    li.querySelector('.ev-when').textContent = when;
    li.querySelector('.ev-desc').textContent = f[3];
    if (!f[3]) li.querySelector('.ev-desc').remove();
    return li;
  }));
})();
