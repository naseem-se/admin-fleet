import clsx from 'clsx';

const palette = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700', 'bg-teal-100 text-teal-700'];

function colorFor(name) {
  const index = name?.charCodeAt(0) ?? 0;
  return palette[index % palette.length];
}

export function Avatar({ name, size = 'md' }) {
  const initials = (name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-full font-medium',
        size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm',
        colorFor(name)
      )}
    >
      {initials}
    </div>
  );
}