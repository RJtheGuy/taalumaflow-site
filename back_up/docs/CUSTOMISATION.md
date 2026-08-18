# Customisation Guide

## Updating the chatbot's knowledge

Edit `src/js/chatPrompt.js` — the `SYSTEM_PROMPT` constant.
This is the **only file** you need to change to update what the AI knows
about products, pricing, tone, or company details.

---

## Changing colours

All colours live in `src/css/main.css` at the top in two blocks:

```css
[data-theme="dark"]  { ... }
[data-theme="light"] { ... }
```

| Variable    | Purpose                          |
|-------------|----------------------------------|
| `--bg`      | Page background                  |
| `--bg2`     | Alternate section background     |
| `--blue`    | Primary accent (links, buttons)  |
| `--purple`  | Secondary accent                 |
| `--cyan`    | Tertiary accent                  |
| `--text`    | Primary text                     |
| `--text2`   | Secondary / muted text           |

---

## Adding a product card

In `index.html`, find the `products-grid` div and add an `<article>`:

```html
<article class="pc rv">
  <!-- Status badge: s-live | s-beta | s-soon -->
  <div class="pc-status s-live"><span class="s-dot"></span>Live</div>
  <div class="pc-icon">🔥</div>
  <h3 class="pc-name">Product Name</h3>
  <p class="pc-desc">Short description here.</p>
  <div class="pc-tags">
    <span class="pc-tag">Tag 1</span>
    <span class="pc-tag">Tag 2</span>
  </div>
  <a href="#contact" class="pc-link">CTA text →</a>
</article>
```

---

## Updating contact details

Search `index.html` for `talumaflow@gmail.com` and `+39 328 9741517`.
Also update `src/js/chatPrompt.js` so the chatbot gives correct info.

---

## Adding a favicon

Place `favicon.ico` (and optionally `favicon.png`) in the `public/` folder,
then add to `index.html` `<head>`:

```html
<link rel="icon" href="public/favicon.ico">
<link rel="icon" type="image/png" href="public/favicon.png">
```

## Adding an Open Graph image

Place `og-image.png` (1200×630px) in `public/` and add to `<head>`:

```html
<meta property="og:image" content="https://www.talumaflow.com/public/og-image.png">
```
