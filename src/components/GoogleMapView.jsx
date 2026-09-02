import { useRef, useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { Loader } from "./Loader";

const containerStyle = { width: "100%", height: "100%" };

function toFiniteNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function GoogleMapView({ lat, lng, accuracy, className }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // A REF alone isn't enough here — refs don't trigger re-renders, so an
  // effect that only depends on lat/lng has no way to "notice" that the
  // map instance became available later via onLoad. This was the actual
  // bug behind "the marker only appears after I click the map": if the
  // location data arrived before Google Maps finished initializing, the
  // marker-drawing effect ran once, found mapRef.current still null, did
  // nothing, and never got a reason to run again. Storing the map
  // instance in STATE means the effect below correctly re-fires the
  // moment the map becomes ready, regardless of load-order timing.
  const [map, setMap] = useState(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const animationFrameRef = useRef(null);

  const safeLat = toFiniteNumber(lat);
  const safeLng = toFiniteNumber(lng);
  const safeAccuracy = toFiniteNumber(accuracy);

  useEffect(() => {
    if (!map || safeLat === null || safeLng === null) return;

    const targetPos = new google.maps.LatLng(safeLat, safeLng);

    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({
        position: targetPos,
        map,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#4f46e5",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
      });
      map.panTo(targetPos);
    } else {
      const startPos = markerRef.current.getPosition();
      const startLat = startPos.lat();
      const startLng = startPos.lng();

      // If the new point is far from the old one (e.g. switching between
      // two different vehicles' journeys), animating a long glide across
      // the map is misleading — snap instantly instead of interpolating.
      const distanceMeters = google.maps.geometry
        ? google.maps.geometry.spherical.computeDistanceBetween(startPos, targetPos)
        : null;

      if (distanceMeters !== null && distanceMeters > 2000) {
        markerRef.current.setPosition(targetPos);
      } else {
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
          if (t < 1) animationFrameRef.current = requestAnimationFrame(step);
        }
        animationFrameRef.current = requestAnimationFrame(step);
      }

      map.panTo(targetPos);
    }

    if (safeAccuracy !== null) {
      if (!circleRef.current) {
        circleRef.current = new google.maps.Circle({
          map,
          fillColor: "#4f46e5",
          fillOpacity: 0.12,
          strokeColor: "#4f46e5",
          strokeOpacity: 0.4,
          strokeWeight: 1,
        });
      }
      circleRef.current.setCenter(new google.maps.LatLng(safeLat, safeLng));
      circleRef.current.setRadius(safeAccuracy);
    } else {
      circleRef.current?.setMap(null);
      circleRef.current = null;
    }
  }, [map, safeLat, safeLng, safeAccuracy]);

  // Whenever the marker being shown represents a genuinely different
  // location context (a different journey selected), the OLD marker/circle
  // must be torn down first — otherwise switching journeys can leave a
  // stale marker from the previous selection lingering on the map.
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      markerRef.current?.setMap(null);
      markerRef.current = null;
      circleRef.current?.setMap(null);
      circleRef.current = null;
    };
  }, [safeLat === null, safeLng === null]);

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
        onLoad={(mapInstance) => setMap(mapInstance)}
        onUnmount={() => setMap(null)}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
      />
    </div>
  );
}