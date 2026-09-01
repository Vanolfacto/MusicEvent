import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshRes = await axios.post(
    `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  const newToken = refreshRes.data.data.accessToken;
  localStorage.setItem('accessToken', newToken);
  return newToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: { field: string; message: string }[] }
      | undefined;
    if (data?.errors?.length) {
      return data.errors.map((e) => e.message).join(' ');
    }
    return data?.message || error.message || 'Došlo je do greške';
  }
  if (error instanceof Error) return error.message;
  return 'Došlo je do greške';
}
