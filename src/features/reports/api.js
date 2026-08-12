import { apiClient } from '../../lib/apiClient';

export const reportsApi = {
  fleetSummary: async (month) => {
    const res = await apiClient.get('/reports/fleet-summary', { params: { month } });
    return res.data;
  },

  vehicleReport: async (vehicleId, from, to) => {
    const res = await apiClient.get(`/reports/vehicle/${vehicleId}`, { params: { from, to } });
    return res.data;
  },

  driverReport: async (driverId, from, to) => {
    const res = await apiClient.get(`/reports/driver/${driverId}`, { params: { from, to } });
    return res.data;
  },

  fuelReport: async (from, to, vehicleId) => {
    const res = await apiClient.get('/reports/fuel', { params: { from, to, vehicle_id: vehicleId } });
    return res.data;
  },

  maintenanceReport: async (from, to, vehicleId) => {
    const res = await apiClient.get('/reports/maintenance', { params: { from, to, vehicle_id: vehicleId } });
    return res.data;
  },
};