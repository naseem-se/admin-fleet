// Free OpenStreetMap iframe embed — no API key, no paid SDK. Good enough for
// a single-point "where is this vehicle now" view; swap for Leaflet/Google
// Maps later if you need custom markers, routes, or clustering.
export function MapEmbed({ lat, lng, zoom = 15, className }) {
  if (!lat || !lng) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-sm text-gray-400 ${className}`}>
        No location data yet
      </div>
    );
  }

  const delta = 0.01;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <iframe
      title="Vehicle location"
      src={src}
      className={className}
      style={{ border: 0 }}
      loading="lazy"
    />
  );
}