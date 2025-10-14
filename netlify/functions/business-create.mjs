import { requireIdentityUser } from './_auth.mjs';
import { getCommunityConfig, userHasAccess } from './_kv.mjs';
import { ginkgo } from './_ginkgo.mjs';
import { slug, ok, err } from './_util.mjs';

export async function handler(event, context){
  const auth = requireIdentityUser(context); if(!auth.ok) return err(auth.status, "Unauthorized");
  const kv = globalThis.KV || undefined;

  const b = JSON.parse(event.body||"{}");
  const { communityId } = b;
  if(!communityId) return err(400,"Missing communityId");
  const allowed = await userHasAccess(auth.user.email, communityId, process.env, kv);
  if(!allowed) return err(403,"Forbidden");
  const { ginkgo_api_key } = await getCommunityConfig(communityId, process.env, kv);

  const payload = {
    name: b.name,
    address: b.address,
    email: b.email,
    phone: b.phone,
    url: b.url,
    category: b.category,
    tags: Array.isArray(b.tags) ? b.tags : (typeof b.tags==='string' && b.tags ? b.tags.split(',').map(s=>s.trim()).filter(Boolean) : []),
    property_municipal_id: b.property_municipal_id,
    unit_name: b.unit_name,
    notes: b.notes,
  };

  const biz = await ginkgo(communityId, ginkgo_api_key, `/businesses`, { method:'POST', body: JSON.stringify(payload) });

  await ginkgo(communityId, ginkgo_api_key, `/events`, {
    method:'POST',
    body: JSON.stringify({
      name: "Stakeholder business submission",
      category: "Business",
      description: b.notes || "",
      starts_at: new Date().toISOString(),
      status: "logged",
      tenant_id: biz.id,
      tags: ["source:portal","channel:web_form","type:business_create"]
    })
  });

  return ok({ ok:true, business_id: biz.id });
}
