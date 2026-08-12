import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from './api';

export function useMaintenanceRecords(filters) {
  return useQuery({
    queryKey: ['maintenance-records', filters],
    queryFn: () => maintenanceApi.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useUpcomingMaintenance() {
  return useQuery({
    queryKey: ['maintenance-records', 'upcoming'],
    queryFn: () => maintenanceApi.upcoming(),
  });
}

export function useCreateMaintenanceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => maintenanceApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance-records'] }),
  });
}

export function useUpdateMaintenanceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => maintenanceApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance-records'] }),
  });
}

export function useDeleteMaintenanceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => maintenanceApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance-records'] }),
  });
}