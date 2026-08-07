# Customisation Guide

## Updating the chatbot's knowledge

Edit `src/js/chatPrompt.js` — the `SYSTEM_PROMPT` constant.
This is the only file you need to change to update what the AI knows
about your products, pricing, or company. No logic changes required.

---

## Changing colours

All colours are CSS custom properties in `src/css/main.css`.
Find the two theme blocks at the top of the file:

```css
[data-theme="dark"]  { ... }
[data-theme="light"] { ... }
```

Key variables:
| Variable    | Purpose                        |
|-------------|--------------------------------|
| `--bg`      | Page background                |
| `--bg2`     | Section alternating background |
| `--blue`    | Primary accent                 |
| `--purple`  | Secondary accent               |
| `--cyan`    | Tertiary accent                |
| `--text`    | Primary text                   |
| `--text2`   | Secondary / muted text         |

---

## Adding a product card

In `index.html`, find the `products-grid` div and copy any `<article class="pc ...">` block.

Required elements inside:
```html
<article class="pc rv">
  <div class="pc-status s-live">  <!-- s-live | s-beta | s-soon -->
    <span class="s-dot"></span>Live
  </div>
  <div class="pc-icon">🔥</div>
  <h3 class="pc-name">Product Name</h3>
  <p class="pc-desc">Description here.</p>
  <div class="pc-tags">
    <span class="pc-tag">Tag 1</span>
  </div>
  <a href="#contact" class="pc-link">CTA text →</a>
</article>
```

---

## Updating contact details

Search `index.html` for `talumaflow@gmail.com` and `+39 328 9741517` —
replace both with your actual addresses. They appear in:
- Nav CTA link
- Contact section details
- Footer email link
- `src/js/chatPrompt.js` (so the bot gives correct contact info)

---

## Adding a new section

1. Add the HTML section to `index.html`
2. Add the CSS to `src/css/main.css`
3. Add a nav link in both the desktop nav and the mobile drawer
4. Add scroll reveal class `rv` to animatable elements

---

## Typography

Fonts are loaded from Google Fonts in `index.html` `<head>`:
- **Space Grotesk** — headings and display text
- **Inter** — body text

To change fonts, update the Google Fonts URL and the CSS variables:
```css
font-family: 'Space Grotesk', sans-serif;  /* headings */
font-family: 'Inter', sans-serif;           /* body */
```
