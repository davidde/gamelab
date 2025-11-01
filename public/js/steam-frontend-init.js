const COLLECTIONS = ['trending', 'top-selling', 'on-sale']

function initSteamData(collection) {
  fetch(`./data/steam/${collection}.json`)
  .then(r => r.json())
  .then(data => {
    document.getElementById(collection).innerHTML = data.results_html;
  });
}

for (const collection of COLLECTIONS) {
  initSteamData(collection);
}
