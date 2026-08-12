export function DateRangePicker({ from, to, onFromChange, onToChange }) {
  return (
    <div className="flex items-center gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1">From</label>
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">To</label>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
    </div>
  );
}