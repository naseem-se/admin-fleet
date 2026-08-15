import { apiClient } from '../../lib/apiClient';

export const platformApi = {
  stats: async () => (await apiClient.get('/admin/stats')).data,

  companies: {
    list: async (filters = {}) => (await apiClient.get('/admin/companies', { params: filters })).data,
    get: async (id) => (await apiClient.get(`/admin/companies/${id}`)).data.data,
    create: async (payload) => (await apiClient.post('/admin/companies', payload)).data.data,
    update: async (id, payload) => (await apiClient.put(`/admin/companies/${id}`, payload)).data.data,
    suspend: async (id) => (await apiClient.post(`/admin/companies/${id}/suspend`)).data.data,
    activate: async (id) => (await apiClient.post(`/admin/companies/${id}/activate`)).data.data,
  },

  plans: {
    list: async () => (await apiClient.get('/admin/subscription-plans')).data.data,
    create: async (payload) => (await apiClient.post('/admin/subscription-plans', payload)).data.data,
    update: async (id, payload) => (await apiClient.put(`/admin/subscription-plans/${id}`, payload)).data.data,
    deactivate: async (id) => (await apiClient.delete(`/admin/subscription-plans/${id}`)).data,
  },

  subscriptions: {
    list: async (companyId) => (await apiClient.get(`/admin/companies/${companyId}/subscriptions`)).data.data,
    assign: async (companyId, payload) => (await apiClient.post(`/admin/companies/${companyId}/subscriptions`, payload)).data.data,
  },
};