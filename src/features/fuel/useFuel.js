import { useQuery } from '@tanstack/react-query';
import { fuelApi } from './api';

export function useFuelEntries(filters) {
  return useQuery({
    queryKey: ['fuel-entries', filters],
    queryFn: () => fuelApi.list(filters),
    placeholderData: (prev) => prev,
  });
}