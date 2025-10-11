import { ok, bad, forward, getBody } from './_utils.mjs';

export async function handler(e){
  const { communityId, password } = getBody(e);
  if (!communityId || !password) return bad('communityId and password required');
  // Global fallback master password (set in env)
  const fallbackPw = process.env.FALLBACK_PORTAL_PASSWORD;
  if (fallbackPw && password === fallbackPw) {
    return ok({ ok: true, communityId, fallback: true });
  }
  if (process.env.DEMO_MODE === 'true') return ok({ ok: true, communityId, demo: true });

  const u = process.env.WEBHOOK_URL_ACCESS_LOGIN;
  if (!u) return bad('WEBHOOK_URL_ACCESS_LOGIN not set', 500);

  const payload = {
    communityId,
    password,
    ip: e.headers['x-nf-client-connection-ip'],
    label: 'access.login',
    source: 'stakeholder-portal',
  };
  const o = await forward(u, payload);
  return { statusCode: o.statusCode, body: o.body };
}