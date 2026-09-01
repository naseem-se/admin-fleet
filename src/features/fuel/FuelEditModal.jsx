import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient, extractValidationErrors, extractErrorMessage } from "../../lib/apiClient";
import { Loader } from "../../components/Loader";

export function FuelEditModal({ entry, onClose }) {
  const [file, setFile] = useState(null);
  const { register, handleSubmit, watch, setError, formState: { errors } } = useForm({
    defaultValues: {
      total_price: entry.total_cost,
      rate_per_litre: entry.rate_per_litre,
      odometer_reading: entry.odometer_reading,
    },
  });

  const totalPrice = watch("total_price");
  const rate = watch("rate_per_litre");
  const computedLitres = totalPrice && rate && Number(rate) > 0
    ? (Number(totalPrice) / Number(rate)).toFixed(2)
    : entry.quantity_litres;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values) => {
      const form = new FormData();
      form.append("total_price", values.total_price);
      form.append("rate_per_litre", values.rate_per_litre);
      form.append("odometer_reading", values.odometer_reading);
      if (file) form.append("receipt_photo", file);
      form.append("_method", "PUT");

      const res = await apiClient.post(`/fuel-entries/${entry.id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuel-entries"] });
      toast.success("Fuel entry updated");
      onClose();
    },
    onError: (err) => {
      const fieldErrors = extractValidationErrors(err);
      if (Object.keys(fieldErrors).length) {
        Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }));
      } else {
        toast.error(extractErrorMessage(err));
      }
    },
  });

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg animate-scaleIn">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Fuel Entry</h2>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Price Paid</label>
            <input {...register("total_price", { required: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate / Litre</label>
            <input {...register("rate_per_litre", { required: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
          {computedLitres && (
            <p className="text-sm text-brand-700 bg-brand-50 rounded-lg px-3 py-2">Litres: {computedLitres} L</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Odometer</label>
            <input {...register("odometer_reading", { required: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Replace Receipt Photo (optional)</label>
            {entry.receipt_photo_url && (
              <a href={entry.receipt_photo_url} target="_blank" rel="noreferrer" className="mb-2 block text-xs text-brand-600 hover:underline">
                View current receipt
              </a>
            )}
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-sm" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-press flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
              {mutation.isPending && <Loader size="sm" className="border-white/40 border-t-white" />}
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}