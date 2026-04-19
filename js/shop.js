/* ============================================================
   ZAUQ — Shop Page Logic (connected to real API)
   ============================================================ */

let activeCategory = 'all';
let activeIntensity = 'all';
let activeSort = 'default';
let allProducts = [];

/* ----- FETCH FROM REAL API ----- */
async function fetchAndRender() {
  const grid  = document.getElementById('shopGrid');
  const empty = document.getElementById('shopEmpty');
  const count = document.getElementById('filterCount');

  grid.innerHTML = products.map((p, i) => {
    const visualClasses = [
      'product-card__visual--1','product-card__visual--2',
      'product-card__visual--3','product-card__visual--4',
      'product-card__visual--5','product-card__visual--6'
    ];
    const bottleClasses = [
      'mini-bottle--dark','mini-bottle--gold','mini-bottle--light',
      'mini-bottle--dark','mini-bottle--gold','mini-bottle--light'
    ];

    const hasImage = p.images && p.images.length > 0;

    const visualHTML = hasImage
      ? `<img src="${p.images[0]}"
           style="width:100%;height:100%;object-fit:cover;display:block;
           transition:transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94);"
           onmouseover="this.style.transform='scale(1.05)'"
           onmouseout="this.style.transform='scale(1)'"
           alt="${p.name}" />`
      : `<div class="product-card__mini-bottle">
           <div class="mini-bottle ${bottleClasses[i % 3]}"></div>
         </div>`;

    return `
      <div class="shop-card" style="animation-delay:${i * 80}ms">
        <div class="shop-card__visual ${visualClasses[i % 6]}"
          style="${hasImage ? 'padding:0;overflow:hidden;' : ''}">
          ${p.tag ? `<div class="shop-card__tag ${p.tag === 'New' ? 'shop-card__tag--new' : ''}"
            style="position:absolute;top:16px;left:16px;z-index:3;">${p.tag}</div>` : ''}
          ${visualHTML}
          ${!hasImage ? `
          <div class="shop-card__hover-notes">
            <span>Top · ${p.notes.top}</span>
            <span>Heart · ${p.notes.heart}</span>
            <span>Base · ${p.notes.base}</span>
          </div>` : `
          <div class="shop-card__hover-notes"
            style="position:absolute;bottom:0;left:0;right:0;z-index:3;">
            <span>Top · ${p.notes.top}</span>
            <span>Heart · ${p.notes.heart}</span>
            <span>Base · ${p.notes.base}</span>
          </div>`}
        </div>
        <div class="shop-card__body">
          <div class="shop-card__meta">
            <span class="shop-card__num">${p.number}</span>
            <span class="shop-card__intensity">${p.intensity}</span>
          </div>
          <h3 class="shop-card__name">${p.name}</h3>
          <p class="shop-card__desc">${p.description}</p>
          <div class="shop-card__footer">
            <div>
              <p class="shop-card__price">PKR ${p.price.toLocaleString()}</p>
              <p class="shop-card__size">${p.size} EDP</p>
            </div>
            <div class="shop-card__actions">
              <a href="product.html?id=${p._id}" class="shop-card__view" title="View details">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </a>
              <button class="btn btn--add"
                onclick="handleAddToCart('${p._id}','${p.name}',${p.price},${p.stock})">
                ${p.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

function handleAddToCart(id, name, price) {
  const cart = Cart.get();
  const existing = cart.find(p => p.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, name, price, qty: 1 });
  Cart.save(cart);
  Cart.updateUI();
  showToast(`${name} added to cart`);
}

function resetFilters() {
  activeCategory = 'all';
  activeIntensity = 'all';
  activeSort = 'default';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
  document.querySelectorAll('.intensity-btn').forEach(b => b.classList.toggle('active', b.dataset.intensity === 'all'));
  document.getElementById('sortSelect').value = 'default';
  fetchAndRender();
}

/* ----- SEARCH ----- */
function initSearch() {
  const overlay  = document.getElementById('searchOverlay');
  const toggle   = document.getElementById('searchToggle');
  const closeBtn = document.getElementById('searchClose');
  const input    = document.getElementById('searchInput');
  const results  = document.getElementById('searchResults');

  toggle.addEventListener('click', () => {
    overlay.classList.add('open');
    setTimeout(() => input.focus(), 300);
  });
  closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.classList.remove('open');
  });

  let searchTimer;
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      const q = input.value.trim();
      if (!q) { results.innerHTML = ''; return; }

      const res = await ProductsAPI.getAll({ search: q });
      if (!res.ok || res.data.products.length === 0) {
        results.innerHTML = `<p style="color:var(--text-dim);font-size:14px;padding:16px 0;">No results for "${q}"</p>`;
        return;
      }

      results.innerHTML = res.data.products.map(p => `
        <a href="product.html?id=${p._id}" class="search-result-item">
          <div>
            <p class="search-result-item__name">${p.name}</p>
            <p style="font-size:11px;color:var(--text-dim);letter-spacing:0.1em;margin-top:2px;text-transform:uppercase;">${p.notes.top}</p>
          </div>
          <span class="search-result-item__price">PKR ${p.price.toLocaleString()}</span>
        </a>`).join('');
    }, 300);
  });
}

/* ----- INIT ----- */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCursor();
  initReveal();
  fetchAndRender();
  initSearch();

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      fetchAndRender();
    });
  });

  document.querySelectorAll('.intensity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeIntensity = btn.dataset.intensity;
      fetchAndRender();
    });
  });

  document.getElementById('sortSelect').addEventListener('change', (e) => {
    activeSort = e.target.value;
    fetchAndRender();
  });
});

/* ----- SEARCH ----- */
function initSearch() {
  const overlay  = document.getElementById('searchOverlay');
  const toggle   = document.getElementById('searchToggle');
  const closeBtn = document.getElementById('searchClose');
  const input    = document.getElementById('searchInput');
  const results  = document.getElementById('searchResults');

  toggle.addEventListener('click', () => {
    overlay.classList.add('open');
    setTimeout(() => input.focus(), 300);
  });

  closeBtn.addEventListener('click', () => overlay.classList.remove('open'));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.classList.remove('open');
  });

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { results.innerHTML = ''; return; }

    const matches = ZAUQ_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.intensity.toLowerCase().includes(q) ||
      p.notes.top.toLowerCase().includes(q) ||
      p.notes.heart.toLowerCase().includes(q) ||
      p.notes.base.toLowerCase().includes(q)
    );

    results.innerHTML = matches.length
      ? matches.map(p => `
          <a href="product.html?id=${p.id}" class="search-result-item">
            <div>
              <p class="search-result-item__name">${p.name}</p>
              <p style="font-size:11px;color:var(--text-dim);letter-spacing:0.1em;margin-top:2px;text-transform:uppercase;">${p.notes.top}</p>
            </div>
            <span class="search-result-item__price">PKR ${p.price.toLocaleString()}</span>
          </a>`).join('')
      : `<p style="color:var(--text-dim);font-size:14px;padding:16px 0;">No results for "${input.value}"</p>`;
  });
}

/* ----- INIT ----- */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCursor();
  initReveal();
  renderProducts();
  initSearch();

  /* Category filters */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      renderProducts();
    });
  });

  /* Intensity filters */
  document.querySelectorAll('.intensity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeIntensity = btn.dataset.intensity;
      renderProducts();
    });
  });

  /* Sort */
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    activeSort = e.target.value;
    renderProducts();
  });
});