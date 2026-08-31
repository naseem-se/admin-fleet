export function buildFormData(fields) {
  const form = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    form.append(key, value);
  });

  return form;
}