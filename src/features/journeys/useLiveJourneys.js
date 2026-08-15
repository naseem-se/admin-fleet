import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { journeysApi } from './api';
import { getEcho } from '../../lib/echo';
import { useAuth } from '../../context/AuthContext';

export function useLiveJourneys() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);

  const query = useQuery({
    queryKey: ['journeys', 'live'],
    queryFn: () => journeysApi.live(),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!user?.company_id) return;

    const echo = getEcho();
    const channelName = `company.${user.company_id}.journeys`;
    const channel = echo.join(channelName)
      .here(() => setConnected(true))
      .listen('.journey.location.updated', (event) => {
        queryClient.setQueryData(['journeys', 'live'], (old) => {
          if (!old) return old;
          return old.map((j) =>
            j.id === event.journey_id
              ? { ...j, last_location: { lat: event.lat, lng: event.lng, recorded_at: event.recorded_at } }
              : j
          );
        });
      })
      .listen('.journey.status.changed', () => {
        queryClient.invalidateQueries({ queryKey: ['journeys', 'live'] });
      })
      .error(() => setConnected(false));

    return () => {
      echo.leave(channelName);
    };
  }, [user?.company_id, queryClient]);

  return { ...query, isRealtimeConnected: connected };
}