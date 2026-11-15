(() => {
  'use strict';

  // This is a client-side access gate, not server-side authentication.
  // Credentials are visible to anyone who can inspect this public site's source.
  const ACCOUNTS = {
    admin: { password: 'admin123', role: 'admin', label: 'Admin', modules: null },
    radiologi: { password: 'petugas123', role: 'petugas', label: 'Petugas', modules: ['reminder'] }
  };
  const SESSION_KEY = 'radiologi-auth-session';
  const ROLE_KEY = 'radiologi-auth-role';

  const form = document.getElementById('loginForm');
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const errorMessage = document.getElementById('loginError');
  const logoutButton = document.getElementById('logoutButton');

  function applyRole(account) {
    const allowed = account.modules;
    window.SIR_ALLOWED = allowed;
    document.body.dataset.role = account.role;
    document.querySelectorAll('#mainMenu button[data-module]').forEach((b) => {
      b.hidden = !!allowed && allowed.indexOf(b.dataset.module) < 0;
    });
    document.querySelectorAll('#v-dashboard [data-go]').forEach((c) => {
      c.hidden = !!allowed && allowed.indexOf(c.dataset.go) < 0;
    });
    const roleLabel = document.getElementById('dashRole');
    if (roleLabel) roleLabel.textContent = account.label;
  }

  function unlock(account) {
    applyRole(account);
    document.body.classList.remove('app-locked');
    document.getElementById('loginScreen').hidden = true;
    const first = account.modules ? account.modules[0] : 'dashboard';
    const target = document.querySelector('#mainMenu button[data-module="' + first + '"]');
    if (target) target.click();
  }

  function lock() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    window.SIR_ALLOWED = null;
    document.body.classList.add('app-locked');
    document.getElementById('loginScreen').hidden = false;
    form.reset();
    errorMessage.textContent = '';
    usernameInput.focus();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const key = usernameInput.value.trim().toLowerCase();
    const account = Object.prototype.hasOwnProperty.call(ACCOUNTS, key) ? ACCOUNTS[key] : null;
    if (!account || passwordInput.value !== account.password) {
      errorMessage.textContent = 'Username atau password tidak sesuai.';
      passwordInput.select();
      return;
    }

    sessionStorage.setItem(SESSION_KEY, 'authenticated');
    sessionStorage.setItem(ROLE_KEY, key);
    errorMessage.textContent = '';
    unlock(account);
  });

  logoutButton.addEventListener('click', lock);

  const savedKey = sessionStorage.getItem(ROLE_KEY);
  if (sessionStorage.getItem(SESSION_KEY) === 'authenticated' && savedKey && Object.prototype.hasOwnProperty.call(ACCOUNTS, savedKey)) {
    unlock(ACCOUNTS[savedKey]);
  } else {
    document.getElementById('loginScreen').hidden = false;
  }
})();
