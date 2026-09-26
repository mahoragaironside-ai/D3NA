const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erro de rede.");
  return data;
}

export const api = {
  register: (phone_number, password) =>
    fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number, password }),
    }).then(handle),

  login: (phone_number, password) =>
    fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number, password }),
    }).then(handle),

  createProject: (name, category) =>
    fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ name, category }),
    }).then(handle),

  listProjects: () => fetch(`${API_URL}/projects`, { headers: authHeaders() }).then(handle),

  getProject: (id) => fetch(`${API_URL}/projects/${id}`, { headers: authHeaders() }).then(handle),

  sendMessage: (projectId, text) =>
    fetch(`${API_URL}/projects/${projectId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ text }),
    }).then(handle),

  transcribeAudio: (projectId, blob) => {
    const form = new FormData();
    form.append("audio", blob, "gravacao.webm");
    return fetch(`${API_URL}/projects/${projectId}/audio`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    }).then(handle);
  },

  adminPending: (adminKey) =>
    fetch(`${API_URL}/subscriptions/pending`, { headers: { "x-admin-key": adminKey } }).then(handle),

  adminConfirm: (subscriptionId, adminKey) =>
    fetch(`${API_URL}/subscriptions/${subscriptionId}/confirm`, {
      method: "POST",
      headers: { "x-admin-key": adminKey },
    }).then(handle),

  adminPendingSiteBuilds: (adminKey) =>
    fetch(`${API_URL}/site-builds/admin/pending`, { headers: { "x-admin-key": adminKey } }).then(handle),

  adminSummary: (adminKey) =>
    fetch(`${API_URL}/admin-stats/summary`, { headers: { "x-admin-key": adminKey } }).then(handle),

  adminRevenue: (adminKey, bucket) =>
    fetch(`${API_URL}/admin-stats/revenue?bucket=${bucket || "dia"}`, { headers: { "x-admin-key": adminKey } }).then(handle),

  adminNewUsers: (adminKey, bucket) =>
    fetch(`${API_URL}/admin-stats/new-users?bucket=${bucket || "dia"}`, { headers: { "x-admin-key": adminKey } }).then(handle),

  adminUsers: (adminKey) =>
    fetch(`${API_URL}/admin-stats/users`, { headers: { "x-admin-key": adminKey } }).then(handle),

  adminActivityLog: (adminKey) =>
    fetch(`${API_URL}/activity-log`, { headers: { "x-admin-key": adminKey } }).then(handle),

  adminReviews: (adminKey) =>
    fetch(`${API_URL}/reviews`, { headers: { "x-admin-key": adminKey } }).then(handle),

  adminReviewsSummary: (adminKey) =>
    fetch(`${API_URL}/reviews/summary`, { headers: { "x-admin-key": adminKey } }).then(handle),

  adminPendingCourses: (adminKey) =>
    fetch(`${API_URL}/course-enrollments/pending`, { headers: { "x-admin-key": adminKey } }).then(handle),

  adminConfirmCourse: (enrollmentId, adminKey) =>
    fetch(`${API_URL}/course-enrollments/${enrollmentId}/confirm`, {
      method: "POST",
      headers: { "x-admin-key": adminKey },
    }).then(handle),

  adminConfirmSiteBuild: (buildId, adminKey) =>
    fetch(`${API_URL}/site-builds/${buildId}/confirm`, {
      method: "POST",
      headers: { "x-admin-key": adminKey },
    }).then(handle),

  createSiteBuild: (payload) =>
    fetch(`${API_URL}/site-builds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),

  getSiteBuildStatus: (buildId) =>
    fetch(`${API_URL}/site-builds/${buildId}/status`).then(handle),

  previewSiteBuild: async (payload) => {
    const res = await fetch(`${API_URL}/site-builds/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Não foi possível gerar a pré-visualização.");
    }
    return res.text();
  },

  me: () => fetch(`${API_URL}/auth/me`, { headers: authHeaders() }).then(handle),
  sendOtp: () => fetch(`${API_URL}/auth/otp/send`, { method: "POST", headers: authHeaders() }).then(handle),
  verifyOtp: (code) =>
    fetch(`${API_URL}/auth/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ code }),
    }).then(handle),

  createSubscription: (plan) =>
    fetch(`${API_URL}/subscriptions/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ plan }),
    }).then(handle),

  subscriptionStatus: () => fetch(`${API_URL}/subscriptions/status`, { headers: authHeaders() }).then(handle),

  searchSuppliers: (projectId, query) =>
    fetch(`${API_URL}/projects/${projectId}/suppliers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ query }),
    }).then(handle),

  createReview: (service_type, reference_id, rating, comment) =>
    fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ service_type, reference_id, rating, comment }),
    }).then(handle),

  adWatched: () => fetch(`${API_URL}/ads/watched`, { method: "POST", headers: authHeaders() }).then(handle),
  adStatus: () => fetch(`${API_URL}/ads/status`, { headers: authHeaders() }).then(handle),
};

export { API_URL };
