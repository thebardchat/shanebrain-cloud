/* MEGA CREW Stories — renders from data/episodes.json */

const EP_FILES_BASE = 'https://raw.githubusercontent.com/thebardchat/shanebrain-cloud/main/data/episodes/';

async function loadEpisodes() {
  const res = await fetch('data/episodes.json');
  const episodes = await res.json();
  renderEpisodes(episodes);
}

function renderEpisodes(episodes) {
  const grid = document.getElementById('episodes-grid');
  grid.innerHTML = '';

  episodes.forEach((ep, i) => {
    const card = document.createElement('div');
    card.className = 'episode-card reveal';
    card.dataset.delay = (i % 3) + 1;

    const charTags = (ep.characters || []).map(c =>
      `<span class="ep-char-tag">${c}</span>`
    ).join('');

    const epLabel = `EP ${String(ep.num).padStart(3, '0')}`;

    card.innerHTML = `
      <div class="ep-meta">
        <span class="ep-num">${epLabel}</span>
        <span class="ep-date">${ep.date || ''}</span>
      </div>
      <div class="ep-title">${ep.title}</div>
      <p class="ep-excerpt">${ep.excerpt || ''}</p>
      <div class="ep-characters">${charTags}</div>
      <span class="ep-read-hint">Read episode →</span>
    `;

    card.addEventListener('click', () => openEpisode(ep));

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.05 });
    obs.observe(card);

    grid.appendChild(card);
  });
}

function openEpisode(ep) {
  const modal = document.getElementById('episode-modal');
  const content = document.getElementById('ep-modal-content');

  const charTags = (ep.characters || []).map(c =>
    `<span class="ep-char-tag">${c}</span>`
  ).join('');

  content.innerHTML = `
    <div class="ep-modal-header">
      <span class="ep-modal-num">Episode ${String(ep.num).padStart(3, '0')} &nbsp;·&nbsp; ${ep.date || ''}</span>
      <div class="ep-modal-title">${ep.title}</div>
      <div class="ep-modal-chars">${charTags}</div>
    </div>
    <div class="ep-modal-body" id="ep-body">
      <div style="color:var(--bone-dim);font-family:var(--font-mono);font-size:0.75rem;">Loading...</div>
    </div>
  `;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Fetch the actual markdown from the episodes folder
  fetch(`data/episodes/${ep.filename}`)
    .then(r => r.text())
    .then(text => {
      const body = document.getElementById('ep-body');
      if (!body) return;

      // Strip frontmatter (everything between --- markers)
      const parts = text.split('---');
      const prose = parts.length > 2 ? parts.slice(2).join('---').trim() : text.trim();

      // Convert markdown paragraphs to HTML
      const html = prose
        .split(/\n\n+/)
        .map(block => {
          block = block.trim();
          if (!block) return '';
          if (block.startsWith('*') && block.endsWith('*'))
            return `<p style="font-style:italic;opacity:0.7">${block.replace(/\*/g, '')}</p>`;
          return `<p>${block}</p>`;
        })
        .filter(Boolean)
        .join('');

      body.innerHTML = html || `<p style="opacity:0.5">Episode text coming soon.</p>`;
    })
    .catch(() => {
      const body = document.getElementById('ep-body');
      if (body) body.innerHTML = `
        <div class="ep-coming-soon">
          <span class="section-label">EPISODE ${String(ep.num).padStart(3,'0')}</span>
          <p>Full text stored locally. Public episode archive coming with the Mega Bots series launch.</p>
        </div>
      `;
    });
}

function closeEpisode() {
  const modal = document.getElementById('episode-modal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.getElementById('ep-modal-backdrop').addEventListener('click', closeEpisode);
document.getElementById('ep-modal-close').addEventListener('click', closeEpisode);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeEpisode(); });

loadEpisodes();
