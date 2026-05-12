/* ================================================
   TASKS MODULE
   Task items, flat list, modal, filter/sort/search
   ================================================ */
const Tasks = (() => {
  let _filter  = 'all';
  let _sort    = 'newest';
  let _search  = '';

  /* ================================================
     TASK ITEM — used inside bucket cards
     ================================================ */
  function createTaskItem(task, bucketId) {
    const el = document.createElement('div');
    el.className = `task-item${task.completed ? ' completed' : ''}`;
    el.dataset.taskId = task.id;

    const noteHtml = _renderNote(task.note);

    el.innerHTML = `
      <div class="task-item-top">
        <input
          type="checkbox"
          class="task-checkbox"
          ${task.completed ? 'checked' : ''}
          aria-label="Mark task complete"
        />
        <div class="task-content">
          <div class="task-title">${_esc(task.title)}</div>
          ${noteHtml ? `<div class="task-note">${noteHtml}</div>` : ''}
          <div class="task-meta">
            ${UI.priorityBadge(task.priority)}
            ${UI.dueBadge(task.dueDate)}
          </div>
        </div>
      </div>
      <div class="task-item-actions">
        <button class="btn btn-ghost btn-sm edit-task-btn">Edit</button>
        <button class="btn btn-danger btn-sm del-task-btn">Delete</button>
      </div>
    `;

    /* Toggle complete */
    el.querySelector('.task-checkbox').addEventListener('change', async () => {
      if (Auth.isLoggedIn && Auth.isLoggedIn()) {
        const res = await API.tasks.toggle(bucketId, task.id);
        if (res.ok) {
          UI.toast(res.data?.completed ? 'Task marked complete' : 'Task marked pending', 'success');
          App.loadData();
        } else {
          UI.toast(res.error || 'Unable to update task', 'error');
          el.querySelector('.task-checkbox').checked = task.completed;
        }
      } else {
        Storage.toggleTask(bucketId, task.id);
        el.classList.toggle('completed');
        App.updateStats();
        if (Router.getCurrent() === 'tasks') renderFlatList();
      }
    });

    /* Edit */
    el.querySelector('.edit-task-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openTaskModal(bucketId, task);
    });

    /* Delete */
    el.querySelector('.del-task-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (window.confirm('Delete this task?')) {
        if (Auth.isLoggedIn && Auth.isLoggedIn()) {
          const res = await API.tasks.delete(bucketId, task.id);
          if (res.ok) {
            UI.toast('Task deleted', 'default');
            App.loadData();
          } else {
            UI.toast(res.error || 'Unable to delete task', 'error');
          }
        } else {
          Storage.deleteTask(bucketId, task.id);
          Buckets.renderAll();
          if (Router.getCurrent() === 'tasks') renderFlatList();
          App.updateStats();
          UI.toast('Task deleted', 'default');
        }
      }
    });

    return el;
  }

  /* ================================================
     FLAT LIST — Tasks page
     ================================================ */
  function renderFlatList() {
    const container = document.getElementById('tasksFlatList');
    let tasks = Storage.getAllTasks();

    /* Filter */
    if (_filter === 'pending')   tasks = tasks.filter(t => !t.completed);
    if (_filter === 'completed') tasks = tasks.filter(t =>  t.completed);
    if (_filter === 'high')      tasks = tasks.filter(t => t.priority === 'high');

    /* Search */
    if (_search) {
      const q = _search.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.note || '').toLowerCase().includes(q) ||
        t.bucketName.toLowerCase().includes(q)
      );
    }

    /* Sort */
    const _pri = { high: 0, medium: 1, low: 2 };
    if (_sort === 'newest')   tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (_sort === 'oldest')   tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (_sort === 'priority') tasks.sort((a, b) => (_pri[a.priority] || 1) - (_pri[b.priority] || 1));
    if (_sort === 'alpha')    tasks.sort((a, b) => a.title.localeCompare(b.title));

    container.innerHTML = '';

    if (tasks.length === 0) {
      container.innerHTML = UI.emptyState(
        '✅',
        'No tasks found',
        'Add tasks from your buckets on the Home page, or adjust your filter.'
      );
      return;
    }

    tasks.forEach(task => container.appendChild(_createFlatItem(task)));
  }

  /* Build a flat task item row */
  function _createFlatItem(task) {
    const el = document.createElement('div');
    el.className = `task-flat-item${task.completed ? ' completed' : ''}`;

    const noteHtml = _renderNote(task.note);

    el.innerHTML = `
      <input
        type="checkbox"
        class="task-checkbox"
        ${task.completed ? 'checked' : ''}
        aria-label="Mark task complete"
      />
      <div class="task-flat-content">
        <div class="task-flat-header">
          <span class="task-flat-title">${_esc(task.title)}</span>
          <span class="task-flat-bucket">${_esc(task.bucketName)}</span>
          ${UI.priorityBadge(task.priority)}
          ${UI.dueBadge(task.dueDate)}
        </div>
        ${noteHtml ? `<div class="task-note" style="margin-top:5px">${noteHtml}</div>` : ''}
      </div>
      <div class="task-flat-actions">
        <button class="btn btn-ghost btn-sm edit-flat-btn">Edit</button>
        <button class="btn btn-danger btn-sm del-flat-btn">Delete</button>
      </div>
    `;

    el.querySelector('.task-checkbox').addEventListener('change', async () => {
      if (Auth.isLoggedIn && Auth.isLoggedIn()) {
        const res = await API.tasks.toggle(task.bucketId, task.id);
        if (res.ok) {
          App.loadData();
        } else {
          UI.toast(res.error || 'Unable to update task', 'error');
          el.querySelector('.task-checkbox').checked = task.completed;
        }
      } else {
        Storage.toggleTask(task.bucketId, task.id);
        el.classList.toggle('completed');
        App.updateStats();
        Buckets.renderAll();
      }
    });

    el.querySelector('.edit-flat-btn').addEventListener('click', () => {
      openTaskModal(task.bucketId, task);
    });

    el.querySelector('.del-flat-btn').addEventListener('click', async () => {
      if (window.confirm('Delete this task?')) {
        if (Auth.isLoggedIn && Auth.isLoggedIn()) {
          const res = await API.tasks.delete(task.bucketId, task.id);
          if (res.ok) {
            UI.toast('Task deleted', 'default');
            App.loadData();
          } else {
            UI.toast(res.error || 'Unable to delete task', 'error');
          }
        } else {
          Storage.deleteTask(task.bucketId, task.id);
          renderFlatList();
          Buckets.renderAll();
          App.updateStats();
          UI.toast('Task deleted', 'default');
        }
      }
    });

    return el;
  }

  /* ================================================
     TASK MODAL — add / edit
     ================================================ */
  function openTaskModal(bucketId, task = null) {
    document.getElementById('taskModalBucketId').value = bucketId  || '';
    document.getElementById('taskModalTaskId').value   = task ? task.id : '';
    document.getElementById('taskModalTitle').textContent = task ? 'Edit Task' : 'Add Task';
    document.getElementById('taskTitleInput').value    = task ? _esc(task.title)       : '';
    document.getElementById('taskNoteInput').value     = task ? (task.note  || '')     : '';
    document.getElementById('taskPriorityInput').value = task ? (task.priority || 'medium') : 'medium';
    document.getElementById('taskDueDateInput').value  = task ? (task.dueDate  || '')  : '';
    UI.openModal('taskModal');
  }

  /* ================================================
     INIT — wire up filters, search, sort, form
     ================================================ */
  function init() {
    /* Form submit */
    document.getElementById('taskForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const bucketId = document.getElementById('taskModalBucketId').value;
      const taskId   = document.getElementById('taskModalTaskId').value;
      const title    = document.getElementById('taskTitleInput').value.trim();
      const note     = document.getElementById('taskNoteInput').value.trim();
      const priority = document.getElementById('taskPriorityInput').value;
      const dueDate  = document.getElementById('taskDueDateInput').value || null;

      if (!title) return;

      if (Auth.isLoggedIn && Auth.isLoggedIn()) {
        let result;
        if (taskId) {
          result = await API.tasks.update(bucketId, taskId, { title, note, priority, dueDate });
        } else {
          result = await API.tasks.create(bucketId, { title, note, priority, dueDate });
        }

        if (result.ok) {
          UI.toast(taskId ? 'Task updated' : 'Task added', 'success');
          UI.closeModal('taskModal');
          App.loadData();
        } else {
          UI.toast(result.error || 'Unable to save task online', 'error');
        }
      } else {
        if (taskId) {
          Storage.updateTask(bucketId, taskId, { title, note, priority, dueDate });
          UI.toast('Task updated', 'success');
        } else {
          Storage.addTask(bucketId, { title, note, priority, dueDate });
          UI.toast('Task added', 'success');
        }

        UI.closeModal('taskModal');
        Buckets.renderAll();
        if (Router.getCurrent() === 'tasks') renderFlatList();
        App.updateStats();
      }
    });

    /* Filter tabs */
    document.querySelectorAll('.filter-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _filter = btn.dataset.filter;
        renderFlatList();
      });
    });

    /* Search */
    document.getElementById('taskSearchInput').addEventListener('input', (e) => {
      _search = e.target.value.trim();
      renderFlatList();
    });

    /* Sort */
    document.getElementById('taskSortSelect').addEventListener('change', (e) => {
      _sort = e.target.value;
      renderFlatList();
    });
  }

  /* ---- Render a note field — linkify URLs ---- */
  function _renderNote(note) {
    if (!note) return '';
    if (/^https?:\/\//i.test(note)) {
      return `<a href="${_esc(note)}" target="_blank" rel="noopener noreferrer">${_esc(note)}</a>`;
    }
    return _esc(note);
  }

  /* ---- HTML escape ---- */
  function _esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { createTaskItem, renderFlatList, openTaskModal, init };
})();
