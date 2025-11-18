import { injectGameHtml } from './utils.js';


const FILE_PATH = '../assets/data/igdb/';
const EXTENSION = '.json';
const gamesPageTitle = document.getElementById('games-page-title');
let container; // The container to fill with the game data
const errorDisplay = document.getElementById('games-error');

// `window.location.search` gives us the full query string
// (E.g. `?query=xyz` or `?collection=trending&id=298915`):
const params = new URLSearchParams(window.location.search);
// Get the parameters; either a query, or a collection with id:
let searchTerm = params.get('query');
let collection = params.get('collection');
let id = params.get('id');
// displayMode specifies if we're displaying search results, or an individual game:
const displayMode = searchTerm ? 'search' : 'game'


main();

async function main() {
  switch (displayMode) {
    case 'search':
      container = document.getElementById('search-results-list');
      searchTerm = decodeURIComponent(searchTerm);
      collection = 'favourites';
      // Display the term the user searched for:
      gamesPageTitle.textContent = `Search Results for "${searchTerm}":`;
      break;
    case 'game':
      if (collection && id) {
        container = document.getElementById('single-game-result');
        collection = decodeURIComponent(collection);
        id = Number(decodeURIComponent(id));
        const sidescroller = document.getElementById('games-sidescroller');
        sidescroller.classList.add('hidden');
        break;
      }
    default:
      errorDisplay.innerHTML = "Error: Empty or incorrect query string syntax in URL.";
      return;
  }

  const json = await getJsonData(collection);
  const games = getGames(json);
  displayGames(games);
}

function displayGames(games) {
  switch (displayMode) {
    case 'search': // `games` is an array of search results:
      if (games.length > 0) {
        games.forEach(game => injectGameHtml(game, collection, container));
      }
      else { // If `games` is empty:
        container.innerHTML = "<p>Nothing found. Too bad...</p>";
      }
      break;
    case 'game': // `games` is a single game:
      injectGameHtml(games, collection, container);
      break;
  }
}

// Get the requested games from the json file:
function getGames(json) {
  try {
    if (searchTerm) {
      // Case-insensitive, partial match on 'name' (if there is a searchTerm):
      return json.filter(game => game.name.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    // If no searchTerm, just get the id:
    } else return json.find(game => game.id === id);
  } catch (error) {
    console.error('Could not filter data:', error);
    errorDisplay.innerHTML = "Error filtering data. Check console.";
    return null;
  }
}

// Get all data from the correct json file:
async function getJsonData(collection) {
  try {
    // Load the data from the json file:
    const response = await fetch(`${FILE_PATH}${collection}${EXTENSION}`);
    if (!response.ok) throw new Error(`HTTP error! Response status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Could not load data:', error);
    errorDisplay.innerHTML = "Error loading data. Check console.";
    return [];
  }
}
