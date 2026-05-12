/* ================================================
   NOTES MODULE
   Notes & Reminders with color-coded cards
   ================================================ */
const Notes = (() => {
  let _selectedColor = '#fffef9';

  /* ---- Render all notes ---- */
  function renderAll() {
    const grid  = document.getElementById('notesGrid');
    const notes = Storage.getNotes();

    grid.innerHTML = '';

    if (notes.length === 0) {
      grid.innerHTML = UI.emptyState(
        '📝',
        'No notes yet',
        'Capture your thoughts, reminders, and ideas here.'
      );
      return;
    }

    notes.forEach(note => grid.appendChild(_createCard(note)));
  }

  /* ---- Build a note card ---- */
  function _createCard(note) {
    const card     = document.createElement('div');
    card.className = 'note-card';
    card.style.background = note.color || '#fffef9';

    card.innerHTML = `
      <div class="note-header">
        <div class="note-title">${_esc(note.title)}</div>
        <div class="note-actions">
          <button class="btn-icon edit-note-btn" title="Edit note">✏</button>
          <button class="btn-icon del-note-btn"  title="Delete note">🗑</button>
        </div>
      </div>
      ${note.content ? `<div class="note-content">${_esc(note.content)}</div>` : ''}
      <div class="note-date">${UI.formatDate(note.createdAt)}</div>
    `;

    card.querySelector('.edit-note-btn').addEventListener('click', () => openNoteModal(note));
    card.querySelector('.del-note-btn').addEventListener('click', async () => {
      if (window.confirm('Delete this note?')) {
        if (Auth.isLoggedIn && Auth.isLoggedIn()) {
          const res = await API.notes.delete(note.id);
          if (res.ok) {
            UI.toast('Note deleted', 'default');
            App.loadData();
          } else {
            UI.toast(res.error || 'Unable to delete note', 'error');
          }
        } else {
          Storage.deleteNote(note.id);
          renderAll();
          UI.toast('Note deleted', 'default');
        }
      }
    });

    return card;
  }

  /* ---- Open note modal for add / edit ---- */
  function openNoteModal(note = null) {
    _selectedColor = note ? (note.color || '#fffef9') : '#fffef9';

    document.getElementById('noteModalId').value          = note ? note.id : '';
    document.getElementById('noteModalTitle').textContent = note ? 'Edit Note' : 'New Note';
    document.getElementById('noteTitleInput').value       = note ? note.title          : '';
    document.getElementById('noteContentInput').value     = note ? (note.content || '') : '';

    /* Refresh color picker state */
    const picker = document.getElementById('noteColorPicker');
    picker.querySelectorAll('.color-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.color === _selectedColor);
    });

    UI.openModal('noteModal');
  }

  /* ---- Init note form & color picker ---- */
  function init() {
    document.getElementById('noteForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id      = document.getElementById('noteModalId').value;
      const title   = document.getElementById('noteTitleInput').value.trim();
      const content = document.getElementById('noteContentInput').value.trim();

      if (!title) return;

      if (Auth.isLoggedIn && Auth.isLoggedIn()) {
        let res;
        if (id) {
          res = await API.notes.update(id, { title, content, color: _selectedColor });
        } else {
          res = await API.notes.create({ title, content, color: _selectedColor });
        }

        if (res.ok) {
          UI.toast(id ? 'Note updated' : 'Note saved 📝', 'success');
          UI.closeModal('noteModal');
          App.loadData();
        } else {
          UI.toast(res.error || 'Unable to save note online', 'error');
        }
      } else {
        if (id) {
          Storage.updateNote(id, { title, content, color: _selectedColor });
          UI.toast('Note updated', 'success');
        } else {
          Storage.addNote({ title, content, color: _selectedColor });
          UI.toast('Note saved 📝', 'success');
        }

        UI.closeModal('noteModal');
        renderAll();
      }
    });

    /* Color picker dots */
    UI.initColorDots(
      document.getElementById('noteColorPicker'),
      (color) => { _selectedColor = color; }
    );

    /* Add Note button on Notes page header */
    document.getElementById('addNoteBtn').addEventListener('click', () => openNoteModal(null));
  }

  function _esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return { renderAll, openNoteModal, init };
})();
