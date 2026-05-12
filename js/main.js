/* scroll reveals */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* nav scroll state */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* sobriety counter — 2023-11-27 */
const soberDays = Math.floor((Date.now() - new Date('2023-11-27').getTime()) / 86400000);
const soberStr = `DAY ${soberDays.toLocaleString()}`;

const footerSober = document.getElementById('footer-sober');
if (footerSober) footerSober.textContent = soberStr;

const terminalSober = document.getElementById('terminal-sober');
if (terminalSober) terminalSober.textContent = soberStr;

/* terminal uptime (boot: 2026-01-01) */
const uptimeEl = document.getElementById('uptime-display');
if (uptimeEl) {
  const mins = Math.floor((Date.now() - new Date('2026-01-01').getTime()) / 60000);
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  uptimeEl.textContent = `${d}d ${h}h ${m}m`;
}
