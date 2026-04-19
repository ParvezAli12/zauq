/* ============================================================
   ZAUQ — Account Page Logic
   ============================================================ */

/* ----- TAB SWITCHING ----- */
function switchTab(tab) {
  const slider = document.getElementById('tabSlider');

  if (tab === 'login') {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('tabLogin').classList.add('active');
    document.getElementById('tabRegister').classList.remove('active');
    slider.classList.remove('right');
  } else {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('tabLogin').classList.remove('active');
    document.getElementById('tabRegister').classList.add('active');
    slider.classList.add('right');
  }
}

/* ----- PASSWORD VISIBILITY ----- */
function initPasswordToggles() {
  [['toggleLoginPass', 'loginPassword'], ['toggleRegPass', 'regPassword']].forEach(([btnId, inputId]) => {
    document.getElementById(btnId)?.addEventListener('click', () => {
      const input = document.getElementById(inputId);
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });
}

/* ----- PASSWORD STRENGTH ----- */
function initPasswordStrength() {
  document.getElementById('regPassword')?.addEventListener('input', (e) => {
    const val = e.target.value;
    const fill  = document.getElementById('strengthFill');
    const label = document.getElementById('strengthLabel');

    let score = 0;
    if (val.length >= 8)          score++;
    if (/[A-Z]/.test(val))        score++;
    if (/[0-9]/.test(val))        score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = [
      { pct: '0%',   color: 'transparent', text: '' },
      { pct: '25%',  color: '#c0392b',     text: 'Weak' },
      { pct: '50%',  color: '#e67e22',     text: 'Fair' },
      { pct: '75%',  color: '#f1c40f',     text: 'Good' },
      { pct: '100%', color: '#27ae60',     text: 'Strong' },
    ];

    const level = levels[score] || levels[0];
    fill.style.width      = level.pct;
    fill.style.background = level.color;
    label.textContent     = level.text;
    label.style.color     = level.color;
  });
}

/* ----- VALIDATION ----- */
function validateLogin() {
  let valid = true;
  const email    = document.getElementById('loginEmail');
  const password = document.getElementById('loginPassword');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    document.getElementById('err-loginEmail').textContent = 'Please enter a valid email.';
    email.classList.add('error');
    valid = false;
  } else {
    document.getElementById('err-loginEmail').textContent = '';
    email.classList.remove('error');
  }

  if (password.value.length < 6) {
    document.getElementById('err-loginPassword').textContent = 'Password must be at least 6 characters.';
    password.classList.add('error');
    valid = false;
  } else {
    document.getElementById('err-loginPassword').textContent = '';
    password.classList.remove('error');
  }

  return valid;
}

function validateRegister() {
  let valid = true;

  const fields = [
    { id: 'regFirstName', check: v => v.length >= 2,     msg: 'Enter your first name.' },
    { id: 'regLastName',  check: v => v.length >= 2,     msg: 'Enter your last name.' },
    { id: 'regEmail',     check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Enter a valid email.' },
    { id: 'regPassword',  check: v => v.length >= 8,     msg: 'Password must be at least 8 characters.' },
  ];

  fields.forEach(({ id, check, msg }) => {
    const input = document.getElementById(id);
    const err   = document.getElementById(`err-${id}`);
    if (!check(input.value.trim())) {
      err.textContent = msg;
      input.classList.add('error');
      valid = false;
    } else {
      err.textContent = '';
      input.classList.remove('error');
    }
  });

  const pass    = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm');
  const errConf = document.getElementById('err-regConfirm');
  if (confirm.value !== pass) {
    errConf.textContent = 'Passwords do not match.';
    confirm.classList.add('error');
    valid = false;
  } else {
    errConf.textContent = '';
    confirm.classList.remove('error');
  }

  if (!document.getElementById('agreeTerms').checked) {
    showToast('Please agree to the Terms of Service.');
    valid = false;
  }

  return valid;
}

/* ----- AUTH SIMULATION (will be replaced by real API later) ----- */
function simulateLogin(email, name) {
  const user = { email, name, initials: name.charAt(0).toUpperCase() };
  localStorage.setItem('zauq_user', JSON.stringify(user));
  showDashboard(user);
}

function showDashboard(user) {
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('dashName').textContent    = user.name;
  document.getElementById('dashEmail').textContent   = user.email;
  document.getElementById('dashAvatar').textContent  = user.initials;

  // Pre-fill profile
  const parts = user.name.split(' ');
  document.getElementById('profileFirst').value = parts[0] || '';
  document.getElementById('profileLast').value  = parts[1] || '';
  document.getElementById('profileEmail').value = user.email;

  loadOrders();
}

function loadOrders() {
  // Simulated order — real orders come from backend later
  const orders = JSON.parse(localStorage.getItem('zauq_orders') || '[]');
  const list   = document.getElementById('ordersList');
  const empty  = document.getElementById('ordersEmpty');

  if (orders.length === 0) {
    empty.style.display = 'flex';
    list.style.display  = 'none';
    return;
  }

  empty.style.display = 'none';
  list.style.display  = 'block';
  list.innerHTML = orders.map(o => `
    <div class="order-card">
      <div>
        <p class="order-card__id">${o.id}</p>
        <p class="order-card__items">${o.items}</p>
        <p class="order-card__date">${o.date}</p>
      </div>
      <div class="order-card__right">
        <p class="order-card__total">PKR ${o.total.toLocaleString()}</p>
        <span class="order-card__status order-card__status--${o.status}">${o.status}</span>
      </div>
    </div>
  `).join('');
}

/* ----- DASHBOARD TABS ----- */
function initDashboardTabs() {
  document.querySelectorAll('.dashboard-nav__item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dashboard-nav__item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.add('hidden'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
    });
  });
}

/* ----- INIT ----- */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCursor();
  initPasswordToggles();
  initPasswordStrength();
  initDashboardTabs();

  // Check if already logged in
  const saved = localStorage.getItem('zauq_user');
  if (saved) {
    showDashboard(JSON.parse(saved));
  }

  /* LOGIN */
  document.getElementById('loginBtn').addEventListener('click', async () => {
    if (!validateLogin()) return;
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const btn = document.getElementById('loginBtn');
    btn.textContent = 'Signing in...';
    btn.disabled = true;

    const res = await AuthAPI.login(email, password);

    btn.textContent = 'Sign In';
    btn.disabled = false;

    if (!res.ok) {
      document.getElementById('err-loginEmail').textContent = res.data.message || 'Invalid credentials';
      return;
    }

    showToast(`Welcome back, ${res.data.user.firstName}!`);
    showDashboard({
      name:     `${res.data.user.firstName} ${res.data.user.lastName}`,
      email:    res.data.user.email,
      initials: res.data.user.firstName.charAt(0).toUpperCase()
    });
  });

  /* REGISTER */
  document.getElementById('registerBtn').addEventListener('click', async () => {
    if (!validateRegister()) return;
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName  = document.getElementById('regLastName').value.trim();
    const email     = document.getElementById('regEmail').value.trim();
    const password  = document.getElementById('regPassword').value;

    const btn = document.getElementById('registerBtn');
    btn.textContent = 'Creating account...';
    btn.disabled = true;

    const res = await AuthAPI.register(firstName, lastName, email, password);

    btn.textContent = 'Create Account';
    btn.disabled = false;

    if (!res.ok) {
      document.getElementById('err-regEmail').textContent = res.data.message || 'Registration failed';
      return;
    }

    showToast(`Welcome to Zauq, ${firstName}!`);
    showDashboard({
      name:     `${firstName} ${lastName}`,
      email:    email,
      initials: firstName.charAt(0).toUpperCase()
    });
  });

  /* LOGOUT */
  document.getElementById('logoutBtn').addEventListener('click', () => {
    AuthAPI.logout();
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('authSection').classList.remove('hidden');
    showToast('You have been signed out.');
  });

  /* SAVE PROFILE */
  document.getElementById('saveProfileBtn').addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('zauq_user') || '{}');
    user.name = `${document.getElementById('profileFirst').value} ${document.getElementById('profileLast').value}`.trim();
    user.email = document.getElementById('profileEmail').value;
    user.initials = user.name.charAt(0).toUpperCase();
    localStorage.setItem('zauq_user', JSON.stringify(user));
    document.getElementById('dashName').textContent   = user.name;
    document.getElementById('dashEmail').textContent  = user.email;
    document.getElementById('dashAvatar').textContent = user.initials;
    showToast('Profile updated successfully!');
  });

  /* GOOGLE BTN (placeholder for OAuth later) */
  document.getElementById('googleBtn').addEventListener('click', () => {
    showToast('Google login coming with the backend!');
  });
});