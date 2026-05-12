/* ================================================
   STORAGE MODULE
   localStorage CRUD — single source of truth
   when backend is unavailable (offline mode)
   ================================================ */
const Storage = (() => {
  const KEY = 'shivam_workspace_v2';

  /* --- Default data on first load --- */
  function _defaults() {
    return {
      buckets: [
        { id: uid(), name: 'To Do',             type: 'todo',   tasks: [], createdAt: new Date().toISOString() },
        { id: uid(), name: 'Long Term Goals',   type: 'goals',  tasks: [], createdAt: new Date().toISOString() },
        { id: uid(), name: 'Notes & Reminders', type: 'notes',  tasks: [], createdAt: new Date().toISOString() }
      ],
      goals: [],
      notes: []
    };
  }

  /* --- Utility: generate unique ID --- */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* --- Core read / write --- */
  function get() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : _defaults();
    } catch {
      return _defaults();
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  /* ---- BUCKET OPERATIONS ---- */

  function getBuckets() {
    return get().buckets || [];
  }

  function addBucket(name, type = 'todo') {
    const data = get();
    const bucket = {
      id: uid(),
      name: name.trim(),
      type,
      tasks: [],
      createdAt: new Date().toISOString()
    };
    data.buckets.push(bucket);
    save(data);
    return bucket;
  }

  function updateBucket(id, changes) {
    const data = get();
    const idx = data.buckets.findIndex(b => b.id === id);
    if (idx >= 0) {
      data.buckets[idx] = { ...data.buckets[idx], ...changes };
      save(data);
      return data.buckets[idx];
    }
    return null;
  }

  function deleteBucket(id) {
    const data = get();
    data.buckets = data.buckets.filter(b => b.id !== id);
    save(data);
  }

  /* ---- TASK OPERATIONS ---- */

  function getAllTasks() {
    const tasks = [];
    getBuckets().forEach(b => {
      (b.tasks || []).forEach(t => {
        tasks.push({ ...t, bucketId: b.id, bucketName: b.name });
      });
    });
    return tasks;
  }

  function addTask(bucketId, taskData) {
    const data = get();
    const bucket = data.buckets.find(b => b.id === bucketId);
    if (!bucket) return null;

    const task = {
      id: uid(),
      title:     (taskData.title || '').trim(),
      note:      (taskData.note  || '').trim(),
      priority:  taskData.priority  || 'medium',
      completed: false,
      dueDate:   taskData.dueDate   || null,
      createdAt: new Date().toISOString()
    };
    bucket.tasks.push(task);
    save(data);
    return task;
  }

  function updateTask(bucketId, taskId, changes) {
    const data = get();
    const bucket = data.buckets.find(b => b.id === bucketId);
    if (!bucket) return null;
    const idx = bucket.tasks.findIndex(t => t.id === taskId);
    if (idx >= 0) {
      bucket.tasks[idx] = { ...bucket.tasks[idx], ...changes };
      save(data);
      return bucket.tasks[idx];
    }
    return null;
  }

  function deleteTask(bucketId, taskId) {
    const data = get();
    const bucket = data.buckets.find(b => b.id === bucketId);
    if (!bucket) return;
    bucket.tasks = bucket.tasks.filter(t => t.id !== taskId);
    save(data);
  }

  function toggleTask(bucketId, taskId) {
    const data = get();
    const bucket = data.buckets.find(b => b.id === bucketId);
    if (!bucket) return null;
    const task = bucket.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      save(data);
      return task;
    }
    return null;
  }

  /* ---- GOAL OPERATIONS ---- */

  function getGoals() {
    return get().goals || [];
  }

  function addGoal(goalData) {
    const data = get();
    if (!data.goals) data.goals = [];
    const goal = {
      id:          uid(),
      title:       (goalData.title       || '').trim(),
      description: (goalData.description || '').trim(),
      category:    goalData.category    || 'personal',
      progress:    goalData.progress    || 0,
      targetDate:  goalData.targetDate  || null,
      createdAt:   new Date().toISOString()
    };
    data.goals.push(goal);
    save(data);
    return goal;
  }

  function updateGoal(id, changes) {
    const data = get();
    const idx = (data.goals || []).findIndex(g => g.id === id);
    if (idx >= 0) {
      data.goals[idx] = { ...data.goals[idx], ...changes };
      save(data);
      return data.goals[idx];
    }
    return null;
  }

  function deleteGoal(id) {
    const data = get();
    data.goals = (data.goals || []).filter(g => g.id !== id);
    save(data);
  }

  /* ---- NOTE OPERATIONS ---- */

  function getNotes() {
    return get().notes || [];
  }

  function addNote(noteData) {
    const data = get();
    if (!data.notes) data.notes = [];
    const note = {
      id:        uid(),
      title:     (noteData.title   || '').trim(),
      content:   (noteData.content || '').trim(),
      color:     noteData.color    || '#fffef9',
      createdAt: new Date().toISOString()
    };
    data.notes.push(note);
    save(data);
    return note;
  }

  function updateNote(id, changes) {
    const data = get();
    const idx = (data.notes || []).findIndex(n => n.id === id);
    if (idx >= 0) {
      data.notes[idx] = { ...data.notes[idx], ...changes };
      save(data);
      return data.notes[idx];
    }
    return null;
  }

  function deleteNote(id) {
    const data = get();
    data.notes = (data.notes || []).filter(n => n.id !== id);
    save(data);
  }

  /* --- Public API --- */
  return {
    uid,
    get, save,
    getBuckets, addBucket, updateBucket, deleteBucket,
    getAllTasks, addTask, updateTask, deleteTask, toggleTask,
    getGoals,   addGoal,  updateGoal,  deleteGoal,
    getNotes,   addNote,  updateNote,  deleteNote
  };
})();
