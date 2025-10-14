export async function api(path:string, payload:any) {
  const { requireToken } = await import('./identity');
  const token = await requireToken();
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: { 'content-type':'application/json', 'authorization': `Bearer ${token}` },
    body: JSON.stringify(payload||{})
  });
  if (!res.ok) throw new Error(await res.text());
  try { return await res.json(); } catch { return {}; }
}
