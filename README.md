# GameLab
- [GameLab](#gamelab)
  - [Login functionality](#login-functionality)
  - [IGDB (= Internet Game Database)](#igdb--internet-game-database)
    - [Genres](#genres)
  - [GitLab CI](#gitlab-ci)

<br>

> [!Caution] Important: Root of project
> For local development, the root of the project needs to be correctly configured as `/public` for the dev server:
> * For the vscode `Live Server` extension this can be done by adding the following in `.vscode/settings.json`:
>   ```json
>   {
>     "liveServer.settings.root": "public",
>   }
>   ```
> * For the vscode `Live Preview` extension this can be done by adding the following in `.vscode/settings.json`:
>   ```json
>   {
>     "livePreview.serverRoot": "public",
>   }
>   ```
> Alternatively, you can also just open `/public` as root in vscode / your IDE directly, and start the dev server from there.

## Login functionality
Since this is a static site, the login functionality was implemented using **localStorage**.  
As such, it is for demonstration purposes only. It is local-only and **not secure**;
anyone can inspect all logins and passwords in the browser's Devtools' Storage tab.

## IGDB (= Internet Game Database)
We're using the [IGDB API](https://www.igdb.com/api) because it allows fine-grained control over game data. It uses an SQL-like querying language [Apicalypse](https://apicalypse.io/) that allows for very specific game data filtering. IGDB is Twitch/Amazon-owned and requires a Twitch developer account with accompanying Client_ID and Access_token.

To solve the infamous "Cross-Origin" errors when client-side fetching, we've integrated the API calls in the Gitlab build process. Gitlab then writes the data to `.json` files inside `public/assets/data/igdb`.

To get this data for local development, create an .env file with your keys:
```.env
TWITCH_CLIENT_ID=uvw
TWITCH_ACCESS_TOKEN=xyz
```
Then run the fetch script to get local `.json` data:
```shell
node --env-file=.env public/assets/js/backend-igdb-fetch.js
```
On Gitlab, these keys belong in CI/CD variables under `"Project Name" > Settings > CI/CD > Variables`.

### Genres
To get a full, up-to-date list of all IGDB genres:
```bash
source .env
curl -X 'POST' 'https://api.igdb.com/v4/genres' -H "Client-ID: $TWITCH_CLIENT_ID" -H "Authorization: Bearer $TWITCH_ACCESS_TOKEN" -H 'Content-Type: text/plain' -d 'fields name, slug; limit 500;'
```
For convenience, this currently returns:
```json
[
  {
    "id": 2,
    "name": "Point-and-click",
    "slug": "point-and-click"
  },
  {
    "id": 4,
    "name": "Fighting",
    "slug": "fighting"
  },
  {
    "id": 5,
    "name": "Shooter",
    "slug": "shooter"
  },
  {
    "id": 7,
    "name": "Music",
    "slug": "music"
  },
  {
    "id": 8,
    "name": "Platform",
    "slug": "platform"
  },
  {
    "id": 9,
    "name": "Puzzle",
    "slug": "puzzle"
  },
  {
    "id": 10,
    "name": "Racing",
    "slug": "racing"
  },
  {
    "id": 11,
    "name": "Real Time Strategy (RTS)",
    "slug": "real-time-strategy-rts"
  },
  {
    "id": 12,
    "name": "Role-playing (RPG)",
    "slug": "role-playing-rpg"
  },
  {
    "id": 13,
    "name": "Simulator",
    "slug": "simulator"
  },
  {
    "id": 14,
    "name": "Sport",
    "slug": "sport"
  },
  {
    "id": 15,
    "name": "Strategy",
    "slug": "strategy"
  },
  {
    "id": 16,
    "name": "Turn-based strategy (TBS)",
    "slug": "turn-based-strategy-tbs"
  },
  {
    "id": 24,
    "name": "Tactical",
    "slug": "tactical"
  },
  {
    "id": 25,
    "name": "Hack and slash/Beat \u0027em up",
    "slug": "hack-and-slash-beat-em-up"
  },
  {
    "id": 26,
    "name": "Quiz/Trivia",
    "slug": "quiz-trivia"
  },
  {
    "id": 30,
    "name": "Pinball",
    "slug": "pinball"
  },
  {
    "id": 31,
    "name": "Adventure",
    "slug": "adventure"
  },
  {
    "id": 32,
    "name": "Indie",
    "slug": "indie"
  },
  {
    "id": 33,
    "name": "Arcade",
    "slug": "arcade"
  },
  {
    "id": 34,
    "name": "Visual Novel",
    "slug": "visual-novel"
  },
  {
    "id": 35,
    "name": "Card \u0026 Board Game",
    "slug": "card-and-board-game"
  },
  {
    "id": 36,
    "name": "MOBA",
    "slug": "moba"
  }
]
```

## GitLab CI
This project's static Pages are built by [GitLab CI](https://docs.gitlab.com/ci/),
following the steps defined in [`.gitlab-ci.yml`](.gitlab-ci.yml).
