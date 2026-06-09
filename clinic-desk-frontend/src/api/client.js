import axios from 'axios';

let accessToken = '';
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const getAccessToken = () => accessToken;
export const setAccessToken = (token) => {
  accessToken = token;
};

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for cookie-based refresh tokens
});

// Request Interceptor
client.interceptors.request.use(
  (config) => {
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for 401 Handling & Token Refresh
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we are trying to refresh and fail, or login fails, do not retry
      if (originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/login') {
        accessToken = '';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt token refresh
        const response = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const { accessToken: newAccessToken } = response.data;
        
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        accessToken = '';
        
        // Trigger a custom event so the App / AuthContext can redirect to login
        window.dispatchEvent(new Event('auth:unauthorized'));
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
