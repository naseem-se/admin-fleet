import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

export function getEcho() {
  if (echoInstance) return echoInstance;

  const token = localStorage.getItem('fleet_auth_token');

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authEndpoint: `${import.meta.env.VITE_API_BASE_URL}/broadcasting/auth`,
    auth: { headers: { Authorization: `Bearer ${token}` } },
  });

  const pusher = echoInstance.connector.pusher;
  pusher.connection.bind('connected', () => console.log('[Pusher] connected'));
  pusher.connection.bind('disconnected', () => console.warn('[Pusher] disconnected'));
  pusher.connection.bind('error', (err) => console.error('[Pusher] connection error', err));

  return echoInstance;
}

export function disconnectEcho() {
  echoInstance?.disconnect();
  echoInstance = null;
}