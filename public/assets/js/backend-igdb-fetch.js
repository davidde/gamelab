import fs from 'fs';


// Constants:
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const ACCESS_TOKEN = process.env.TWITCH_ACCESS_TOKEN;
const IGDB_URL = 'https://api.igdb.com/v4/games';
const BASEQUERY = `
  fields name, summary, storyline, genres.name, platforms.name, cover.url,
    artworks.url, total_rating, total_rating_count, hypes, first_release_date;
  where version_parent = null;
`

// IGDB "Apicalypse" REST queries:
const QUERIES = [
  {
    name: 'trending',
    sort: ' sort hypes desc; ',
    amount: 100,
  },
  {
    name: 'favourites',
    sort: ' where total_rating_count >= 350; sort total_rating desc; ',
    amount: 500,
  },
];
// Notes:
// Image sizes:
// * By default returns `t_thumb` or thumbnail size.
// * Other sizes: `t_cover_small`, `t_cover_big`, `t_cover_big_2x`, `t_720p`, `t_1080p`
//   (or `t_screenshot_med` and `t_screenshot_big` for screenshots).
// * Also, a cover is (almost) always available, artworks may not be for older games.

// * `first_release_date`: UNIX timestamp

// * `total_rating`: average IGDB community score for the game, ranging from 0.0 to 100.0.
//   (i.e. games that score highly here, are highly-regarded games in general; popular in the long-term)
// * `total_rating_count`: number of unique user votes that contributed to the total_rating.
//   (i.e. crucial for determining the reliability of the `total_rating`; the higher the count the better)

// * `hypes`: = Trending Now; tracks pre-release and recent buzz and excitement.

// * `storyline`: Not always present!

async function fetchIgdbData(query) {
  if (!CLIENT_ID || !ACCESS_TOKEN) {
    console.error("Authentication Error: TWITCH_CLIENT_ID or TWITCH_ACCESS_TOKEN is not set in environment variables.");
    return;
  }

  // Build final "Apicalypse" query:
  let queryBody = BASEQUERY.concat(query.sort).concat(`limit ${query.amount};`);

  console.log(`Fetching Top ${query.amount} '${query.name}' games from IGDB ...`);

  try {
    const response = await fetch(IGDB_URL, {
      method: 'POST',
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Accept': 'application/json',
      },
      body: queryBody
    });

    // Check for non-200 HTTP status codes:
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IGDB API Request Failed (Status: ${response.status}): ${errorText}`);
    }

    const games = await response.json();

    // Save games to local .json files:
    const outputfile = `public/assets/data/igdb/${query.name}.json`;
    fs.mkdirSync("public/assets/data/igdb", { recursive: true });
    fs.writeFileSync(
      outputfile,
      JSON.stringify(games, null, 2)
    );

    console.log(`Saved '${query.name}' data (${games.length} games) to '${outputfile}'`);
  } catch (error) {
    console.error('\nFatal Error during IGDB fetch:', error.message);
  }
}

console.log('');
for (const query of QUERIES) {
  fetchIgdbData(query);
}
