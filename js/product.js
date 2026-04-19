/* ============================================================
   ZAUQ — Product Page Logic
   ============================================================ */

let currentProduct = null;
let qty            = 1;
let selectedSize   = '50ml';
let currentThumbIndex = 0;

/* ----- SWITCH PRODUCT IMAGE (thumbnail click) ----- */
/* ----- SWITCH PRODUCT IMAGE ----- */
function switchProductImage(src, index, total) {
  const main    = document.getElementById('mainProductImage');
  const counter = document.getElementById('imageCounter');

  if (!main) return;

  // Fade out
  main.style.opacity   = '0';
  main.style.transform = 'scale(1.02)';

  setTimeout(() => {
    main.src             = src;
    main.style.opacity   = '1';
    main.style.transform = 'scale(1)';
  }, 250);

  // Update counter
  if (counter) counter.textContent = index + 1;

  // Update thumbnail borders and opacity
  const prevWrap = document.getElementById(`thumbWrap-${currentThumbIndex}`);
  const prevImg  = document.getElementById(`thumb-${currentThumbIndex}`);
  if (prevWrap) prevWrap.style.borderColor = 'rgba(201,165,90,0.15)';
  if (prevImg)  prevImg.style.opacity      = '0.6';

  const newWrap = document.getElementById(`thumbWrap-${index}`);
  const newImg  = document.getElementById(`thumb-${index}`);
  if (newWrap) newWrap.style.borderColor = '#c9a55a';
  if (newImg)  newImg.style.opacity      = '1';

  currentThumbIndex = index;
}

/* ----- ZOOM TOGGLE ----- */
let isZoomed = false;
function toggleZoom() {
  const main = document.getElementById('mainProductImage');
  if (!main) return;
  isZoomed = !isZoomed;
  main.style.transform     = isZoomed ? 'scale(1.5)' : 'scale(1)';
  main.style.cursor        = isZoomed ? 'zoom-out' : 'zoom-in';
  main.style.objectPosition = isZoomed ? 'center' : 'center';
}

/* ----- LOAD PRODUCT FROM URL ----- */
async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  if (!id) {
    window.location.href = 'shop.html';
    return;
  }

  const res = await ProductsAPI.getOne(id);

  if (!res.ok) {
    document.getElementById('productSection').innerHTML = `
      <div style="padding:100px 60px;text-align:center;
        color:var(--text-dim);grid-column:1/-1;">
        <h2 style="font-size:2rem;margin-bottom:12px;
          font-family:'Cormorant Garamond',serif;">
          Product not found
        </h2>
        <a href="shop.html" class="btn btn--outline"
          style="margin-top:16px;display:inline-flex;">
          Back to Shop
        </a>
      </div>`;
    return;
  }

  currentProduct = res.data.product;
  renderProduct();
  renderRelated();
}

/* ----- RENDER PRODUCT ----- */
function renderProduct() {
  const p = currentProduct;

  document.title = `${p.name} — Zauq Fragrances`;

  document.getElementById('breadcrumbName').textContent   = p.name;
  document.getElementById('productNumber').textContent    = p.number;
  document.getElementById('productIntensity').textContent = p.intensity;
  document.getElementById('productName').textContent      = p.name;
  document.getElementById('productTagline').textContent   = p.description;
  document.getElementById('noteTop').textContent          = p.notes.top;
  document.getElementById('noteHeart').textContent        = p.notes.heart;
  document.getElementById('noteBase').textContent         = p.notes.base;
  document.getElementById('productDesc').textContent      = p.longDescription;
  document.getElementById('bottleName').textContent       = p.name.toUpperCase();

  updatePrice();


  /* ----- REAL IMAGE OR CSS BOTTLE ----- */
  const visual     = document.getElementById('productVisual');
  const bottleWrap = document.querySelector('.product__bottle-wrap');

  if (p.images && p.images.length > 0) {
    if (bottleWrap) bottleWrap.style.display = 'none';

    const existingGallery = document.getElementById('productImageGallery');
    if (existingGallery) existingGallery.remove();

    const galleryHTML = `
      <div id="productImageGallery" style="
        position: absolute;
        inset: 0;
        z-index: 2;
        display: flex;
        flex-direction: column;
        border-radius: 20px;
        overflow: hidden;
      ">

        <!-- MAIN IMAGE -->
        <div style="
          flex: 1;
          position: relative;
          overflow: hidden;
          min-height: 360px;
          background: #0a0810;
        ">
          <img id="mainProductImage"
            src="${p.images[0]}"
            alt="${p.name}"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
              transition: opacity 0.4s ease, transform 0.6s ease;
            " />

          <!-- Subtle dark vignette overlay -->
          <div style="
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse at center,
              transparent 40%,
              rgba(8,7,10,0.5) 100%);
            pointer-events: none;
          "></div>

          <!-- Image count badge -->
          ${p.images.length > 1 ? `
            <div style="
              position: absolute;
              top: 16px;
              right: 16px;
              background: rgba(8,7,10,0.75);
              border: 1px solid rgba(201,165,90,0.3);
              border-radius: 50px;
              padding: 5px 12px;
              font-family: 'Jost', sans-serif;
              font-size: 11px;
              letter-spacing: 0.1em;
              color: var(--gold-dim);
              backdrop-filter: blur(10px);
            ">
              <span id="imageCounter">1</span> / ${p.images.length}
            </div>
          ` : ''}

          <!-- Zoom hint -->
          <div style="
            position: absolute;
            bottom: 16px;
            right: 16px;
            background: rgba(8,7,10,0.6);
            border: 1px solid rgba(201,165,90,0.2);
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.3s;
          " onclick="toggleZoom()" id="zoomBtn" title="Toggle zoom">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="rgba(201,165,90,0.7)" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
        </div>

        <!-- THUMBNAIL STRIP -->
        ${p.images.length > 1 ? `
          <div style="
            display: flex;
            gap: 0;
            background: rgba(8,7,10,0.95);
            border-top: 1px solid rgba(201,165,90,0.15);
            padding: 12px 14px;
            overflow-x: auto;
            scrollbar-width: none;
          ">
            ${p.images.map((img, i) => `
              <div onclick="switchProductImage('${img}', ${i}, ${p.images.length})"
                id="thumbWrap-${i}"
                style="
                  flex-shrink: 0;
                  width: 64px;
                  height: 64px;
                  border-radius: 8px;
                  overflow: hidden;
                  margin-right: 8px;
                  cursor: pointer;
                  position: relative;
                  border: 2px solid ${i === 0 ? '#c9a55a' : 'rgba(201,165,90,0.15)'};
                  transition: all 0.3s ease;
                  background: #0a0810;
                "
                onmouseover="if(${i} !== currentThumbIndex) this.style.borderColor='rgba(201,165,90,0.5)'"
                onmouseout="if(${i} !== currentThumbIndex) this.style.borderColor='rgba(201,165,90,0.15)'">
                <img src="${img}" alt="${p.name} ${i + 1}"
                  id="thumb-${i}"
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: opacity 0.3s;
                    ${i !== 0 ? 'opacity:0.6;' : ''}
                  " />
              </div>
            `).join('')}
          </div>
        ` : ''}

      </div>`;

    if (visual) {
      visual.style.padding  = '0';
      visual.style.overflow = 'hidden';
      visual.insertAdjacentHTML('beforeend', galleryHTML);
    }

  } else {
    if (bottleWrap) bottleWrap.style.display = 'flex';
    const existingGallery = document.getElementById('productImageGallery');
    if (existingGallery) existingGallery.remove();
    if (visual) {
      visual.style.padding  = '';
      visual.style.overflow = '';
    }
  }

  /* ----- OUT OF STOCK HANDLING ----- */
  const addBtn     = document.getElementById('addToCartBtn');
  const buyBtn     = document.getElementById('buyNowBtn');
  const qtyWrap    = document.getElementById('qtyWrap');
  const stockBadge = document.getElementById('stockBadge');
  const lowStock   = document.getElementById('lowStock');

  if (p.stock <= 0) {
    if (stockBadge) stockBadge.style.display = 'flex';

    addBtn.textContent   = 'Out of Stock';
    addBtn.disabled      = true;
    addBtn.style.cssText = `
      opacity:0.5;
      cursor:not-allowed;
      background:var(--bg-3);
      color:var(--text-dim);
      border-color:var(--border);
    `;

    if (buyBtn) {
      buyBtn.style.cssText = `
        opacity:0.5;
        pointer-events:none;
        cursor:not-allowed;
      `;
    }

    if (qtyWrap)  qtyWrap.style.display  = 'none';
    if (lowStock) lowStock.style.display = 'none';

  } else {
    if (stockBadge) stockBadge.style.display = 'none';

    addBtn.textContent   = 'Add to Cart';
    addBtn.disabled      = false;
    addBtn.style.cssText = '';

    if (buyBtn) buyBtn.style.cssText = '';
    if (qtyWrap) qtyWrap.style.display = 'block';

    if (lowStock) {
      if (p.stock <= 10) {
        lowStock.textContent   = `Only ${p.stock} left in stock`;
        lowStock.style.display = 'block';
      } else {
        lowStock.style.display = 'none';
      }
    }
  }

  /* ----- TAG BADGE ----- */
  const tagEl = document.getElementById('productTag');
  if (tagEl && p.tag) {
    tagEl.textContent = p.tag;
    tagEl.classList.add('visible');
  }

  /* ----- VISUAL BACKGROUND TINT ----- */
  const tints = {
    oriental: 'rgba(139,26,26,0.08)',
    floral:   'rgba(180,120,180,0.07)',
    fresh:    'rgba(34,100,50,0.06)',
    woody:    'rgba(80,50,20,0.08)',
  };

  if (visual && (!p.images || p.images.length === 0)) {
    visual.style.background =
      `radial-gradient(ellipse at center,
        ${tints[p.category] || 'rgba(201,165,90,0.06)'},
        var(--bg-2) 70%)`;
  }
}

/* ----- UPDATE PRICE ----- */
function updatePrice() {
  if (!currentProduct) return;
  let base = currentProduct.price;
  if (selectedSize === '100ml') base += 3000;
  const priceEl = document.getElementById('productPrice');
  if (priceEl) priceEl.textContent = `PKR ${(base * qty).toLocaleString()}`;
}

/* ----- RENDER RELATED PRODUCTS ----- */
async function renderRelated() {
  const res = await ProductsAPI.getAll();
  if (!res.ok) return;

  const related = res.data.products
    .filter(p => p._id !== currentProduct._id)
    .slice(0, 3);

  const grid = document.getElementById('relatedGrid');
  if (!grid) return;

  const bottleClasses = ['mini-bottle--dark', 'mini-bottle--gold', 'mini-bottle--light'];

  grid.innerHTML = related.map((p, i) => {
    const hasImage = p.images && p.images.length > 0;
    return `
      <a href="product.html?id=${p._id}" class="related-card">

        <!-- Image or mini bottle -->
        <div style="width:100%;height:160px;border-radius:10px;
          overflow:hidden;margin-bottom:16px;background:var(--bg-3);
          border:1px solid var(--border);display:flex;
          align-items:center;justify-content:center;position:relative;">
          ${hasImage
            ? `<img src="${p.images[0]}" alt="${p.name}"
                style="width:100%;height:100%;object-fit:cover;
                transition:transform 0.4s ease;"
                onmouseover="this.style.transform='scale(1.05)'"
                onmouseout="this.style.transform='scale(1)'" />`
            : `<div class="mini-bottle ${bottleClasses[i % 3]}"></div>`
          }
          ${p.stock <= 0
            ? `<div style="position:absolute;top:8px;right:8px;font-size:9px;
                letter-spacing:0.15em;text-transform:uppercase;color:#c0392b;
                border:1px solid rgba(192,57,43,0.3);background:rgba(8,7,10,0.85);
                padding:2px 10px;border-radius:50px;">Out of Stock</div>`
            : ''
          }
        </div>

        <span class="related-card__num">${p.number}</span>
        <h3 class="related-card__name">${p.name}</h3>
        <p class="related-card__desc">${p.description}</p>
        <div style="display:flex;justify-content:space-between;
          align-items:center;margin-top:8px;">
          <span class="related-card__price">PKR ${p.price.toLocaleString()}</span>
        </div>
      </a>`;
  }).join('');
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCursor();
  loadProduct();

  /* ----- QTY MINUS ----- */
  document.getElementById('qtyMinus')?.addEventListener('click', () => {
    if (qty > 1) {
      qty--;
      document.getElementById('qtyVal').textContent = qty;
      updatePrice();
    }
  });

  /* ----- QTY PLUS ----- */
  document.getElementById('qtyPlus')?.addEventListener('click', () => {
    if (!currentProduct) return;
    if (qty < currentProduct.stock) {
      qty++;
      document.getElementById('qtyVal').textContent = qty;
      updatePrice();
    } else {
      showToast('Maximum available stock reached');
    }
  });

  /* ----- SIZE BUTTONS ----- */
  document.querySelectorAll('.product__size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.product__size-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.textContent.includes('100') ? '100ml' : '50ml';
      updatePrice();
    });
  });

  /* ----- ADD TO CART ----- */
  document.getElementById('addToCartBtn')?.addEventListener('click', () => {
    if (!currentProduct || currentProduct.stock <= 0) return;

    const cart     = Cart.get();
    const existing = cart.find(p => p.id === currentProduct._id);

    if (existing) {
      existing.qty = Math.min(existing.qty + qty, currentProduct.stock);
    } else {
      cart.push({
        id:    currentProduct._id,
        name:  currentProduct.name,
        price: currentProduct.price,
        qty:   qty
      });
    }

    Cart.save(cart);
    Cart.updateUI();
    showToast(`${currentProduct.name} × ${qty} added to cart`);
  });

  /* ----- BUY NOW ----- */
  document.getElementById('buyNowBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!currentProduct || currentProduct.stock <= 0) return;

    const cart     = Cart.get();
    const existing = cart.find(p => p.id === currentProduct._id);

    if (existing) {
      existing.qty = Math.min(existing.qty + qty, currentProduct.stock);
    } else {
      cart.push({
        id:    currentProduct._id,
        name:  currentProduct.name,
        price: currentProduct.price,
        qty:   qty
      });
    }

    Cart.save(cart);
    Cart.updateUI();
    window.location.href = 'checkout.html';
  });

  /* ----- WISHLIST ----- */
  document.querySelector('.product__wishlist')?.addEventListener('click', function() {
    this.classList.toggle('wishlisted');
    const active = this.classList.contains('wishlisted');
    const path   = this.querySelector('path');
    if (path) path.setAttribute('fill', active ? '#c0392b' : 'none');
    showToast(active
      ? `${currentProduct?.name} saved to wishlist`
      : 'Removed from wishlist'
    );
  });

  /* ----- ACCORDIONS ----- */
  document.querySelectorAll('.product__accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const accordion = btn.parentElement;
      const isOpen    = accordion.classList.contains('open');
      document.querySelectorAll('.product__accordion')
        .forEach(a => a.classList.remove('open'));
      if (!isOpen) accordion.classList.add('open');
    });
  });
});