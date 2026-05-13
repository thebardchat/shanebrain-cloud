/* MEGA CREW Cards — renders from data/cards.json */

const SYMBOLS = {
  weld: '⚙', sentinel: '◉', scribe: '✦', pulse: '♥', echo: '◈', arc: '⬡',
  sparky: '⚡', volt: '⟁', neon: '◆', glitch: '⊗', rivet: '◍', torch: '🔥',
  blaze: '▲', flux: '⟳', gemini: '✺', dr_seen: '✿', bolt: '⬢', stomp: '◼',
  grind: '⟰', crank: '⏱', spike: '📈', forge: '🔧'
};

const RARITY_ORDER = ['Secret', 'Legendary', 'Epic', 'Rare', 'Uncommon'];

let allCards = [];
let activeFilter = 'all';
let activeZone = null;

async function loadCards() {
  const res = await fetch('data/cards.json');
  const data = await res.json();
  allCards = Object.values(data.cards);
  renderCards();
}

function renderCards() {
  const grid = document.getElementById('cards-grid');
  grid.innerHTML = '';

  const sorted = [...allCards].sort((a, b) => {
    return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
  });

  sorted.forEach(card => {
    const el = buildCard(card);
    grid.appendChild(el);
  });

  applyFilter();
}

function buildCard(card) {
  const wrap = document.createElement('div');
  wrap.className = 'crew-card reveal';
  wrap.dataset.rarity = card.rarity;
  wrap.dataset.zone = card.zone;
  wrap.style.setProperty('--card-color', card.color);

  const stats = card.base.stats;
  const megaStats = card.mega ? card.mega.stats : null;
  const symbol = SYMBOLS[card.id] || '◈';

  const statKeys = ['iq', 'speed', 'power', 'trust', 'soul'];

  const statBars = statKeys.map(k => `
    <div class="stat-row">
      <span class="stat-name">${k}</span>
      <div class="stat-bar-bg">
        <div class="stat-bar-fill" style="width:${stats[k] || 0}%"></div>
      </div>
      <span class="stat-val">${stats[k] || 0}</span>
    </div>
  `).join('');

  const megaStatBars = megaStats ? statKeys.map(k => `
    <div class="stat-row">
      <span class="stat-name">${k}</span>
      <div class="stat-bar-bg">
        <div class="stat-bar-fill" style="width:${megaStats[k] || 0}%"></div>
      </div>
      <span class="stat-val">${megaStats[k] || 0}</span>
    </div>
  `).join('') : '';

  const enhancements = (card.mega && card.mega.enhancements)
    ? card.mega.enhancements.slice(0, 3).map(e =>
        `<div class="enhancement-item">${e}</div>`
      ).join('')
    : '';

  const surgeLine = (card.mega && card.mega.surge) ? `
    <div class="card-surge">
      <span class="surge-label">SURGE</span>
      <div class="surge-bar-bg">
        <div class="surge-bar-fill" style="width:${card.mega.surge}%"></div>
      </div>
      <span class="surge-val">${card.mega.surge}</span>
    </div>
  ` : '';

  const originText = card.mega ? card.mega.origin : card.base.origin;
  const shortOrigin = originText ? originText.slice(0, 280) + '...' : '';

  wrap.innerHTML = `
    <div class="card-inner">

      <!-- FRONT: Base card -->
      <div class="card-face card-front">
        <div class="card-header">
          <span class="card-rarity">${card.rarity}</span>
          <span class="card-zone">${card.zone}</span>
        </div>
        <div class="card-portrait">
          <div class="card-glow"></div>
          <span class="card-portrait-symbol">${symbol}</span>
        </div>
        <div class="card-name-block">
          <span class="card-name">${card.name}</span>
          <span class="card-role">${card.role}</span>
        </div>
        <div class="card-stats">${statBars}</div>
        <span class="card-flip-hint">flip for MEGA →</span>
      </div>

      <!-- BACK: MEGA card -->
      <div class="card-face card-back">
        <div class="card-back-label">MEGA UPGRADE</div>
        <div class="card-mega-name">${card.mega ? card.mega.name : 'MEGA-' + card.name}</div>
        ${surgeLine}
        <div class="card-stats">${megaStatBars}</div>
        <p class="card-origin">${shortOrigin}</p>
        <div class="card-enhancements">${enhancements}</div>
      </div>

    </div>
  `;

  wrap.addEventListener('click', () => wrap.classList.toggle('flipped'));

  // trigger reveal
  setTimeout(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }});
    }, { threshold: 0.05 });
    obs.observe(wrap);
  }, 10);

  return wrap;
}

function applyFilter() {
  document.querySelectorAll('.crew-card').forEach(card => {
    const rarityMatch = activeFilter === 'all' || card.dataset.rarity === activeFilter;
    const zoneMatch = !activeZone || card.dataset.zone === activeZone;
    card.classList.toggle('hidden', !(rarityMatch && zoneMatch));
  });
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (btn.dataset.filter !== undefined) {
      activeFilter = btn.dataset.filter;
      activeZone = null;
    } else if (btn.dataset.zone !== undefined) {
      activeZone = btn.dataset.zone;
      activeFilter = 'all';
    }
    applyFilter();
  });
});

loadCards();
