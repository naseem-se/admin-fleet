import clsx from 'clsx';

const styles = {
  active: 'bg-green-50 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  maintenance: 'bg-amber-50 text-amber-700',
  suspended: 'bg-red-50 text-red-700',
  trial: 'bg-purple-50 text-purple-700',
  completed: 'bg-blue-50 text-blue-700',
};

export function StatusBadge({ status }) {
  return (
    <span className={clsx('inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize', styles[status] ?? styles.inactive)}>
      {status}
    </span>
  );
}