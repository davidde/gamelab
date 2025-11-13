const DATA_ROOT = new URL("../data/", window.location.href).pathname;

const dom = {
  cover: document.querySelector('[data-field="cover"]'),
  name: document.querySelector('[data-field="name"]'),
  tags: document.querySelector('[data-field="tags"]'),
  ratingWrap: document.querySelector('[data-field="rating-wrapper"]'),
  ratingFill: document.querySelector('[data-field="rating-fill"]'),
  ratingText: document.querySelector('[data-field="rating-text"]'),
  summary: document.querySelector('[data-field="summary"]'),
  price: document.querySelector('[data-field="price"]'),
  notice: document.querySelector('[data-field="notice"]'),
  form: document.querySelector("[data-search-form]"),
  input: document.querySelector("[data-search-input]"),
  main: document.querySelector("main.game-page"),
};

function setStatus(status, message = "") {
  dom.main.dataset.status = status; // "loading" | "ready" | "error"
  if (message) {
    dom.notice.hidden = false;
    dom.notice.textContent = message;
  } else {
    dom.notice.hidden = true;
    dom.notice.textContent = "";
  }
}

async function fetchJSON(path) {
  const url = path.startsWith("/") || path.startsWith("http")
    ? path
    : DATA_ROOT + path.replace(/^\.\//, "");
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} for ${url}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function toSlug(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function normalizeGame(raw) {
  // Support either pre-normalized or IGDB-like shape.
  const name = raw.name || raw.title || "Unknown";
  const coverUrl =
    raw.coverUrl ||
    raw.cover?.url ||
    raw.cover?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${raw.cover.image_id}.jpg`
      : null;

  const tags =
    raw.tags ||
    raw.genres?.map(g => g.name) ||
    raw.genres ||
    [];

  const rating =
    typeof raw.rating === "number"
      ? raw.rating
      : typeof raw.aggregated_rating === "number"
      ? raw.aggregated_rating
      : null;

  const ratingSource =
    raw.ratingSource ||
    (raw.aggregated_rating ? "IGDB" : raw.rating ? "User" : null);

  const summary =
    raw.summary || raw.storyline || raw.description || "No description available.";

  const price =
    raw.price?.value != null
      ? { value: raw.price.value, currency: raw.price.currency || "USD" }
      : null;

  return { name, coverUrl, tags, rating, ratingSource, summary, price };
}

function renderTags(tags) {
  dom.tags.innerHTML = "";
  (tags || []).slice(0, 10).forEach(tag => {
    const li = document.createElement("li");
    li.className = "tag";
    li.textContent = tag;
    dom.tags.appendChild(li);
  });
}

function renderRating(rating, source) {
  if (typeof rating === "number" && rating >= 0) {
    const pct = Math.max(0, Math.min(100, Math.round(rating)));
    dom.ratingFill.style.width = `${pct}%`;
    dom.ratingText.textContent = `${pct}% ${source ? `(${source})` : ""}`.trim();
    dom.ratingWrap.hidden = false;
  } else {
    dom.ratingWrap.hidden = true;
    dom.ratingFill.style.width = "0%";
    dom.ratingText.textContent = "";
  }
}

function renderPrice(price) {
  if (price && typeof price.value === "number") {
    const fmt = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: price.currency || "USD",
      maximumFractionDigits: 2,
    }).format(price.value);
    dom.price.textContent = fmt;
  } else {
    dom.price.textContent = ""; // Hide via CSS if empty.
  }
}

function fillGame(game) {
  document.title = `${game.name} · GameLab`;
  dom.name.textContent = game.name;

  if (game.coverUrl) {
    dom.cover.src = game.coverUrl;
    dom.cover.alt = `Cover art for ${game.name}`;
  }

  renderTags(game.tags);
  renderRating(game.rating, game.ratingSource);
  dom.summary.textContent = game.summary || "";
  renderPrice(game.price);
}

async function findSlugFromSearch(term) {
  const q = term.trim().toLowerCase();
  if (!q) return null;

  const index = await fetchJSON("search-index.json"); // [{slug,name}]
  // Prefer exact slug match, then exact name, then includes
  const exactSlug = index.find(x => x.slug.toLowerCase() === q);
  if (exactSlug) return exactSlug.slug;

  const exactName = index.find(x => x.name?.toLowerCase() === q);
  if (exactName) return exactName.slug;

  const simplifiedQ = toSlug(q);
  const slugBySimplify = index.find(x => toSlug(x.name) === simplifiedQ);
  if (slugBySimplify) return slugBySimplify.slug;

  const partial = index.find(
    x => x.name?.toLowerCase().includes(q) || x.slug.toLowerCase().includes(q)
  );
  return partial ? partial.slug : null;
}

async function loadGameBySlug(slug) {
  const raw = await fetchJSON(`games/${slug}.json`);
  return normalizeGame(raw);
}

async function loadRandomGame() {
  const list = await fetchJSON("index.json"); // ["slug", ...]
  const slug = pickRandom(list);
  return loadGameBySlug(slug);
}

async function main() {
  setStatus("loading", "Loading game…");

  // Wire search UX
  dom.form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const term = (dom.input?.value || "").trim();
    const url = new URL(window.location.href);
    if (term) url.searchParams.set("q", term);
    else url.searchParams.delete("q");
    window.location.href = url.toString();
  });

  // Persist q into input for convenience
  const url = new URL(window.location.href);
  const q = url.searchParams.get("q") || "";
  if (dom.input) dom.input.value = q;

  try {
    let game;
    if (q) {
      // Try as slug/id direct first
      const maybeSlug = toSlug(q);
      try {
        game = await loadGameBySlug(maybeSlug);
      } catch (err) {
        if (err.status !== 404) throw err;
        const matched = await findSlugFromSearch(q);
        if (!matched) {
          throw new Error(`No results for "${q}".`);
        }
        game = await loadGameBySlug(matched);
      }
    } else {
      game = await loadRandomGame();
    }

    fillGame(game);
    setStatus("ready", "");
  } catch (err) {
    console.error(err);
    setStatus(
      "error",
      err?.message || "Failed to load game. Please try again."
    );
  }
}

document.addEventListener("DOMContentLoaded", main);