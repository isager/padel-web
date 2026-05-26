# Padel Mexicano Manager

A simple web app for running a [Mexicano](https://en.wikipedia.org/wiki/Mexicano_(padel)) padel tournament: add players, generate balanced rounds from the live leaderboard, enter scores, and track standings.

**Live app:** [https://isager.github.io/padel-web/](https://isager.github.io/padel-web/)

The site is hosted on **GitHub Pages** from the `main` branch of this repository.

## Features

- Add and remove players (minimum 4 to start)
- Mexicano court pairings (1+4 vs 2+3 within each group of four)
- Fair bye rotation when the player count is not divisible by four
- Round counter and leaderboard with local persistence (`localStorage`)
- Reset tournament

## Local development

No build step required. From the project folder:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

Or open `index.html` directly in a browser.

## Tech

Static HTML, CSS, and JavaScript — no framework or backend.
