import { apiClient } from '../../lib/apiClient';

export const driversApi = {
  list: async (filters = {}) => {
    const res = await apiClient.get('/drivers', { params: filters });
    return res.data;
  },
  get: async (id) => {
    const res = await apiClient.get(`/drivers/${id}`);
    return res.data.data;
  },
  create: async (payload) => {
    const res = await apiClient.post('/drivers', payload);
    return res.data.data;
  },
  update: async (id, payload) => {
    const res = await apiClient.put(`/drivers/${id}`, payload);
    return res.data.data;
  },
  remove: async (id) => {
    await apiClient.delete(`/drivers/${id}`);
  },
  performance: async (id, params = {}) => {
    const res = await apiClient.get(`/drivers/${id}/performance`, { params });
    return res.data;
  },
  createLogin: async (id, payload) => {
    const res = await apiClient.post(`/drivers/${id}/login`, payload);
    return res.data.data;
  },
  updateLogin: async (id, payload) => {
    const res = await apiClient.put(`/drivers/${id}/login`, payload);
    return res.data.data;
  },
};