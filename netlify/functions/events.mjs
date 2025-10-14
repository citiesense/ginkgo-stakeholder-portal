import { requireIdentityUser } from './_auth.mjs';
import { getCommunityConfig, userHasAccess } from './_kv.mjs';
import { ginkgo } from './_ginkgo.mjs';
import { ok, err } from './_util.mjs';

export async function handler(event, context){
  const auth = requireIdentityUser(context); if(!auth.ok) return err(auth.status, "Unauthorized");
  const kv = globalThis.KV || undefined;

  const { communityId, event: eventName, payload } = JSON.parse(event.body||"{}");
  if(!communityId || !eventName) return err(400,"Missing communityId or event");
  const allowed = await userHasAccess(auth.user.email, communityId, process.env, kv);
  if(!allowed) return err(403,"Forbidden");
  const { ginkgo_api_key } = await getCommunityConfig(communityId, process.env, kv);

  const ev = await ginkgo(communityId, ginkgo_api_key, `/events`, {
    method:'POST',
    body: JSON.stringify({
      name: eventName,
      category: 'Portal',
      description: JSON.stringify(payload||{}),
      starts_at: new Date().toISOString(),
      status: 'logged',
      tags: ['source:portal','channel:web_event']
    })
  });

  return ok({ ok:true, event_id: ev.id });
}
