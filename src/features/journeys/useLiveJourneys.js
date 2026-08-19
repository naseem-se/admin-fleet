import { useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { journeysApi } from './api';
import { getEcho } from '../../lib/echo';
import { useAuth } from '../../context/AuthContext';

export function useLiveJourneys() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const connectedRef = useRef(false);

  const query = useQuery({
    queryKey: ['journeys', 'live'],
    queryFn: () => journeysApi.live(),
    // Safety-net polling — only matters while the WebSocket is down;
    // once Reverb connects this just adds harmless background freshness.
    refetchInterval: () => (connectedRef.current ? false : 8000),
  });

  useEffect(() => {
    if (!user?.company_id) return;

    const echo = getEcho();
    const channelName = `company.${user.company_id}.journeys`;

    const channel = echo.join(channelName)
      .here(() => {
        connectedRef.current = true;
        setConnected(true);
      })
      .listen('.journey.location.updated', (event) => {
        queryClient.setQueryData(['journeys', 'live'], (old) => {
          if (!old) return old;
          return old.map((j) =>
            j.id === event.journey_id
              ? { ...j, last_location: { lat: event.lat, lng: event.lng, recorded_at: event.recorded_at, accuracy_meters: event.accuracy_meters } }
              : j
          );
        });
      })
      .listen('.journey.status.changed', () => {
        queryClient.invalidateQueries({ queryKey: ['journeys', 'live'] });
      })
      .error((err) => {
        connectedRef.current = false;
        setConnected(false);
        console.error('[LiveJourneys] channel error', err);
      });

    return () => {
      connectedRef.current = false;
      echo.leave(channelName);
    };
  }, [user?.company_id, queryClient]);

  return { ...query, isRealtimeConnected: connected };
}