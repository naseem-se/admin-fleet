export function EmptyState({ icon: Icon, message }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center animate-fadeIn">
      <Icon className="mx-auto text-gray-300 mb-3" size={32} />
      <p className="text-gray-500">{message}</p>
    </div>
  );
}