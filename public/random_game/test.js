
(() => {
  const CC = 'be';
  const LANG = 'en';

  // Steam endpoints (direct)
  const STORE_SEARCH = (term) =>
    `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&cc=${CC}&l=${LANG}`;
  const APPDETAILS = (appid) =>
    `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=${CC}&l=${LANG}`;
  const APPREVIEWS = (appid) =>
    `https://store.steampowered.com/appreviews/${appid}?json=1&filter=summary&language=all&purchase_type=all`;

  const STORE_URL = (appid) => `https://store.steampowered.com/app/${appid}/`;
  const HEADER_IMG = (appid) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;

  // Abort slow requests to keep UI responsive.
  async function fetchJSON(url, { timeoutMs = 9000 } = {}) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal, credentials: 'omit', cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  }

  function byRelevance(items, term) {
    const q = term.toLowerCase();
    const score = (n) => (n === q ? 0 : n.startsWith(q) ? 1 : n.includes(q) ? 2 : 3);
    return [...items].sort((a, b) => score((a.name||'').toLowerCase()) - score((b.name||'').toLowerCase()));
  }

  function formatPrice(po) {
    if (!po) return { now: 'Free', before: null, discount: 0 };
    const { currency, final, initial, discount_percent } = po;
    try {
      const fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency });
      const now = fmt.format((final ?? 0) / 100);
      const before = typeof initial === 'number' && initial > final ? fmt.format(initial / 100) : null;
      return { now, before, discount: discount_percent || 0 };
    } catch {
      return {
        now: typeof final === 'number' ? (final / 100).toFixed(2) + ' ' + (currency || '') : 'N/A',
        before: typeof initial === 'number' && initial > final ? (initial / 100).toFixed(2) + ' ' + (currency || '') : null,
        discount: discount_percent || 0
      };
    }
  }

  function setTags(genres = [], categories = []) {
    const ul = document.querySelector('.tags');
    if (!ul) return;
    ul.innerHTML = '';
    const top = genres.map(g => g.description).filter(Boolean).slice(0, 3);
    const cats = categories.map(c => c.description).filter(x => /single-player|multi-player|co-op/i.test(x)).slice(0, 2);
    [...top, ...cats].slice(0, 5).forEach(t => {
      const li = document.createElement('li');
      li.className = 'tag';
      li.textContent = t;
      ul.appendChild(li);
    });
  }

  function setRating(positive, negative, desc) {
    const wrap = document.querySelector('.rating');
    const fill = document.querySelector('.rating-fill');
    const text = document.querySelector('.rating-text');
    if (!wrap || !fill || !text) return;
    const total = (positive || 0) + (negative || 0);
    if (!total) { wrap.style.display = 'none'; return; }
    const pct = Math.round((positive / total) * 100);
    fill.style.width = `${pct}%`;
    text.textContent = `${desc || 'User reviews'} (${pct}%) on Steam`;
    wrap.style.display = '';
  }

  function ensureSteamLink(url) {
    let link = document.querySelector('.steam-link');
    if (!link) {
      const container = document.querySelector('.game-info');
      if (!container) return;
      link = document.createElement('a');
      link.className = 'steam-link';
      link.target = '_blank';
      link.rel = 'noopener';
      link.style.display = 'inline-block';
      link.style.marginTop = '0.25rem';
      link.textContent = 'View on Steam';
      const nameEl = container.querySelector('.game-name');
      if (nameEl && nameEl.nextSibling) nameEl.parentNode.insertBefore(link, nameEl.nextSibling);
      else container.prepend(link);
    }
    link.href = url;
  }

  function applyToDom(appid, details, reviews) {
    const { name, header_image, short_description, genres, categories, price_overview } = details || {};
    const nameEl = document.querySelector('.game-name');
    const imgEl = document.querySelector('.game-img img');
    const expl = document.querySelector('.explanation');
    const priceNowEl = document.querySelector('.price-now');

    if (nameEl) nameEl.textContent = name || 'Unknown Game';
    if (imgEl) {
      imgEl.src = header_image || HEADER_IMG(appid);
      imgEl.alt = name ? `Cover art for ${name}` : 'Game cover art';
      imgEl.decoding = 'async';
      imgEl.loading = 'eager';
      imgEl.style.cursor = 'pointer';
      imgEl.onclick = () => window.open(STORE_URL(appid), '_blank', 'noopener');
    }
    if (expl) expl.textContent = (short_description || '').trim() || expl.textContent;

    if (priceNowEl) {
      const { now, before, discount } = formatPrice(price_overview);
      priceNowEl.textContent = now;
      const priceWrap = priceNowEl.closest('.price');
      if (priceWrap) {
        let old = priceWrap.querySelector('.price-old');
        let badge = priceWrap.querySelector('.price-discount');
        if (before && discount > 0) {
          if (!old) { old = document.createElement('span'); old.className = 'price-old'; old.style.marginLeft = '0.5rem'; priceWrap.appendChild(old); }
          if (!badge) { badge = document.createElement('span'); badge.className = 'price-discount'; badge.style.marginLeft = '0.5rem'; priceWrap.appendChild(badge); }
          old.textContent = before; old.style.textDecoration = 'line-through';
          badge.textContent = `-${discount}%`;
        } else {
          if (old) old.remove();
          if (badge) badge.remove();
        }
      }
    }

    setTags(genres, categories);
    ensureSteamLink(STORE_URL(appid));
    if (name) document.title = `${name} · Gamegrid`;

    const pos = Number(reviews?.query_summary?.total_positive) || 0;
    const neg = Number(reviews?.query_summary?.total_negative) || 0;
    const desc = reviews?.query_summary?.review_score_desc || null;
    setRating(pos, neg, desc);
  }

  async function searchAppId(term) {
    const data = await fetchJSON(STORE_SEARCH(term));
    const items = Array.isArray(data?.items) ? data.items : [];
    if (!items.length) return null;
    const sorted = byRelevance(items, term);
    return sorted[0]?.id || null;
  }

  async function getAppDetails(appid) {
    const d = await fetchJSON(APPDETAILS(appid));
    const node = d?.[appid];
    if (!node || node.success !== true) return null;
    return node.data || null;
  }

  async function getAppReviews(appid) {
    return await fetchJSON(APPREVIEWS(appid));
  }

  async function fillFromSearch(term) {
    try {
      const appid = await searchAppId(term);
      if (!appid) { alert(`No results on Steam for "${term}".`); return null; }
      const [details, reviews] = await Promise.all([ getAppDetails(appid), getAppReviews(appid) ]);
      if (!details) { alert('Could not fetch game details.'); return null; }
      applyToDom(appid, details, reviews);
      return { appid, details, reviews };
    } catch (err) {
      // Why: If this throws a TypeError from fetch, it's likely a CORS block by Steam.
      console.error('[steam/direct] failed:', err);
      alert('Steam blocked the request (likely CORS). Use a same-origin reverse proxy on your GitLab host.');
      return null;
    }
  }

  function bindSearchForm() {
    const form = document.querySelector('form.search');
    const input = form?.querySelector('input[type="search"][name="q"]');
    if (!form || !input) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const term = (input.value || '').trim();
      if (!term) return;
      fillFromSearch(term);
    }, false);

    // Optional deep link: ?q=...
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) { input.value = q; fillFromSearch(q); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindSearchForm, { once: true });
  } else {
    bindSearchForm();
  }

  // Expose for console testing
  window.fillFromSearch = fillFromSearch;
})();
 