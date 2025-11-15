/** Generate HTML for the `game` json data and inject it in the `container` HTMLElement:
    <li class='game-card'>
      <div>
        <div>
          <h2></h2>
          <div class='rating'></div>
          <ul class='genres-list tags'></ul>
          <ul class='platforms-list tags'></ul>
          <div class='game-summary'></div>
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

  // Remove the part of the game name after the hyphen if it has one:
  // (Some names are too long because they include useless data, like:
  // The Legend of Zelda: Tears of the Kingdom - Nintendo Switch 2 Edition)
  let gameName = game.name.split('-')[0].trim();
  const h2 = document.createElement('h2');
  h2.textContent = gameName;
  div2.appendChild(h2);

  // Extra elements for the game detail page:
  appendRating(div2, game.total_rating, game.total_rating_count);
  appendTagList(div2, game.genres, "Genres");
  appendTagList(div2, game.platforms, "Platforms");
  appendSummary(div2, game.summary);

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

function appendRating(parent, rating, rating_count) {
  if (!(typeof rating === "number" && rating >= 0)) return;

  const roundedRating = Math.round(rating * 100) / 100;
  const ratingBar = document.createElement('div');
  const ratingFill = document.createElement('div');
  ratingFill.style.width = `${roundedRating}%`;
  ratingBar.appendChild(ratingFill);

  const ratingText = document.createElement('span');
  ratingText.textContent = `${roundedRating}% (Based on ${rating_count} reviews)`;

  const ratingDiv = document.createElement('div');
  ratingDiv.classList.add('rating');
  ratingDiv.appendChild(ratingBar);
  ratingDiv.appendChild(ratingText);

  parent.appendChild(ratingDiv);
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

function appendSummary(parent, summary) {
  if (!summary) return;

  const h3 = document.createElement('h3');
  h3.textContent = 'Summary';
  const p = document.createElement('p');
  p.textContent = summary;

  const summaryDiv = document.createElement('div');
  summaryDiv.classList.add('game-summary');
  summaryDiv.appendChild(h3);
  summaryDiv.appendChild(p);

  parent.appendChild(summaryDiv);
}
