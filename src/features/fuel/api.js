import { apiClient } from "../../lib/apiClient";

export const fuelApi = {
  list: async (filters = {}) => (await apiClient.get("/fuel-entries", { params: filters })).data,
  create: async (payload) => (await apiClient.post("/fuel-entries/manual", payload)).data.data,
  update: async (id, payload) => (await apiClient.put(`/fuel-entries/${id}`, payload)).data.data,
  remove: async (id) => { await apiClient.delete(`/fuel-entries/${id}`); },
};