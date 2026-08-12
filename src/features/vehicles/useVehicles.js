import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from './api';

export function useVehicles(filters) {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => vehiclesApi.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => vehiclesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => vehiclesApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => vehiclesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}