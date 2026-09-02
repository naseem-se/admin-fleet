import { apiClient } from "../../lib/apiClient";

export const reportsApi = {
  fleetSummary: async (month) => (await apiClient.get("/reports/fleet-summary", { params: { month } })).data,
  vehicleReport: async (vehicleId, from, to) => (await apiClient.get(`/reports/vehicle/${vehicleId}`, { params: { from, to } })).data,
  driverReport: async (driverId, from, to) => (await apiClient.get(`/reports/driver/${driverId}`, { params: { from, to } })).data,
  fuelReport: async (from, to, vehicleId) => (await apiClient.get("/reports/fuel", { params: { from, to, vehicle_id: vehicleId } })).data,
  maintenanceReport: async (from, to, vehicleId) => (await apiClient.get("/reports/maintenance", { params: { from, to, vehicle_id: vehicleId } })).data,
};