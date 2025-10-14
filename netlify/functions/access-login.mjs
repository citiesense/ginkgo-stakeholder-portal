import { ok, err } from './_util.mjs';
import { getPasswordHash, verifyPassword } from './_password.mjs';

export async function handler(e){
  try {
    const body = JSON.parse(e.body || '{}');
    const communityId = String(body.communityId || '').trim();
    const password = String(body.password || '').trim();
    if (!communityId || !password) return err(400, 'communityId and password required');

    const kv = globalThis.KV || undefined;
    const hash = await getPasswordHash(communityId, kv, process.env);
    const source = kv ? (hash ? 'kv' : 'kv-miss+fallback') : 'fallback';
    console.log(`[access-login] source=${source} communityId=${communityId}`);
    if (!verifyPassword(password, hash)) return err(401, 'Unauthorized');

    return ok({ ok: true, communityId });
  } catch (e) {
    return err(500, 'Server error');
  }
}