import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Truck } from 'lucide-react';
import { reportsApi } from './api';
import { VehicleSelect } from '../vehicles/VehicleSelect';
import { DateRangePicker } from '../../components/DateRangePicker';
import { StatCard } from '../../components/StatCard';
import { EmptyState } from '../../components/EmptyState';
import { FullPageLoader } from '../../components/Loader';
import { Gauge, Fuel, Wrench } from 'lucide-react';
import { DownloadButton } from '../../components/DownloadButton';
import { PhotoLightbox } from '../../components/PhotoLightbox';

const today = new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

export function VehicleReportTab() {
  const [vehicle, setVehicle] = useState(null);
  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reports', 'vehicle', vehicle?.id, from, to],
    queryFn: () => reportsApi.vehicleReport(vehicle.id, from, to),
    enabled: !!vehicle,
  });

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
              params={{ from, to, format: 'pdf' }}
              filename={`vehicle-${vehicle.registration_number}-report.pdf`}
            />
            <DownloadButton
              icon={Download}
              label="Excel"
              path={`/reports/vehicle/${vehicle.id}`}
              params={{ from, to, format: 'xlsx' }}
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Distance" value={`${data.total_distance.toLocaleString()} km`} icon={Gauge} color="blue" />
            <StatCard label="KMPL" value={data.kmpl ?? '-'} icon={Fuel} color="teal" />
            <StatCard label="Fuel Cost" value={data.total_fuel_cost.toLocaleString()} icon={Fuel} color="green" />
            <StatCard label="Maintenance Cost" value={data.total_maintenance_cost.toLocaleString()} icon={Wrench} color="amber" />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden card-hover">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-medium text-gray-900">Journeys ({data.total_journeys})</h2>
            </div>
            {data.journeys.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No journeys in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Start</th>
                      <th className="px-4 py-3">End</th>
                      <th className="px-4 py-3">Start KM</th>
                      <th className="px-4 py-3">End KM</th>
                      <th className="px-4 py-3">Distance</th>
                      <th className="px-4 py-3">Photos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.journeys.map((j) => (
                      <tr key={j.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{j.start_time ? new Date(j.start_time).toLocaleString() : '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{j.end_time ? new Date(j.end_time).toLocaleString() : '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{j.start_km}</td>
                        <td className="px-4 py-3 text-gray-600">{j.end_km ?? '-'}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{j.total_distance ?? '-'} km</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {j.start?.photo_url && (
                              <button onClick={() => setLightboxPhoto({ src: j.start.photo_url, label: 'Start Odometer' })} className="text-xs text-brand-600 hover:underline">Start</button>
                            )}
                            {j.end?.photo_url && (
                              <button onClick={() => setLightboxPhoto({ src: j.end.photo_url, label: 'End Odometer' })} className="text-xs text-brand-600 hover:underline">End</button>
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
        </>
      )}
      {lightboxPhoto && (
        <PhotoLightbox src={lightboxPhoto.src} label={lightboxPhoto.label} onClose={() => setLightboxPhoto(null)} />
      )}
    </div>
  );
}