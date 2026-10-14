import axios from 'axios';

const TOKEN_KEY = 'taskflow_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthAttempt =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/google');
      const hadToken = Boolean(localStorage.getItem(TOKEN_KEY));

      if (hadToken && !isAuthAttempt) {
        localStorage.removeItem(TOKEN_KEY);
        if (!window.location.pathname.startsWith('/login')) {
          window.location.assign('/login');
        }
      }
    }
    return Promise.reject(error);
  }
);

export { TOKEN_KEY };
export default api;
