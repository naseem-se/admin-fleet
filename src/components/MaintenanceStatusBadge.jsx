import clsx from "clsx";

const CONFIG = {
  overdue: { label: "Overdue", classes: "bg-red-50 text-red-700" },
  due_soon: { label: "Due Soon", classes: "bg-amber-50 text-amber-700" },
  ok: { label: "On Schedule", classes: "bg-green-50 text-green-700" },
  none: { label: "No Schedule Set", classes: "bg-gray-100 text-gray-500" },
};

export function MaintenanceStatusBadge({ status }) {
  const config = CONFIG[status] ?? CONFIG.none;
  return (
    <span className={clsx("inline-block rounded-full px-2.5 py-1 text-xs font-medium", config.classes)}>
      {config.label}
    </span>
  );
}