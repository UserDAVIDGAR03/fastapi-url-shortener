import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://192.168.1.66:8000';

export function getOrCreateGuestId() {
  let guestId = localStorage.getItem('fast_url_guest_id');
  if (!guestId) {
    guestId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('fast_url_guest_id', guestId);
  }
  return guestId;
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const isGuest = localStorage.getItem('fast_url_guest_mode') === 'true';
  const token = localStorage.getItem('fast_url_token');

  if (isGuest) {
    delete config.headers.Authorization;
    config.headers['X-Guest-Id'] = getOrCreateGuestId();
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async (credentials) => {
  const { data } = await api.post('/auth/register', credentials);
  return data;
};

export const loginUser = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const shortenUrl = async (payload) => {
  const { data } = await api.post('/api/shorten', payload);
  return data;
};

export const getUrls = async () => {
  const { data } = await api.get('/api/urls');
  return data;
};

export const toggleUrlStatus = async (shortId) => {
  const { data } = await api.patch(`/api/urls/${shortId}/toggle`);
  return data;
};

export const deleteUrl = async (shortId) => {
  const { data } = await api.delete(`/api/urls/${shortId}`);
  return data;
};

export const getUrlAnalytics = async (shortId) => {
  const { data } = await api.get(`/api/analytics/${shortId}`);
  return data;
};

export default api;