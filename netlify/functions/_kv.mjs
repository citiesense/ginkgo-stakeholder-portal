export async function getCommunityConfig(communityId, env, kv){
  if (kv){
    const v = await kv.get(`cfg:${communityId}`);
    if (v) return JSON.parse(v);
  }
  const raw = env.COMMUNITY_CONFIGS_JSON || "{}";
  const map = JSON.parse(raw);
  if (!map[communityId]?.ginkgo_api_key) throw new Error("Missing community config");
  return map[communityId];
}
export async function userHasAccess(email, communityId, env, kv){
  if (kv){
    const v = await kv.get(`member:${(email||'').toLowerCase()}`);
    if (v) return JSON.parse(v).includes(communityId);
  }
  const raw = env.PORTAL_MEMBERSHIPS_JSON || "{}";
  const map = JSON.parse(raw);
  const list = map[(email||'').toLowerCase()] || [];
  return list.includes(communityId);
}
