# Shivam's Workspace

A personal productivity operating system — tasks, goals, notes, and reminders in one clean place.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | HTML + CSS + Vanilla JS (SPA)     |
| Backend    | Node.js + Express.js              |
| Database   | MongoDB + Mongoose                |
| Auth       | JWT (JSON Web Tokens)             |
| Deployment | Frontend → Netlify / Backend → Render |

---

## Folder Structure

```
To Do/
├── frontend/                  ← Static SPA (open index.html in browser)
│   ├── index.html
│   ├── css/
│   │   ├── theme.css          ← CSS variables (light/dark tokens)
│   │   └── main.css           ← All component styles
│   └── js/
│       ├── storage.js         ← localStorage CRUD (offline mode)
│       ├── api.js             ← Backend HTTP wrapper
│       ├── ui.js              ← Toasts, modals, theme, helpers
│       ├── router.js          ← Hash-based SPA routing
│       ├── auth.js            ← Login / signup / logout
│       ├── buckets.js         ← Bucket cards render & events
│       ├── tasks.js           ← Task items, flat list, filters
│       ├── goals.js           ← Long-term goals & progress
│       ├── notes.js           ← Notes & reminders
│       └── app.js             ← Main entry point
│
├── backend/                   ← Express REST API
│   ├── server.js
│   ├── package.json
│   ├── .env.example           ← Copy to .env and fill values
│   ├── models/
│   │   ├── User.js
│   │   ├── Bucket.js          ← Buckets with embedded tasks
│   │   ├── Goal.js
│   │   └── Note.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bucketController.js
│   │   ├── taskController.js
│   │   ├── goalController.js
│   │   └── noteController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── buckets.js
│   │   ├── tasks.js
│   │   ├── goals.js
│   │   └── notes.js
│   └── middleware/
│       └── authMiddleware.js  ← JWT protect middleware
│
├── README.md
└── todo.md
```

---

## Quick Start

### Frontend only (offline mode)

Just open `frontend/index.html` in any browser (double-click or drag into a tab).
All data is persisted in `localStorage` — no server needed.

> **Tip:** The frontend is pure HTML/CSS/JS. There is no `package.json` here, so `npm run dev` is not required.

### With full backend (local development)

**1. Set up backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — fill MONGO_URI, JWT_SECRET, optional CLIENT_URL list
npm run dev
```

**2. Open frontend**
- In development keep the `<meta name="api-base" content="http://localhost:5000/api">` tag in `frontend/index.html`
- Open `frontend/index.html` in your browser

The frontend auto-detects if the backend is reachable.
If the server is offline it silently falls back to localStorage storage for buckets/tasks/goals/notes.

---

## Environment Variables

| Variable       | Description                            | Example                  |
|----------------|----------------------------------------|--------------------------|
| `PORT`         | Server port                            | `5000`                   |
| `MONGO_URI`    | MongoDB Atlas connection string        | `mongodb+srv://...`      |
| `JWT_SECRET`   | Long random secret for signing tokens  | `abc123...`              |
| `JWT_EXPIRES_IN` | Token lifetime                       | `7d`                     |
| `CLIENT_URL`   | Frontend URL(s) for CORS (comma separated) | `http://localhost:3000,https://my-site.netlify.app` |

---

## API Endpoints

### Auth
| Method | Path               | Auth | Description     |
|--------|--------------------|------|-----------------|
| POST   | /api/auth/signup   | No   | Register        |
| POST   | /api/auth/login    | No   | Login           |
| GET    | /api/auth/me       | Yes  | Current user    |

### Buckets
| Method | Path               | Auth | Description          |
|--------|--------------------|------|----------------------|
| GET    | /api/buckets       | Yes  | Get all buckets      |
| POST   | /api/buckets       | Yes  | Create bucket        |
| PUT    | /api/buckets/:id   | Yes  | Update bucket        |
| DELETE | /api/buckets/:id   | Yes  | Delete bucket        |

### Tasks (nested under bucket)
| Method | Path                                          | Auth | Description   |
|--------|-----------------------------------------------|------|---------------|
| GET    | /api/tasks                                    | Yes  | All tasks flat|
| POST   | /api/buckets/:bucketId/tasks                  | Yes  | Add task      |
| PUT    | /api/buckets/:bucketId/tasks/:taskId          | Yes  | Update task   |
| DELETE | /api/buckets/:bucketId/tasks/:taskId          | Yes  | Delete task   |
| PATCH  | /api/buckets/:bucketId/tasks/:taskId/toggle   | Yes  | Toggle done   |

### Goals & Notes
Same CRUD pattern: `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`

---

## Configuring the API base URL

The frontend looks for the backend API in this order:

1. `window.__API_BASE__` (set before loading the scripts)
2. `<meta name="api-base" content="...">` in `frontend/index.html`
3. `window.location.origin + /api`
4. Fallback `http://localhost:5000/api`

For deployment, edit the meta tag to your Render URL, e.g.
```html
<meta name="api-base" content="https://my-manager-backend.onrender.com/api" />
```

## Deployment

### Frontend → GitHub Pages / Netlify / Vercel
- Push the `frontend/` folder to GitHub (see Git instructions below)
- On Netlify simply drag & drop the `frontend` folder or connect the repo and point the publish directory to `frontend`

### Backend → Render (Node Web Service)
1. Ensure your `.env` file contains production values:
   - `MONGO_URI` (Atlas connection)
   - `JWT_SECRET`
   - `CLIENT_URL` (e.g. `https://your-netlify-app.netlify.app`)
2. Commit and push the repository to GitHub (backend + frontend)
3. In Render:
   - Create "New +" → "Web Service"
   - Select your repo (`My-Manager`)
   - Choose the `backend/` directory as the root (Render supports this via the "Root Directory" field)
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node version: 18+
4. Add environment variables in Render dashboard (same as `.env`)
5. Deploy — Render will expose a URL like `https://my-manager-backend.onrender.com`
6. Update the `<meta name="api-base">` in `frontend/index.html` (or set `window.__API_BASE__`) to that Render URL

### Verify
- Open `frontend/index.html` served from Netlify/GitHub Pages
- Ensure authentication and CRUD calls reach the Render backend
- If the backend is offline, UI continues in localStorage-only mode