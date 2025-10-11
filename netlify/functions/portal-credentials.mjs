import { ok, bad, forward, getBody } from './_utils.mjs';

export async function handler(e){
  const { communityId, apiKey } = getBody(e);
  if (!communityId || !apiKey) return bad('communityId and apiKey required');
  if (process.env.DEMO_MODE === 'true') return ok({ ok: true, demo: true });

  const u = process.env.WEBHOOK_URL_PORTAL_CREDENTIALS;
  if (!u) return bad('WEBHOOK_URL_PORTAL_CREDENTIALS not set', 500);

  const payload = { communityId, apiKey, label: 'portal.credentials.save', source: 'stakeholder-portal' };
  const o = await forward(u, payload);
  return { statusCode: o.statusCode, body: o.body };
}