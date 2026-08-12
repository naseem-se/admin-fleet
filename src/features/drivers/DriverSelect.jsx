import { SearchableSelect } from '../../components/SearchableSelect';
import { driversApi } from './api';

export function DriverSelect({ value, onChange, placeholder = 'Search driver by name...' }) {
  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      queryKey="driver-select"
      placeholder={placeholder}
      fetchOptions={async (query) => {
        const res = await driversApi.list({ search: query, per_page: 8 });
        return res.data;
      }}
      getLabel={(d) => d.name}
      getSubLabel={(d) => d.phone}
    />
  );
}