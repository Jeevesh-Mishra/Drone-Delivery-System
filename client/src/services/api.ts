import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Attach JWT token to every outgoing request if it exists in local storage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('drone_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept 401/403 responses:
// If we have a stale/expired token, clear it and retry the request once without it.
// Dev-mode backend allows unauthenticated access, so the retry will succeed.
// Only hard-redirect to login if the retry also fails.
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      // Clear the stale token so the retry goes unauthenticated
      localStorage.removeItem('drone_token');
      localStorage.removeItem('drone_user');
      // Remove auth header for retry
      delete originalRequest.headers['Authorization'];
      try {
        // Retry the request without a token — dev mode will allow it
        return await API(originalRequest);
      } catch (retryError) {
        // If retry also fails, redirect to login
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.href = '/';
        }
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
