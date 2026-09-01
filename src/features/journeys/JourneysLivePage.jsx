import { useState } from "react";
import { Route as RouteIcon, Gauge, Clock, MapPin } from "lucide-react";
import { useLiveJourneys } from "./useLiveJourneys";
import { Avatar } from "../../components/Avatar";
import { GoogleMapView } from "../../components/GoogleMapView";
import { FullPageLoader } from "../../components/Loader";
import { formatDateTime, formatTime } from "../../lib/formatDateTime";
import clsx from "clsx";

export function JourneysLivePage() {
  const { data: journeys, isLoading, isRealtimeConnected } = useLiveJourneys();
  const [selectedId, setSelectedId] = useState(null);

  const selected = journeys?.find((j) => j.id === selectedId) ?? journeys?.[0];

  if (isLoading) return <FullPageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Live Journeys</h1>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isRealtimeConnected ? "bg-green-500 animate-pulseGlow" : "bg-gray-300"}`} />
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            {journeys?.length ?? 0} active
          </span>
        </div>
      </div>

      {!journeys || journeys.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center">
          <RouteIcon className="mx-auto text-gray-300 mb-3" size={32} />
          <p className="text-gray-500">No active journeys right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {journeys.map((journey) => (
              <button
                key={journey.id}
                onClick={() => setSelectedId(journey.id)}
                className={clsx(
                  "w-full text-left rounded-2xl border bg-white p-4 transition-colors card-hover",
                  selected?.id === journey.id ? "border-brand-500 ring-1 ring-brand-500" : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{journey.vehicle?.registration_number}</span>
                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulseGlow" /> On Route
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Avatar name={journey.driver?.name} photoUrl={journey.driver?.profile_photo_url} size="sm" />
                  {journey.driver?.name}
                </div>
                {journey.purpose && <p className="text-xs text-gray-400 mt-1">Purpose: {journey.purpose}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                  <span className="flex items-center gap-1"><Clock size={12} /> Started {formatTime(journey.start?.time)}</span>
                  <span className="flex items-center gap-1"><Gauge size={12} /> {journey.start?.km} km</span>
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden card-hover">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selected.vehicle?.registration_number}</h2>
                  <p className="text-sm text-gray-500">Driver: {selected.driver?.name}</p>
                  {selected.purpose && <p className="text-xs text-gray-400 mt-0.5">Purpose: {selected.purpose}</p>}
                </div>
                <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulseGlow" /> On Route
                </span>
              </div>

              <GoogleMapView
                lat={selected.last_location?.lat ?? selected.start.lat}
                lng={selected.last_location?.lng ?? selected.start.lng}
                accuracy={selected.last_location?.accuracy_meters}
                className="w-full h-80"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Start KM</p>
                  <p className="text-sm font-medium text-gray-900">{selected.start.km}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Started At</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(selected.start.time)}</p>
                </div>
                {selected.last_location && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin size={12} /> Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">{formatDateTime(selected.last_location.recorded_at)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}