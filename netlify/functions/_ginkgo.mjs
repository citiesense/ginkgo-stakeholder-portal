export async function ginkgo(communityId, apiKey, path, init){
  const url = `${process.env.GINKGO_API_BASE}/community/${communityId}${path}`;
  const res = await fetch(url, {
    ...(init||{}),
    headers: {
      'authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json',
      ...((init&&init.headers)||{})
    }
  });
  if (!res.ok) throw new Error(`Ginkgo ${res.status}`);
  try { return await res.json(); } catch { return {}; }
}
