import { injectGameHtml } from './utils.js';


const FILE_PATH = '../assets/data/igdb/';
const EXTENSION = '.json';
const resultList = document.getElementById('result-list');
const gamesPageTitle = document.getElementById('games-page-title');

// `window.location.search` gives us the full query string
// (E.g. `?query=xyz` or `?collection=trending&id=298915`):
const params = new URLSearchParams(window.location.search);
// Get the parameters; either a query, or a collection with id:
let searchTerm = params.get('query');
let collection = params.get('collection');
let id = params.get('id');



main();

async function main() {
  if (searchTerm) {
    searchTerm = decodeURIComponent(searchTerm);
    // Display the term the user searched for:
    gamesPageTitle.textContent = `Search Results for "${searchTerm}":`;
  } else if (collection) {
    collection = decodeURIComponent(collection);
    id = Number(decodeURIComponent(id));
  } else {
    resultList.innerHTML = "<p class='error'>Error: Empty or incorrect query string syntax in URL.</p>";
    return;
  }

  const json = await getJsonData(collection ?? 'favourites');
  const games = getGames(json);
  displayGames(games);
}

function displayGames(games) {
  if (games.length > 0) {
    games.forEach(game => injectGameHtml(game, collection, resultList));
  } else {
    resultList.innerHTML = "<p>Nothing found. Too bad...</p>";
  }
}

// Get the requested games from the json file:
function getGames(json) {
  try {
    if (searchTerm) {
      // Case-insensitive, partial match on 'name' (if there is a searchTerm):
      return json.filter(game => game.name.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    // If no searchTerm, just get the id:
    } else return [json.find(game => game.id === id)];
  } catch (error) {
    console.error('Could not filter data:', error);
    resultList.innerHTML = "<p class='error'>Error filtering data. Check console.</p>";
    return [];
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
    resultList.innerHTML = "<p class='error'>Error loading data. Check console.</p>";
    return [];
  }
}
