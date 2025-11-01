import fs from 'fs';


// Constants:
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const ACCESS_TOKEN = process.env.TWITCH_ACCESS_TOKEN;
const IGDB_URL = 'https://api.igdb.com/v4/games';
const AMOUNT = 100;

// IGDB "Apicalypse" REST queries:
const QUERIES = [
  {
    name: 'trending',
    body: `
      fields name, cover.url, total_rating, hypes, first_release_date;
      where version_parent = null;
      sort hypes desc;
      limit ${AMOUNT};
    `,
  },
];

async function fetchIgdbData(query) {
  if (!CLIENT_ID || !ACCESS_TOKEN) {
    console.error("Authentication Error: TWITCH_CLIENT_ID or TWITCH_ACCESS_TOKEN is not set in environment variables.");
    return;
  }

  console.log(`\nFetching Top ${AMOUNT} '${query.name}' games from IGDB ...`);

  try {
    const response = await fetch(IGDB_URL, {
      method: 'POST',
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Accept': 'application/json',
      },
      body: query.body
    });

    // Check for non-200 HTTP status codes:
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IGDB API Request Failed (Status: ${response.status}): ${errorText}`);
    }

    const games = await response.json();
    console.log(`Successfully fetched ${games.length} games.`);

    // Save games to local .json files:
    const outputfile = `public/data/igdb/${query.name}.json`;
    fs.mkdirSync("public/data/igdb", { recursive: true });
    fs.writeFileSync(
      outputfile,
      JSON.stringify(games, null, 2)
    );

    console.log(`Saved '${query.name}' data to '${outputfile}'\n`);
  } catch (error) {
    console.error('\nFatal Error during IGDB fetch:', error.message);
  }
}

for (const query of QUERIES) {
  fetchIgdbData(query);
}
