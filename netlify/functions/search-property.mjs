import { ok, bad, forward, getBody } from './_utils.mjs';

export async function handler(e){
  const { q = '', communityId } = getBody(e);
  if (!communityId) return bad('communityId required');
  if (process.env.DEMO_MODE === 'true') return ok({ results: [] });

  const u = process.env.WEBHOOK_URL_SEARCH_PROPERTY;
  if (!u) return bad('WEBHOOK_URL_SEARCH_PROPERTY not set', 500);

  const payload = {
    q,
    communityId,
    lat: 0,
    lon: 0,
    radius: '10000000000000000000000000000000000',
    label: 'search.property',
    source: 'stakeholder-portal',
  };
  const o = await forward(u, payload);
  return { statusCode: o.statusCode, body: o.body };
}