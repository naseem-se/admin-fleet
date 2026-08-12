import { apiClient } from './apiClient';

export async function downloadFile(path, params, filename) {
  let response;

  try {
    response = await apiClient.get(path, { params, responseType: 'blob' });
  } catch (err) {
    throw await toReadableError(err);
  }

  // A backend error can still arrive as a 200 with a JSON body in edge
  // cases (or as an error response, caught above) — either way, a blob
  // whose actual content-type is JSON means something went wrong, not that
  // we have a real file.
  if (response.data.type && response.data.type.includes('application/json')) {
    throw await toReadableError({ response });
  }

  const disposition = response.headers['content-disposition'];
  const serverFilename = disposition?.match(/filename="?([^"]+)"?/)?.[1];

  const blobUrl = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = serverFilename ?? filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}

async function toReadableError(err) {
  const blob = err?.response?.data;

  if (blob instanceof Blob) {
    try {
      const text = await blob.text();
      const json = JSON.parse(text);
      return new Error(json.message ?? 'Could not download the file.');
    } catch {
      return new Error('Could not download the file.');
    }
  }

  return new Error(err?.message ?? 'Could not download the file.');
}