let currentFilter = 'All';
let currentIndex = 0;

function visibleItems() {
  return currentFilter === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((g) => g.category === currentFilter);
}

function tileInner(item) {
  return item.imageUrl
    ? `<img src="${item.imageUrl}" alt="${item.caption}" loading="lazy" onerror="this.outerHTML='<span>📷<br>${item.caption}</span>'">`
    : `<span>📷<br>${item.caption}</span>`;
}

function renderTabs() {
  const categories = ['All', ...new Set(GALLERY_ITEMS.map((g) => g.category))];
  const tabsWrap = document.getElementById('galleryTabs');
  tabsWrap.innerHTML = categories.map((c) => `
    <button type="button" class="gallery-tab" data-cat="${c}"
      style="padding:0.55rem 1.1rem;font-size:0.85rem;border-radius:4px;cursor:pointer;
      border:1px solid ${c === currentFilter ? 'var(--accent)' : 'var(--border)'};
      background:${c === currentFilter ? 'var(--card)' : 'transparent'};
      color:${c === currentFilter ? 'var(--accent)' : 'var(--muted)'};">${c}</button>
  `).join('');

  tabsWrap.querySelectorAll('.gallery-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.cat;
      renderTabs();
      renderGrid();
    });
  });
}

function renderGrid() {
  const grid = document.getElementById('galleryGrid');
  const items = visibleItems();

  if (items.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">📷</div><p>No photos in this category yet.</p></div>`;
    return;
  }

  grid.innerHTML = items.map((item, i) => `
    <button type="button" class="tile gallery-item" data-index="${i}" aria-label="Open photo: ${item.caption}" style="cursor:pointer;">
      ${tileInner(item)}
    </button>
  `).join('');

  grid.querySelectorAll('.gallery-item').forEach((btn) => {
    btn.addEventListener('click', () => openLightbox(Number(btn.dataset.index)));
  });
}

function openLightbox(index) {
  currentIndex = index;
  renderLightbox();
  document.getElementById('lightbox').classList.add('open');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

function renderLightbox() {
  const items = visibleItems();
  const item = items[currentIndex];
  const content = document.getElementById('lbContent');
  content.innerHTML = item.imageUrl
    ? `<img src="${item.imageUrl}" alt="${item.caption}" style="max-width:85vw;max-height:75vh;object-fit:contain;" onerror="this.outerHTML='<div style=&quot;width:min(85vw,600px);aspect-ratio:4/3;background:var(--card);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:2.5rem;&quot;>📷</div>'">`
    : `<div style="width:min(85vw,600px);aspect-ratio:4/3;background:var(--card);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:2.5rem;">📷</div>`;
  content.innerHTML += `<p style="text-align:center;color:var(--muted);margin-top:1rem;">${item.caption} — ${item.category}</p>`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderTabs();
  renderGrid();

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => {
    const items = visibleItems();
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    renderLightbox();
  });
  document.getElementById('lbNext').addEventListener('click', () => {
    const items = visibleItems();
    currentIndex = (currentIndex + 1) % items.length;
    renderLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('lightbox').classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') document.getElementById('lbNext').click();
    if (e.key === 'ArrowLeft') document.getElementById('lbPrev').click();
  });

  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
});