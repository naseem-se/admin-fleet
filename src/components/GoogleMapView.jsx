import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { Loader } from './Loader';

const containerStyle = { width: '100%', height: '100%' };

export function GoogleMapView({ lat, lng, className }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (!lat || !lng) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-sm text-gray-400 ${className}`}>
        No location data yet
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <Loader />
      </div>
    );
  }

  const position = { lat: Number(lat), lng: Number(lng) };

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position}
        zoom={15}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
      >
        <MarkerF position={position} />
      </GoogleMap>
    </div>
  );
}