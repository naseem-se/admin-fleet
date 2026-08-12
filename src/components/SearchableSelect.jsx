import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronDown, X } from 'lucide-react';
import { useDebounce } from '../lib/useDebounce';
import { Loader } from './Loader';

export function SearchableSelect({
  value,
  onChange,
  fetchOptions,
  queryKey,
  getLabel,
  getSubLabel,
  placeholder = 'Search...',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, debouncedQuery],
    queryFn: () => fetchOptions(debouncedQuery),
    enabled: open,
  });

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {value ? (
        <div className="flex items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <div>
            <p className="font-medium text-gray-900">{getLabel(value)}</p>
            {getSubLabel && <p className="text-xs text-gray-500">{getSubLabel(value)}</p>}
          </div>
          <button type="button" onClick={() => onChange(null)} className="text-gray-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-400 hover:border-gray-400"
        >
          {placeholder}
          <ChevronDown size={16} />
        </button>
      )}

      {open && !value && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg animate-scaleIn">
          <div className="relative border-b border-gray-100 p-2">
            <Search size={14} className="absolute left-4 top-4.5 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-md border-0 bg-gray-50 py-1.5 pl-7 pr-2 text-sm focus:outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center py-4"><Loader size="sm" /></div>
            )}
            {!isLoading && data?.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-gray-400">No results</p>
            )}
            {data?.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => { onChange(option); setOpen(false); setQuery(''); }}
                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{getLabel(option)}</span>
                {getSubLabel && <span className="text-xs text-gray-500">{getSubLabel(option)}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}