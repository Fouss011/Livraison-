const API_URL = "https://backend-winter-ridge-1450.fly.dev/api";

export function getToken() {
  return localStorage.getItem("delivery_token");
}

export function setSession(token, user) {
  localStorage.setItem("delivery_token", token);
  localStorage.setItem("delivery_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("delivery_token");
  localStorage.removeItem("delivery_user");
}

export function getStoredUser() {
  const raw = localStorage.getItem("delivery_user");
  return raw ? JSON.parse(raw) : null;
}

async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur API");
  }

  return data;
}

export const api = {
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getStats: () => request("/parcels/stats/dashboard"),

  getParcels: (search = "") =>
  request(search ? `/parcels?search=${encodeURIComponent(search)}` : "/parcels"),

  createParcel: (payload) =>
    request("/parcels", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  updateParcelStatus: (id, payload) =>
    request(`/parcels/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),

  getAvailableParcels: () => request("/parcels/available/list"),

  getRequests: () => request("/requests"),

  createPublicRequest: (payload) =>
    request("/requests", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  updateRequestStatus: (id, payload) =>
    request(`/requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
    deleteParcel: (id) =>
  request(`/parcels/${id}`, {
    method: "DELETE"
  }),

    trackParcelPublic: (search) =>
  request(`/parcels/track/public?search=${encodeURIComponent(search)}`),
};