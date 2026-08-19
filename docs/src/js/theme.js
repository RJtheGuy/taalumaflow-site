
const KEY = 'tf-theme';

function apply(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const knob = document.querySelector('.theme-knob');
  if (knob) knob.textContent = theme === 'dark' ? '🌙' : '☀️';
}

export function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  apply(next);
  localStorage.setItem(KEY, next);
}

export function initTheme() {
  const saved = localStorage.getItem(KEY);
  if (saved && saved !== 'dark') apply('light');
}
