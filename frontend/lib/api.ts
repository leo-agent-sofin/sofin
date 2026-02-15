import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
export const setToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }
};

// Check for existing token on client load
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    setToken(token);
  }
}

// Add response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token
      setToken(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: (email: string, password: string) =>
    api.post('/api/auth/signup', { email, password }),
  
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  
  getStravaAuthUrl: () =>
    api.get('/api/auth/strava/url'),
  
  stravaCallback: (code: string, userId: string) =>
    api.post('/api/auth/strava/callback', { code, userId }),
};

export const userApi = {
  getProfile: () =>
    api.get('/api/user/profile'),
  
  updateSocialLinks: (socialLinks: any[]) =>
    api.put('/api/user/social-links', { socialLinks }),
  
  getActivities: (limit = 20, offset = 0) =>
    api.get('/api/user/activities', { params: { limit, offset } }),
  
  getRecords: () =>
    api.get('/api/user/records'),
  
  updateSlug: (slug: string) =>
    api.put('/api/user/slug', { slug }),
};

export const slugApi = {
  checkAvailability: (slug: string) =>
    api.get('/api/slug/check', { params: { slug } }),
};

export const syncApi = {
  syncStrava: () =>
    api.post('/api/sync/strava'),
};

export const statsApi = {
  getPublicStats: (slug: string) =>
    api.get(`/api/stats/${slug}`),
};

export default api;
