import { ok, bad, forward, getBody } from './_utils.mjs';

export async function handler(e){
  const b = getBody(e);
  if (process.env.DEMO_MODE === 'true') return ok({ ok: true, demo: true });
  const u = process.env.WEBHOOK_URL_EVENTS;
  if (!u) return bad('WEBHOOK_URL_EVENTS not set', 500);
  const payload = { ...b, source: b.source || 'stakeholder-portal' };
  const o = await forward(u, payload);
  return { statusCode: o.statusCode, body: o.body };
}