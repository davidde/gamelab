const COLLECTIONS = ['trending', 'top-selling', 'on-sale']

function initSteamData(collection) {
  fetch(`./steam-data/${collection}.json`)
  .then(r => r.json())
  .then(data => {
    document.getElementById(collection).innerHTML = data.results_html;
  });
}

for (const collection of COLLECTIONS) {
  initSteamData(collection);
}
