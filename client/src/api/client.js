const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, options);
  } catch {
    throw new Error('Cannot reach the server. Start it with "npm run dev" and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
  return data;
}

export const api = {
  status: () => request('/status'),
  verify: (form) => request('/verify', { method: 'POST', body: form }),
  diff: (form) => request('/diff', { method: 'POST', body: form }),
  health: (repo) =>
    request('/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo }),
    }),
  history: () => request('/history'),
  removeHistory: (id) => request(`/history/${id}`, { method: 'DELETE' }),
};
