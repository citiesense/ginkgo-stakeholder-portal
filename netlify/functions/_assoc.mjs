// Association KV helpers: contact -> businesses/properties mapping

const KEY_PREFIX_C = 'assoc:contact:';
const KEY_PREFIX_B = 'assoc:business:';
const KEY_PREFIX_P = 'assoc:property:';

const keyC = (cid) => `${KEY_PREFIX_C}${String(cid)}`;
const keyB = (bid) => `${KEY_PREFIX_B}${String(bid)}`;
const keyP = (pid) => `${KEY_PREFIX_P}${String(pid)}`;

async function kvGetJSON(kv, key, defVal){
  const v = await kv.get(key);
  return v ? JSON.parse(v) : defVal;
}
async function kvPutJSON(kv, key, val){
  await kv.set(key, JSON.stringify(val));
}
function uniq(arr){ return Array.from(new Set((arr||[]).filter(Boolean))); }

export async function assocAdd(kv, contactId, opts){
  if (!kv) return; // no-op without KV
  const cid = String(contactId);
  const a = await kvGetJSON(kv, keyC(cid), { businesses:[], properties:[] });
  if (opts?.businessId) a.businesses = uniq([...a.businesses, String(opts.businessId)]);
  if (opts?.propertyId) a.properties = uniq([...a.properties, String(opts.propertyId)]);
  await kvPutJSON(kv, keyC(cid), a);

  if (opts?.businessId) {
    const bKey = keyB(String(opts.businessId));
    const b = await kvGetJSON(kv, bKey, { contacts:[] });
    b.contacts = uniq([...b.contacts, cid]);
    await kvPutJSON(kv, bKey, b);
  }
  if (opts?.propertyId) {
    const pKey = keyP(String(opts.propertyId));
    const p = await kvGetJSON(kv, pKey, { contacts:[] });
    p.contacts = uniq([...p.contacts, cid]);
    await kvPutJSON(kv, pKey, p);
  }
}

export async function assocGetForContact(kv, contactId){
  if (!kv) return { businesses:[], properties:[] };
  return kvGetJSON(kv, keyC(String(contactId)), { businesses:[], properties:[] });
}
