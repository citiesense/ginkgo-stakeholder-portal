import { requireIdentityUser } from './_auth.mjs';
import { getCommunityConfig, userHasAccess } from './_kv.mjs';
import { ginkgo } from './_ginkgo.mjs';
import { ok, err } from './_util.mjs';

export async function handler(event, context){
  const auth = requireIdentityUser(context); if(!auth.ok) return err(auth.status, "Unauthorized");
  const kv = globalThis.KV || undefined;
  const { communityId } = JSON.parse(event.body||"{}");
  if(!communityId) return err(400, 'communityId required');
  const allowed = await userHasAccess(auth.user.email, communityId, process.env, kv);
  if(!allowed) return err(403, 'Forbidden');
  const { ginkgo_api_key } = await getCommunityConfig(communityId, process.env, kv);
  const info = await ginkgo(communityId, ginkgo_api_key, ``, { method:'GET' });
  return ok({ ok:true, name: info?.name || info?.title || `Community ${communityId}` });
}
