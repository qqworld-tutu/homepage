const button = document.querySelector('.theme-toggle');
const preference = matchMedia('(prefers-color-scheme: dark)');
function isDark() {
  return document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark'
    : preference.matches;
}
function updateLabel() {
  button.setAttribute('aria-label', `Switch to ${isDark() ? 'light' : 'dark'} theme`);
  button.title = button.getAttribute('aria-label');
}
button.addEventListener('click', () => {
  const theme = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('quan-theme', theme); } catch {}
  updateLabel();
});
preference.addEventListener('change', updateLabel);
updateLabel();

const links = [...document.querySelectorAll('.section-nav a')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of links) {
        const active = link.hash === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
  }, {rootMargin: '-15% 0px -60% 0px'});
  document.querySelectorAll('main section').forEach(section => observer.observe(section));
}
