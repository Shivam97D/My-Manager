/* ================================================
   ROUTER MODULE
   Hash-based SPA routing
   ================================================ */
const Router = (() => {
  const VALID_PAGES = ['buckets', 'tasks', 'goals', 'notes'];
  let _current = 'buckets';

  function navigateTo(page) {
    if (!VALID_PAGES.includes(page)) page = 'buckets';

    /* Hide all pages */
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    /* Show target page */
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    /* Update nav tab highlights */
    document.querySelectorAll('.nav-tab, .mobile-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.page === page);
    });

    _current = page;

    /* Notify App so it can re-render the right content */
    if (typeof App !== 'undefined') App.onPageChange(page);
  }

  function init() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || 'buckets';
      navigateTo(hash);
    });

    /* Handle initial load */
    const hash = window.location.hash.slice(1) || 'buckets';
    navigateTo(hash);
  }

  function getCurrent() { return _current; }

  function go(page) {
    window.location.hash = page;
  }

  return { init, navigateTo, getCurrent, go };
})();
