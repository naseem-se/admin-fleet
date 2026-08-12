import clsx from 'clsx';

// Static class map — Tailwind can't resolve dynamically-built class strings
// like `bg-${color}-50`, so every color this card can take is spelled out here.
const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600' },
};

export function StatCard({ label, value, icon: Icon, color = 'blue', trend }) {
  const colors = colorMap[color] ?? colorMap.blue;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm card-hover">
      <div className="flex items-start justify-between">
        <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', colors.bg)}>
          <Icon size={20} className={colors.text} />
        </div>
        {trend && (
          <span
            className={clsx(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              trend.direction === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            )}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}