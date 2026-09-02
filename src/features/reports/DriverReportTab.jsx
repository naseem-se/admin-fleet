import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserRound, Gauge, Fuel, Download, AlertTriangle } from "lucide-react";
import { reportsApi } from "./api";
import { DriverSelect } from "../drivers/DriverSelect";
import { DateRangePicker } from "../../components/DateRangePicker";
import { StatCard } from "../../components/StatCard";
import { EmptyState } from "../../components/EmptyState";
import { FullPageLoader } from "../../components/Loader";
import { DownloadButton } from "../../components/DownloadButton";

const today = new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

export function DriverReportTab() {
  const [driver, setDriver] = useState(null);
  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);
  const [highlighted, setHighlighted] = useState(null);
  const journeyRefs = useRef({});
  const fuelRefs = useRef({});

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reports", "driver", driver?.id, from, to],
    queryFn: () => reportsApi.driverReport(driver.id, from, to),
    enabled: !!driver,
  });

  function jumpTo(refs, id) {
    const el = refs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlighted(`${refs === journeyRefs ? "journey" : "fuel"}-${id}`);
    setTimeout(() => setHighlighted(null), 2000);
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-64">
            <label className="block text-xs text-gray-500 mb-1">Driver</label>
            <DriverSelect value={driver} onChange={setDriver} />
          </div>
          <DateRangePicker from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        </div>
        {driver && (
          <DownloadButton icon={Download} label="Excel" path={`/reports/driver/${driver.id}`} params={{ from, to, format: "xlsx" }} filename={`driver-${driver.name}-report.xlsx`} />
        )}
      </div>

      {!driver ? (
        <EmptyState icon={UserRound} message="Select a driver to view their report." />
      ) : isLoading ? (
        <FullPageLoader />
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 py-10 text-center animate-fadeIn">
          <p className="text-sm text-red-700">Couldn't load this report.</p>
          <p className="text-xs text-red-500 mt-1">{error?.response?.data?.message ?? error?.message}</p>
        </div>
      ) : (
        <>
          {data.driver.license_expiring_soon && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <AlertTriangle size={16} /> This driver's license expires on {data.driver.license_expiry_date}.
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Journeys" value={data.total_journeys} icon={UserRound} color="blue" />
            <StatCard label="Total Distance" value={`${data.total_distance.toLocaleString()} km`} icon={Gauge} color="teal" />
            <StatCard label="Fuel Cost" value={data.total_fuel_cost.toLocaleString()} icon={Fuel} color="green" />
            <StatCard label="Avg KMPL" value={data.avg_kmpl ?? "-"} icon={Fuel} color="amber" />
          </div>

          {data.vehicles_used.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden card-hover mb-4">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-medium text-gray-900">Vehicles Used This Period</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <tr><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Trips</th><th className="px-4 py-3">Distance</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.vehicles_used.map((v, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-gray-600">{v.vehicle}</td>
                        <td className="px-4 py-3 text-gray-600">{v.trips}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{v.distance} km</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden card-hover mb-4">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-medium text-gray-900">Journey Log</h2>
            </div>
            {data.journeys.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No journeys in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Purpose</th>
                      <th className="px-4 py-3">Distance</th>
                      <th className="px-4 py-3">Fuel Logged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.journeys.map((j) => (
                      <tr key={j.id} ref={(el) => (journeyRefs.current[j.id] = el)} className={`transition-colors duration-500 ${highlighted === `journey-${j.id}` ? "bg-brand-50" : ""}`}>
                        <td className="px-4 py-3 text-gray-600">{new Date(j.start_time).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-600">{j.vehicle_registration}</td>
                        <td className="px-4 py-3 text-gray-600">{j.purpose_display}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{j.distance_display} km</td>
                        <td className="px-4 py-3">
                          {j.linked_fuel_ids?.length > 0 ? (
                            j.linked_fuel_ids.map((fuelId) => (
                              <button key={fuelId} onClick={() => jumpTo(fuelRefs, fuelId)} className="text-xs text-brand-600 hover:underline block">View Fuel Entry</button>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">None</span>
                          )}
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
              <h2 className="font-medium text-gray-900">Fuel Entries Logged</h2>
            </div>
            {data.fuel_entries.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No fuel entries in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Litres</th>
                      <th className="px-4 py-3">Cost</th>
                      <th className="px-4 py-3">Linked Trip</th>
                      <th className="px-4 py-3">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.fuel_entries.map((f) => (
                      <tr key={f.id} ref={(el) => (fuelRefs.current[f.id] = el)} className={`transition-colors duration-500 ${highlighted === `fuel-${f.id}` ? "bg-brand-50" : ""}`}>
                        <td className="px-4 py-3 text-gray-600">{new Date(f.entry_time).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-600">{f.vehicle?.registration_number ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{f.quantity_litres} L</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{f.total_cost}</td>
                        <td className="px-4 py-3">
                          {f.linked_journey_id ? (
                            <button onClick={() => jumpTo(journeyRefs, f.linked_journey_id)} className="text-xs text-brand-600 hover:underline">View Trip ({f.linked_journey_date})</button>
                          ) : <span className="text-xs text-gray-400">Not linked</span>}
                        </td>
                        <td className="px-4 py-3">
                          {f.receipt_url ? <a href={f.receipt_url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline">View Receipt</a> : <span className="text-xs text-gray-400">No receipt</span>}
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