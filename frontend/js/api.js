/* ================================================
   API MODULE
   Wraps backend HTTP calls.
   Falls back gracefully when server is unreachable.
   ================================================ */
const API = (() => {
  /* Backend base URL — configurable via <meta name="api-base"> */
  const metaTag     = document.querySelector('meta[name="api-base"]');
  const defaultBase = `${window.location.origin.replace(/\/$/, '')}/api`;
  const BASE_URL    = (
    window.__API_BASE__ ||
    metaTag?.content?.trim() ||
    defaultBase ||
    'http://localhost:5000/api'
  );

  let _token = localStorage.getItem('ws_token') || null;

  /* ---- Token management ---- */
  function setToken(token) {
    _token = token;
    if (token) {
      localStorage.setItem('ws_token', token);
    } else {
      localStorage.removeItem('ws_token');
    }
  }

  function getToken() { return _token; }

  /* ---- Core request wrapper ---- */
  async function request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (_token) headers['Authorization'] = `Bearer ${_token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    try {
      const res = await fetch(BASE_URL + path, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  /* ---- Auth endpoints ---- */
  const auth = {
    login:  (email, password)         => request('POST', '/auth/login',  { email, password }),
    signup: (name, email, password)   => request('POST', '/auth/signup', { name, email, password }),
    me:     ()                        => request('GET',  '/auth/me')
  };

  /* ---- Bucket endpoints ---- */
  const buckets = {
    getAll: ()         => request('GET',    '/buckets'),
    create: (data)     => request('POST',   '/buckets', data),
    update: (id, data) => request('PUT',    `/buckets/${id}`, data),
    delete: (id)       => request('DELETE', `/buckets/${id}`)
  };

  /* ---- Task endpoints ---- */
  const tasks = {
    getAll: ()                          => request('GET',    '/tasks'),
    create: (bucketId, data)            => request('POST',   `/buckets/${bucketId}/tasks`, data),
    update: (bucketId, taskId, data)    => request('PUT',    `/buckets/${bucketId}/tasks/${taskId}`, data),
    delete: (bucketId, taskId)          => request('DELETE', `/buckets/${bucketId}/tasks/${taskId}`),
    toggle: (bucketId, taskId)          => request('PATCH',  `/buckets/${bucketId}/tasks/${taskId}/toggle`)
  };

  /* ---- Goal endpoints ---- */
  const goals = {
    getAll: ()         => request('GET',    '/goals'),
    create: (data)     => request('POST',   '/goals', data),
    update: (id, data) => request('PUT',    `/goals/${id}`, data),
    delete: (id)       => request('DELETE', `/goals/${id}`)
  };

  /* ---- Note endpoints ---- */
  const notes = {
    getAll: ()         => request('GET',    '/notes'),
    create: (data)     => request('POST',   '/notes', data),
    update: (id, data) => request('PUT',    `/notes/${id}`, data),
    delete: (id)       => request('DELETE', `/notes/${id}`)
  };

  /* --- Public API --- */
  return { setToken, getToken, auth, buckets, tasks, goals, notes };
})();
