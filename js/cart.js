/* ============================================================
   ZAUQ — Cart Page Logic
   ============================================================ */

const PROMO_CODES = {
  'ZAUQ10': 0.10,
  'WELCOME': 0.15,
  'OUD20':  0.20,
};

let appliedDiscount = 0;

/* ----- RENDER CART ----- */
function renderCart() {
  const cart        = Cart.get();
  const cartSection = document.querySelector('.cart-section');
  const cartEmpty   = document.getElementById('cartEmpty');
  const cartUpsell  = document.getElementById('cartUpsell');

  if (cart.length === 0) {
    cartSection.style.display = 'none';
    cartEmpty.style.display   = 'flex';
    cartUpsell.style.display  = 'none';
    return;
  }

  cartSection.style.display = 'grid';
  cartEmpty.style.display   = 'none';
  cartUpsell.style.display  = 'block';

  renderItems(cart);
  renderSummary(cart);
  renderUpsell(cart);
}

/* ----- RENDER ITEMS ----- */
function renderItems(cart) {
  const container = document.getElementById('cartItems');

  container.innerHTML = `
    <div class="cart-items__header">
      <span>Product</span>
      <span>Quantity</span>
      <span style="text-align:right">Price</span>
      <span></span>
    </div>
    ${cart.map(item => {
      const product = ZAUQ_PRODUCTS.find(p => p.id === item.id);
      return `
        <div class="cart-item" id="cartItem-${item.id}">
          <div class="cart-item__product">
            <div class="cart-item__visual">
              <div class="cart-item__mini-bottle ${product ? product.bottleClass : ''}"></div>
            </div>
            <div class="cart-item__details">
              <p class="cart-item__num">${product ? product.number : ''}</p>
              <p class="cart-item__name">${item.name}</p>
              <p class="cart-item__size">50ml EDP</p>
            </div>
          </div>
          <div class="cart-item__qty">
            <button class="cart-item__qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
            <span class="cart-item__qty-val">${item.qty}</span>
            <button class="cart-item__qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
          <p class="cart-item__price">PKR ${(item.price * item.qty).toLocaleString()}</p>
          <button class="cart-item__remove" onclick="removeItem(${item.id})" aria-label="Remove">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      `;
    }).join('')}
  `;
}

/* ----- RENDER SUMMARY ----- */
function renderSummary(cart) {
  const subtotal = Cart.total();
  const shipping = subtotal >= 5000 ? 0 : 250;
  const discount = Math.round(subtotal * appliedDiscount);
  const total    = subtotal + shipping - discount;

  // Item rows
  document.getElementById('summaryRows').innerHTML = cart.map(item => `
    <div class="cart-summary__item">
      <span class="cart-summary__item-name">${item.name} × ${item.qty}</span>
      <span class="cart-summary__item-price">PKR ${(item.price * item.qty).toLocaleString()}</span>
    </div>
  `).join('');

  document.getElementById('subtotalVal').textContent =
    `PKR ${subtotal.toLocaleString()}`;
  document.getElementById('shippingVal').textContent =
    shipping === 0 ? 'Free' : `PKR ${shipping.toLocaleString()}`;
  document.getElementById('totalVal').textContent =
    `PKR ${total.toLocaleString()}`;

  const discountRow = document.getElementById('discountRow');
  if (discount > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('discountVal').textContent =
      `− PKR ${discount.toLocaleString()}`;
  } else {
    discountRow.style.display = 'none';
  }
}

/* ----- RENDER UPSELL ----- */
function renderUpsell(cart) {
  const cartIds = cart.map(i => i.id);
  const suggestions = ZAUQ_PRODUCTS
    .filter(p => !cartIds.includes(p.id))
    .slice(0, 3);

  document.getElementById('upsellGrid').innerHTML = suggestions.map(p => `
    <div class="upsell-card">
      <span class="upsell-card__num">${p.number}</span>
      <h3 class="upsell-card__name">${p.name}</h3>
      <p class="upsell-card__desc">${p.desc}</p>
      <div class="upsell-card__footer">
        <span class="upsell-card__price">PKR ${p.price.toLocaleString()}</span>
        <button class="btn btn--add" onclick="addUpsell(${p.id})">Add to Cart</button>
      </div>
    </div>
  `).join('');
}

/* ----- ACTIONS ----- */
function changeQty(id, delta) {
  const cart = Cart.get();
  const item = cart.find(p => p.id === id);
  if (!item) return;
  item.qty = Math.max(1, Math.min(10, item.qty + delta));
  Cart.save(cart);
  Cart.updateUI();
  renderCart();
}

function removeItem(id) {
  const el = document.getElementById(`cartItem-${id}`);
  if (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-12px)';
    el.style.transition = 'all 0.3s';
    setTimeout(() => { Cart.remove(id); renderCart(); }, 300);
  }
}

function addUpsell(id) {
  const name = Cart.add(id);
  if (name) { showToast(`${name} added to cart`); renderCart(); }
}

/* ----- PROMO CODE ----- */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCursor();
  renderCart();

  const promoBtn   = document.getElementById('promoBtn');
  const promoInput = document.getElementById('promoInput');
  const promoMsg   = document.getElementById('promoMsg');

  promoBtn.addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();
    if (!code) return;

    if (PROMO_CODES[code]) {
      appliedDiscount = PROMO_CODES[code];
      const pct = Math.round(appliedDiscount * 100);
      promoMsg.textContent = `Code applied! ${pct}% discount added.`;
      promoMsg.className = 'cart-promo__msg cart-promo__msg--success';
      promoInput.disabled = true;
      promoBtn.textContent = 'Applied ✓';
      promoBtn.style.opacity = '0.5';
      promoBtn.disabled = true;
      renderSummary(Cart.get());
    } else {
      promoMsg.textContent = 'Invalid promo code. Try ZAUQ10.';
      promoMsg.className = 'cart-promo__msg cart-promo__msg--error';
    }
  });

  promoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') promoBtn.click();
  });
});