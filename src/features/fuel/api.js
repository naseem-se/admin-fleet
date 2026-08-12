import { apiClient } from '../../lib/apiClient';

export const fuelApi = {
  list: async (filters = {}) => {
    const res = await apiClient.get('/fuel-entries', { params: filters });
    return res.data;
  },
  create: async (payload) => {
    const res = await apiClient.post('/fuel-entries', payload);
    return res.data.data;
  },
  exportUrl: (filters = {}) => {
    const params = new URLSearchParams({ ...filters, format: 'xlsx' }).toString();
    return `${apiClient.defaults.baseURL}/reports/fuel?${params}`;
  },
   create: async (payload) => {
    const res = await apiClient.post('/fuel-entries/manual', payload);
    return res.data.data;
  },
};