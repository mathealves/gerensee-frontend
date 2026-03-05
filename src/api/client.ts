import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Token provider set by auth store to break circular dependency
let _getToken: () => string | null = () => null;
let _clearAuth: () => void = () => {};
let _setToken: (token: string) => void = () => {};

export function registerAuthProvider(
  getToken: () => string | null,
  clearAuth: () => void,
  setToken: (token: string) => void,
) {
  _getToken = getToken;
  _clearAuth = clearAuth;
  _setToken = setToken;
}

// Request interceptor — inject Authorization header
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = _getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 response interceptor — refresh + retry (fully wired in T026)
let isRefreshing = false;
type FailedRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};
let failedQueue: FailedRequest[] = [];

function processQueue(error: AxiosError | null, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshAccessToken } = await import('@/api/auth');
        const { accessToken: newToken, refreshToken: newRefreshToken } = await refreshAccessToken();
        if (typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        _setToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(error, null);
        _clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Surface 500+ and network errors as toast notifications
    if (typeof window !== 'undefined') {
      const status = error.response?.status;
      if (!status) {
        // Network error (no response)
        import('sonner').then(({ toast }) => {
          toast.error('Network error. Please check your connection.');
        });
      } else if (status >= 500) {
        import('sonner').then(({ toast }) => {
          toast.error(`Server error (${status}). Please try again later.`);
        });
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
