/* ================================================
   APP — Main Entry Point
   Wires everything together
   ================================================ */
const App = (() => {

  /* ---- Bootstrap on DOM ready ---- */
  function _init() {
    UI.initTheme();
    Router.init();
    Auth.init();
    Tasks.init();
    Goals.init();
    Notes.init();

    /* Theme toggle */
    document.getElementById('themeToggle').addEventListener('click', UI.toggleTheme);

    /* Hamburger mobile menu */
    document.getElementById('hamburger').addEventListener('click', () => {
      document.getElementById('mobileMenu').classList.toggle('hidden');
    });

    /* Close mobile menu when a tab link is clicked */
    document.querySelectorAll('.mobile-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.getElementById('mobileMenu').classList.add('hidden');
      });
    });

    /* Add bucket button */
    document.getElementById('addBucketBtn').addEventListener('click', createBucket);

    /* Also allow Enter key in the bucket name input */
    document.getElementById('bucketNameInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') createBucket();
    });

    _updateGreeting();
    loadData();
  }

  /* ---- Greeting & date ---- */
  function _updateGreeting() {
    const hour    = new Date().getHours();
    const greet   = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const greetEl = document.getElementById('greetingText');
    if (greetEl) greetEl.textContent = `${greet}, Shivam ✦`;

    const dateEl = document.getElementById('dateText');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric'
      });
    }
  }

  /* ---- Load / refresh all data ---- */
  function loadData() {
    Buckets.renderAll();
    updateStats();
  }

  /* ---- Create a new bucket ---- */
  function createBucket() {
    const input      = document.getElementById('bucketNameInput');
    const typeSelect = document.getElementById('bucketTypeSelect');
    const name       = input.value.trim();

    if (!name) {
      UI.toast('Please enter a bucket name', 'warning');
      return;
    }

    Storage.addBucket(name, typeSelect.value);
    input.value = '';
    Buckets.renderAll();
    updateStats();
    UI.toast('Bucket created!', 'success');
  }

  /* ---- Update stats chips on Home page ---- */
  function updateStats() {
    const allTasks = Storage.getAllTasks();
    const done     = allTasks.filter(t => t.completed).length;
    const pending  = allTasks.length - done;
    const goals    = Storage.getGoals().length;

    const container = document.getElementById('headerStats');
    if (!container) return;

    container.innerHTML = `
      <div class="stat-chip">
        <span class="stat-number">${allTasks.length}</span>
        <span class="stat-label">Tasks</span>
      </div>
      <div class="stat-chip">
        <span class="stat-number" style="color:var(--success)">${done}</span>
        <span class="stat-label">Done</span>
      </div>
      <div class="stat-chip">
        <span class="stat-number" style="color:var(--warning)">${pending}</span>
        <span class="stat-label">Pending</span>
      </div>
      <div class="stat-chip">
        <span class="stat-number" style="color:var(--accent)">${goals}</span>
        <span class="stat-label">Goals</span>
      </div>
    `;
  }

  /* ---- Called by Router on every page switch ---- */
  function onPageChange(page) {
    if (page === 'home')  loadData();
    if (page === 'tasks') Tasks.renderFlatList();
    if (page === 'goals') Goals.renderAll();
    if (page === 'notes') Notes.renderAll();
  }

  /* Start everything when DOM is ready */
  document.addEventListener('DOMContentLoaded', _init);

  /* Public interface */
  return { loadData, createBucket, updateStats, onPageChange };
})();
