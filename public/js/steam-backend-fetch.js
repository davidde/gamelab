import fs from "fs";


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
];

async function fetchSteamData(collection) {
  const result = await fetch(collection.url);
  if (!result.ok) throw new Error(`Steam fetch failed: ${result.status}`);
  const data = await result.json();

  const outputfile = `public/steam-data/${collection.name}.json`;
  fs.mkdirSync("public/steam-data", { recursive: true });
  fs.writeFileSync(
    outputfile,
    JSON.stringify(data, null, 2)
  );

  console.log(`Saved '${collection.name}' data to '${outputfile}'`);
}

for (const collection of COLLECTIONS) {
  fetchSteamData(collection);
}

