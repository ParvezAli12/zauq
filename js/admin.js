/* ============================================================
   ZAUQ — Admin Dashboard Logic
   ============================================================ */

const ADMIN_CREDENTIALS = {
  email:    'admin@zauq.pk',
  password: 'Zauq@Admin2025'
};

let allOrders        = [];
let allProducts      = [];
let editingProductId = null;

/* ----- CLOCK ----- */
function updateClock() {
  const el = document.getElementById('adminTime');
  if (el) {
    el.textContent = new Date().toLocaleTimeString('en-PK', {
      hour: '2-digit', minute: '2-digit'
    });
  }
}

/* ----- TAB SWITCHING ----- */
function switchTab(tabName) {
  document.querySelectorAll('.admin-nav__item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(`tab-${tabName}`).classList.add('active');

  const titles = {
    overview:  ['Overview',  'Welcome back to Zauq Admin'],
    orders:    ['Orders',    'Manage and update all orders'],
    products:  ['Products',  'Add, edit, and manage your catalogue'],
    customers: ['Customers', 'View customer order history'],
  };
  document.getElementById('tabTitle').textContent = titles[tabName][0];
  document.getElementById('tabSub').textContent   = titles[tabName][1];

  if (tabName === 'orders')    loadOrders();
  if (tabName === 'products')  loadProducts();
  if (tabName === 'customers') loadCustomers();
}

/* ----- SHOW DASHBOARD ----- */
function showDashboard() {
  document.getElementById('adminLogin').classList.add('hidden');
  document.getElementById('adminWrap').classList.remove('hidden');
  initDashboard();
}

/* ----- INIT DASHBOARD ----- */
async function initDashboard() {
  await loadOverview();
  setInterval(updateClock, 1000);
  updateClock();
}

/* ----- OVERVIEW ----- */
async function loadOverview() {
  const [ordersRes, productsRes] = await Promise.all([
    apiFetch('/orders/all'),
    apiFetch('/products')
  ]);

  if (ordersRes.ok) {
    allOrders = ordersRes.data.orders;
    const revenue    = allOrders.reduce((s, o) => s + o.total, 0);
    const processing = allOrders.filter(o => o.status === 'processing').length;

    document.getElementById('statOrders').textContent     = allOrders.length;
    document.getElementById('statRevenue').textContent    = `PKR ${revenue.toLocaleString()}`;
    document.getElementById('statProcessing').textContent = processing;

    renderRecentOrders(allOrders.slice(0, 5));
  }

  if (productsRes.ok) {
    allProducts = productsRes.data.products;
    document.getElementById('statProducts').textContent = allProducts.length;
  }
}

/* ----- RECENT ORDERS ----- */
function renderRecentOrders(orders) {
  const tbody = document.getElementById('recentOrdersBody');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="admin-table__loading">No orders yet</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td style="color:var(--gold);font-weight:500;">${o.orderId}</td>
      <td>${o.customer.fullName}</td>
      <td>${o.items.length} item${o.items.length !== 1 ? 's' : ''}</td>
      <td style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:var(--gold-light);">
        PKR ${o.total.toLocaleString()}
      </td>
      <td><span class="status-badge status-badge--${o.status}">${o.status}</span></td>
      <td>${new Date(o.createdAt).toLocaleDateString('en-PK')}</td>
    </tr>
  `).join('');
}

/* ----- ALL ORDERS ----- */
async function loadOrders() {
  const res = await apiFetch('/orders/all');
  if (!res.ok) return;
  allOrders = res.data.orders;
  renderOrdersTable(allOrders);

  const filterEl = document.getElementById('orderStatusFilter');
  filterEl.onchange = (e) => {
    const val      = e.target.value;
    const filtered = val === 'all' ? allOrders : allOrders.filter(o => o.status === val);
    renderOrdersTable(filtered);
  };
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('allOrdersBody');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="admin-table__loading">No orders found</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td style="color:var(--gold);">${o.orderId}</td>
      <td>${o.customer.fullName}</td>
      <td>${o.customer.phone}</td>
      <td>${o.shippingAddress.city}</td>
      <td style="font-family:'Cormorant Garamond',serif;color:var(--gold-light);">
        PKR ${o.total.toLocaleString()}
      </td>
      <td>
        <span class="status-badge status-badge--pending">${o.payment.method}</span>
      </td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${o.orderId}', this.value)">
          <option value="processing" ${o.status==='processing' ? 'selected':''}>Processing</option>
          <option value="confirmed"  ${o.status==='confirmed'  ? 'selected':''}>Confirmed</option>
          <option value="shipped"    ${o.status==='shipped'    ? 'selected':''}>Shipped</option>
          <option value="delivered"  ${o.status==='delivered'  ? 'selected':''}>Delivered</option>
          <option value="cancelled"  ${o.status==='cancelled'  ? 'selected':''}>Cancelled</option>
        </select>
      </td>
      <td>
        <button class="admin-action-btn" onclick="viewOrder('${o.orderId}')">View</button>
      </td>
    </tr>
  `).join('');
}

/* ----- UPDATE ORDER STATUS ----- */
async function updateOrderStatus(orderId, status) {
  const res = await apiFetch(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });

  if (res.ok) {
    showToast(`Order ${orderId} → ${status}`);

    const order = allOrders.find(o => o.orderId === orderId);
    if (order) order.status = status;

    const processingEl = document.getElementById('statProcessing');
    if (processingEl) {
      processingEl.textContent =
        allOrders.filter(o => o.status === 'processing').length;
    }

    const productsTab = document.getElementById('tab-products');
    if (productsTab && productsTab.classList.contains('active')) {
      await loadProducts();
    }

    if (status === 'delivered') {
      const productsRes = await apiFetch('/products');
      if (productsRes.ok) {
        allProducts = productsRes.data.products;
        const statEl = document.getElementById('statProducts');
        if (statEl) statEl.textContent = allProducts.length;
      }
    }
  } else {
    showToast('Failed to update order status');
  }
}

/* ----- VIEW ORDER DETAIL ----- */
function viewOrder(orderId) {
  const order = allOrders.find(o => o.orderId === orderId);
  if (!order) return;

  document.getElementById('modalOrderId').textContent = `Order ${order.orderId}`;
  document.getElementById('modalBody').innerHTML = `
    <div class="order-detail-grid">
      <div class="order-detail-block">
        <p class="order-detail-block__label">Customer</p>
        <p>${order.customer.fullName}</p>
        <p>${order.customer.email}</p>
        <p>${order.customer.phone}</p>
      </div>
      <div class="order-detail-block">
        <p class="order-detail-block__label">Shipping Address</p>
        <p>${order.shippingAddress.street}</p>
        <p>${order.shippingAddress.city}, ${order.shippingAddress.province}</p>
      </div>
      <div class="order-detail-block">
        <p class="order-detail-block__label">Payment</p>
        <p>${order.payment.method.toUpperCase()}</p>
        <span class="status-badge status-badge--${order.payment.status}">${order.payment.status}</span>
      </div>
      <div class="order-detail-block">
        <p class="order-detail-block__label">Shipping</p>
        <p>${order.shipping.method}</p>
        <p>${order.shipping.cost === 0 ? 'Free' : `PKR ${order.shipping.cost}`}</p>
      </div>
    </div>
    <div class="order-detail-items">
      <p class="order-detail-block__label" style="margin-bottom:12px;">Items</p>
      ${order.items.map(item => `
        <div class="order-detail-item">
          <span>${item.name} × ${item.qty} (${item.size})</span>
          <span>PKR ${(item.price * item.qty).toLocaleString()}</span>
        </div>
      `).join('')}
    </div>
    ${order.notes ? `<p style="font-size:13px;color:var(--text-dim);margin-bottom:20px;">Note: ${order.notes}</p>` : ''}
    <div class="order-detail-total">
      <span>Total</span>
      <span>PKR ${order.total.toLocaleString()}</span>
    </div>
  `;
  document.getElementById('orderModal').style.display = 'flex';
}

/* ----- PRODUCTS ----- */
async function loadProducts() {
  const res = await apiFetch('/products');
  if (!res.ok) return;
  allProducts = res.data.products;
  renderProductsTable(allProducts);
}

function renderProductsTable(products) {
  const tbody = document.getElementById('productsBody');
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="admin-table__loading">No products found</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:12px;">
          ${p.images && p.images.length > 0
            ? `<img src="${p.images[0]}"
                style="width:44px;height:44px;object-fit:cover;border-radius:8px;
                border:1px solid rgba(201,165,90,0.2);flex-shrink:0;" />`
            : `<div style="width:44px;height:44px;border-radius:8px;background:var(--bg-3);
                border:1px solid var(--border);display:flex;align-items:center;
                justify-content:center;flex-shrink:0;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1" opacity="0.3">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
               </div>`
          }
          <span style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:var(--text);">
            ${p.name}
          </span>
        </div>
      </td>
      <td style="color:var(--gold);">${p.number}</td>
      <td>${p.category}</td>
      <td>${p.intensity}</td>
      <td style="color:var(--gold-light);">PKR ${p.price.toLocaleString()}</td>
      <td>${p.stock}</td>
      <td>${p.sold}</td>
      <td>
        <span class="status-badge ${p.isActive ? 'status-badge--delivered' : 'status-badge--cancelled'}">
          ${p.isActive ? 'Active' : 'Hidden'}
        </span>
      </td>
      <td>
        <button class="admin-action-btn" onclick="editProduct('${p._id}')">Edit</button>
        <button class="admin-action-btn admin-action-btn--danger"
          onclick="toggleProduct('${p._id}', ${p.isActive})">
          ${p.isActive ? 'Hide' : 'Show'}
        </button>
      </td>
    </tr>
  `).join('');
}

/* ----- OPEN PRODUCT MODAL ----- */
function openProductModal(p = null) {
  editingProductId = p ? p._id : null;
  document.getElementById('productModalTitle').textContent = p ? `Edit — ${p.name}` : 'Add New Product';
  document.getElementById('saveProductBtn').textContent    = p ? 'Save Changes' : 'Add Product';

  document.getElementById('pName').value       = p ? p.name            : '';
  document.getElementById('pNumber').value     = p ? p.number          : '';
  document.getElementById('pCategory').value   = p ? p.category        : 'oriental';
  document.getElementById('pIntensity').value  = p ? p.intensity       : 'Moderate';
  document.getElementById('pPrice').value      = p ? p.price           : '';
  document.getElementById('pPrice100').value   = p ? p.price100ml      : '';
  document.getElementById('pStock').value      = p ? p.stock           : 100;
  document.getElementById('pTag').value        = p ? (p.tag || '')     : '';
  document.getElementById('pNotesTop').value   = p ? p.notes.top       : '';
  document.getElementById('pNotesHeart').value = p ? p.notes.heart     : '';
  document.getElementById('pNotesBase').value  = p ? p.notes.base      : '';
  document.getElementById('pDesc').value       = p ? p.description     : '';
  document.getElementById('pLongDesc').value   = p ? p.longDescription : '';

  /* Existing images */
  const imageSection = document.getElementById('productImagesSection');
  if (p && p.images && p.images.length > 0) {
    imageSection.innerHTML = `
      <p class="admin-form-label" style="margin-bottom:10px;">
        Current Images (${p.images.length})
      </p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
        ${p.images.map((img, i) => `
          <div style="position:relative;width:80px;height:80px;">
            <img src="${img}"
              style="width:80px;height:80px;object-fit:cover;border-radius:8px;
              border:1px solid rgba(201,165,90,0.25);" />
            <button onclick="deleteProductImage('${p._id}', ${i})"
              style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;
              border-radius:50%;background:#c0392b;border:none;color:white;
              font-size:12px;cursor:pointer;display:flex;align-items:center;
              justify-content:center;line-height:1;font-family:'Jost',sans-serif;">
              ✕
            </button>
          </div>
        `).join('')}
      </div>`;
  } else {
    imageSection.innerHTML = `
      <p style="font-size:12px;color:var(--text-dim);margin-bottom:14px;letter-spacing:0.05em;">
        No images uploaded yet
      </p>`;
  }

  /* Reset upload area */
  document.getElementById('imagePreview').innerHTML  = '';
  document.getElementById('imageUploadInput').value  = '';

  const uploadBtn = document.getElementById('uploadImageBtn');
  uploadBtn.style.display  = 'none';
  uploadBtn.textContent    = 'Upload Images';
  uploadBtn.disabled       = false;

  document.getElementById('productModal').style.display = 'flex';
}

function editProduct(id) {
  const p = allProducts.find(p => p._id === id);
  if (p) openProductModal(p);
}

async function toggleProduct(id, isActive) {
  const res = await apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ isActive: !isActive })
  });
  if (res.ok) {
    showToast(`Product ${!isActive ? 'shown' : 'hidden'}`);
    loadProducts();
  }
}

/* ----- DELETE PRODUCT IMAGE ----- */
async function deleteProductImage(productId, imageIndex) {
  const product = allProducts.find(p => p._id === productId);
  if (!product) return;

  const updatedImages = product.images.filter((_, i) => i !== imageIndex);
  const res = await apiFetch(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ images: updatedImages })
  });

  if (res.ok) {
    showToast('Image removed');
    product.images = updatedImages;
    openProductModal(product);
    loadProducts();
  } else {
    showToast('Failed to remove image');
  }
}

/* ----- CUSTOMERS ----- */
async function loadCustomers() {
  const res = await apiFetch('/orders/all');
  if (!res.ok) return;

  const map = {};
  res.data.orders.forEach(o => {
    const key = o.customer.email;
    if (!map[key]) {
      map[key] = {
        name:   o.customer.fullName,
        email:  o.customer.email,
        phone:  o.customer.phone,
        city:   o.shippingAddress.city,
        orders: 0,
        spent:  0
      };
    }
    map[key].orders++;
    map[key].spent += o.total;
  });

  const customers = Object.values(map);
  const tbody     = document.getElementById('customersBody');

  if (!customers.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="admin-table__loading">No customers yet</td></tr>';
    return;
  }

  tbody.innerHTML = customers.map(c => `
    <tr>
      <td style="color:var(--text);">${c.name}</td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td>${c.city}</td>
      <td style="text-align:center;">${c.orders}</td>
      <td style="font-family:'Cormorant Garamond',serif;color:var(--gold-light);">
        PKR ${c.spent.toLocaleString()}
      </td>
    </tr>
  `).join('');
}

/* ============================================================
   INIT — Everything starts here
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();

  /* ----- CHECK IF ALREADY LOGGED IN ----- */
  if (sessionStorage.getItem('zauq_admin') === 'true') {
    showDashboard();
    return;
  }

  /* ----- LOGIN ----- */
  document.getElementById('adminLoginBtn').addEventListener('click', () => {
    const email    = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const errEl    = document.getElementById('adminLoginErr');

    if (!email || !password) {
      errEl.textContent = 'Please enter both email and password.';
      return;
    }

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      sessionStorage.setItem('zauq_admin', 'true');
      errEl.textContent = '';
      showDashboard();
    } else {
      errEl.textContent = 'Invalid email or password.';
    }
  });

  document.getElementById('adminPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('adminLoginBtn').click();
  });
  document.getElementById('adminEmail').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('adminLoginBtn').click();
  });

  /* ----- LOGOUT ----- */
  document.getElementById('adminLogout').addEventListener('click', () => {
    sessionStorage.removeItem('zauq_admin');
    document.getElementById('adminWrap').classList.add('hidden');
    document.getElementById('adminLogin').classList.remove('hidden');
  });

  /* ----- NAV TABS ----- */
  document.querySelectorAll('.admin-nav__item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  /* ----- ADD PRODUCT BTN ----- */
  document.getElementById('addProductBtn').addEventListener('click', () => {
    openProductModal(null);
  });

  /* ----- SAVE PRODUCT ----- */
  document.getElementById('saveProductBtn').addEventListener('click', async () => {
    const productData = {
      name:            document.getElementById('pName').value.trim(),
      number:          document.getElementById('pNumber').value.trim(),
      category:        document.getElementById('pCategory').value,
      intensity:       document.getElementById('pIntensity').value,
      price:           Number(document.getElementById('pPrice').value),
      price100ml:      Number(document.getElementById('pPrice100').value),
      stock:           Number(document.getElementById('pStock').value),
      tag:             document.getElementById('pTag').value || null,
      notes: {
        top:   document.getElementById('pNotesTop').value.trim(),
        heart: document.getElementById('pNotesHeart').value.trim(),
        base:  document.getElementById('pNotesBase').value.trim()
      },
      description:     document.getElementById('pDesc').value.trim(),
      longDescription: document.getElementById('pLongDesc').value.trim()
    };

    if (!productData.name || !productData.price || !productData.notes.top) {
      showToast('Please fill in all required fields');
      return;
    }

    const btn = document.getElementById('saveProductBtn');
    btn.textContent = 'Saving...';
    btn.disabled    = true;

    const endpoint = editingProductId ? `/products/${editingProductId}` : '/products';
    const method   = editingProductId ? 'PUT' : 'POST';
    const res      = await apiFetch(endpoint, { method, body: JSON.stringify(productData) });

    btn.textContent = editingProductId ? 'Save Changes' : 'Add Product';
    btn.disabled    = false;

    if (res.ok) {
      showToast(editingProductId ? 'Product updated!' : 'Product added! Now you can upload images.');
      if (!editingProductId) {
        editingProductId = res.data.product._id;
        document.getElementById('productModalTitle').textContent = `Edit — ${productData.name}`;
        document.getElementById('saveProductBtn').textContent = 'Save Changes';
        document.getElementById('uploadImageBtn').style.display = 'inline-flex';
      }
      loadProducts();
    } else {
      showToast(res.data.message || 'Failed to save product');
    }
  });

  /* ----- IMAGE FILE SELECTION PREVIEW ----- */
  /* ----- IMAGE FILE SELECTION PREVIEW ----- */
  document.getElementById('imageUploadInput')?.addEventListener('change', function(e) {
    e.preventDefault();
    e.stopPropagation();

    const files     = Array.from(this.files);
    const preview   = document.getElementById('imagePreview');
    const uploadBtn = document.getElementById('uploadImageBtn');

    if (!files.length) {
      preview.innerHTML       = '';
      uploadBtn.style.display = 'none';
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    const okFiles = files.filter(f => f.size <= maxSize);
    const tooBig  = files.filter(f => f.size > maxSize);

    if (tooBig.length > 0) {
      showToast(`${tooBig.length} file(s) skipped — over 10MB`);
    }

    if (okFiles.length === 0) {
      preview.innerHTML = `
        <p style="color:#c0392b;font-size:12px;margin-top:12px;text-align:center;">
          All files are too large. Max 10MB each.
        </p>`;
      uploadBtn.style.display = 'none';
      return;
    }

    uploadBtn.style.display = 'inline-flex';

    Promise.all(
      okFiles.map(file => new Promise(resolve => {
        const reader  = new FileReader();
        reader.onload = ev => resolve({ src: ev.target.result, size: file.size, name: file.name });
        reader.readAsDataURL(file);
      }))
    ).then(results => {
      preview.innerHTML = `
        <div style="margin-top:14px;">
          <p style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;
            color:var(--gold-dim);margin-bottom:10px;text-align:center;">
            ${results.length} image${results.length > 1 ? 's' : ''} ready
          </p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
            ${results.map(r => `
              <div style="text-align:center;">
                <img src="${r.src}"
                  style="width:70px;height:70px;object-fit:cover;
                  border-radius:8px;border:1px solid rgba(201,165,90,0.3);display:block;" />
                <span style="font-size:10px;color:var(--text-dim);margin-top:4px;display:block;">
                  ${(r.size / 1024).toFixed(0)}KB
                </span>
              </div>`
            ).join('')}
          </div>
        </div>`;
    });
  });

  /* ----- IMAGE UPLOAD TO SERVER ----- */
  document.getElementById('uploadImageBtn')?.addEventListener('click', async function(e) {
    e.preventDefault();
    e.stopPropagation();

    const input = document.getElementById('imageUploadInput');
    const files = Array.from(input.files).filter(f => f.size <= 10 * 1024 * 1024);

    if (!files.length) {
      showToast('Please select at least one image under 10MB');
      return;
    }

    if (!editingProductId) {
      showToast('Save the product first, then upload images');
      return;
    }

    const btn          = this;
    const originalText = 'Upload Images';
    btn.textContent    = `Uploading ${files.length} image${files.length > 1 ? 's' : ''}...`;
    btn.disabled       = true;
    btn.style.opacity  = '0.7';

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      let res, data;

      try {
        res = await fetch(
          `http://localhost:5000/api/products/${editingProductId}/image`,
          { method: 'POST', body: formData }
        );
      } catch (networkErr) {
        showToast('Cannot reach server — make sure backend is running on port 5000');
        return;
      }

      try {
        data = await res.json();
      } catch (parseErr) {
        showToast(`Server error (${res.status}) — check your terminal`);
        return;
      }

      if (data.success) {
        showToast(`${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully!`);

        input.value = '';
        document.getElementById('imagePreview').innerHTML = '';
        btn.style.display = 'none';

        const updated = allProducts.find(p => p._id === editingProductId);
        if (updated) {
          updated.images = data.images;
          openProductModal(updated);
        }
        await loadProducts();
      } else {
        showToast(data.message || 'Upload failed — check terminal for details');
      }

    } catch (err) {
      console.error('Unexpected upload error:', err);
      showToast('Something went wrong — check the browser console');
    } finally {
      btn.textContent   = originalText;
      btn.disabled      = false;
      btn.style.opacity = '1';
    }
  });

  /* ----- CLOSE ORDER MODAL ----- */
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('orderModal').style.display = 'none';
  });
  document.getElementById('orderModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('orderModal')) {
      document.getElementById('orderModal').style.display = 'none';
    }
  });

  /* ----- CLOSE PRODUCT MODAL ----- */
  document.getElementById('closeProductModal').addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
  });
  document.getElementById('cancelProductBtn').addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
  });
  document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('productModal')) {
      document.getElementById('productModal').style.display = 'none';
    }
  });
});