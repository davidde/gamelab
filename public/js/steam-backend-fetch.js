import fs from 'fs';


const COLLECTIONS = [
  {
    name: 'trending',
    url: 'https://store.steampowered.com/search/results/?filter=popularnew&infinite=1&json=1'
  },
  {
    name: 'top-selling',
    url: 'https://store.steampowered.com/search/results/?filter=topsellers&infinite=1&json=1'
  },
  {
    name: 'on-sale',
    url: 'https://store.steampowered.com/search/results/?specials=1&infinite=1&json=1'
  },
  // Huge file of hundreds of MB's!
  // Alternative: IGDB (Internet Game Database -> Requires Twitch Developer Account)
  // {
  //   name: 'app-list',
  //   url: 'https://api.steampowered.com/ISteamApps/GetAppList/v2/'
  // },
];

async function fetchSteamData(collection) {
  const result = await fetch(collection.url);
  if (!result.ok) throw new Error(`Steam fetch failed: ${result.status}`);
  const data = await result.json();

  const outputfile = `public/data/steam/${collection.name}.json`;
  fs.mkdirSync("public/data/steam", { recursive: true });
  fs.writeFileSync(
    outputfile,
    JSON.stringify(data, null, 2)
  );

  console.log(`Saved '${collection.name}' data to '${outputfile}'`);
}

for (const collection of COLLECTIONS) {
  fetchSteamData(collection);
}

