/** Generate HTML for the `game` json data and inject it in the `container` HTMLElement:
    <li class='game-card'>
      <div>
        <div>
          <h2></h2>
          <ul class='genres-list tags></ul>
          <ul class='platforms-list tags></ul>
        </div>
        <a href=""></a>
        <img>
      </div>
    </li>
**/
export function injectGameHtml(game, collection, container) {
  // Check if essential properties exist before trying to access them:
  if (!game.cover || !game.cover.url || !game.name) {
    console.warn(`Skipping game due to missing data: ${game.name || 'Unknown'}`);
    return; // Skip game and continue the loop
  }

  const div1 = document.createElement('div');
  const div2 = document.createElement('div');

  let gameName = game.name;
  const h2 = document.createElement('h2');
  // Remove part of the name after a hyphen if it has one:
  // (Some names are too long because they include useless data, like:
  // The Legend of Zelda: Tears of the Kingdom - Nintendo Switch 2 Edition)
  if (gameName.includes('-')) gameName = gameName.split('-')[0].trim();
  h2.textContent = gameName;
  div2.appendChild(h2);

  // Extra elements for the game detail page:
  appendTagList(div2, game.genres, "Genres");
  appendTagList(div2, game.platforms, "Platforms");

  div1.appendChild(div2);

  // Default elements for both sidescroller and game detail page:
  const a = document.createElement('a');
  let path = window.location.pathname;
  path = path.endsWith('/games/') ? path : path + 'games/';
  a.href = `${path}?collection=${collection}&id=${game.id}`;
  div1.appendChild(a);

  const img = document.createElement('img');
  img.src = game.cover.url.replace('t_thumb', 't_720p');
  img.alt = gameName;
  div1.appendChild(img);

  // Append the div to the 'game-card' list item:
  const li = document.createElement('li');
  li.classList.add('game-card');
  li.appendChild(div1);

  container.appendChild(li);
}

function appendTagList(parent, tags, name) {
  if (!tags) return;

  const tagsTitle = document.createElement('span');
  tagsTitle.textContent = `${name}: `;
  const tagsUl = document.createElement('ul');
  tagsUl.classList.add(`${name}-list`, 'tags');
  tags.forEach(tag => {
    const li = document.createElement('li');
    li.textContent = tag.name;
    tagsUl.appendChild(li);
  });

  const tagsDiv = document.createElement('div');
  tagsDiv.classList.add('tags-row');
  tagsDiv.appendChild(tagsTitle);
  tagsDiv.appendChild(tagsUl);

  parent.appendChild(tagsDiv);
}