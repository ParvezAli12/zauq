/* ============================================================
   ZAUQ — Checkout Page Logic
   ============================================================ */

let currentStep = 1;
let shippingCost = 0;
const SHIPPING_COSTS = { standard: 0, express: 500, sameday: 300 };

/* ----- STEP NAVIGATION ----- */
function goToStep(step) {
  document.getElementById(`panel${currentStep}`).classList.add('hidden');
  document.getElementById(`panel${step}`).classList.remove('hidden');

  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`step-indicator-${i}`);
    el.classList.remove('active', 'done');
    if (i === step) el.classList.add('active');
    if (i < step)  el.classList.add('done');
  }

  currentStep = step;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ----- VALIDATION ----- */
function validateStep1() {
  let valid = true;

  const fields = [
    { id: 'fullName', label: 'Full name', check: v => v.length >= 3 },
    { id: 'email',    label: 'Email',     check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id: 'phone',    label: 'Phone',     check: v => v.replace(/\D/g,'').length >= 10 },
    { id: 'address',  label: 'Address',   check: v => v.length >= 5 },
    { id: 'city',     label: 'City',      check: v => v.length >= 2 },
    { id: 'province', label: 'Province',  check: v => v !== '' },
  ];

  fields.forEach(({ id, label, check }) => {
    const input = document.getElementById(id);
    const err   = document.getElementById(`err-${id}`);
    const val   = input.value.trim();
    if (!check(val)) {
      err.textContent = `Please enter a valid ${label.toLowerCase()}.`;
      input.classList.add('error');
      valid = false;
    } else {
      err.textContent = '';
      input.classList.remove('error');
    }
  });

  return valid;
}

/* ----- RENDER SIDEBAR ----- */
function renderSidebar() {
  const cart     = Cart.get();
  const subtotal = Cart.total();
  const total    = subtotal + shippingCost;

  document.getElementById('sidebarItems').innerHTML = cart.map(item => `
    <div class="sidebar-item">
      <div>
        <p class="sidebar-item__name">${item.name}</p>
        <p class="sidebar-item__qty">× ${item.qty} · 50ml EDP</p>
      </div>
      <span class="sidebar-item__price">PKR ${(item.price * item.qty).toLocaleString()}</span>
    </div>
  `).join('');

  document.getElementById('sidebarTotals').innerHTML = `
    <div class="sidebar-total-row">
      <span>Subtotal</span>
      <span>PKR ${subtotal.toLocaleString()}</span>
    </div>
    <div class="sidebar-total-row">
      <span>Shipping</span>
      <span>${shippingCost === 0 ? 'Free' : `PKR ${shippingCost.toLocaleString()}`}</span>
    </div>
    <div class="sidebar-total-row sidebar-total-row--grand">
      <span>Total</span>
      <span>PKR ${total.toLocaleString()}</span>
    </div>
  `;
}

/* ----- RENDER ORDER REVIEW (Step 3) ----- */
function renderOrderReview() {
  const cart     = Cart.get();
  const subtotal = Cart.total();
  const total    = subtotal + shippingCost;

  document.getElementById('reviewItems').innerHTML = cart.map(item => `
    <div class="order-review__item">
      <span class="order-review__item-name">${item.name} × ${item.qty}</span>
      <span>PKR ${(item.price * item.qty).toLocaleString()}</span>
    </div>
  `).join('');

  document.getElementById('reviewTotals').innerHTML = `
    <div class="order-review__total-row">
      <span>Subtotal</span><span>PKR ${subtotal.toLocaleString()}</span>
    </div>
    <div class="order-review__total-row">
      <span>Shipping</span><span>${shippingCost === 0 ? 'Free' : `PKR ${shippingCost.toLocaleString()}`}</span>
    </div>
    <div class="order-review__total-row order-review__total-row--grand">
      <span>Total</span><span>PKR ${total.toLocaleString()}</span>
    </div>
  `;
}

/* ----- PLACE ORDER — Connected to real backend ----- */
async function placeOrder() {
  const btn = document.getElementById('placeOrderBtn');
  btn.textContent = 'Placing Order...';
  btn.disabled = true;

  const cart = Cart.get();

  const orderData = {
    customer: {
      fullName: document.getElementById('fullName').value.trim(),
      email:    document.getElementById('email').value.trim(),
      phone:    document.getElementById('phone').value.trim()
    },
    shippingAddress: {
      street:   document.getElementById('address').value.trim(),
      city:     document.getElementById('city').value.trim(),
      province: document.getElementById('province').value
    },
    items: cart.map(item => ({
      name:  item.name,
      price: item.price,
      qty:   item.qty,
      size:  '50ml'
    })),
    payment: {
      method: document.querySelector('input[name="payment"]:checked')?.value || 'cod',
      status: 'pending'
    },
    shipping: {
      method: document.querySelector('input[name="shipping"]:checked')?.value || 'standard',
      cost:   shippingCost
    },
    subtotal: Cart.total(),
    total:    Cart.total() + shippingCost,
    notes:    document.getElementById('notes')?.value?.trim() || ''
  };

  try {
    const res = await OrdersAPI.create(orderData);

    if (!res.ok) {
      showToast(res.data.message || 'Order failed. Please try again.');
      btn.textContent = 'Place Order';
      btn.disabled = false;
      return;
    }

    const orderId = res.data.order.orderId;
    localStorage.removeItem('zauq_cart');
    Cart.updateUI();

    document.getElementById('orderId').textContent = `Order ID: ${orderId}`;
    document.getElementById('orderSuccess').style.display = 'flex';

  } catch (err) {
    showToast('Something went wrong. Please try again.');
    btn.textContent = 'Place Order';
    btn.disabled = false;
  }
}

/* ----- INIT ----- */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCursor();

  if (Cart.get().length === 0) {
    window.location.href = 'shop.html';
    return;
  }

  const subtotal   = Cart.total();
  const standardEl = document.getElementById('standardPrice');
  if (subtotal >= 5000) {
    shippingCost = 0;
    standardEl.textContent = 'Free';
  } else {
    shippingCost = 250;
    standardEl.textContent = 'PKR 250';
  }

  renderSidebar();

  document.getElementById('nextToShipping').addEventListener('click', () => {
    if (validateStep1()) goToStep(2);
  });

  document.getElementById('nextToPayment').addEventListener('click', () => {
    goToStep(3);
    renderOrderReview();
  });

  document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);

  document.getElementById('backToInfo').addEventListener('click',     () => goToStep(1));
  document.getElementById('backToShipping').addEventListener('click', () => goToStep(2));

  document.querySelectorAll('input[name="shipping"]').forEach(radio => {
    radio.addEventListener('change', () => {
      shippingCost = SHIPPING_COSTS[radio.value] || 0;
      renderSidebar();
    });
  });

  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.payment-detail').forEach(d => d.classList.add('hidden'));
      const detail = document.getElementById(`detail-${radio.value}`);
      if (detail) detail.classList.remove('hidden');
    });
  });

  ['fullName','email','phone','address','city'].forEach(id => {
    document.getElementById(id)?.addEventListener('blur', () => {
      const input = document.getElementById(id);
      if (input.classList.contains('error') && input.value.trim().length > 0) {
        input.classList.remove('error');
        document.getElementById(`err-${id}`).textContent = '';
      }
    });
  });
});