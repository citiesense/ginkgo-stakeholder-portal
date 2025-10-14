import { requireIdentityUser } from './_auth.mjs';
import { getCommunityConfig, userHasAccess } from './_kv.mjs';
import { ginkgo } from './_ginkgo.mjs';
import { ok, err } from './_util.mjs';

function digits(s){ return String(s||'').replace(/\D+/g,''); }
async function searchContacts(communityId, key, apiKey){
  return await ginkgo(communityId, apiKey, `/contacts`, { method:'POST', body: JSON.stringify({ q: key }) });
}

export async function handler(event, context){
  const auth = requireIdentityUser(context); if(!auth.ok) return err(401, "Unauthorized");
  const { communityId, email, phone } = JSON.parse(event.body||'{}');
  if(!communityId) return err(400,"Missing communityId");
  const kv = globalThis.KV || undefined;
  if(!(await userHasAccess(auth.user.email, communityId, process.env, kv))) return err(403,"Forbidden");
  const { ginkgo_api_key } = await getCommunityConfig(communityId, process.env, kv);

  const contactsMap = new Map();
  if (email) {
    const list = await searchContacts(communityId, String(email).trim(), ginkgo_api_key);
    (list||[]).forEach((c)=>contactsMap.set(c.id, c));
  }
  if (phone) {
    const raw = String(phone).trim();
    const d = digits(raw);
    const keys = Array.from(new Set([
      raw,
      d,
      d.length>=10 ? d.slice(-10) : '',
      d.length>=7 ? d.slice(-7) : ''
    ].filter(Boolean)));
    for (const k of keys) {
      const list = await searchContacts(communityId, k, ginkgo_api_key);
      (list||[]).forEach((c)=>contactsMap.set(c.id, c));
    }
  }
  const contactIds = Array.from(contactsMap.keys());
  if (contactIds.length === 0) return ok({ ok:true, contacts: [], businesses: [], properties: [] });

  let businesses = [];
  try {
    businesses = await ginkgo(communityId, ginkgo_api_key, `/businesses`, {
      method:'POST', body: JSON.stringify({ contact_ids: contactIds })
    });
  } catch {
    const c = contactsMap.values().next().value;
    const broad = await ginkgo(communityId, ginkgo_api_key, `/businesses`, {
      method:'POST', body: JSON.stringify({ q: c?.email || c?.name || '' })
    });
    businesses = (broad||[]).filter((b)=>Array.isArray(b.contact_ids) && b.contact_ids.some((id)=>contactIds.includes(id)));
  }

  let properties = [];
  try {
    properties = await ginkgo(communityId, ginkgo_api_key, `/properties`, {
      method:'POST', body: JSON.stringify({ contact_ids: contactIds })
    });
  } catch {
    const c = contactsMap.values().next().value;
    const broad = await ginkgo(communityId, ginkgo_api_key, `/properties`, {
      method:'POST', body: JSON.stringify({ q: c?.email || c?.name || '' })
    });
    properties = (broad||[]).filter((p)=>Array.isArray(p.contact_ids) && p.contact_ids.some((id)=>contactIds.includes(id)));
  }

  const safeBiz = (businesses||[]).map((b)=>({
    id: b.id, name: b.name, address: b.address, url: b.url, email: b.email, phone: b.phone,
    contact_ids: (b.contact_ids||[]).filter((id)=>contactIds.includes(id))
  }));
  const safeProps = (properties||[]).map((p)=>({
    id: p.id, address: p.address, bbl: p.bbl,
    contact_ids: (p.contact_ids||[]).filter((id)=>contactIds.includes(id))
  }));
  const safeContacts = contactIds.map(id => {
    const c = contactsMap.get(id);
    return { id: c.id, name: c.name, first_name: c.first_name, last_name: c.last_name, email: c.email, phone: c.phone };
  });

  return ok({ ok:true, contacts: safeContacts, businesses: safeBiz, properties: safeProps });
}
