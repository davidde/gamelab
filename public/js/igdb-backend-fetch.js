import fs from 'fs';


// Constants:
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const ACCESS_TOKEN = process.env.TWITCH_ACCESS_TOKEN;
const IGDB_URL = 'https://api.igdb.com/v4/games';
const AMOUNT = 100; // Max 500 per request!

// IGDB "Apicalypse" REST queries:
const QUERIES = [
  {
    name: 'trending',
    body: `
      fields name, summary, storyline, genres.name, platforms.name, cover.url,
        artworks.url, total_rating, total_rating_count, hypes, first_release_date;
      where version_parent = null;
      sort hypes desc;
      limit ${AMOUNT};
    `,
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
