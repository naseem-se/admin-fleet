import clsx from 'clsx';

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

export function Loader({ size = 'md', className }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        'animate-spin rounded-full border-gray-200 border-t-brand-600',
        sizes[size],
        className
      )}
    />
  );
}

export function FullPageLoader() {
  return (
    <div className="flex h-full min-h-[240px] w-full items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}