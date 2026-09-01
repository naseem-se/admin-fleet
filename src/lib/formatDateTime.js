export function formatDateTime(isoString) {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatTime(isoString) {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleTimeString(undefined, { timeStyle: "short" });
}