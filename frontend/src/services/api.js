import axios from 'axios';

const TOKEN_KEY = 'fast_url_token';
const GUEST_ID_KEY = 'fast_url_guest_id';

function resolveApiBaseUrl() {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '') {
    return import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol || 'http:';
    const hostname = window.location.hostname || 'localhost';
    return `${protocol}//${hostname}:8000`;
  }

  return 'http://localhost:8000';
}

export const API_BASE_URL = resolveApiBaseUrl();

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getOrCreateGuestId() {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `guest_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

export function getGuestId() {
  return localStorage.getItem(GUEST_ID_KEY);
}

export function clearGuestId() {
  localStorage.removeItem(GUEST_ID_KEY);
}

export function buildShortUrl(shortId) {
  const cleanId = String(shortId || '').replace(/^\/+/, '');
  return `${API_BASE_URL}/${cleanId}`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    const isAuthEndpoint =
      config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!token) {
      const guestId = getOrCreateGuestId();
      config.headers['X-Guest-Id'] = guestId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      window.dispatchEvent(new CustomEvent('fast-url:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// --- Autenticación ---
export async function registerUser({ email, password }) {
  const { data } = await api.post('/auth/register', { email, password });
  return data;
}

export async function loginUser({ email, password }) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const { data } = await api.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (data?.access_token) {
    setToken(data.access_token);
  }

  return data;
}

export function logoutUser() {
  clearToken();
}

// --- Gestión de URLs ---
export async function getUrls() {
  const { data } = await api.get('/api/urls');
  return data;
}

export async function shortenUrl({ original_url, custom_slug = null, expires_in_hours = null }) {
  const payload = {
    original_url,
    ...(custom_slug ? { custom_slug } : {}),
    ...(expires_in_hours ? { expires_in_hours: Number(expires_in_hours) } : {}),
  };

  const { data } = await api.post('/api/shorten', payload);
  return data;
}

export async function toggleUrlStatus(shortId) {
  const { data } = await api.patch(`/api/urls/${encodeURIComponent(shortId)}/toggle`);
  return data;
}

export async function deleteUrl(shortId) {
  const { data } = await api.delete(`/api/urls/${encodeURIComponent(shortId)}`);
  return data;
}

export async function getUrlAnalytics(shortId) {
  const { data } = await api.get(`/api/urls/${encodeURIComponent(shortId)}/analytics`);
  return data;
}

export default api;