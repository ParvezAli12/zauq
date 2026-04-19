/* ============================================================
   ZAUQ — Homepage Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCursor();
  initReveal();
  loadFeaturedProducts();

  /* PARALLAX ORBS */
  const orb1 = document.querySelector('.hero__orb--1');
  const orb2 = document.querySelector('.hero__orb--2');
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    if (orb1) orb1.style.transform = `translate(${x}px, ${y}px)`;
    if (orb2) orb2.style.transform = `translate(${-x * 0.6}px, ${-y * 0.6}px)`;
  }, { passive: true });

  /* NEWSLETTER */
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input.value.trim()) {
        showToast("You're on the list! Welcome to Zauq.");
        input.value = '';
      }
    });
  }

  /* SMOOTH SCROLL */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

/* ----- LOAD FEATURED PRODUCTS FROM API ----- */
async function loadFeaturedProducts() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  const res = await ProductsAPI.getAll();

  if (!res.ok) {
    grid.innerHTML = `
      <div class="home-loading">
        <p>Could not load products. Make sure the backend is running.</p>
      </div>`;
    return;
  }

  const products = res.data.products.slice(0, 3);

  const visualClasses = [
    'product-card__visual--1',
    'product-card__visual--2',
    'product-card__visual--3'
  ];
  const bottleClasses = [
    'mini-bottle--dark',
    'mini-bottle--gold',
    'mini-bottle--light'
  ];

  grid.innerHTML = products.map((p, i) => {
    const visualClasses = [
      'product-card__visual--1',
      'product-card__visual--2',
      'product-card__visual--3'
    ];
    const bottleClasses = [
      'mini-bottle--dark',
      'mini-bottle--gold',
      'mini-bottle--light'
    ];

    const hasImage = p.images && p.images.length > 0;

    return `
      <div class="product-card ${p.tag === 'Bestseller' ? 'product-card--featured' : ''}"
        data-reveal>
        ${p.tag ? `<div class="product-card__badge">${p.tag}</div>` : ''}

        <div class="product-card__visual ${visualClasses[i]}"
          style="${hasImage ? 'padding:0;overflow:hidden;' : ''}">
          ${hasImage
            ? `<img src="${p.images[0]}" alt="${p.name}"
                style="width:100%;height:100%;object-fit:cover;display:block;
                transition:transform 0.5s ease;"
                onmouseover="this.style.transform='scale(1.05)'"
                onmouseout="this.style.transform='scale(1)'" />`
            : `<div class="product-card__mini-bottle">
                 <div class="mini-bottle ${bottleClasses[i]}"></div>
               </div>`
          }
          <div class="product-card__notes"
            style="${hasImage ? 'position:absolute;bottom:0;left:0;right:0;z-index:3;' : ''}">
            <span>Top: ${p.notes.top}</span>
            <span>Heart: ${p.notes.heart}</span>
            <span>Base: ${p.notes.base}</span>
          </div>
        </div>

        <div class="product-card__info">
          <div class="product-card__meta">
            <p class="product-card__collection">${p.number}</p>
            <p class="product-card__intensity">${p.intensity}</p>
          </div>
          <h3 class="product-card__name">${p.name}</h3>
          <p class="product-card__desc">${p.description}</p>
          <div class="product-card__footer">
            <p class="product-card__price">PKR ${p.price.toLocaleString()}</p>
            <div style="display:flex;gap:8px;align-items:center;">
              <a href="pages/product.html?id=${p._id}" class="btn btn--ghost"
                style="padding:8px 16px;font-size:11px;">
                View
              </a>
              <button class="btn btn--add"
                onclick="addToCartHome('${p._id}','${p.name}',${p.price},${p.stock})">
                ${p.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
  
  initReveal();
}

/* ----- ADD TO CART FROM HOMEPAGE ----- */
function addToCartHome(id, name, price, stock) {
  if (stock <= 0) {
    showToast('This product is out of stock');
    return;
  }
  const cart     = Cart.get();
  const existing = cart.find(p => p.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, name, price, qty: 1 });
  Cart.save(cart);
  Cart.updateUI();
  showToast(`${name} added to cart`);
}