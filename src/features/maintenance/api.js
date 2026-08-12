import { apiClient } from '../../lib/apiClient';

export const maintenanceApi = {
  list: async (filters = {}) => {
    const res = await apiClient.get('/maintenance-records', { params: filters });
    return res.data;
  },
  create: async (payload) => {
    const res = await apiClient.post('/maintenance-records', payload);
    return res.data.data;
  },
  update: async (id, payload) => {
    const res = await apiClient.put(`/maintenance-records/${id}`, payload);
    return res.data.data;
  },
  remove: async (id) => {
    await apiClient.delete(`/maintenance-records/${id}`);
  },
  upcoming: async (days = 30) => {
    const res = await apiClient.get('/maintenance/upcoming', { params: { days } });
    return res.data.data;
  },
};