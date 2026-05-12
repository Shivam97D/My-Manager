/* ================================================
   GOALS MODULE
   Long-term goals with progress tracking
   ================================================ */
const Goals = (() => {
  /* Category → soft background color */
  const CAT_COLORS = {
    career:   '#dbeafe',
    health:   '#dcfce7',
    learning: '#ede9fe',
    finance:  '#fef3c7',
    personal: '#fce7f3',
    other:    '#f0fdf4'
  };

  /* ---- Render all goals ---- */
  function renderAll() {
    const grid  = document.getElementById('goalsGrid');
    const goals = Storage.getGoals();

    grid.innerHTML = '';

    if (goals.length === 0) {
      grid.innerHTML = UI.emptyState(
        '🎯',
        'No goals yet',
        'Define your long-term ambitions and track your progress over time.'
      );
      return;
    }

    goals.forEach(goal => grid.appendChild(_createCard(goal)));
  }

  /* ---- Build a goal card ---- */
  function _createCard(goal) {
    const card     = document.createElement('div');
    card.className = 'goal-card';

    const catBg    = CAT_COLORS[goal.category] || CAT_COLORS.other;
    const progress = goal.progress || 0;
    const dateHtml = goal.targetDate
      ? `🗓 ${UI.formatDate(goal.targetDate)}`
      : 'No target date';

    card.innerHTML = `
      <div class="goal-header">
        <div class="goal-title">${_esc(goal.title)}</div>
        <span class="goal-category" style="background:${catBg}">${goal.category}</span>
      </div>
      ${goal.description ? `<p class="goal-desc">${_esc(goal.description)}</p>` : ''}
      <div class="goal-progress-wrap">
        <div class="progress-label-row">
          <span>Progress</span>
          <span>${progress}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${progress}%"></div>
        </div>
      </div>
      <div class="goal-footer">
        <div class="goal-date">${dateHtml}</div>
        <div class="goal-actions">
          <button class="btn btn-ghost btn-sm edit-goal-btn">Edit</button>
          <button class="btn btn-danger btn-sm del-goal-btn">Delete</button>
        </div>
      </div>
    `;

    card.querySelector('.edit-goal-btn').addEventListener('click', () => openGoalModal(goal));
    card.querySelector('.del-goal-btn').addEventListener('click', async () => {
      if (window.confirm('Delete this goal?')) {
        if (Auth.isLoggedIn && Auth.isLoggedIn()) {
          const res = await API.goals.delete(goal.id);
          if (res.ok) {
            UI.toast('Goal deleted', 'default');
            App.loadData();
          } else {
            UI.toast(res.error || 'Unable to delete goal', 'error');
          }
        } else {
          Storage.deleteGoal(goal.id);
          renderAll();
          App.updateStats();
          UI.toast('Goal deleted', 'default');
        }
      }
    });

    return card;
  }

  /* ---- Open goal modal for add / edit ---- */
  function openGoalModal(goal = null) {
    document.getElementById('goalModalId').value        = goal ? goal.id : '';
    document.getElementById('goalModalTitle').textContent = goal ? 'Edit Goal' : 'New Goal';
    document.getElementById('goalTitleInput').value     = goal ? goal.title        : '';
    document.getElementById('goalDescInput').value      = goal ? (goal.description || '') : '';
    document.getElementById('goalCategoryInput').value  = goal ? (goal.category    || 'personal') : 'personal';
    document.getElementById('goalTargetDate').value     = goal ? (goal.targetDate  || '') : '';

    const progress = goal ? (goal.progress || 0) : 0;
    document.getElementById('goalProgressInput').value   = progress;
    document.getElementById('goalProgressValue').textContent = progress + '%';

    UI.openModal('goalModal');
  }

  /* ---- Init goal form & progress slider ---- */
  function init() {
    document.getElementById('goalForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id          = document.getElementById('goalModalId').value;
      const title       = document.getElementById('goalTitleInput').value.trim();
      const description = document.getElementById('goalDescInput').value.trim();
      const category    = document.getElementById('goalCategoryInput').value;
      const targetDate  = document.getElementById('goalTargetDate').value || null;
      const progress    = parseInt(document.getElementById('goalProgressInput').value, 10);

      if (!title) return;

      if (Auth.isLoggedIn && Auth.isLoggedIn()) {
        let res;
        if (id) {
          res = await API.goals.update(id, { title, description, category, targetDate, progress });
        } else {
          res = await API.goals.create({ title, description, category, targetDate, progress });
        }

        if (res.ok) {
          UI.toast(id ? 'Goal updated' : 'Goal added! 🎯', 'success');
          UI.closeModal('goalModal');
          App.loadData();
        } else {
          UI.toast(res.error || 'Unable to save goal online', 'error');
        }
      } else {
        if (id) {
          Storage.updateGoal(id, { title, description, category, targetDate, progress });
          UI.toast('Goal updated', 'success');
        } else {
          Storage.addGoal({ title, description, category, targetDate, progress });
          UI.toast('Goal added! 🎯', 'success');
        }

        UI.closeModal('goalModal');
        renderAll();
        App.updateStats();
      }
    });

    /* Live progress slider value */
    document.getElementById('goalProgressInput').addEventListener('input', (e) => {
      document.getElementById('goalProgressValue').textContent = e.target.value + '%';
    });

    /* Add Goal button on Goals page header */
    document.getElementById('addGoalBtn').addEventListener('click', () => openGoalModal(null));
  }

  function _esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return { renderAll, openGoalModal, init };
})();
