import { ok, bad, forward, getBody } from './_utils.mjs';

export async function handler(e){
  const b = getBody(e);
  if (!b || !b.recordId || !b.communityId) return bad('recordId and communityId required');
  if (process.env.DEMO_MODE === 'true') return ok({ ok: true, demo: true });
  const u = process.env.WEBHOOK_URL_CONTACT_SUBMIT;
  if (!u) return bad('WEBHOOK_URL_CONTACT_SUBMIT not set', 500);
  const payload = { ...b, label: b.label || 'contact.submit', source: 'stakeholder-portal' };
  const o = await forward(u, payload);
  return { statusCode: o.statusCode, body: o.body };
}