/* ================================================
   BUCKETS MODULE
   Render bucket cards, quick-add tasks
   ================================================ */
const Buckets = (() => {

  /* ---- Render all buckets into the grid ---- */
  function renderAll() {
    const grid    = document.getElementById('bucketGrid');
    const buckets = Storage.getBuckets();

    grid.innerHTML = '';

    if (buckets.length === 0) {
      grid.innerHTML = UI.emptyState('📂', 'No buckets yet', 'Create your first bucket above to get started.');
      return;
    }

    buckets.forEach(bucket => {
      grid.appendChild(_createCard(bucket));
    });
  }

  /* ---- Build a single bucket card DOM element ---- */
  function _createCard(bucket) {
    const card = document.createElement('div');
    card.className = 'bucket-card';
    card.dataset.bucketId = bucket.id;

    const tasks        = bucket.tasks || [];
    const totalCount   = tasks.length;
    const doneCount    = tasks.filter(t => t.completed).length;

    card.innerHTML = `
      <div class="bucket-header">
        <div class="bucket-title-wrap">
          <span class="bucket-type-badge">${bucket.type}</span>
          <div class="bucket-title" contenteditable="true" spellcheck="false">${_esc(bucket.name)}</div>
        </div>
        <div class="bucket-actions">
          <span class="task-count" title="Completed / Total">${doneCount}/${totalCount}</span>
          <button class="btn-icon delete-bucket-btn" title="Delete this bucket">🗑</button>
        </div>
      </div>

      <div class="bucket-quick-add">
        <input
          type="text"
          class="input-field quick-task-input"
          placeholder="Quick-add a task…"
          aria-label="Quick-add task to ${_esc(bucket.name)}"
        />
        <button class="btn btn-primary btn-sm quick-add-btn" title="Add task">+</button>
      </div>

      <div class="task-list" id="task-list-${bucket.id}"></div>
    `;

    /* Render existing tasks */
    _renderTaskList(card, bucket);

    /* Wire up interactions */
    _attachEvents(card, bucket);

    return card;
  }

  /* ---- Render tasks inside a bucket card ---- */
  function _renderTaskList(card, bucket) {
    const list  = card.querySelector('.task-list');
    const tasks = bucket.tasks || [];

    list.innerHTML = '';

    if (tasks.length === 0) {
      list.innerHTML = `<p class="bucket-empty-hint">No items yet — add one above</p>`;
      return;
    }

    tasks.forEach(task => {
      list.appendChild(Tasks.createTaskItem(task, bucket.id));
    });
  }

  /* ---- Attach all event listeners to a card ---- */
  function _attachEvents(card, bucket) {
    /* Editable bucket title */
    const titleEl = card.querySelector('.bucket-title');

    titleEl.addEventListener('blur', () => {
      const newName = titleEl.textContent.trim();
      if (newName && newName !== bucket.name) {
        Storage.updateBucket(bucket.id, { name: newName });
        bucket.name = newName;
        /* Update aria-label on the quick-add input */
        const qi = card.querySelector('.quick-task-input');
        if (qi) qi.setAttribute('aria-label', `Quick-add task to ${newName}`);
      }
    });

    titleEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); }
    });

    /* Delete bucket */
    card.querySelector('.delete-bucket-btn').addEventListener('click', () => {
      if (window.confirm(`Delete bucket "${bucket.name}"?\nAll tasks inside will be removed.`)) {
        Storage.deleteBucket(bucket.id);
        renderAll();
        App.updateStats();
        UI.toast('Bucket deleted', 'default');
      }
    });

    /* Quick-add task */
    const quickInput = card.querySelector('.quick-task-input');
    const quickBtn   = card.querySelector('.quick-add-btn');

    const _doQuickAdd = () => {
      const title = quickInput.value.trim();
      if (!title) return;
      Storage.addTask(bucket.id, { title });
      quickInput.value = '';
      /* Full re-render so task count badge updates too */
      renderAll();
      App.updateStats();
      if (Router.getCurrent() === 'tasks') Tasks.renderFlatList();
      UI.toast('Task added', 'success');
    };

    quickBtn.addEventListener('click', _doQuickAdd);
    quickInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') _doQuickAdd(); });
  }

  /* ---- Tiny HTML escape helper ---- */
  function _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { renderAll };
})();
