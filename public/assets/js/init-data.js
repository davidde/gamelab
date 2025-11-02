const COLLECTIONS = ['trending_top_100', 'all_time_favs'];

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
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        console.error(`Data for "${collection}" is empty or not an array.`);
        return;
      }

      console.log(`Successfully loaded ${data.length} items for ${collection}. Appending now...`);

      data.forEach(game => {
        // Check if essential properties exist before trying to access them:
        if (!game.cover || !game.cover.url || !game.name) {
          console.warn(`Skipping game due to missing data: ${game.name || 'Unknown'}`);
          return; // Skip game and continue the loop
        }

        const li = document.createElement('li');
        li.classList.add('game-card');

        let name = game.name;
        const img = document.createElement('img');
        img.src = game.cover.url.replace('t_thumb', 't_720p');
        img.alt = name;

        const h2 = document.createElement('h2');
        // Remove part of the name after a hyphen if it has one:
        // (Some names are too long because they include useless data, like:
        // The Legend of Zelda: Tears of the Kingdom - Nintendo Switch 2 Edition)
        if (name.includes('-')) name = name.split('-')[0].trim();
        h2.textContent = name;

        // Append img and h2 elements into the li:
        li.appendChild(img);
        li.appendChild(h2);

        container.appendChild(li);
      });
    });
}

for (const collection of COLLECTIONS) {
  initData(collection);
}
