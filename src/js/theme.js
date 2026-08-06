/**
 * theme.js
 * Dark / light mode toggle with localStorage persistence.
 * Reads the saved preference on page load so the user's
 * choice survives navigation.
 */

const STORAGE_KEY = 'tf-theme';
const DARK = 'dark';
const LIGHT = 'light';

/** Apply a theme to <html> and update the knob emoji. */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const knob = document.querySelector('.theme-knob');
  if (knob) knob.textContent = theme === DARK ? '🌙' : '☀️';
}

/** Toggle between dark and light, persisting to localStorage. */
export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || DARK;
  const next = current === DARK ? LIGHT : DARK;
  applyTheme(next);
  localStorage.setItem(STORAGE_KEY, next);
}

/** Call once on page load to restore the saved preference. */
export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && saved !== DARK) applyTheme(LIGHT);
  // Dark is the default set in HTML, so no action needed for dark
}
