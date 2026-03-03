# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Wes's Cocktail Menu** — a static, no-build, vanilla HTML/CSS/JS cocktail menu hosted on GitHub Pages at `https://wspangleriii.github.io/cocktail-menu/`. The admin panel at `/admin/` uses Decap CMS (formerly Netlify CMS) backed by Netlify Identity + Git Gateway for authentication.

## Development

No build step. Open `index.html` directly in a browser, or use a local static server.

## Deployment

Changes go live automatically when pushed to `main` (GitHub Pages):

```bash
git add .
git commit -m "Describe change"
git push origin main
```

## Architecture

### Data Flow

1. On page load, `app.js` fetches `data/menu.json`
2. Cocktail items are filtered (hidden items excluded) and rendered as `<details>` accordion cards into section containers defined in `index.html`
3. Spirit filter dropdown and "Surprise Me" button interact with the already-rendered DOM

### Key Files

| File | Role |
|------|------|
| `index.html` | Shell with 7 section containers + nav chips + filter dropdown |
| `app.js` | Data fetch, card rendering, filtering, scroll animations, parallax, Surprise Me |
| `styles.css` | CSS custom properties theming, 7 section color schemes, responsive grid |
| `admin.css` | Admin panel styles (loaded separately) |
| `data/menu.json` | All cocktail data — single source of truth |
| `admin/config.yml` | Decap CMS schema (fields, sections, spirit types) |
| `admin/index.html` | Admin panel entry point with inline custom styles |

### Menu Data Schema (`data/menu.json`)

```json
{
  "items": [
    {
      "section": "Bright & Citrus-Driven",
      "name": "Cocktail Name",
      "ingredients": "Ingredient list string",
      "spirit": "Gin",
      "hidden": false
    }
  ]
}
```

**Valid `section` values:** Bright & Citrus-Driven, Elegant & Aromatic, Smooth & Spirit-Forward, Bold & Bitter, Tropical & Escapist, Deep Cuts & Bartender Picks, Spritzes, 🎄 Holiday Specials

**Valid `spirit` values:** Gin, Tequila, Whiskey, Rum, Vodka, Amaro, Liqueur, Aperitif, Other

`hidden: true` excludes an item from the public menu without deleting it. The Holiday Specials section is only shown when at least one non-hidden holiday item exists.

### Section Theming

Each section has a distinct CSS color theme defined via custom properties in `styles.css`. Section containers in `index.html` use `data-section` attributes matched in `app.js` when inserting cards.

### Admin Panel

The admin at `/admin/` requires Netlify Identity authentication. Edits made through Decap CMS commit directly to the GitHub repo, which triggers a new GitHub Pages deployment. The admin panel's styles are split between `admin/index.html` (inline, for CMS overrides) and `admin.css`.
