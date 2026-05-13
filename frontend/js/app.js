/* ================================================
   APP — Main Entry Point
   Wires everything together
   ================================================ */
const App = (() => {
  const DEFAULT_BUCKET_PRESETS = [
    { name: 'Buckets', type: 'custom' },
    { name: 'To-Do',   type: 'todo'   },
    { name: 'Goals',   type: 'goals'  },
    { name: 'Notes',   type: 'notes'  }
  ];

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

    /* Clear task filters when navigating directly via nav */
    document.querySelectorAll('[data-page="tasks"]').forEach(link => {
      link.addEventListener('click', () => {
        if (typeof Tasks !== 'undefined' && Tasks.clearBucketFilter) {
          Tasks.clearBucketFilter();
        }
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
    if (greetEl) {
      const user      = Auth.getUser?.() || null;
      const rawName   = user?.name?.trim() || '';
      const firstName = rawName ? rawName.split(/\s+/)[0] : (user?.email ? user.email.split('@')[0] : 'Shivam');
      greetEl.textContent = `${greet}, ${firstName || 'there'} ✦`;
    }

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
  async function loadData() {
    _updateGreeting();

    const user = Auth.getUser?.();
    const shouldSyncRemote = Auth.isLoggedIn && Auth.isLoggedIn() && !user?.offline;

    if (shouldSyncRemote) {
      try {
        let bucketRes = await API.buckets.getAll();

        if (bucketRes.ok && (!Array.isArray(bucketRes.data) || bucketRes.data.length === 0)) {
          await _seedDefaultBucketsRemote();
          bucketRes = await API.buckets.getAll();
        }

        const [goalRes, noteRes] = await Promise.all([
          API.goals.getAll(),
          API.notes.getAll()
        ]);

        if (bucketRes.ok) {
          const buckets = (bucketRes.data || []).map(_normaliseBucketFromServer);
          Storage.setBuckets(buckets);
        }

        if (goalRes.ok) {
          const goals = (goalRes.data || []).map(_normaliseGoalFromServer);
          Storage.setGoals(goals);
        }

        if (noteRes.ok) {
          const notes = (noteRes.data || []).map(_normaliseNoteFromServer);
          Storage.setNotes(notes);
        }

        if (!bucketRes.ok || !goalRes.ok || !noteRes.ok) {
          UI.toast('Some data failed to sync. Showing last saved items.', 'warning');
        }
      } catch (err) {
        console.warn('Remote sync failed:', err);
        UI.toast('Online sync failed — working with cached data.', 'warning');
      }
    }

    if (!shouldSyncRemote) {
      _ensureOfflineDefaultBuckets();
    }

    Buckets.renderAll();
    updateStats();

    const current = Router.getCurrent?.() || 'buckets';
    if (current === 'tasks') Tasks.renderFlatList();
    if (current === 'goals') Goals.renderAll();
    if (current === 'notes') Notes.renderAll();
  }

  /* ---- Create a new bucket ---- */
  async function createBucket() {
    const input      = document.getElementById('bucketNameInput');
    const typeSelect = document.getElementById('bucketTypeSelect');
    const name       = input.value.trim();

    if (!name) {
      UI.toast('Please enter a bucket name', 'warning');
      return;
    }

    if (Auth.isLoggedIn && Auth.isLoggedIn()) {
      const result = await API.buckets.create({ name, type: typeSelect.value });
      if (result.ok) {
        input.value = '';
        UI.toast('Bucket created!', 'success');
        loadData();
      } else {
        UI.toast(result.error || 'Failed to create bucket online.', 'error');
      }
    } else {
      Storage.addBucket(name, typeSelect.value);
      input.value = '';
      Buckets.renderAll();
      updateStats();
      UI.toast('Bucket created!', 'success');
    }
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
    if (page === 'buckets') loadData();
    if (page === 'tasks') Tasks.renderFlatList();
    if (page === 'goals') Goals.renderAll();
    if (page === 'notes') Notes.renderAll();
  }

  async function _seedDefaultBucketsRemote() {
    for (const preset of DEFAULT_BUCKET_PRESETS) {
      try {
        await API.buckets.create(preset);
      } catch (err) {
        console.warn('Default bucket seed failed:', err);
      }
    }
  }

  function _ensureOfflineDefaultBuckets() {
    const renameMap = [
      { from: 'To Do',             update: { name: 'To-Do', type: 'todo' } },
      { from: 'Long Term Goals',   update: { name: 'Goals', type: 'goals' } },
      { from: 'Notes & Reminders', update: { name: 'Notes', type: 'notes' } }
    ];

    const buckets = Storage.getBuckets();
    let mutated = false;

    renameMap.forEach(({ from, update }) => {
      const bucket = buckets.find(b => b.name === from);
      if (bucket) {
        Storage.updateBucket(bucket.id, update);
        mutated = true;
      }
    });

    if (!buckets.some(b => b.name === 'Buckets')) {
      Storage.addBucket('Buckets', 'custom');
      mutated = true;
    }

    if (mutated) {
      // Refresh local cache to include any new IDs/types
      const refreshed = Storage.getBuckets();
      Storage.setBuckets(refreshed);
    }
  }

  /* Start everything when DOM is ready */
  document.addEventListener('DOMContentLoaded', _init);

  /* Public interface */
  return { loadData, createBucket, updateStats, onPageChange };
})();

function _normaliseBucketFromServer(bucket) {
  return {
    id: bucket._id || bucket.id,
    name: bucket.name,
    type: bucket.type || 'todo',
    tasks: (bucket.tasks || []).map(task => ({
      id: task._id || task.id,
      title: task.title,
      note: task.note || '',
      priority: task.priority || 'medium',
      completed: !!task.completed,
      dueDate: task.dueDate || null,
      createdAt: task.createdAt || new Date().toISOString()
    })),
    createdAt: bucket.createdAt || new Date().toISOString()
  };
}

function _normaliseGoalFromServer(goal) {
  return {
    id: goal._id || goal.id,
    title: goal.title,
    description: goal.description || '',
    category: goal.category || 'personal',
    progress: typeof goal.progress === 'number' ? goal.progress : 0,
    targetDate: goal.targetDate || null,
    createdAt: goal.createdAt || new Date().toISOString()
  };
}

function _normaliseNoteFromServer(note) {
  return {
    id: note._id || note.id,
    title: note.title,
    content: note.content || '',
    color: note.color || '#fffef9',
    createdAt: note.createdAt || new Date().toISOString()
  };
}
