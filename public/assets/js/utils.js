/** Generate HTML for the `game` json data and inject it in the `container` HTMLElement:
    <li class='game-card'>
      <div>
        <img>
        <h2></h2>
        <a href=""></a>
      </div>
    </li>
**/
export function injectGameHtml(game, collection, container) {
  // Check if essential properties exist before trying to access them:
  if (!game.cover || !game.cover.url || !game.name) {
    console.warn(`Skipping game due to missing data: ${game.name || 'Unknown'}`);
    return; // Skip game and continue the loop
  }

  const div = document.createElement('div');

  let name = game.name;
  const img = document.createElement('img');
  img.src = game.cover.url.replace('t_thumb', 't_720p');
  img.alt = name;

  const h2 = document.createElement('h2');
  // Remove part of the name after a hyphen if it has one:
  // (Some names are too long because they include useless data, like:
  // The Legend of Zelda: Tears of the Kingdom - Nintendo Switch 2 Edition)
  if (name.includes('-')) name = name.split('-')[0].trim();
  h2.textContent = name;

  const a = document.createElement('a');
  a.href = `./games/?collection=${collection}&id=${game.id}`;

  // Append img, h2 and a elements to the div:
  div.appendChild(h2);
  div.appendChild(a);
  div.appendChild(img);

  // Append the div to the 'game-card' list item:
  const li = document.createElement('li');
  li.classList.add('game-card');
  li.appendChild(div);

  container.appendChild(li);
}

