import { apiClient } from '../../lib/apiClient';

export const settingsApi = {
  updateProfile: async (payload) => (await apiClient.put('/profile', payload)).data,
  changePassword: async (payload) => (await apiClient.put('/profile/password', payload)).data,
  getCompanySettings: async () => (await apiClient.get('/company/settings')).data.data,
  updateCompanySettings: async (payload) => (await apiClient.put('/company/settings', payload)).data.data,
};