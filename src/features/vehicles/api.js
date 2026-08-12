import { apiClient } from '../../lib/apiClient';

export const vehiclesApi = {
  list: async (filters = {}) => {
    const res = await apiClient.get('/vehicles', { params: filters });
    return res.data;
  },
  get: async (id) => {
    const res = await apiClient.get(`/vehicles/${id}`);
    return res.data.data;
  },
  create: async (payload) => {
    const res = await apiClient.post('/vehicles', payload);
    return res.data.data;
  },
  update: async (id, payload) => {
    const res = await apiClient.put(`/vehicles/${id}`, payload);
    return res.data.data;
  },
  remove: async (id) => {
    await apiClient.delete(`/vehicles/${id}`);
  },
   history: async (id) => {
    const res = await apiClient.get(`/vehicles/${id}/history`);
    return res.data;
  },
};