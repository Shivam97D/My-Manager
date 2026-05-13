# Workspace Project — Todo

---

## ✅ Completed Tasks

### Major Upgrade — May 13, 2026

- [x] Create frontend structure (HTML shell + CSS theme + main styles)
- [x] Create frontend JS modules (storage, api, ui, router, auth)
- [x] Create frontend JS modules (buckets, tasks, goals, notes, app)
- [x] Create backend (server, package.json, .env.example)
- [x] Create backend models (User, Bucket (w/ embedded Tasks), Goal, Note)
- [x] Create backend middleware (authMiddleware.js)
- [x] Create backend controllers (auth, bucket, task, goal, note)
- [x] Create backend routes (auth, buckets, tasks, goals, notes)
- [x] Create README.md with deployment instructions
- [x] Create .gitignore
- [x] Make API base URL configurable via meta tag / window override
- [x] Add production middleware (helmet, compression, morgan) + multi-origin CORS
- [x] Polish navbar user badge & greeting with profile emoji and first-name pull (2026-05-13 02:40 IST)
- [x] Sync frontend data with backend (buckets, tasks, goals, notes CRUD) with offline fallback (2026-05-13 02:40 IST)
- [x] Realign navigation tabs to Buckets / To-Do / Goals / Notes with scoped bucket drill-down (2026-05-13 03:25 IST)
- [x] Seed default buckets for offline + remote users and migrate legacy names automatically (2026-05-13 03:25 IST)
- [x] Enhance To-Do tab with quick add button, bucket filter chip, and mobile polish (2026-05-13 03:25 IST)

---

## 🔲 Remaining / Future Tasks

### High Priority
- [ ] Update `<meta name="api-base">` in `frontend/index.html` to your Render URL after deployment
- [ ] Provide MongoDB Atlas connection string → ensure `backend/.env` has production creds
- [ ] Deploy backend to Render (web service using `backend/` root)
- [ ] Deploy frontend to Netlify

### Medium Priority
- [ ] Push repo to GitHub (`My-Manager`) — include `frontend/`, `backend/`, docs
- [ ] Sync backend data with localStorage on login
- [ ] Drag and drop bucket reordering
- [ ] Drag and drop task reordering within/between buckets
- [ ] Toast on offline mode detection (check `navigator.onLine`)

### Low Priority / Future
- [ ] Calendar view for tasks with due dates
- [ ] Milestone steps inside each goal
- [ ] Export tasks/notes as Markdown
- [ ] Reminders / push notifications
- [ ] Progress chart / analytics dashboard
