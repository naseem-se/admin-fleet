import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fleet_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fleet_auth_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const extractValidationErrors = (error) => {
  if (axios.isAxiosError(error) && error.response?.status === 422) {
    const errors = error.response.data?.errors ?? {};
    return Object.fromEntries(
      Object.entries(errors).map(([field, messages]) => [field, messages[0]])
    );
  }
  return {};
}

export const extractErrorMessage = (error) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}