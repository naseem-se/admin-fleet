import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Fuel as FuelIcon } from "lucide-react";
import { reportsApi } from "./api";
import { VehicleSelect } from "../vehicles/VehicleSelect";
import { DateRangePicker } from "../../components/DateRangePicker";
import { StatCard } from "../../components/StatCard";
import { EmptyState } from "../../components/EmptyState";
import { FullPageLoader } from "../../components/Loader";
import { DownloadButton } from "../../components/DownloadButton";

const today = new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

export function FuelReportTab() {
  const [vehicle, setVehicle] = useState(null);
  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reports", "fuel", vehicle?.id, from, to],
    queryFn: () => reportsApi.fuelReport(from, to, vehicle?.id),
  });

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-64">
            <label className="block text-xs text-gray-500 mb-1">Vehicle (optional)</label>
            <VehicleSelect value={vehicle} onChange={setVehicle} placeholder="All vehicles" />
          </div>
          <DateRangePicker from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        </div>
        <DownloadButton icon={Download} label="Excel" path="/reports/fuel" params={{ from, to, vehicle_id: vehicle?.id ?? "", format: "xlsx" }} filename="fuel-report.xlsx" />
      </div>

      {isLoading ? (
        <FullPageLoader />
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 py-10 text-center animate-fadeIn">
          <p className="text-sm text-red-700">Couldn't load this report.</p>
          <p className="text-xs text-red-500 mt-1">{error?.response?.data?.message ?? error?.message}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard label="Total Litres" value={data.total_litres.toFixed(2)} icon={FuelIcon} color="blue" />
            <StatCard label="Total Cost" value={data.total_cost.toLocaleString()} icon={FuelIcon} color="green" />
            <StatCard label="Avg Rate/Litre" value={data.avg_rate ?? "-"} icon={FuelIcon} color="amber" />
          </div>

          {data.per_vehicle.length > 1 && (
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden card-hover mb-4">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-medium text-gray-900">By Vehicle</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Entries</th>
                      <th className="px-4 py-3">Total Litres</th>
                      <th className="px-4 py-3">Total Cost</th>
                      <th className="px-4 py-3">Avg Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.per_vehicle.map((v, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-gray-600">{v.vehicle}</td>
                        <td className="px-4 py-3 text-gray-600">{v.entries}</td>
                        <td className="px-4 py-3 text-gray-600">{v.total_litres} L</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{v.total_cost}</td>
                        <td className="px-4 py-3 text-gray-600">{v.avg_rate ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.entries.length === 0 ? (
            <EmptyState icon={FuelIcon} message="No fuel entries in this period." />
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden card-hover">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-medium text-gray-900">All Entries</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Driver</th>
                      <th className="px-4 py-3">Litres</th>
                      <th className="px-4 py-3">Cost</th>
                      <th className="px-4 py-3">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.entries.map((e) => (
                      <tr key={e.id}>
                        <td className="px-4 py-3 text-gray-600">{new Date(e.entry_time).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-600">{e.vehicle?.registration_number ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{e.driver?.name ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{e.quantity_litres} L</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{e.total_cost}</td>
                        <td className="px-4 py-3">
                          {e.receipt_url ? <a href={e.receipt_url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline">View Receipt</a> : <span className="text-xs text-gray-400">No receipt</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}