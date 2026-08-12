import { SearchableSelect } from '../../components/SearchableSelect';
import { vehiclesApi } from './api';

export function VehicleSelect({ value, onChange, placeholder = 'Search vehicle by registration...' }) {
  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      queryKey="vehicle-select"
      placeholder={placeholder}
      fetchOptions={async (query) => {
        const res = await vehiclesApi.list({ search: query, per_page: 8 });
        return res.data;
      }}
      getLabel={(v) => v.registration_number}
      getSubLabel={(v) => [v.make, v.model].filter(Boolean).join(' ') || '-'}
    />
  );
}