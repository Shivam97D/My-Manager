/* ================================================
   UI MODULE
   Toasts, Modals, Theme, Auth UI, Helpers
   ================================================ */
const UI = (() => {

  /* ================================================
     TOAST NOTIFICATIONS
     ================================================ */
  function toast(message, type = 'default', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `toast ${type}`;

    const icons = { success: '✓', error: '✗', warning: '⚠', default: 'ℹ' };
    el.innerHTML = `<span>${icons[type] || icons.default}</span><span>${message}</span>`;

    container.appendChild(el);

    setTimeout(() => {
      el.style.transition = 'all 0.3s ease';
      el.style.opacity    = '0';
      el.style.transform  = 'translateX(110%)';
      setTimeout(() => el.remove(), 320);
    }, duration);
  }

  /* ================================================
     MODAL HELPERS
     ================================================ */
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
    document.body.style.overflow = '';
  }

  /* Delegate close button clicks & overlay clicks */
  document.addEventListener('click', (e) => {
    /* Close button inside modal */
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) {
      closeModal(closeBtn.dataset.close);
      return;
    }
    /* Click on overlay background */
    if (e.target.classList.contains('modal-overlay')) {
      closeAllModals();
    }
  });

  /* ESC key closes any open modal */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  /* ================================================
     THEME
     ================================================ */
  function initTheme() {
    const saved = localStorage.getItem('ws_theme') || 'light';
    _applyTheme(saved);
  }

  function _applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ws_theme', theme);
    const icon = document.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☾' : '☀';
  }

  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme');
    _applyTheme(cur === 'dark' ? 'light' : 'dark');
  }

  /* ================================================
     AUTH TABS (inside login modal)
     ================================================ */
  function switchAuthTab(tab) {
    const loginForm  = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginBtn   = document.getElementById('loginTabBtn');
    const signupBtn  = document.getElementById('signupTabBtn');

    if (tab === 'login') {
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
      loginBtn.classList.add('active');
      signupBtn.classList.remove('active');
    } else {
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      signupBtn.classList.add('active');
      loginBtn.classList.remove('active');
    }
  }

  /* ================================================
     AUTH SECTION IN NAVBAR
     ================================================ */
  function _firstNameFromUser(user) {
    if (!user) return '';
    const rawName = (user.name || '').trim();
    if (rawName) return rawName.split(/\s+/)[0];
    const email = (user.email || '').trim();
    return email ? email.split('@')[0] : '';
  }

  function updateAuthUI(user) {
    const authSection   = document.getElementById('authSection');
    const userSection   = document.getElementById('userSection');
    const userNameEl    = document.getElementById('userName');
    const mobileAuthRow = document.getElementById('mobileAuthRow');

    if (user) {
      authSection?.classList.add('hidden');
      userSection?.classList.remove('hidden');
      mobileAuthRow?.classList.add('hidden');
      if (userNameEl) {
        const first = _firstNameFromUser(user);
        userNameEl.textContent = first ? `👤 ${first}` : '';
      }
    } else {
      authSection?.classList.remove('hidden');
      userSection?.classList.add('hidden');
      mobileAuthRow?.classList.remove('hidden');
      if (userNameEl) userNameEl.textContent = '';
    }
  }

  /* ================================================
     EMPTY STATE HTML
     ================================================ */
  function emptyState(icon, title, desc) {
    return `
      <div class="empty-state">
        <span class="empty-state-icon">${icon}</span>
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>
    `;
  }

  /* ================================================
     BADGES & DATE HELPERS
     ================================================ */
  function priorityBadge(p) {
    const label = (p || 'medium');
    return `<span class="priority-badge priority-${label}">${label}</span>`;
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch { return iso; }
  }

  function dueBadge(dueDate) {
    if (!dueDate) return '';
    const overdue = new Date(dueDate) < new Date();
    return `<span class="due-badge${overdue ? ' overdue' : ''}">📅 ${formatDate(dueDate)}${overdue ? ' (overdue)' : ''}</span>`;
  }

  /* ================================================
     COLOR DOT INITIALIZER
     ================================================ */
  function initColorDots(containerEl, onChange) {
    containerEl.querySelectorAll('.color-dot').forEach(dot => {
      /* Apply background from data-color attribute */
      dot.style.background = dot.dataset.color;

      dot.addEventListener('click', () => {
        containerEl.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        if (onChange) onChange(dot.dataset.color);
      });
    });
  }

  /* --- Public API --- */
  return {
    toast,
    openModal, closeModal, closeAllModals,
    initTheme, toggleTheme,
    switchAuthTab, updateAuthUI,
    emptyState,
    priorityBadge, formatDate, dueBadge,
    initColorDots
  };
})();
