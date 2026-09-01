import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fuelApi } from "./api";
import { VehicleSelect } from "../vehicles/VehicleSelect";
import { DriverSelect } from "../drivers/DriverSelect";
import { extractValidationErrors, extractErrorMessage } from "../../lib/apiClient";
import { Loader } from "../../components/Loader";

export function FuelFormModal({ onClose }) {
  const [vehicle, setVehicle] = useState(null);
  const [driver, setDriver] = useState(null);
  const { register, handleSubmit, watch, setError, formState: { errors } } = useForm({
    defaultValues: { total_price: "", rate_per_litre: "", odometer_reading: "" },
  });

  const totalPrice = watch("total_price");
  const rate = watch("rate_per_litre");
  const computedLitres = totalPrice && rate && Number(rate) > 0
    ? (Number(totalPrice) / Number(rate)).toFixed(2)
    : null;

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload) => fuelApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuel-entries"] });
      toast.success("Fuel entry added");
    },
  });

  async function onSubmit(values) {
    if (!vehicle || !driver) {
      toast.error("Please select both a vehicle and a driver.");
      return;
    }
    try {
      await mutation.mutateAsync({
        vehicle_id: vehicle.id,
        driver_id: driver.id,
        total_price: Number(values.total_price),
        rate_per_litre: Number(values.rate_per_litre),
        odometer_reading: Number(values.odometer_reading),
      });
      onClose();
    } catch (err) {
      const fieldErrors = extractValidationErrors(err);
      if (Object.keys(fieldErrors).length) {
        Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }));
      } else {
        toast.error(extractErrorMessage(err));
      }
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
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Add Fuel Entry</h2>
        <p className="text-sm text-gray-500 mb-4">For cash purchases or backfilling — no receipt photo required here.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <VehicleSelect value={vehicle} onChange={setVehicle} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
            <DriverSelect value={driver} onChange={setDriver} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Price Paid</label>
              <input {...register("total_price", { required: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate/Litre</label>
              <input {...register("rate_per_litre", { required: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Odometer</label>
              <input {...register("odometer_reading", { required: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          {computedLitres && (
            <p className="text-sm text-brand-700 bg-brand-50 rounded-lg px-3 py-2">Litres: {computedLitres} L</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-press flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
              {mutation.isPending && <Loader size="sm" className="border-white/40 border-t-white" />}
              {mutation.isPending ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}