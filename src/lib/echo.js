import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

export function getEcho() {
  if (echoInstance) return echoInstance;

  const token = localStorage.getItem('fleet_auth_token');

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_API_BASE_URL}/broadcasting/auth`,
    auth: { headers: { Authorization: `Bearer ${token}` } },
  });

  // Visible connection-state logging — check the browser console to
  // confirm whether the socket is actually connecting, rather than
  // guessing from silent behavior.
  const pusher = echoInstance.connector.pusher;
  pusher.connection.bind('connected', () => console.log('[Reverb] connected'));
  pusher.connection.bind('disconnected', () => console.warn('[Reverb] disconnected'));
  pusher.connection.bind('error', (err) => console.error('[Reverb] connection error', err));
  pusher.connection.bind('unavailable', () => console.error('[Reverb] unavailable — is `php artisan reverb:start` running?'));

  return echoInstance;
}

export function disconnectEcho() {
  echoInstance?.disconnect();
  echoInstance = null;
}