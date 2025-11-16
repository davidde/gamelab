import { injectGameHtml } from './utils.js';


const COLLECTIONS = ['trending', 'favourites'];

function initData(collection) {
  const container = document.getElementById(collection);

  if (!container) {
    console.error(`Container element with ID "${collection}" not found!`);
    return;
  }

  fetch(`./assets/data/igdb/${collection}.json`)
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

      console.log(`Successfully loaded ${games.length} items for ${collection}. Appending now...`);

      let gamesToShow = 100;
      for (let i = 0; i < gamesToShow && i < games.length; i++) {
        injectGameHtml(games[i], collection, container);
      }
    });
}

for (const collection of COLLECTIONS) {
  initData(collection);
}
