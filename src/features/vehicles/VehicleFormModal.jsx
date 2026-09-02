import { useForm } from "react-hook-form";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useCreateVehicle, useUpdateVehicle } from "./useVehicles";
import { extractValidationErrors, extractErrorMessage } from "../../lib/apiClient";
import { Loader } from "../../components/Loader";

export function VehicleFormModal({ vehicle, onClose }) {
  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: {
      registration_number: vehicle?.registration_number ?? "",
      make: vehicle?.make ?? "",
      model: vehicle?.model ?? "",
      year: vehicle?.year?.toString() ?? "",
      vehicle_type: vehicle?.vehicle_type ?? "",
      fuel_type: vehicle?.fuel_type ?? "",
      tank_capacity_litres: vehicle?.tank_capacity_litres?.toString() ?? "",
      current_odometer: vehicle?.current_odometer?.toString() ?? "0",
      current_fuel_litres: vehicle?.current_fuel_litres?.toString() ?? "0",
      mileage_rated: vehicle?.mileage_rated?.toString() ?? "",
    },
  });

  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values) {
    const payload = {
      ...values,
      year: values.year ? Number(values.year) : undefined,
      tank_capacity_litres: values.tank_capacity_litres ? Number(values.tank_capacity_litres) : undefined,
      current_odometer: values.current_odometer !== "" ? Number(values.current_odometer) : undefined,
      current_fuel_litres: values.current_fuel_litres !== "" ? Number(values.current_fuel_litres) : undefined,
      mileage_rated: values.mileage_rated ? Number(values.mileage_rated) : undefined,
    };

    try {
      if (vehicle) {
        await updateMutation.mutateAsync({ id: vehicle.id, payload });
        toast.success("Vehicle updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Vehicle added");
      }
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
      const fieldErrors = extractValidationErrors(err);
      if (Object.keys(fieldErrors).length) {
        Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }));
      } //else {
      //   toast.error(extractErrorMessage(err));
      // }
    }
  }

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{vehicle ? "Edit Vehicle" : "Add Vehicle"}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
            <input {...register("registration_number", { required: "Registration number is required" })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            {errors.registration_number && <p className="mt-1 text-xs text-red-600">{errors.registration_number.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input {...register("make")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input {...register("model")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input {...register("year")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <select {...register("fuel_type")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
                <option value="">-</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="cng">CNG</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tank (L)</label>
              <input {...register("tank_capacity_litres")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Odometer</label>
              <input {...register("current_odometer")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
              {errors.current_odometer && <p className="mt-1 text-xs text-red-600">{errors.current_odometer.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Fuel (L)</label>
              <input {...register("current_fuel_litres")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rated Mileage (km/L)</label>
              <input {...register("mileage_rated")} placeholder="e.g. 12.5" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
          </div>
          <p className="text-xs text-gray-400 -mt-2">
            Rated Mileage is the vehicle's expected/manufacturer fuel efficiency — used in reports to compare against actual measured efficiency.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-press flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
              {isSubmitting && <Loader size="sm" className="border-white/40 border-t-white" />}
              Save Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}