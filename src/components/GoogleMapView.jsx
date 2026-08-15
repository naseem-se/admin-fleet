import { useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Loader } from './Loader';

const containerStyle = { width: '100%', height: '100%' };

export function GoogleMapView({ lat, lng, className }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !lat || !lng) return;

    const targetPos = new google.maps.LatLng(lat, lng);

    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({
        position: targetPos,
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#4f46e5',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        },
      });
      mapRef.current.panTo(targetPos);
      return;
    }

    // Animate from the marker's current position to the new one over
    // ~1 second — this is the difference between a jumpy dot and the
    // smooth gliding motion inDrive/Yango/foodpanda riders expect.
    const startPos = markerRef.current.getPosition();
    const startLat = startPos.lat();
    const startLng = startPos.lng();
    const duration = 1000;
    const startTime = performance.now();

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    function step(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const easedT = t * (2 - t); // ease-out — decelerates into the new point, feels less mechanical

      const currentLat = startLat + (lat - startLat) * easedT;
      const currentLng = startLng + (lng - startLng) * easedT;

      markerRef.current.setPosition(new google.maps.LatLng(currentLat, currentLng));

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      }
    }

    animationFrameRef.current = requestAnimationFrame(step);
    mapRef.current.panTo(targetPos);
  }, [isLoaded, lat, lng]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      markerRef.current?.setMap(null);
    };
  }, []);

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

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat, lng }}
        zoom={15}
        onLoad={(map) => { mapRef.current = map; }}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
      />
    </div>
  );
}