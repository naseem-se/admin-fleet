import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Truck, Gauge, Fuel, Wrench } from "lucide-react";
import { reportsApi } from "./api";
import { VehicleSelect } from "../vehicles/VehicleSelect";
import { DateRangePicker } from "../../components/DateRangePicker";
import { StatCard } from "../../components/StatCard";
import { EmptyState } from "../../components/EmptyState";
import { FullPageLoader } from "../../components/Loader";
import { DownloadButton } from "../../components/DownloadButton";

const today = new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

export function VehicleReportTab() {
  const [vehicle, setVehicle] = useState(null);
  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);
  const [highlightedJourneyId, setHighlightedJourneyId] = useState(null);
  const journeyRowRefs = useRef({});

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reports", "vehicle", vehicle?.id, from, to],
    queryFn: () => reportsApi.vehicleReport(vehicle.id, from, to),
    enabled: !!vehicle,
  });

  function jumpToJourney(journeyId) {
    const el = journeyRowRefs.current[journeyId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedJourneyId(journeyId);
      setTimeout(() => setHighlightedJourneyId(null), 2000);
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-64">
            <label className="block text-xs text-gray-500 mb-1">Vehicle</label>
            <VehicleSelect value={vehicle} onChange={setVehicle} />
          </div>
          <DateRangePicker from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        </div>

        {vehicle && (
          <div className="flex gap-2">
            <DownloadButton
              icon={FileText}
              label="PDF"
              path={`/reports/vehicle/${vehicle.id}`}
              params={{ from, to, format: "pdf" }}
              filename={`vehicle-${vehicle.registration_number}-report.pdf`}
            />
            <DownloadButton
              icon={Download}
              label="Excel"
              path={`/reports/vehicle/${vehicle.id}`}
              params={{ from, to, format: "xlsx" }}
              filename={`vehicle-${vehicle.registration_number}-report.xlsx`}
            />
          </div>
        )}
      </div>

      {!vehicle ? (
        <EmptyState icon={Truck} message="Select a vehicle to view its report." />
      ) : isLoading ? (
        <FullPageLoader />
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 py-10 text-center animate-fadeIn">
          <p className="text-sm text-red-700">Couldn't load this report.</p>
          <p className="text-xs text-red-500 mt-1">{error?.response?.data?.message ?? error?.message}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
            <StatCard label="Total Distance" value={`${data.total_distance.toLocaleString()} km`} icon={Gauge} color="blue" />
            <StatCard label="Actual KMPL" value={data.kmpl ?? "-"} icon={Fuel} color="teal" />
            <StatCard label="Total Fuel Cost" value={data.total_fuel_cost.toLocaleString()} icon={Fuel} color="green" />
            <StatCard label="Maintenance Cost" value={data.total_maintenance_cost.toLocaleString()} icon={Wrench} color="amber" />
          </div>

          {data.mileage_rated > 0 && data.kmpl !== null && (
            <p className="text-xs text-gray-400 mb-6">
              Rated mileage: {data.mileage_rated} km/L —{" "}
              <span className={data.mileage_variance_percent >= 0 ? "text-green-600" : "text-red-600"}>
                {data.mileage_variance_percent >= 0 ? "+" : ""}{data.mileage_variance_percent}%
              </span>{" "}
              vs. actual
            </p>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden card-hover mb-4">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-medium text-gray-900">Journey Log ({data.total_journeys})</h2>
            </div>
            {data.journeys.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No journeys in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Driver</th>
                      <th className="px-4 py-3">Purpose</th>
                      <th className="px-4 py-3">Start / End KM</th>
                      <th className="px-4 py-3">Distance</th>
                      <th className="px-4 py-3">Photos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.journeys.map((j) => (
                      <tr
                        key={j.id}
                        ref={(el) => (journeyRowRefs.current[j.id] = el)}
                        className={`transition-colors duration-500 ${highlightedJourneyId === j.id ? "ring-2 ring-inset ring-brand-500" : ""}`}
                      >
                        <td className="px-4 py-3 text-gray-600">{j.start_time ? new Date(j.start_time).toLocaleString() : "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{j.driver_name}</td>
                        <td className="px-4 py-3 text-gray-600">{j.purpose_display}</td>
                        <td className="px-4 py-3 text-gray-600">{j.start_km_display} → {j.end_km_display}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{j.distance_display} km</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {j.start_photo_url && (
                              <a href={j.start_photo_url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline">Start</a>
                            )}
                            {j.end_photo_url && (
                              <a href={j.end_photo_url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline">End</a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden card-hover">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-medium text-gray-900">Fuel Purchases</h2>
            </div>
            {data.fuel_entries.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No fuel purchases in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Driver</th>
                      <th className="px-4 py-3">Litres</th>
                      <th className="px-4 py-3">Total Cost</th>
                      <th className="px-4 py-3">Linked Trip</th>
                      <th className="px-4 py-3">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.fuel_entries.map((f) => (
                      <tr key={f.id}>
                        <td className="px-4 py-3 text-gray-600">{new Date(f.entry_time).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-600">{f.driver?.name ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{f.quantity_litres} L</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{f.total_cost}</td>
                        <td className="px-4 py-3">
                          {f.linked_journey_id ? (
                            <button onClick={() => jumpToJourney(f.linked_journey_id)} className="text-xs text-brand-600 hover:underline">
                              View Trip ({f.linked_journey_date})
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">Not linked</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {f.receipt_url ? (
                            <a href={f.receipt_url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline">View Receipt</a>
                          ) : (
                            <span className="text-xs text-gray-400">No receipt</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}