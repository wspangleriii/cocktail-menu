# Wes’s Cocktail Menu 🍸

A responsive, mobile-first cocktail menu with themed sections, scroll effects, and interactive features.  
Hosted live via **GitHub Pages**:  
👉 [https://wspangleriii.github.io/cocktail-menu/](https://wspangleriii.github.io/cocktail-menu/)

---

## Features
- Seven themed sections (Bright, Aromatic, Spirit-Forward, Bitter, Tropical, Deep Cuts, Spritzes).
- Expandable cocktail cards (`<details>/<summary>`).
- “Filter by Spirit” dropdown.
- **🎲 Surprise Me** button that jumps to a random cocktail.
- Smooth scroll + entrance animations (with reduced motion fallback).
- Print-friendly stylesheet.

---

## Update Instructions

Whenever you change recipes, styles, or code:

```bash
# make sure you are on main branch
git checkout main

# stage all changes
git add .

# commit your update
git commit -m "Describe your change"

# push to GitHub
git push origin main



---

### To add this:
In your VS Code terminal (inside `Cocktail-Menu`):

```bash
echo "# Wes’s Cocktail Menu 🍸" > README.md
# OR paste the full content above into a new README.md file

git add README.md
git commit -m "Add project README with update instructions"
git push origin main
