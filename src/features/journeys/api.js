import { apiClient } from '../../lib/apiClient';

export const journeysApi = {
  live: async () => {
    const res = await apiClient.get('/journeys/live');
    return res.data.data;
  },
  get: async (id) => {
    const res = await apiClient.get(`/journeys/${id}`);
    return res.data.data;
  },
};