import { requireIdentityUser } from './_auth.mjs';
import { getCommunityConfig, userHasAccess } from './_kv.mjs';
import { ginkgo } from './_ginkgo.mjs';
import { ok, err } from './_util.mjs';

export async function handler(event, context){
  const auth = requireIdentityUser(context); if(!auth.ok) return err(auth.status, "Unauthorized");
  const { communityId, q } = JSON.parse(event.body||"{}");
  if(!communityId || !q) return err(400,"Missing communityId or q");
  const kv = globalThis.KV || undefined;

  const allowed = await userHasAccess(auth.user.email, communityId, process.env, kv);
  if(!allowed) return err(403,"Forbidden");
  const { ginkgo_api_key } = await getCommunityConfig(communityId, process.env, kv);

  const data = await ginkgo(communityId, ginkgo_api_key, `/businesses`, { method:'POST', body: JSON.stringify({ q }) });
  const results = (data||[]).map((b)=>({
    id:b.id, name:b.name, address:b.address, url:b.url, email:b.email, phone:b.phone,
    contacts:(b.contact_ids||[]).map((id)=>({ id, name:undefined }))
  }));
  return ok({ ok:true, results });
}
