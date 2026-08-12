import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { driversApi } from './api';

export function useDrivers(filters) {
  return useQuery({
    queryKey: ['drivers', filters],
    queryFn: () => driversApi.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => driversApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => driversApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => driversApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });
}