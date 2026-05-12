/* ================================================
   AUTH MODULE
   Login, Signup, Logout — JWT or offline mode
   ================================================ */
const Auth = (() => {
  let _currentUser = null;

  function init() {
    /* Login form submit */
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      const result = await API.auth.login(email, password);

      if (result.ok) {
        API.setToken(result.data.token);
        _currentUser = result.data.user;
        UI.updateAuthUI(_currentUser);
        UI.closeModal('authModal');
        UI.toast('Welcome back!', 'success');
        App.loadData();
      } else {
        /* Offline fallback — allow local use without a server */
        UI.toast('Backend offline — using local mode', 'warning');
        _currentUser = { name: email.split('@')[0], email, offline: true };
        UI.updateAuthUI(_currentUser);
        UI.closeModal('authModal');
        App.loadData();
      }
    });

    /* Signup form submit */
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name     = document.getElementById('signupName').value.trim();
      const email    = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;

      if (password.length < 6) {
        UI.toast('Password must be at least 6 characters', 'error');
        return;
      }

      const result = await API.auth.signup(name, email, password);

      if (result.ok) {
        API.setToken(result.data.token);
        _currentUser = result.data.user;
        UI.updateAuthUI(_currentUser);
        UI.closeModal('authModal');
        UI.toast('Account created! 🎉', 'success');
        App.loadData();
      } else {
        UI.toast(result.error || 'Signup failed. Backend may be offline.', 'error');
      }
    });

    /* Logout button */
    document.getElementById('logoutBtn').addEventListener('click', logout);

    /* Navbar auth buttons */
    document.getElementById('loginBtn').addEventListener('click', () => {
      UI.switchAuthTab('login');
      UI.openModal('authModal');
    });

    document.getElementById('signupBtn').addEventListener('click', () => {
      UI.switchAuthTab('signup');
      UI.openModal('authModal');
    });

    /* Mobile menu auth buttons */
    document.getElementById('mobileLoginBtn')?.addEventListener('click', () => {
      UI.switchAuthTab('login');
      UI.openModal('authModal');
      document.getElementById('mobileMenu').classList.add('hidden');
    });

    document.getElementById('mobileSignupBtn')?.addEventListener('click', () => {
      UI.switchAuthTab('signup');
      UI.openModal('authModal');
      document.getElementById('mobileMenu').classList.add('hidden');
    });

    /* Auth tab toggle buttons */
    document.getElementById('loginTabBtn').addEventListener('click',  () => UI.switchAuthTab('login'));
    document.getElementById('signupTabBtn').addEventListener('click', () => UI.switchAuthTab('signup'));

    /* Restore session from stored token */
    const token = API.getToken();
    if (token) {
      API.auth.me().then(result => {
        if (result.ok) {
          _currentUser = result.data.user;
          UI.updateAuthUI(_currentUser);
          App.loadData();
        } else {
          API.setToken(null);
        }
      });
    }
  }

  function logout() {
    API.setToken(null);
    _currentUser = null;
    UI.updateAuthUI(null);
    UI.toast('Logged out', 'default');
    App.loadData();
  }

  function getUser()    { return _currentUser; }
  function isLoggedIn() { return !!_currentUser; }

  return { init, logout, getUser, isLoggedIn };
})();
