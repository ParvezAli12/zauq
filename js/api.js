/* ============================================================
   ZAUQ — API Connection Layer
   Connects frontend to Node.js + Express + MongoDB backend
   ============================================================ */

const API_URL = 'https://zauq-production.up.railway.app/api';

/* ----- TOKEN HELPERS ----- */
const Auth = {
  getToken() {
    return localStorage.getItem('zauq_token');
  },
  setToken(token) {
    localStorage.setItem('zauq_token', token);
  },
  removeToken() {
    localStorage.removeItem('zauq_token');
    localStorage.removeItem('zauq_user');
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  getUser() {
    return JSON.parse(localStorage.getItem('zauq_user') || 'null');
  },
  setUser(user) {
    localStorage.setItem('zauq_user', JSON.stringify(user));
  }
};

/* ----- BASE FETCH HELPER ----- */
async function apiFetch(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error('API Error:', err.message);
    return { ok: false, data: { message: 'Network error — is the server running?' } };
  }
}

/* ----- Make apiFetch globally available for admin ----- */
window.apiFetch = apiFetch;

/* ============================================================
   PRODUCTS API
   ============================================================ */
const ProductsAPI = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category  && filters.category  !== 'all') params.set('category',  filters.category);
    if (filters.intensity && filters.intensity !== 'all') params.set('intensity', filters.intensity);
    if (filters.sort)   params.set('sort',   filters.sort);
    if (filters.search) params.set('search', filters.search);
    const query = params.toString() ? `?${params}` : '';
    return await apiFetch(`/products${query}`);
  },

  async getOne(id) {
    return await apiFetch(`/products/${id}`);
  },

  async create(data) {
    return await apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(id, data) {
    return await apiFetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(id) {
    return await apiFetch(`/products/${id}`, {
      method: 'DELETE'
    });
  }
};

/* ============================================================
   AUTH API
   ============================================================ */
const AuthAPI = {
  async register(firstName, lastName, email, password) {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password })
    });
    if (res.ok) {
      Auth.setToken(res.data.token);
      Auth.setUser(res.data.user);
    }
    return res;
  },

  async login(email, password) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      Auth.setToken(res.data.token);
      Auth.setUser(res.data.user);
    }
    return res;
  },

  async getMe() {
    return await apiFetch('/auth/me');
  },

  logout() {
    Auth.removeToken();
  }
};

/* ============================================================
   ORDERS API
   ============================================================ */
const OrdersAPI = {
  async create(orderData) {
    return await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  async getMyOrders() {
    return await apiFetch('/orders/my');
  },

  async getOne(orderId) {
    return await apiFetch(`/orders/${orderId}`);
  },

  async getAll() {
    return await apiFetch('/orders/all');
  },

  async updateStatus(orderId, status) {
    return await apiFetch(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
};

/* ============================================================
   USERS API
   ============================================================ */
const UsersAPI = {
  async getProfile() {
    return await apiFetch('/users/profile');
  },

  async updateProfile(data) {
    return await apiFetch('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async toggleWishlist(productId) {
    return await apiFetch(`/users/wishlist/${productId}`, {
      method: 'POST'
    });
  },

  async addAddress(address) {
    return await apiFetch('/users/address', {
      method: 'POST',
      body: JSON.stringify(address)
    });
  },

  async deleteAddress(addressId) {
    return await apiFetch(`/users/address/${addressId}`, {
      method: 'DELETE'
    });
  }
};