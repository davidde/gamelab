import fs from 'fs';


// Constants:
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const ACCESS_TOKEN = process.env.TWITCH_ACCESS_TOKEN;
const IGDB_GAMES_URL = 'https://api.igdb.com/v4/games';
const GAMES_FIELD_QUERY = `
  fields name, summary, storyline, genres.name, genres.slug, platforms.name,
    cover.url, total_rating, total_rating_count, hypes, first_release_date;
`;
const IGDB_GENRES_URL = 'https://api.igdb.com/v4/genres';
const GENRES_FIELD_QUERY = `fields name, slug;`;

// IGDB "Apicalypse" REST queries:
const QUERIES = [
  { // List of all genres:
    name: 'genres',
    sort: '',
    amount: 50,
  },

  // Specific genres:
  { // The `version_parent` field in the IGDB API is used to distinguish the original/main release
    // from its subsequent versions, such as ports, remakes, or re-releases:
    // `version_parent = [game_id]` indicates the game entry is a derivative version of another game_id.
    name: 'fighting',
    sort: ' where version_parent = null & genres = (4) & total_rating_count >= 5; sort total_rating desc; ',
    // Note the parenthesis around the genre id `(4)`! This is essential to select all games with the
    // genre `fighting`; without the parenthesis, it will select ONLY games with the `fighting` genre and
    // WITHOUT any other genres. This excludes many games since most games actually have multiple genres!
    amount: 500,
  },
  {
    name: 'shooter',
    sort: ' where version_parent = null & genres = (5) & total_rating_count >= 15; sort total_rating desc; ',
    amount: 500,
  },
  // { // Only results in 92 games:
  //   name: 'music',
  //   sort: ' where version_parent = null & genres = (7) & total_rating_count >= 5; sort total_rating desc; ',
  //   amount: 500,
  // },
  {
    name: 'platform',
    sort: ' where version_parent = null & genres = (8) & total_rating_count >= 5; sort total_rating desc; ',
    amount: 500,
  },
  {
    name: 'puzzle',
    sort: ' where version_parent = null & genres = (9) & total_rating_count >= 5; sort total_rating desc; ',
    amount: 500,
  },
  {
    name: 'racing',
    sort: ' where version_parent = null & genres = (10) & total_rating_count >= 5; sort total_rating desc; ',
    amount: 500,
  },
  // { // Only results in 17 games:
  //   name: 'real-time-strategy',
  //   sort: ' where version_parent = null & genres = (11) & total_rating_count >= 5; sort total_rating desc; ',
  //   amount: 500,
  // },
  {
    name: 'rpg',
    sort: ' where version_parent = null & genres = (12) & total_rating_count >= 5; sort total_rating desc; ',
    amount: 500,
  },
  {
    name: 'simulator',
    sort: ' where version_parent = null & genres = (13) & total_rating_count >= 5; sort total_rating desc; ',
    amount: 500,
  },
  {
    name: 'sport',
    sort: ' where version_parent = null & genres = (14) & total_rating_count >= 5; sort total_rating desc; ',
    amount: 500,
  },
  {
    name: 'strategy',
    sort: ' where version_parent = null & genres = (15) & total_rating_count >= 5; sort total_rating desc; ',
    amount: 500,
  },
  // { // Only results in 9 games:
  //   name: 'turn-based-strategy',
  //   sort: ' where version_parent = null & genres = (16) & total_rating_count >= 5; sort total_rating desc; ',
  //   amount: 500,
  // },
  // { // Only results in 3 games:
  //   name: 'tactical',
  //   sort: ' where version_parent = null & genres = (24) & total_rating_count >= 5; sort total_rating desc; ',
  //   amount: 500,
  // },
  {
    name: 'hack-and-slash',
    sort: ' where version_parent = null & genres = (25) & total_rating_count >= 5; sort total_rating desc; ',
    amount: 500,
  },
  // { // Only results in 20 games:
  //   name: 'quiz',
  //   sort: ' where version_parent = null & genres = (26) & total_rating_count >= 5; sort total_rating desc; ',
  //   amount: 500,
  // },
  {
    name: 'adventure',
    sort: ' where version_parent = null & genres = (31) & total_rating_count >= 5; sort total_rating desc; ',
    amount: 500,
  },
  {
    name: 'indie',
    sort: ' where version_parent = null & genres = (32) & total_rating_count >= 5; sort total_rating desc; ',
    amount: 500,
  },
  // { // Only results in 4 games:
  //   name: 'moba',
  //   sort: ' where version_parent = null & genres = (36) & total_rating_count >= 5; sort total_rating desc; ',
  //   amount: 500,
  // },

  // Other categories:
  {
    name: 'trending',
    sort: ' where version_parent = null & hypes >= 50 & total_rating_count >= 50; sort hypes desc; ',
    amount: 500,
  },
  {
    name: 'favourites',
    sort: ' where version_parent = null & total_rating_count >= 350; sort total_rating desc; ',
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

  const FIELD_QUERY = query.name === 'genres' ? GENRES_FIELD_QUERY : GAMES_FIELD_QUERY;
  const URL = query.name === 'genres' ? IGDB_GENRES_URL : IGDB_GAMES_URL;

  // Build final "Apicalypse" query:
  let queryBody = FIELD_QUERY.concat(query.sort).concat(`limit ${query.amount};`);

  const logName = query.name === 'genres' ? '' : `'${query.name}' `;
  const logType = query.name === 'genres' ? 'genres' : 'games';
  console.log(`Fetching Top ${query.amount} ${logName}${logType} from IGDB ...`);

  try {
    const response = await fetch(URL, {
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

    console.log(`Saved '${query.name}' data (${games.length} ${logType}) to '${outputfile}'`);
  } catch (error) {
    console.error('\nFatal Error during IGDB fetch:', error.message);
  }
}

console.log('');
for (const query of QUERIES) {
  fetchIgdbData(query);
}
