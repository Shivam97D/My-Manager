/* ================================================
   BUCKETS MODULE
   Render bucket cards, quick-add tasks
   ================================================ */
const Buckets = (() => {
  const TYPE_LABELS = {
    todo:  'To-Do',
    goals: 'Goals',
    notes: 'Notes',
    custom: 'Custom'
  };

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
    const typeLabel    = TYPE_LABELS[bucket.type] || bucket.type || 'Bucket';

    card.innerHTML = `
      <div class="bucket-header">
        <div class="bucket-title-wrap">
          <span class="bucket-type-badge">${_esc(typeLabel)}</span>
          <div
            class="bucket-title"
            role="button"
            tabindex="0"
            aria-label="View ${_esc(bucket.name)} tasks"
          >${_esc(bucket.name)}</div>
        </div>
        <div class="bucket-actions">
          <span class="task-count" title="Completed / Total">${doneCount}/${totalCount}</span>
          <button class="btn-icon edit-bucket-btn" type="button" title="Rename this bucket">✎</button>
          <button class="btn-icon delete-bucket-btn" type="button" title="Delete this bucket">🗑</button>
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
    const titleEl     = card.querySelector('.bucket-title');
    const editBtn     = card.querySelector('.edit-bucket-btn');
    const deleteBtn   = card.querySelector('.delete-bucket-btn');
    const quickInput  = card.querySelector('.quick-task-input');
    const quickBtn    = card.querySelector('.quick-add-btn');

    titleEl.dataset.editing = 'false';
    titleEl.setAttribute('contenteditable', 'false');

    const navigateToTasks = () => {
      if (typeof Tasks !== 'undefined' && Tasks.filterByBucket) {
        Tasks.filterByBucket(bucket);
      }
      Router.go('tasks');
    };

    const stopEditing = () => {
      titleEl.dataset.editing = 'false';
      titleEl.setAttribute('contenteditable', 'false');
      titleEl.classList.remove('is-editing');
      titleEl.setAttribute('role', 'button');
      const sel = window.getSelection();
      if (sel) sel.removeAllRanges();
    };

    const startEditing = () => {
      titleEl.dataset.editing = 'true';
      titleEl.setAttribute('contenteditable', 'true');
      titleEl.classList.add('is-editing');
      titleEl.setAttribute('role', 'textbox');
      titleEl.setAttribute('aria-label', 'Rename bucket name');
      titleEl.focus();
      const range = document.createRange();
      range.selectNodeContents(titleEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };

    titleEl.addEventListener('click', () => {
      if (titleEl.dataset.editing === 'true') return;
      navigateToTasks();
    });

    titleEl.addEventListener('keydown', (e) => {
      if (titleEl.dataset.editing === 'true') {
        if (e.key === 'Enter') {
          e.preventDefault();
          titleEl.blur();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          titleEl.textContent = bucket.name;
          titleEl.setAttribute('aria-label', `View ${bucket.name} tasks`);
          stopEditing();
        }
        return;
      }

      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space') {
        e.preventDefault();
        navigateToTasks();
      }
    });

    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (titleEl.dataset.editing === 'true') return;
      startEditing();
    });

    titleEl.addEventListener('blur', async () => {
      if (titleEl.dataset.editing !== 'true') return;

      const newName = titleEl.textContent.replace(/\s+/g, ' ').trim();
      if (!newName) {
        titleEl.textContent = bucket.name;
        titleEl.setAttribute('aria-label', `View ${bucket.name} tasks`);
        stopEditing();
        return;
      }

      if (newName === bucket.name) {
        titleEl.textContent = bucket.name;
        titleEl.setAttribute('aria-label', `View ${bucket.name} tasks`);
        stopEditing();
        return;
      }

      if (Auth.isLoggedIn && Auth.isLoggedIn()) {
        const res = await API.buckets.update(bucket.id, { name: newName });
        if (res.ok) {
          UI.toast('Bucket renamed', 'success');
          titleEl.setAttribute('aria-label', `View ${newName} tasks`);
          stopEditing();
          App.loadData();
        } else {
          UI.toast(res.error || 'Rename failed', 'error');
          titleEl.textContent = bucket.name;
          titleEl.setAttribute('aria-label', `View ${bucket.name} tasks`);
          stopEditing();
        }
      } else {
        Storage.updateBucket(bucket.id, { name: newName });
        bucket.name = newName;
        titleEl.textContent = newName;
        titleEl.setAttribute('aria-label', `View ${newName} tasks`);
        if (quickInput) quickInput.setAttribute('aria-label', `Quick-add task to ${newName}`);
        UI.toast('Bucket renamed', 'success');
        stopEditing();
      }
    });

    /* Delete bucket */
    deleteBtn.addEventListener('click', async () => {
      if (window.confirm(`Delete bucket "${bucket.name}"?\nAll tasks inside will be removed.`)) {
        if (Auth.isLoggedIn && Auth.isLoggedIn()) {
          const res = await API.buckets.delete(bucket.id);
          if (res.ok) {
            UI.toast('Bucket deleted', 'default');
            App.loadData();
          } else {
            UI.toast(res.error || 'Unable to delete bucket', 'error');
          }
        } else {
          Storage.deleteBucket(bucket.id);
          renderAll();
          App.updateStats();
          if (typeof Tasks !== 'undefined' && Tasks.clearBucketFilter) {
            Tasks.clearBucketFilter();
          }
          UI.toast('Bucket deleted', 'default');
        }
      }
    });

    /* Quick-add task */
    const _doQuickAdd = async () => {
      const title = quickInput.value.trim();
      if (!title) return;
      if (Auth.isLoggedIn && Auth.isLoggedIn()) {
        const res = await API.tasks.create(bucket.id, { title });
        if (res.ok) {
          quickInput.value = '';
          UI.toast('Task added', 'success');
          App.loadData();
        } else {
          UI.toast(res.error || 'Unable to add task online', 'error');
        }
      } else {
        Storage.addTask(bucket.id, { title });
        quickInput.value = '';
        renderAll();
        App.updateStats();
        if (Router.getCurrent() === 'tasks') Tasks.renderFlatList();
        UI.toast('Task added', 'success');
      }
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
