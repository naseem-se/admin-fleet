import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Wrench, AlertTriangle } from "lucide-react";
import { reportsApi } from "./api";
import { VehicleSelect } from "../vehicles/VehicleSelect";
import { DateRangePicker } from "../../components/DateRangePicker";
import { StatCard } from "../../components/StatCard";
import { EmptyState } from "../../components/EmptyState";
import { FullPageLoader } from "../../components/Loader";
import { DownloadButton } from "../../components/DownloadButton";
import { MaintenanceStatusBadge } from "../../components/MaintenanceStatusBadge";

const today = new Date().toISOString().slice(0, 10);
const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);

export function MaintenanceReportTab() {
  const [vehicle, setVehicle] = useState(null);
  const [from, setFrom] = useState(ninetyDaysAgo);
  const [to, setTo] = useState(today);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reports", "maintenance", vehicle?.id, from, to],
    queryFn: () => reportsApi.maintenanceReport(from, to, vehicle?.id),
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
        <DownloadButton icon={Download} label="Excel" path="/reports/maintenance" params={{ from, to, vehicle_id: vehicle?.id ?? "", format: "xlsx" }} filename="maintenance-report.xlsx" />
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatCard label="Total Cost" value={data.total_cost.toLocaleString()} icon={Wrench} color="amber" />
            <StatCard label="Total Records" value={data.total_records} icon={Wrench} color="blue" />
            <StatCard label="Overdue Now" value={data.overdue_count} icon={AlertTriangle} color="red" />
            <StatCard label="Due Soon" value={data.due_soon_count} icon={AlertTriangle} color="amber" />
          </div>

          {data.cost_by_type.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden card-hover mb-4">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-medium text-gray-900">Cost by Type</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <tr><th className="px-4 py-3">Type</th><th className="px-4 py-3">Count</th><th className="px-4 py-3">Total Cost</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.cost_by_type.map((t, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-gray-600 capitalize">{t.type.replace("_", " ")}</td>
                        <td className="px-4 py-3 text-gray-600">{t.count}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{t.total_cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.records.length === 0 ? (
            <EmptyState icon={Wrench} message="No maintenance records in this period." />
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden card-hover">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-medium text-gray-900">All Records</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Cost</th>
                      <th className="px-4 py-3">Next Due</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.records.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 text-gray-600">{new Date(r.service_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-600">{r.vehicle_registration}</td>
                        <td className="px-4 py-3 text-gray-600 capitalize">{r.type.replace("_", " ")}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{r.cost}</td>
                        <td className="px-4 py-3 text-gray-600">{new Date(r.next_service_date).toLocaleDateString() ?? "-"}{r.next_service_km ? ` / ${r.next_service_km} km` : ""}</td>
                        <td className="px-4 py-3"><MaintenanceStatusBadge status={r.due_status} /></td>
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