import crypto from 'crypto';
const KEY_PREFIX = 'pw:';
function sha256(s){ return crypto.createHash('sha256').update(s).digest('hex'); }
export async function getPasswordHash(communityId, kv, env){
  const key = `${KEY_PREFIX}${String(communityId)}`;
  if (kv){
    const v = await kv.get(key);
    if (v) return v;
  }
  if (env.FALLBACK_PORTAL_PASSWORD) return sha256(env.FALLBACK_PORTAL_PASSWORD);
  return null;
}
export async function setPassword(communityId, newPlain, kv){
  if (!kv) throw new Error('KV not available; cannot set password');
  const h = sha256(String(newPlain||'').trim());
  await kv.set(`${KEY_PREFIX}${String(communityId)}`, h);
  return h;
}
export function verifyPassword(plain, storedHash){
  if (!storedHash) return false;
  const h = sha256(String(plain||'').trim());
  return crypto.timingSafeEqual(Buffer.from(h,'hex'), Buffer.from(storedHash,'hex'));
}
