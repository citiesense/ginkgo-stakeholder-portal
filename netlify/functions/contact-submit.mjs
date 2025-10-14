import { requireIdentityUser } from './_auth.mjs';
import { getCommunityConfig, userHasAccess } from './_kv.mjs';
import { ginkgo } from './_ginkgo.mjs';
import { splitFullName, slug, ok, err } from './_util.mjs';
import { assocAdd } from './_assoc.mjs';

export async function handler(event, context){
  const auth = requireIdentityUser(context); if(!auth.ok) return err(auth.status, "Unauthorized");
  const kv = globalThis.KV || undefined;

  const { communityId, recordType, recordId, existingContactId, full_name, email, phone, contact_type, notes, topic } = JSON.parse(event.body||"{}");
  if(!communityId) return err(400,"Missing communityId");
  const allowed = await userHasAccess(auth.user.email, communityId, process.env, kv);
  if(!allowed) return err(403,"Forbidden");
  const { ginkgo_api_key } = await getCommunityConfig(communityId, process.env, kv);

  let contactId = existingContactId;
  if(!contactId){
    let found = [];
    if(email){ found = await ginkgo(communityId, ginkgo_api_key, `/contacts`, { method:'POST', body: JSON.stringify({ q: email }) }); }
    if((!found||!found.length) && phone){ found = await ginkgo(communityId, ginkgo_api_key, `/contacts`, { method:'POST', body: JSON.stringify({ q: phone }) }); }
    if((!found||!found.length) && full_name){ found = await ginkgo(communityId, ginkgo_api_key, `/contacts`, { method:'POST', body: JSON.stringify({ q: full_name }) }); }
    if(found && found.length){ contactId = found[0].id; }

    const names = splitFullName(full_name);
    const payload = { ...names, email, phone, contact_type, notes: (notes||"") + `\n\n(source: portal)` };
    if(contactId){
      await ginkgo(communityId, ginkgo_api_key, `/contacts/${contactId}`, { method:'PUT', body: JSON.stringify(payload) });
    } else {
      const c = await ginkgo(communityId, ginkgo_api_key, `/contacts`, { method:'POST', body: JSON.stringify(payload) });
      contactId = c.id;
    }
  }

  let eventAddress, eventGeom;
  if(recordType === 'property' && recordId){
    const prop = await ginkgo(communityId, ginkgo_api_key, `/properties/${recordId}`, { method:'GET' });
    const ids = Array.from(new Set([ ...(prop.contact_ids||[]), contactId ]));
    await ginkgo(communityId, ginkgo_api_key, `/properties/${recordId}`, { method:'PUT', body: JSON.stringify({ contact_ids: ids }) });
    eventAddress = prop.address; eventGeom = prop.the_geom;
    // Maintain KV association index
    await assocAdd(kv, contactId, { propertyId: recordId });
  }
  if(recordType === 'business' && recordId){
    // Optional: update business metadata contact_ids if desired; always index KV
    await assocAdd(kv, contactId, { businessId: recordId });
  }

  const ev = await ginkgo(communityId, ginkgo_api_key, `/events`, {
    method:'POST',
    body: JSON.stringify({
      name: "Stakeholder portal submission",
      category: topic || "Inquiry",
      description: notes || "",
      starts_at: new Date().toISOString(),
      status: "logged",
      contact_ids: [contactId],
      tenant_id: recordType === 'business' ? recordId : undefined,
      address: eventAddress,
      the_geom: eventGeom,
      tags: ["source:portal","channel:web_form", topic ? `topic:${slug(topic)}` : undefined].filter(Boolean)
    })
  });

  return ok({ ok:true, contact_id: contactId, event_id: ev.id, business_id: recordType==='business'?recordId:undefined });
}
