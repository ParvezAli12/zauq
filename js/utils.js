/* ============================================================
   ZAUQ — Shared Utilities & Product Data
   ============================================================ */

/* ----- PRODUCT DATA ----- */
const ZAUQ_PRODUCTS = [
  {
    id: 1,
    name: 'Laila Noir',
    number: 'No. 01',
    intensity: 'Intense',
    price: 8500,
    size: '50ml',
    category: 'oriental',
    notes: { top: 'Bergamot, Saffron', heart: 'Rose, Oud', base: 'Amber, Musk' },
    desc: 'A night-blooming rose wrapped in smoky oud — seductive, timeless, unforgettable.',
    longDesc: 'Laila Noir opens with a burst of bergamot and golden saffron, before the heart reveals a deeply romantic accord of Bulgarian rose and pure Assam oud. The drydown is a warm embrace of amber and white musk that lasts well into the next morning.',
    bottleClass: 'mini-bottle--dark',
    visualClass: 'product-card__visual--1',
    tag: null
  },
  {
    id: 2,
    name: 'Raat Ki Rani',
    number: 'No. 02',
    intensity: 'Moderate',
    price: 9200,
    size: '50ml',
    category: 'floral',
    notes: { top: 'Cardamom, Citrus', heart: 'Sandalwood, Iris', base: 'Vetiver, White Musk' },
    desc: 'Queen of the night. A veil of sandalwood and spice that lingers long after you\'ve left.',
    longDesc: 'Named after the tuberose that blooms only after dark, Raat Ki Rani is a sophisticated floral built on a foundation of Mysore sandalwood. Cardamom and citrus open playfully, before iris and sandalwood take over in a powdery, skin-close heart.',
    bottleClass: 'mini-bottle--gold',
    visualClass: 'product-card__visual--2',
    tag: 'Bestseller'
  },
  {
    id: 3,
    name: 'Subah-e-Noor',
    number: 'No. 03',
    intensity: 'Light',
    price: 7800,
    size: '50ml',
    category: 'fresh',
    notes: { top: 'Jasmine, Green Tea', heart: 'Peony, Cedarwood', base: 'Patchouli, Vanilla' },
    desc: 'Morning light on jasmine petals. Fresh, luminous, and alive — a breath of pure dawn.',
    longDesc: 'Subah-e-Noor (Morning of Light) is the scent of early morning — dew on jasmine, steam rising from green tea. A luminous floral that transitions into a soft cedarwood and vanilla base, clean yet deeply comforting.',
    bottleClass: 'mini-bottle--light',
    visualClass: 'product-card__visual--3',
    tag: 'New'
  },
  {
    id: 4,
    name: 'Raakh',
    number: 'No. 04',
    intensity: 'Intense',
    price: 10500,
    size: '50ml',
    category: 'woody',
    notes: { top: 'Black Pepper, Incense', heart: 'Leather, Vetiver', base: 'Oud, Smoke' },
    desc: 'Ash and smoke over warm leather. Raw, powerful, and deeply masculine.',
    longDesc: 'Raakh (Ash) is for those who wear their fragrance like armour. Black pepper and incense open with authority, before a core of dark leather and vetiver emerges. The base is smoked oud at its most elemental — primal and unforgettable.',
    bottleClass: 'mini-bottle--dark',
    visualClass: 'product-card__visual--4',
    tag: null
  },
  {
    id: 5,
    name: 'Gulab-e-Shab',
    number: 'No. 05',
    intensity: 'Moderate',
    price: 8900,
    size: '50ml',
    category: 'floral',
    notes: { top: 'Lychee, Raspberry', heart: 'Rose, Peony', base: 'Musk, Sandalwood' },
    desc: 'A garden of roses after midnight rain — lush, romantic, and impossibly soft.',
    longDesc: 'Gulab-e-Shab is the ultimate rose fragrance. Lychee and raspberry open with a juicy sweetness, drawing you into a heart of pure Bulgarian rose and white peony. The finish is clean musk over warm sandalwood — a fragrance you\'ll never want to wash off.',
    bottleClass: 'mini-bottle--gold',
    visualClass: 'product-card__visual--5',
    tag: null
  },
  {
    id: 6,
    name: 'Safar',
    number: 'No. 06',
    intensity: 'Light',
    price: 7200,
    size: '50ml',
    category: 'fresh',
    notes: { top: 'Sea Salt, Citrus', heart: 'Driftwood, Jasmine', base: 'Ambergris, Musk' },
    desc: 'The scent of open water and salt wind — freedom distilled into a bottle.',
    longDesc: 'Safar (Journey) captures the feeling of departure — salt air, open horizons, and the particular freedom of being in motion. Sea salt and citrus open wide and airy, before driftwood and jasmine ground the fragrance into something warmer and deeply personal.',
    bottleClass: 'mini-bottle--light',
    visualClass: 'product-card__visual--6',
    tag: 'New'
  }
];

/* ----- CART UTILITIES ----- */
const Cart = {
  get() {
    return JSON.parse(localStorage.getItem('zauq_cart') || '[]');
  },
  save(cart) {
    localStorage.setItem('zauq_cart', JSON.stringify(cart));
  },
  add(productId) {
    const cart = this.get();
    const product = ZAUQ_PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(p => p.id === productId);
    if (existing) existing.qty++;
    else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    this.save(cart);
    this.updateUI();
    return product.name;
  },
  remove(productId) {
    const cart = this.get().filter(p => p.id !== productId);
    this.save(cart);
    this.updateUI();
  },
  updateQty(productId, qty) {
    const cart = this.get();
    const item = cart.find(p => p.id === productId);
    if (item) {
      item.qty = qty;
      if (item.qty <= 0) return this.remove(productId);
    }
    this.save(cart);
    this.updateUI();
  },
  total() {
    return this.get().reduce((sum, item) => sum + item.price * item.qty, 0);
  },
  count() {
    return this.get().reduce((sum, item) => sum + item.qty, 0);
  },
  updateUI() {
    const count = this.count();
    document.querySelectorAll('.nav__cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count === 0 ? 'none' : 'flex';
    });
  }
};

/* ----- TOAST ----- */
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position:fixed; bottom:32px; left:50%;
    transform:translateX(-50%) translateY(20px);
    background:rgba(15,13,18,0.95);
    border:1px solid rgba(201,165,90,0.3);
    color:#e8d5a3; padding:14px 28px;
    border-radius:50px; font-family:'Jost',sans-serif;
    font-size:13px; letter-spacing:0.08em;
    z-index:10000; opacity:0;
    transition:all 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
    backdrop-filter:blur(20px); white-space:nowrap;
    pointer-events:none;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

/* ----- NAV INIT (runs on every page) ----- */
function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  if (hamburger && mobileMenu) {
    let menuOpen = false;
    hamburger.addEventListener('click', () => {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle('open', menuOpen);
      document.body.style.overflow = menuOpen ? 'hidden' : '';
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.cssText = menuOpen ? 'transform:rotate(45deg) translate(4px,4px)' : '';
      spans[1].style.cssText = menuOpen ? 'transform:rotate(-45deg) translate(4px,-4px)' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuOpen = false;
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  Cart.updateUI();
}

/* ----- SCROLL REVEAL ----- */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('revealed'), i * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ----- CURSOR ----- */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;
  let fx = 0, fy = 0, mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });
  (function animate() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animate);
  })();
}