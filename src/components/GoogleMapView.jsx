import { useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Loader } from './Loader';

const containerStyle = { width: '100%', height: '100%' };

function toFiniteNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function GoogleMapView({ lat, lng, accuracy, className }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const safeLat = toFiniteNumber(lat);
  const safeLng = toFiniteNumber(lng);
  const safeAccuracy = toFiniteNumber(accuracy);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || safeLat === null || safeLng === null) return;

    const targetPos = new google.maps.LatLng(safeLat, safeLng);

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
    } else {
      const startPos = markerRef.current.getPosition();
      const startLat = startPos.lat();
      const startLng = startPos.lng();
      const duration = 1000;
      const startTime = performance.now();

      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

      function step(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const easedT = t * (2 - t);

        const currentLat = startLat + (safeLat - startLat) * easedT;
        const currentLng = startLng + (safeLng - startLng) * easedT;

        markerRef.current.setPosition(new google.maps.LatLng(currentLat, currentLng));

        if (t < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        }
      }

      animationFrameRef.current = requestAnimationFrame(step);
      mapRef.current.panTo(targetPos);
    }

    if (safeAccuracy !== null) {
      if (!circleRef.current) {
        circleRef.current = new google.maps.Circle({
          map: mapRef.current,
          fillColor: '#4f46e5',
          fillOpacity: 0.12,
          strokeColor: '#4f46e5',
          strokeOpacity: 0.4,
          strokeWeight: 1,
        });
      }
      circleRef.current.setCenter(new google.maps.LatLng(safeLat, safeLng));
      circleRef.current.setRadius(safeAccuracy);
    }
  }, [isLoaded, safeLat, safeLng, safeAccuracy]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      markerRef.current?.setMap(null);
      circleRef.current?.setMap(null);
    };
  }, []);

  if (safeLat === null || safeLng === null) {
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
        center={{ lat: safeLat, lng: safeLng }}
        zoom={15}
        onLoad={(map) => { mapRef.current = map; }}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
      />
    </div>
  );
}