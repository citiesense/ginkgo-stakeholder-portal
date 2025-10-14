import { ok, err } from './_util.mjs';
import { requireIdentityUser } from './_auth.mjs';
import { setPassword } from './_password.mjs';

export async function handler(e, context){
  try {
    const auth = requireIdentityUser(context); if(!auth.ok) return err(401, 'Unauthorized');
    // Basic admin check: require app_metadata.roles includes 'admin' (adjust per your Identity roles)
    const roles = auth.user?.app_metadata?.roles || [];
    if (!Array.isArray(roles) || !roles.includes('admin')) return err(403, 'Forbidden');

    const body = JSON.parse(e.body || '{}');
    const communityId = String(body.communityId || '').trim();
    const newPassword = String(body.newPassword || '').trim();
    if (!communityId || !newPassword) return err(400, 'communityId and newPassword required');
    const kv = globalThis.KV || undefined;
    if (!kv) return err(500, 'KV not available; cannot set password');
    await setPassword(communityId, newPassword, kv);
    return ok({ ok:true });
  } catch (e) {
    return err(500, 'Server error');
  }
}