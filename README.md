# Gamegrid
> [!Important] Link to logbook:
> [Logbook](https://hubkaho-my.sharepoint.com/:w:/r/personal/melih_kudretov_student_odisee_be/Documents/Document.docx?d=w5fd8bbca678847b5a57894fb42c865aa&e=4%3abc6e9649e1ff418b9b34d0c18697e635&sharingv2=true&fromShare=true&at=9&xsdata=MDV8MDJ8ZGF2aWQuZGVwcm9zdEBzdHVkZW50Lm9kaXNlZS5iZXxlMjdkZmQ3MDI0NWE0YjM5MTk2NTA4ZGUwMThiOGE4Y3w1ZTc0OTAxZDMzNGY0NmUzOTZkMTQ3ZDg0MjU4NWFiZHwwfDB8NjM4OTQ5ODk2MDA1ODA2NTQ1fFVua25vd258VFdGcGJHWnNiM2Q4ZXlKRmJYQjBlVTFoY0draU9uUnlkV1VzSWxZaU9pSXdMakF1TURBd01DSXNJbEFpT2lKWGFXNHpNaUlzSWtGT0lqb2lUV0ZwYkNJc0lsZFVJam95ZlE9PXwwfHx8&sdata=U2U3bmQvRXpIYk9KKzJJYmdCZnA2VEJBZHhIbk83OFk4bWlHUGFjcTQ0QT0%3d)

- [Gamegrid](#gamegrid)
  - [Git Intro](#git-intro)
  - [IGDB (= Internet Game Database)](#igdb--internet-game-database)
  - [GitLab CI](#gitlab-ci)
  - [GitLab User or Group Pages](#gitlab-user-or-group-pages)
  - [Did you fork this project?](#did-you-fork-this-project)
  - [Troubleshooting](#troubleshooting)

## Git Intro
> Install git:
> ```
> winget install --id Git.Git -e --source winget
> ```
> (https://git-scm.com/downloads/win)

* General workflow:  
  ```
  "Save file" => git add => git commit => git push
  ```

* For example:  
  ```
  "Save index.html"
  "Save stylesheet.css"
  git add index.html stylesheet.css
  git commit -m "Update nav element with styles"
  git push
  ```

* To get the most recent changes from Gitlab/Github:  
  ```bash
  git pull
  ```

## IGDB (= Internet Game Database)
We're using the [IGDB API](https://www.igdb.com/api) because it allows fine-grained control over game data. It uses an SQL-like querying language [Apicalypse](https://apicalypse.io/) that allows for very specific game data filtering. IGDB is Twitch/Amazon-owned and requires a Twitch developer account with accompanying Client_ID and Access_token.

To solve the infamous "Cross-Origin" errors when client-side fetching, we've integrated the API calls in the Gitlab build process. Gitlab then writes the data to `.json` files inside `public/data/igdb`.

To get this data for local development, create an .env file with your keys:
```.env
TWITCH_CLIENT_ID=uvw
TWITCH_ACCESS_TOKEN=xyz
```
Then run the fetch script to get local `.json` data:
```shell
node --env-file=.env public/js/backend-igdb-fetch.js
```
On Gitlab, these keys belong in CI/CD variables under `Settings > CI/CD > Variables`.

## GitLab CI
This project's static Pages are built by [GitLab CI][ci], following the steps
defined in [`.gitlab-ci.yml`](.gitlab-ci.yml):

```
image: busybox

pages:
  stage: deploy
  script:
  - echo 'Nothing to do...'
  artifacts:
    paths:
    - public
    expire_in: 1 day
  rules:
    - if: $CI_COMMIT_REF_NAME == $CI_DEFAULT_BRANCH
```

The above example expects to put all your HTML files in the `public/` directory.

## GitLab User or Group Pages
To use this project as your user/group website, you will need one additional
step: just rename your project to `namespace.gitlab.io`, where `namespace` is
your `username` or `groupname`. This can be done by navigating to your
project's **Settings**.

Read more about [user/group Pages][userpages] and [project Pages][projpages].

## Did you fork this project?
If you forked this project for your own use, please go to your project's
**Settings** and remove the forking relationship, which won't be necessary
unless you want to contribute back to the upstream project.

## Troubleshooting
1. CSS is missing! That means that you have wrongly set up the CSS URL in your
   HTML files. Have a look at the [index.html] for an example.

[ci]: https://about.gitlab.com/gitlab-ci/
[index.html]: https://gitlab.com/pages/plain-html/blob/master/public/index.html
[userpages]: https://docs.gitlab.com/ce/user/project/pages/introduction.html#user-or-group-pages
[projpages]: https://docs.gitlab.com/ce/user/project/pages/introduction.html#project-pages
