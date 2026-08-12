import { useQuery } from '@tanstack/react-query';
import { journeysApi } from './api';

export function useLiveJourneys() {
  return useQuery({
    queryKey: ['journeys', 'live'],
    queryFn: () => journeysApi.live(),
    refetchInterval: 20_000, // poll every 20s — simplest reliable "live" view, see design notes on upgrading to broadcast later
  });
}