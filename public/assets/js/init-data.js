import { injectGameHtml } from './utils.js';


function initData(collection) {
  const container = document.querySelector(`[data-collection="${collection}"]`);

  if (!container) {
    console.error(`Container element with data-collection="${collection}" not found!`);
    return;
  }

  const isLocalHost = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';
  const ROOT = isLocalHost ? '/public/' : '/';
  fetch(`${ROOT}assets/data/igdb/${collection}.json`)
    .then(request => {
      if (!request.ok) {
        throw new Error(`Failed to load data: ${request.status}`);
      }
      return request.json();
    })
    .then(games => {
      if (!Array.isArray(games) || games.length === 0) {
        console.error(`Data for "${collection}" is empty or not an array.`);
        return;
      }

      let gamesToShow = 100;
      console.log(`Successfully loaded ${games.length} items for ${collection}. Appending first ${gamesToShow} now...`);

      for (let i = 0; i < gamesToShow && i < games.length; i++) {
        injectGameHtml(games[i], collection, container, ROOT);
      }
    });
}

function getCollections() {
  const elements = document.querySelectorAll('[data-collection]');
  return Array.from(elements)
    .map(element => element.dataset.collection);
}

for (const collection of getCollections()) {
  initData(collection);
}
