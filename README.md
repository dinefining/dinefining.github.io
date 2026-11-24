# Dinefining

Website for Dinefining, the live coding alias of Ravi Popat.

A wall of index-card heads that part around your cursor. Scroll down and the stack gathers into a single card to reveal the bio, pieces, performances and talks.

Plain HTML, CSS and JavaScript. No build step: open `index.html` through any static server, or host it on GitHub Pages.

## Files

- `index.html` — page structure and text
- `style.css` — styles
- `script.js` — the card stack, trail, collapse, popup and cursor
- `assets/ravi.jpg` — photo shown when hovering "Ravi Popat"

## Editing

- **Pieces**: the `PROJECTS` list near the top of `script.js` (title + YouTube ID).
- **Performances, Talks, Socials**: in `index.html`, inside `#txt`.
- **Name in the window**: `const NAME` in `script.js`.
- **Ticker**: hidden for now; remove `hidden` from `#tick` in `index.html` and set `TB = 30` in `script.js` to bring it back.
